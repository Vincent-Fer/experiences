from flask import Flask, render_template, request, session, redirect, url_for, jsonify, send_from_directory
from datetime import datetime, timedelta
from database import verify_credentials, getSes, addSes, interSessionTime, get_timer_state, set_timer_state, canFeedback, setLastSessionSeen, interFeedbackTime
import pandas as pd
import time
import base64
import csv
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_key' # eviter en clair ici
app.config["SESSION_TYPE"] = "filesystem" 
app.config["SESSION_PERMANENT"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=30)
app.config['SESSION_REFRESH_EACH_REQUEST'] = True

IMAGE_FOLDER = '/home/vfer/expe3/media'

# IMAGE_FOLDER = './media'

LOG_FOLDER = '/home/vfer/expe3/logs'

# LOG_FOLDER = './logs'

DEFAULT_DEC_INI = 'suspect'

# G1 - 17% erreur
g1_data_fb0 = [2, 5, 10, 17, 23, 26] # 23 Erreur sur image
g1_data_fb1 = [0, 7, 14, 15, 22, 28] # 7 Erreur sur le type de navire vu à l'image
g1_data_fb2 = [1, 5, 12, 15, 22, 24] # 5 erreur sur la zone de pèche et la présence de navire proche
g1_data_fb3 = [3, 9, 10, 19, 21, 23] # 10 erreur de l'IA interprétant la non direction de Roscoff comme une erreur
g1_data_fb4 = [7, 8, 14, 18, 21, 25] # 18, erreur sur l'interpréation des données de vitesse et de cap
g1_data_fb5 = [4, 6, 9, 12, 22, 24] # 9, erreur sur l'interprétation du tirant d'eau
g1_data_fb6 = [3, 9, 13, 17, 21, 24] # 3, erreur sur le nom lu

# G2 - 83% erreur
g2_data_fb0 = [2, 6, 11, 18, 23, 27] # 2 Bonne réponse
g2_data_fb1 = [1, 7, 15, 18, 24, 26] # 15 Bonne réponse
g2_data_fb2 = [3, 5, 13, 15, 21, 26] # 15 Bonne réponse
g2_data_fb3 = [6, 8, 10, 19, 22, 27] # 19 bonne réponse
g2_data_fb4 = [4, 7, 18, 20, 24, 29] # 7 bonne réponse
g2_data_fb5 = [8, 9, 12, 13, 18, 27] # 12 bonne réponse
g2_data_fb6 = [3, 6, 13, 15, 22, 26] # 13 bonne réponse

if not os.path.exists(LOG_FOLDER):
    os.makedirs(LOG_FOLDER)

PHASE_TIMERS = {
    'initial': 30,  # 3 secondes pour tester
    'ai': 5,
    'final': 10
}

# TIMER A REVOIR, N'EST PAS OPTIMISE
@app.route('/get_timer', methods=['GET'])
def get_timer():
    code = session.get('code')
    if not code:
        return jsonify({'error': 'Session inconnue'}), 404
    state = get_timer_state(session['uid'], session['ses'], code)
    if not state:
        # Première visite : initialise
        phase = 'initial'
        countdown = PHASE_TIMERS[phase]
        cond = set_timer_state(session['uid'], session['ses'], code, phase, countdown)
        state = {'phase': phase, 'countdown': countdown}
    else:
        phase = state['phase']
        countdown = state['countdown']
    # Décrémente le timer à chaque appel
    if countdown > 0:
        countdown -= 1
    else:
        if phase == 'initial':
            phase = 'ai'
            countdown = PHASE_TIMERS['ai']
        elif phase == 'ai':
            phase = 'final'
            countdown = PHASE_TIMERS['final']
        elif phase == 'final':
            phase = 'initial'
            countdown = PHASE_TIMERS['initial']

    cond = set_timer_state(session['uid'], session['ses'], code, phase, countdown)
    data = {
        'countdown': countdown,
        'phase': phase,
        'class': 'normal',
        'recIA': session['ves_dict']['recIA']
    }
    if countdown < (PHASE_TIMERS[phase] * (2/3)):
        data['class'] = 'warning'
    elif countdown < (PHASE_TIMERS[phase] * (1/3)):
        data['class'] = 'danger'
    return jsonify(data)


# TIMER A REVOIR, N'EST PAS OPTIMISER
@app.route('/click', methods=['POST'])
def handle_click():
    # Vérifier si une action est déjà en cours
    if session.get('click_in_progress', False):
        return jsonify(success=False, message="Action déjà en cours"), 429

    # Définir le flag pour bloquer les autres clics
    session['click_in_progress'] = True
    try:
        code = session['code']
        state = get_timer_state(session['uid'], session['ses'], code)
        if not state:
            session['click_in_progress'] = False
            return jsonify(success=False)
        phase = state['phase']
        countdown = state['countdown']
        if request.method == 'POST':
            if phase == 'initial':
                objectName = request.get_json()['objectName']
                if objectName == 'none':
                    phase = 'ai'
                    countdown = PHASE_TIMERS['ai']
                    dec_ini, dec_ini_time, userClicked = decIni(DEFAULT_DEC_INI, False)
                    session['beh_dict']['decIni'] = dec_ini
                    session['beh_dict']['decIniTime'] = dec_ini_time
                    session['beh_dict']['iniClicked'] = userClicked
                    cond = set_timer_state(session['uid'], session['ses'], code, phase, countdown)
                    return jsonify(success=cond)
                else:
                    if countdown <= 0:
                        return jsonify(success=False)
                    phase = 'ai'
                    countdown = PHASE_TIMERS['ai']
                    dec_ini, dec_ini_time, userClicked = decIni(objectName, True)
                    session['beh_dict']['decIni'] = dec_ini
                    session['beh_dict']['decIniTime'] = dec_ini_time
                    session['beh_dict']['iniClicked'] = userClicked
                    cond = set_timer_state(session['uid'], session['ses'], code, phase, countdown)
                    return jsonify(success=cond)
            elif phase == 'ai':
                if countdown <= 0:
                    phase = 'final'
                    countdown = PHASE_TIMERS['final']
                    recIA()
            elif phase == 'final':
                objectName = request.form.get('objectName')
                if objectName == 'none':
                    url_to, dec_fin, dec_fin_time, userClicked = decFin(DEFAULT_DEC_INI, False)
                else:
                    url_to, dec_fin, dec_fin_time, userClicked = decFin(objectName, True)
                session['beh_dict']['decFin'] = dec_fin
                session['beh_dict']['decFinTime'] = dec_fin_time
                session['beh_dict']['finClicked'] = userClicked
                writeBeh()
                return jsonify({'redirect_url': url_to})
        cond = set_timer_state(session['uid'], session['ses'], code, phase, countdown)
        return jsonify("Bon")
    finally:
        # Libérer le flag après traitement
        session['click_in_progress'] = False

@app.route('/favicon')
def favicon():
    # return send_from_directory('/home/vfer/expe3/static',
    #                            'favicon.ico',
    #                            mimetype='image/x-icon')
    return send_from_directory('./static',
                               'favicon.ico',
                               mimetype='image/x-icon')

@app.errorhandler(404)
def page_not_found(e):
    if 'uid' in session:
        return redirect('/choice')
    else:
        # Si aucune page précédente n'est connue, on redirige vers l'accueil
        return redirect('/login')

@app.route('/', methods=['GET', 'POST'])
def index():
    if 'uid' in session:
        return redirect(url_for('choice'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        result, uid, lastSession, grp = verify_credentials(username, password)
        if result:
            session['uid'] = str(uid)
            session['grp'] = grp
            session['ses'] = int(lastSession)
            session['messageTps'] = ''
            session['messageSes'] = ''
            session['game'] = False
            session['endGame'] = False
            session['questionnaire'] = False
            session['slider'] = False
            session['choice'] = 1
            # 0 = toDo; 1 = done
            session['last_click_time'] = time.time_ns() // 1_000_000
            session['log_file'] = f"{LOG_FOLDER}/u{uid}s{str(session['ses'])}.log"
            ms = time.time_ns() // 1_000_000
            if os.path.exists(session['log_file']):
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                new_filename = f"{timestamp}_u{str(uid)}s{str(session['ses'])}.log"
                os.rename(session['log_file'], os.path.join(LOG_FOLDER, new_filename))
            with open(session['log_file'], 'a') as f:
                f.write(f"action;time;data;\n")
                f.write(f"connect;{str(ms)};null;\n")
            usr_folder = f"{IMAGE_FOLDER}/mission{str(session['ses'])}/users/"
            if not os.path.exists(usr_folder):
                os.makedirs(usr_folder)
            if(session['ses']==0):
                return redirect(url_for('questionnaireDemography'))
            else:
                return redirect(url_for('choice'))
        else:
            return render_template('login.html', message="Login ou mot de passe incorrect.")
    return render_template('login.html')

@app.route('/explainations', methods=['GET','POST'])
def explainations():
    if 'uid' in session:
        session['messageTps'] = ''
        session['messageSes'] = ''
        ms = time.time_ns() // 1_000_000
        session['last_click_time'] = ms
        code = getCaseExplainations()
        image_path = f"{IMAGE_FOLDER}/rankingFeedback.png"
        with open(image_path, 'rb') as image_file:
            rankingFeedback = base64.b64encode(image_file.read()).decode('utf-8')
        image_path = f"{IMAGE_FOLDER}/elementsFeedback.png"
        with open(image_path, 'rb') as image_file:
            elementsFeedback = base64.b64encode(image_file.read()).decode('utf-8')
        with open(session['log_file'], 'a') as f:
            f.write(f"explainations;{str(ms)};null;\n")
        return render_template('explainations.html', choice=session['choice'], ses=session['ses'], rankingFeedback = rankingFeedback, elementsFeedback = elementsFeedback, code = code)
    return redirect(url_for('login'))

def getCaseExplainations():
    code = ''
    ves_dict = []
    sus = getListSuspect('training')
    code += f'<div id="cases-container" style="display:flex; align-items:center; justify-content:center;">'
    for i in range(10):
        image_path = IMAGE_FOLDER + f'/training/64nm/{str(i)}.png'
        image_path2 = IMAGE_FOLDER + f'/training/vessels/{str(i)}.jpg'
        if os.path.exists(image_path):
            # IMAGE NAVIRE BAS GAUCHE
            try:
                with open(image_path2, 'rb') as image_file2:
                    vessel_image = base64.b64encode(image_file2.read()).decode('utf-8')
            except:
                base_path = IMAGE_FOLDER + "/noImg.png"
                with open(base_path, 'rb') as base_file:
                    vessel_image = base64.b64encode(base_file.read()).decode('utf-8')
            # IMAGE TACTIQUE DROITE
            with open(image_path, 'rb') as image_file:
                encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
            ves_dict = askTargetData(str(i), 'training')
            if (i == 0):
                code += f'<div id="case{str(i)}" class="caseExample">'
            else:
                code += f'<div id="case{str(i)}" class="caseExample" style="display: none">'
            code += f'''
                    <table id="tab_data">
                        <tr id="tr_th">
                            <th class="th_vesData" id="th_sus">
                                Liste suspects
                            </th>
                            <th class="th_vesData" id="th_ais">
                                Données AIS
                            </th>
                            <th class="th_vesData" id="th_sens">
                                Données capteurs
                            </th>
                        </tr>
                        <tr id="tr_vesData">
                            <td class="vesData tdSus{str(i)}" id="tdSus">
                                <p>{sus[0]}</p>
                                <p>{sus[1]}</p>
                                <p>{sus[2]}</p>
                                <p>{sus[3]}</p>
                                <p>{sus[4]}</p>
                                <p>{sus[5]}</p>
                                <p>{sus[6]}</p>
                                <p>{sus[7]}</p>
                                <p>{sus[8]}</p>
                                <p>{sus[9]}</p>
                                <p>{sus[10]}</p>
                                <p>{sus[11]}</p>
                                <p>{sus[12]}</p>
                                <p>{sus[13]}</p>
                                <p>{sus[14]}</p>
                            </td>
                            <td class="vesData tdAis{str(i)}" id="tdAis">
                                <p><strong>Vitesse</strong> : {ves_dict["vspeedAIS"]}</p>
                                <p><strong>Cap</strong> : {ves_dict["vheadAIS"]}</p>
                                <p><strong>Longueur</strong> : {ves_dict["vlengthAIS"]}</p>
                                <p><strong>Largeur</strong> : {ves_dict["vwidth"]}</p>
                                <p><strong>MAJ</strong> : {ves_dict["vLastAIS"]}</p>
                                <p><strong>Type</strong> : {ves_dict["vtype"]}</p>
                                <p><strong>Nom</strong> : {ves_dict["vname"]}</p>
                                <p><strong>Nat</strong> : {ves_dict["vnat"]}</p>
                                <p><strong>MMSI</strong> : {ves_dict["vmmsi"]}</p>
                                <p><strong>IMO</strong> : {ves_dict["vimo"]}</p>
                                <p><strong>De</strong> : {ves_dict["vfrom"]}</p>
                                <p><strong>A</strong> : {ves_dict["vto"]}</p>
                                <p><strong>Status</strong> : {ves_dict["vstatus"]}</p>
                                <p><strong>Année</strong> : {ves_dict["vbuilt"]}</p>
                                <p><strong>Poids</strong> : {ves_dict["vweight"]}</p>
                                <p><strong>Tirant</strong> : {ves_dict["vdraught"]}</p>
                            </td>
                            <td class="vesData tdSensor{str(i)}" id="tdSensor">
                                <p><strong>Vitesse</strong> : {ves_dict["vspeedReal"]}</p>
                                <p><strong>Cap</strong> : {ves_dict["vheadReal"]}</p>
                                <p><strong>Longueur</strong> : {ves_dict["vlengthReal"]}</p>
                                <p><strong>Dist. AIS</strong> : {ves_dict["vDistAIS"]}</p>
                                <p><strong>Route maritime</strong> : {ves_dict["inMaritimeRoad"]}</p>
                                <p><strong>Zone de pèche</strong> : {ves_dict["inFishingZone"]}</p>
                                <p><strong>Zone côtière</strong> : {ves_dict["inCoastZone"]}</p>
                                <p><strong>Navire proche</strong> : {ves_dict["nearOtherVessel"]}</p>
                                <p><strong>Zone protégée</strong> : {ves_dict["protectedZone"]}</p>
                            </td>
                        </tr>
                        <tr id="tr_ves">
                            <td colspan="3" id="td_ves">
                                <img class="imgVes imgVes{str(i)}" id="imgVes" src="data:image/png;base64,{ vessel_image }"/>
                                <div class="loupe loupe{str(i)}" id="loupe"></div>
                            </td>
                        </tr>
                    </table>
                    <table id="tab_tac">
                        <tr id="tr_tac">
                            <td id="td_img_tac">
                                <img class="imgTac{str(i)}" id="imgTac" src="data:image/png;base64,{ encoded_image }"/>
                            </td>
                        </tr>
                        <tr id="tr_dec">
                            <td class="td_dec td_ini{str(i)} tdDecIni{str(i)}" id="tdDecIni">
                                <span class="td_span" id="targetIs">Ce navire est</span>
                                <div class="btn_group">
                                    <button class="but_sus iniSus{str(i)}" id="butIniSus">Suspect</button>
                                    <button class="but_neu iniNeu{str(i)}" id="butIniNeu">Neutre</button>
                                </div>
                            </td>
                            <td class="td_dec td_rec{str(i)}" id="tdRec">
                                <span class="td_span" id="recIs">Recommandation IA</span>
                                <div class="btn_group">
                                    <div class="but_sus recSus{str(i)}" id="recSus">Suspect</div>
                                    <div class="but_neu recNeu{str(i)}" id="recNeu">Neutre</div>
                                </div>
                            </td>
                            <td class="td_dec td_fin{str(i)}" id="tdDecFin">
                                <span class="td_span" id="finTargetIs">Finalement, ce navire est :</span>
                                <div class="btn_group">
                                    <button class="but_sus finSus{str(i)}" type="submit" id="butFinSus">Suspect</button>
                                    <button class="but_neu finNeu{str(i)}" type="submit" id="butFinNeu">Neutre</button>
                                </div>
                            </td>
                        </tr>
                        <tr id="tr_cd">
                            <td class="td_countdown">
                                <span class="normal countdownElement" id="countdownElement{str(i)}">30</span>
                            </td>
                        </tr>
                    </table>
                </div>
                <script>
                    let recIA{str(i)} = "{ves_dict["recIA"]}"
                </script>
            '''
    code += '</div>'
    return code

@app.route('/game', methods=['GET','POST'])
def game():
    if 'uid' in session:
        if session['game']:
            uid = str(session.get('uid', ''))
            ses = str(session.get('ses', ''))
            image_id = str(session['image_id'])
            session['code'] = f"{uid}_{ses}_{image_id}"
            print(session['code'])
            if(session['image_id']<0):
                session['image_id'] = 0
            elif(session['image_id'] >= 30):
                session['slider'] = True
                return redirect(url_for('slider'))
            image_path = IMAGE_FOLDER + '/mission' + ses + '/64nm/' + image_id + '.png'
            image_path2 = IMAGE_FOLDER + '/mission' + ses + '/vessels/' + image_id + '.jpg'
            if os.path.exists(image_path):
                # IMAGE NAVIRE BAS GAUCHE
                try:
                    with open(image_path2, 'rb') as image_file2:
                        encoded_image2 = base64.b64encode(image_file2.read()).decode('utf-8')
                except:
                    base_path = IMAGE_FOLDER + "/noImg.png"
                    with open(base_path, 'rb') as base_file:
                        encoded_image2 = base64.b64encode(base_file.read()).decode('utf-8')
                # IMAGE TACTIQUE DROITE
                with open(image_path, 'rb') as image_file:
                    encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
                ves_dict = askTargetData(image_id, ses);
                session['ves_dict'] = ves_dict;
                session['beh_dict'] = {'decIni' : None, 'decIniTime' : None, 'recIA' : ves_dict['recIA'], 'decFin' : None, 'decFinTime' : None, 'gt' : ves_dict['gt'], 'iniClicked' : None, 'finClicked' : None}
                list_sus = getListSuspect(session['ses']);
                ms = time.time_ns() // 1_000_000
                session['last_click_time'] = ms
                session['click_in_progress'] = False
                with open(session['log_file'], 'a') as f:
                    f.write(f"game;{str(ms)};{str(image_id)};\n")
                return render_template('game.html', encoded_image=encoded_image, vessel_image=encoded_image2, image_id=image_id, ves_dict=ves_dict, sus = list_sus)
            else:
                session['messageSes'] = "Il y a un problème avec cette session, revenez plus tard ..."
                return redirect(url_for('choice'))
        return redirect(url_for('choice'))
    return redirect(url_for('login'))

def decIni(objectName, userClicked):
    ms = time.time_ns() // 1_000_000
    dec_ini_time = ms - session['last_click_time']
    session['last_click_time'] = ms
    if(userClicked==False):
        objectName = DEFAULT_DEC_INI
        dec_ini_time = 30000
    elif(userClicked==None):
        userClicked = False
        objectName = DEFAULT_DEC_INI
        dec_ini_time = 30000
    with open(session['log_file'], 'a') as f:
        f.write(f"decIni;{str(ms)};{objectName};\n")
        f.write(f"decIniTime;{str(ms)};{dec_ini_time};\n")
    return objectName, dec_ini_time, userClicked

def recIA():
    ms = time.time_ns() // 1_000_000
    session['last_click_time'] = ms
    with open(session['log_file'], 'a') as f:
        f.write(f"recIA;{str(ms)};{session['ves_dict']['recIA']};\n")
        f.write(f"gt;{str(ms)};{session['ves_dict']['gt']};\n")

def decFin(objectName, userClicked):
    ms = time.time_ns() // 1_000_000
    dec_fin_time = ms - session['last_click_time']
    session['last_click_time'] = ms
    next_img = session['image_id'] + 1
    if(userClicked==False):
        objectName = session['beh_dict']['decIni']
        dec_fin_time = 10000
    decFin = objectName
    decFinTime = dec_fin_time
    finClicked = userClicked
    with open(session['log_file'], 'a') as f:
        f.write(f"decFin;{str(ms)};{objectName};\n")
        f.write(f"decFinTime;{str(ms)};{dec_fin_time};\n")
    if(next_img==10):
        session['slider'] = True
        session['game'] = False
        return url_for('slider'), decFin, decFinTime, finClicked
    elif(next_img==20):
        session['slider'] = True
        session['game'] = False
        return url_for('slider'), decFin, decFinTime, finClicked
    elif(next_img==30):
        session['slider'] = True
        session['game'] = False
        return url_for('slider'), decFin, decFinTime, finClicked
    else:
        session['game'] = True
        return url_for('game'), decFin, decFinTime, finClicked

@app.route('/slider', methods=['GET','POST'])
def slider():
    if 'uid' in session:
        if session['slider']:
            ms = time.time_ns() // 1_000_000
            with open(session['log_file'], 'a') as f:
                f.write(f"slider;{str(ms)};null;\n")
            if session['image_id'] == 0:
                return render_template('slider.html', end=0)
            elif session['image_id'] > 0 and session['image_id'] <= 20:
                return render_template('slider.html', end=1)
            else:
                return render_template('slider.html', end=2)
        else:
            return redirect(url_for('choice'))
    return redirect(url_for('login'))

@app.route('/sendSlider', methods=['POST'])
def sendSlider():
    if 'uid' in session:
        if request.method == 'POST':
            tValue = request.form.get('question1')
            scValue = request.form.get('question2')
            ms = time.time_ns() // 1_000_000
            with open(session['log_file'], 'a') as f:
                f.write(f"sendSlider;{str(ms)};tValue:{tValue};\n")
                f.write(f"sendSlider;{str(ms)};scValue:{scValue};\n")
            session['slider'] = False
            if session['image_id'] == 0:
                return redirect(url_for('listSuspect'))
            elif session['image_id'] > 0 and session['image_id'] < 30:
                session['game'] = True
                return redirect(url_for('game'))
            elif session['image_id'] >=30:
                session['game'] = False
                session['questionnaire'] = True
                return redirect(url_for('questionnaire'))
    return redirect(url_for('login'))

@app.route('/consent', methods=['GET','POST'])
def consent():
    if 'uid' in session:
        signature_path = IMAGE_FOLDER + "/signature.png"
        ms = time.time_ns() // 1_000_000
        with open(signature_path, 'rb') as signature_file:
            signature = base64.b64encode(signature_file.read()).decode('utf-8')
        with open(session['log_file'], 'a') as f:
            f.write(f"consent;{str(ms)};null;\n")
        return render_template('consent.html', signature=signature)
    return redirect(url_for('login'))

@app.route('/sendConsent', methods=['POST'])
def sendConsent():
    if 'uid' in session:
        if request.method == 'POST':
            ms = time.time_ns() // 1_000_000
            with open(session['log_file'], 'a') as f:
                f.write(f"sendConsent;{str(ms)};null;\n")
        return redirect(url_for('choice'))
    return redirect(url_for('login'))

@app.route('/questionnaire', methods=['GET','POST'])
def questionnaire():
    if 'uid' in session:
        if session['questionnaire']:
            session['messageTps'] = ''
            session['messageSes'] = ''
            ms = time.time_ns() // 1_000_000

            with open(session['log_file'], 'a') as f:
                f.write(f"questionnaire;{str(ms)};null;\n")
            if session['image_id'] == 0:
                return render_template('questionnaire.html', end = 1)
            else:
                return render_template('questionnaire.html', end = 0)
        else:
            return redirect(url_for('choice'))
    return redirect(url_for('login'))

@app.route('/questionnaireInitial', methods=["GET","POST"])
def questionnaireInitial():
    if 'uid' in session:
        if session['ses'] == 0:
            session['messageTps'] = ''
            session['messageSes'] = ''
            ms = time.time_ns() // 1_000_000
            with open(session['log_file'], 'a') as f:
                f.write(f"questionnaireInitial;{str(ms)};null;\n")
            return render_template('questionnaireInitial.html')
        else:
            return redirect(url_for('choice'))
    return redirect(url_for('login'))

@app.route('/questionnaireDemography', methods=["GET","POST"])
def questionnaireDemography():
    if 'uid' in session:
        if session['ses'] == 0:
            ms = time.time_ns() // 1_000_000
            session['choice'] = 1
            with open(session['log_file'], 'a') as f:
                f.write(f"questionnaireDemography;{str(ms)};null;\n")
            return render_template('questionnaireDemography.html')
        else:
            return redirect(url_for('choice'))
    return redirect(url_for('login'))

@app.route('/sendQuestionnaireDemography', methods=['POST'])
def sendQuestionnaireDemography():
    if 'uid' in session:
        if request.method == 'POST':
            ms = time.time_ns() // 1_000_000
            mail = request.form.get('email')
            age = request.form.get('age')
            genre = request.form.get('genre')
            etudes = request.form.get('etudes')
            classification = request.form.get('classification')
            duree_classification = request.form.get('duree_classification')
            utilisation_ia = request.form.get('utilisation_ia')
            familiarite_ia = request.form.get('familiarite_ia')
            with open(session['log_file'], 'a') as f:
                f.write(f"mail;{str(ms)};{mail};\n")
                f.write(f"age;{str(ms)};{age};\n")
                f.write(f"genre;{str(ms)};{genre};\n")
                f.write(f"etudes;{str(ms)};{etudes};\n")
                f.write(f"classification;{str(ms)};{classification};\n")
                f.write(f"duree_classification;{str(ms)};{duree_classification};\n")
                f.write(f"utilisation_ia;{str(ms)};{utilisation_ia};\n")
                f.write(f"familiarite_ia;{str(ms)};{familiarite_ia};\n")
            return redirect(url_for('explainations'))
    return redirect(url_for('login'))

@app.route('/sendQuestionnaireInitial', methods=['POST'])
def sendQuestionnaireInitial():
    if 'uid' in session:
        if request.method == 'POST':
            ms = time.time_ns() // 1_000_000
            for i in range(1,13):
                data = request.form.get(f'question{str(i)}')
                with open(session['log_file'], 'a') as f:
                    f.write(f"jian{str(i)};{str(ms)};{data};\n")
                    time.sleep(0.02)
            return redirect(url_for('slider'))
    return redirect(url_for('login'))

@app.route('/sendQuestionnaire', methods=['POST'])
def sendQuestionnaire():
    if 'uid' in session:
        if request.method == 'POST':
            ms = time.time_ns() // 1_000_000
            for i in range(1,13):
                data = request.form.get(f'question{str(i)}')
                with open(session['log_file'], 'a') as f:
                    f.write(f"jian{str(i)};{str(ms)};{data};\n")
                    time.sleep(0.02)
            session['game'] = False
            session['questionnaire'] = False
            if session['image_id'] == 0:
                session['slider'] = True
                return redirect(url_for('slider'))
            elif session['image_id'] >= 29:
                session['endGame'] = True
                return redirect(url_for('endGame'))
    return redirect(url_for('login'))

@app.route('/endGame', methods=['GET','POST'])
def endGame():
    if 'uid' in session:
        if (session['endGame']):
            idSession = session['ses']
            ms = time.time_ns() // 1_000_000
            with open(session['log_file'], 'a') as f:
                f.write(f"endGame;{str(ms)};null;\n")
            cond, remTime = nextSes(session['uid'])
            session['game'] = False
            session['endGame'] = False
            return render_template('endGame.html', idSession = str(idSession))
        else:
            return redirect(url_for('choice'))
    return redirect(url_for('login'))

@app.route('/choice', methods=['GET', 'POST'])
def choice():
    if 'uid' in session:
        ms = time.time_ns() // 1_000_000
        uid = session['uid']
        session['ses'], timeLast = getSes(uid)
        ses = session['ses']
        session['log_file'] = f'{LOG_FOLDER}/u{uid}s{ses}.log'
        session['beh_file'] = f'{IMAGE_FOLDER}/mission{ses}/users/{uid}.csv'
        session['image_id'] = 0
        session['game'] = False
        session['endGame'] = False
        session['questionnaire'] = False
        session['slider'] = False
        session['choice'] = 0
        with open(session['log_file'], 'a') as f:
            f.write(f"choice;{str(ms)};null;\n")
        try:
            if(session['messageTps'] != ''):
                return render_template('choice.html', ses=ses, messageTps = session['messageTps'])
            elif(session['messageSes'] != ''):
                return render_template('choice.html', ses=ses, messageSes = session['messageSes'])
            return render_template('choice.html', ses=ses)
        except:
            return render_template('choice.html', ses=ses)
    return redirect(url_for('login'))

@app.route('/getNumberSession', methods=['GET','POST'])
def getNumberSession():
    if 'uid' in session:
        ms = time.time_ns() // 1_000_000
        if(request.method == 'POST'):
            s = ''
            uid = str(session['uid'])
            cond, nbSes, timeLast = canFeedback(uid)
            with open(session['log_file'], 'a') as f:
                f.write(f"getNumberSession;{str(ms)};{str(nbSes)};\n")
            if(nbSes==0):
                s += "<span id='noMission'>Pas de missions encore réalisées.</span>"
            elif(nbSes>=1):
                for i in range(nbSes - 1):
                    s += f'''
                        <button type="submit" class="feedbackSession" id="fbS{i + 1}" data-value="fbS{i + 1}">Feedback Session {i + 1}</button>
                    '''
                if cond:
                    s += f'''
                            <button type="submit" class="feedbackSession" id="fbS{nbSes}" data-value="fbS{nbSes}">Feedback Session {nbSes}</button>
                        '''
                else:
                    s += f'''
                            <button type="submit" class="feedbackSession disabled" id="fbS{nbSes}" data-value="fbS{nbSes}" disabled>Feedback Session {nbSes}<br/>Revenez dans {timeLast}.</button>
                        '''
            return jsonify({"message": s})
        return jsonify({"message": "Need POST"})
    return redirect(url_for('login'))

@app.route('/feedback', methods=['GET','POST'])
def feedback():
    if 'uid' in session:
        if 'getFeedback' in session:
            session['messageTps'] = ''
            session['messageSes'] = ''
            ms = time.time_ns() // 1_000_000
            with open(session['log_file'], 'a') as f:
                f.write(f"feedback;{str(ms)};null;\n")
            feedback = createFeedback()
            session['idImgFeedback'] = 0
            return render_template('feedback.html', ses = session['getFeedback'], feedback=feedback)
        else:
            redirect(url_for('choice'))
    return redirect(url_for('login'))

@app.route('/getFeedback', methods=['GET','POST'])
def getFeedback():
    if 'uid' in session:
        ms = time.time_ns() // 1_000_000
        if request.method == 'POST':
            data = request.get_json().get('feedback')
            ses, timeLast = getSes(session['uid'])
            if(data=="fbS1"):
                session['getFeedback'] = 0
            elif(data=="fbS2"):
                session['getFeedback'] = 1
            elif(data=="fbS3"):
                session['getFeedback'] = 2
            elif(data=="fbS4"):
                session['getFeedback'] = 3
            elif(data=="fbS5"):
                session['getFeedback'] = 4
            elif(data=="fbS6"):
                session['getFeedback'] = 5
            elif(data=="fbS7"):
                session['getFeedback'] = 6
            if(ses <= session['getFeedback']):
                return redirect(url_for('choice'))
            with open(session['log_file'], 'a') as f:
                f.write(f"getFeedback;{str(ms)};{str(session['getFeedback'])};\n")
        return redirect(url_for('feedback'))
    return redirect(url_for('login'))

@app.route('/prevFeedback', methods=['POST'])
def prevFeedback():
    if 'uid' in session:
        ms = time.time_ns() // 1_000_000
        session['idImgFeedback'] -= 1
        with open(session['log_file'], 'a') as f:
            f.write(f"prevFeedback;{str(ms)};{str(session['idImgFeedback'])};\n")
        return jsonify(success=True)
    return jsonify(success=False)

@app.route('/nextFeedback', methods=['POST'])
def nextFeedback():
    if 'uid' in session:
        ms = time.time_ns() // 1_000_000
        session['idImgFeedback'] += 1
        if(session['idImgFeedback'] == 6 and ((session['ses']-1) == session['getFeedback'])):
            setLastSessionSeen(session['uid'],1)
        with open(session['log_file'], 'a') as f:
            f.write(f"nextFeedback;{str(ms)};{str(session['idImgFeedback'])};\n")
        return jsonify(success=True)
    return jsonify(success=False)


@app.route('/newSes', methods=['POST'])
def newSes():
    if 'uid' in session:
        ms = time.time_ns() // 1_000_000
        session['image_id'] = 0
        uid = str(session['uid'])
        ses = str(session['ses'])
        session['messageTps'] = ''
        timeBon, sess, timeRemain = interSessionTime(session['uid'])
        if(session['ses'] == 0):
            session['game'] = False
            session['questionnaire'] = True
            try:
                if os.path.exists(session['beh_file']):
                    # Renommer l'ancien fichier
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    new_filename = f'{IMAGE_FOLDER}/mission{ses}/users/{timestamp}_{str(uid)}.csv'
                    os.rename(session['beh_file'], new_filename)
                with open(session['beh_file'], 'a') as f:
                    f.write(f"image_id;decIni;decIniTime;recIA;decFin;decFinTime;gt;pts;iniClicked;finClicked;\n")
                with open(session['log_file'], 'a') as f:
                    f.write(f"choice;{str(ms)};null;\n")
            except:
                print(f"{session['beh_file']} ne peut pas être créé car existe déjà.")
            return redirect(url_for('questionnaire'))
        if(session['ses']<=6 and timeBon):
            cond, timeLast = interFeedbackTime(uid)
            if(cond==False and timeLast=="0"):
                session['messageSes'] = "Vous devez entièrement regarder votre feedback et revenir le lendemain avant de passer à la session suivante."
                return redirect(url_for('choice'))
            elif(cond==False and timeLast!="0"):
                session['messageSes'] = f"Vous avez regardé le feedback mais vous devez attendre {timeLast} avant de commencer la nouvelle session."
                return redirect(url_for('choice'))
            try:
                if os.path.exists(session['beh_file']):
                    # Renommer l'ancien fichier
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    new_filename = f'{IMAGE_FOLDER}/mission{ses}/users/{timestamp}_{str(uid)}.csv'
                    os.rename(session['beh_file'], new_filename)
                with open(session['beh_file'], 'a') as f:
                    f.write(f"image_id;decIni;decIniTime;recIA;decFin;decFinTime;gt;pts;iniClicked;finClicked;\n")
                with open(session['log_file'], 'a') as f:
                    f.write(f"choice;{str(ms)};null;\n")
            except:
                print(f"{session['beh_file']} ne peut pas être créé car existe déjà.")
            with open(session['log_file'], 'a') as f:
                f.write(f"newSes;{str(ms)};{ses};\n")
            session['game'] = False
            session['questionnaire'] = True
            return redirect(url_for('questionnaire'))
        else:
            if(session['ses']>6):
                session['messageSes'] = 'Le maximum de session a été atteint.'
                return redirect(url_for('choice'))
            else:
                if(timeRemain != 'ok'):
                    session['messageTps'] = timeRemain
                return redirect(url_for('choice'))
    return redirect(url_for('login'))

@app.route('/nextImg', methods=['GET','POST'])
def nextImg():
    if 'uid' in session:
        ms = time.time_ns() // 1_000_000
        session['image_id'] += 1
        with open(session['log_file'], 'a') as f:
            f.write(f"nextImg;{str(ms)};{session['image_id']};\n")
        return redirect(url_for('game'))
    return redirect(url_for('login'))

@app.route('/prevImg', methods=['GET','POST'])
def prevImg():
    if 'uid' in session:
        ms = time.time_ns() // 1_000_000
        session['image_id'] -= 1
        with open(session['log_file'], 'a') as f:
            f.write(f"prevImg;{str(ms)};{session['image_id']};\n")
        return redirect(url_for('game'))
    return redirect(url_for('login'))

@app.route('/listSuspect', methods=['GET','POST'])
def listSuspect():
    if 'uid' in session:
        ms = time.time_ns() // 1_000_000
        ses = session['ses']
        listS = getListSuspect(ses)
        with open(session['log_file'], 'a') as f:
            f.write(f"listSuspect;{str(ms)};null;\n")
        return render_template('listSuspect.html', ses = ses, sus = listS)
    return redirect(url_for('login'))

@app.route('/sendListSuspect', methods=['GET','POST'])
def sendListSuspect():
    if 'uid' in session:
        ms = time.time_ns() // 1_000_000
        with open(session['log_file'], 'a') as f:
            f.write(f"sendListSuspect;{str(ms)};null;\n")
        session['game'] = True
        return redirect(url_for('game'))
    return redirect(url_for('login'))

def askTargetData(idVes, ses):
    if(ses == 'training'):
        csv_file = f'{IMAGE_FOLDER}/training/scenario.csv'
    else:
        csv_file = f'{IMAGE_FOLDER}/mission{str(ses)}/scenario.csv'
    df = pd.read_csv(csv_file,delimiter=";", encoding='latin-1').head(30)
    df['id'] = df['id'].where(df['id'].astype(int)<30).astype(int)
    df = df.astype(str)
    ndf = df[df["id"] == str(idVes)].iloc[0]
    ves_dict = {}
    ves_dict['vid'] = idVes
    ves_dict['vname'] = "N/A" if ndf["name"] == 'nan' else ndf["name"]
    ves_dict['vtype'] = "N/A" if ndf["type"] == 'nan' else ndf["type"]
    ves_dict['vLastAIS'] = "N/A" if ndf["vLastAIS"] == 'nan' else ndf["vLastAIS"] + " min"
    ves_dict['vDistAIS'] = "N/A" if ndf["vDistAIS"] == 'nan' else ndf["vDistAIS"] + " NM"
    ves_dict['vheadAIS'] = "N/A" if ndf["headAIS"] == 'nan' else ndf["headAIS"] + "°"
    ves_dict['vheadReal'] = "N/A" if ndf["headReal"] == 'nan' else ndf["headReal"] + "°"
    ves_dict['vspeedAIS'] = "N/A" if ndf["speedAIS"] == 'nan' else ndf["speedAIS"] + "kn"
    ves_dict['vspeedReal'] = "N/A" if ndf["speedReal"] == 'nan' else ndf["speedReal"] + "kn"
    ves_dict['vto'] = "N/A" if ndf["to"] == 'nan' else ndf["to"]
    ves_dict['vfrom'] = "N/A" if ndf["from"] == 'nan' else ndf["from"]
    ves_dict['vnat'] = "N/A" if ndf["nat"] == 'nan' else ndf["nat"]
    ves_dict['vmmsi'] = "N/A" if ndf["mmsi"] == 'nan' else str(int(ndf["mmsi"].split(".")[0]))
    ves_dict['vimo'] = "N/A" if ndf["imo"] == 'nan' else str(int(ndf["imo"].split(".")[0]))
    ves_dict['vstatus'] = "N/A" if ndf["status"] == 'nan' else ndf["status"]
    ves_dict['vlengthAIS'] = "N/A" if ndf["lengthAIS"] == 'nan' else str(int(ndf["lengthAIS"].split(".")[0])) + "m"
    ves_dict['vlengthReal'] = "N/A" if ndf["lengthReal"] == 'nan' else str(int(ndf["lengthReal"].split(".")[0])) + "m"
    ves_dict['vwidth'] = "N/A" if ndf["width"] == 'nan' else str(int(ndf["width"].split(".")[0])) + " m"
    ves_dict['vbuilt'] = "N/A" if ndf["built"] == 'nan' else str(int(ndf["built"].split(".")[0]))
    ves_dict['vweight'] = "N/A" if ndf["weight"] == 'nan' else ndf["weight"] + "kt"
    ves_dict['vdraught'] = "N/A" if ndf["draught"] == 'nan' else ndf["draught"] + "m"
    if (ndf["inMaritimeRoad"] != 'nan'):
        ves_dict['inMaritimeRoad'] = "Oui" if str(int(ndf["inMaritimeRoad"].split(".")[0])) == "1" else "Non"
    else:
        ves_dict['inMaritimeRoad'] = "Non"
    if(ndf["inFishingZone"] != 'nan'):
        ves_dict['inFishingZone'] = "Oui" if str(int(ndf["inFishingZone"].split(".")[0])) == "1" else "Non"
    else:
        ves_dict['inFishingZone'] = "Non"
    if(ndf["inCoastZone"] != 'nan'):
        ves_dict['inCoastZone'] = "Oui" if str(int(ndf["inCoastZone"].split(".")[0])) == "1" else "Non"
    else:
        ves_dict['inCoastZone'] = "Non"
    if(ndf["nearOtherVessel"] != 'nan'):
        ves_dict['nearOtherVessel'] = "Oui" if str(int(ndf["nearOtherVessel"].split(".")[0])) == "1" else "Non"
    else:
        ves_dict['nearOtherVessel'] = "Non"
    if(ndf["protectedZone"] != 'nan'):
        ves_dict['protectedZone'] = "Oui" if str(int(ndf["protectedZone"].split(".")[0])) == "1" else "Non"
    else:
        ves_dict['protectedZone'] = "Non"
    ves_dict['recIA'] = ndf["recIA"]
    ves_dict['gt'] = ndf["gt"]
    ves_dict['expIA'] = ndf["expIA"]
    ves_dict['expGT'] = ndf["expGT"]
    return ves_dict

def getListSuspect(ses):
    t = []
    if(ses == 'training'):
        csv_file = f'{IMAGE_FOLDER}/training/suspects.csv'
    else:
        csv_file = f'{IMAGE_FOLDER}/mission{str(ses)}/suspects.csv'
    with open(csv_file, 'r') as file:
        reader = csv.reader(file, delimiter=';')
        next(reader, None)
        for row in reader:
            if(len(row)>0):
                susName = row[1]
                t.append(susName)
    return t

def nextSes(uid):
    nbPts = 0
    cond, ses, timeLast = interSessionTime(uid)
    if(cond):
        file = f'{IMAGE_FOLDER}/mission{ses}/users/{uid}.csv';
        nbPts = pd.read_csv(file,delimiter=";")["pts"].sum()
        if(ses<7):
            ms = time.time_ns() // 1_000_000
            with open(session['log_file'], 'a') as f:
                f.write(f"nextSes;{str(ms)};null;\n")
            addSes(uid, nbPts)
            return True, ''
    else:
        return False, timeLast

def writeBeh():
    beh_file = session['beh_file']
    pts = 0
    if(session['beh_dict']['iniClicked']==False):
        pts -= 10;
    if(session['beh_dict']['finClicked']==False):
        pts -= 10;
    if(session['beh_dict']['decFin'] == session['beh_dict']['gt']):
        pts += 5;
    else:
        pts -= 11;
    with open(beh_file, 'a') as f:
        f.write(f"{str(session['image_id'])};{session['beh_dict']['decIni']};{str(session['beh_dict']['decIniTime'])};{session['beh_dict']['recIA']};{session['beh_dict']['decFin']};{str(session['beh_dict']['decFinTime'])};{session['beh_dict']['gt']};{pts};{session['beh_dict']['iniClicked']};{session['beh_dict']['finClicked']};\n");
    session['image_id'] = session['image_id'] + 1

def createFeedback():
    tab_fb = [{},{},{},{},{},{}]
    list_sus = getListSuspect(session['getFeedback'])
    sesUser = str(session['getFeedback'])
    uid = str(session['uid'])
    file = f'{IMAGE_FOLDER}/mission{sesUser}/users/{uid}.csv';
    grp = session['grp']
    if(str(grp) == "1"):
        if(session['getFeedback']==0):
            tab_data = g1_data_fb0
        elif(session['getFeedback']==1):
            tab_data = g1_data_fb1
        elif(session['getFeedback']==2):
            tab_data = g1_data_fb2
        elif(session['getFeedback']==3):
            tab_data = g1_data_fb3
        elif(session['getFeedback']==4):
            tab_data = g1_data_fb4
        elif(session['getFeedback']==5):
            tab_data = g1_data_fb5
        elif(session['getFeedback']==6):
            tab_data = g2_data_fb6
    elif(str(grp) == "2"):
        if(session['getFeedback']==0):
            tab_data = g2_data_fb0
        elif(session['getFeedback']==1):
            tab_data = g2_data_fb1
        elif(session['getFeedback']==2):
            tab_data = g2_data_fb2
        elif(session['getFeedback']==3):
            tab_data = g2_data_fb3
        elif(session['getFeedback']==4):
            tab_data = g2_data_fb4
        elif(session['getFeedback']==5):
            tab_data = g2_data_fb5
        elif(session['getFeedback']==6):
            tab_data = g2_data_fb6
    userDatas = pd.read_csv(file,delimiter=";",encoding='utf-8', encoding_errors='ignore')
    for i in range(len(tab_data)):
        userData = userDatas.iloc[[tab_data[i]]]
        vdict = askTargetData(tab_data[i], sesUser)
        image_path = f"{IMAGE_FOLDER}/mission{str(session['getFeedback'])}/64nm/{str(tab_data[i])}.png"
        tab_fb[i]["image_id"] = tab_data[i]
        with open(image_path, 'rb') as image_file:
            tab_fb[i]["imgTac"] = base64.b64encode(image_file.read()).decode('utf-8')
        image_path = f"{IMAGE_FOLDER}/mission{str(session['getFeedback'])}/vessels/{str(tab_data[i])}.jpg"
        with open(image_path, 'rb') as image_file:
            tab_fb[i]["imgVes"] = base64.b64encode(image_file.read()).decode('utf-8')
        if(userData["decIni"].iloc[0] == "neutre"):
            tab_fb[i]["decIni"] = '<span style="color: green; font-weight: bold">Neutre</span>'
        elif(userData["decIni"].iloc[0] == "suspect"):
            tab_fb[i]["decIni"] = '<span style="color: red; font-weight: bold">Suspect</span>'
        if(vdict["recIA"] == "neutre"):
            tab_fb[i]["recIA"] = '<span style="color: green; font-weight: bold">Neutre</span>'
        elif(vdict["recIA"] == "suspect"):
            tab_fb[i]["recIA"] = '<span style="color: red; font-weight: bold">Suspect</span>'
        tab_fb[i]["expIA"] = vdict["expIA"]
        if(userData["decFin"].iloc[0] == "neutre"):
            tab_fb[i]["decFin"] = '<span style="color: green; font-weight: bold">Neutre</span>'
        elif(userData["decFin"].iloc[0] == "suspect"):
            tab_fb[i]["decFin"] = '<span style="color: red; font-weight: bold">Suspect</span>'
        if(vdict["gt"] == "neutre"):
            tab_fb[i]["gt"] = '<span style="color: green; font-weight: bold">Neutre</span>'
        elif(vdict["gt"] == "suspect"):
            tab_fb[i]["gt"] = '<span style="color: red; font-weight: bold">Suspect</span>'
        tab_fb[i]["decIniTime"] = userData["decIniTime"].iloc[0]
        tab_fb[i]["decFinTime"] = userData["decFinTime"].iloc[0]
        tab_fb[i]["ves_dict"] = vdict
    tab_rank, nbParticipantsSes = getRank(uid, sesUser)
    # tab_rank = ["N/A","N/A","N/A","N/A","N/A","N/A","N/A","N/A","N/A"]
    feedback = ''
    num_fb = session['getFeedback']
    if(num_fb>=0):
        feedback += f'''
            <div id="contextes-container">
            '''
        for i in range(6):
            if(i==0):
                feedback += f'''
                <div class="contexte active" id="contexte-{str(i)}">
                '''
            else:
                feedback += f'''
                <div class="contexte" id="contexte-{str(i)}">
                '''
            feedback += f'''
                    <table id="tab_data">
                        <tr id="tr_th">
                            <th class="th_vesData" id="th_sus">
                                Liste suspects
                            </th>
                            <th class="th_vesData" id="th_ais">
                                Données AIS
                            </th>
                            <th class="th_vesData" id="th_sens">
                                Données capteurs
                            </th>
                        </tr>
                        <tr id="tr_vesData">
                            <td class="vesData" id="tdSus">
                                {list_sus[0]} <br/>
                                {list_sus[1]} <br/>
                                {list_sus[2]} <br/>
                                {list_sus[3]} <br/>
                                {list_sus[4]} <br/>
                                {list_sus[5]} <br/>
                                {list_sus[6]} <br/>
                                {list_sus[7]} <br/>
                                {list_sus[8]} <br/>
                                {list_sus[9]} <br/>
                                {list_sus[10]} <br/>
                                {list_sus[11]} <br/>
                                {list_sus[12]} <br/>
                                {list_sus[13]} <br/>
                                {list_sus[14]} <br/>
                            </td>
                            <td class="vesData" id="tdAis">
                                <strong>Vitesse </strong>: {tab_fb[i]["ves_dict"]["vspeedAIS"]}<br/>
                                <strong>Cap </strong>: {tab_fb[i]["ves_dict"]["vheadAIS"]}<br/>
                                <strong>Longueur </strong>: {tab_fb[i]["ves_dict"]["vlengthAIS"]}<br/>
                                <strong>Largeur </strong>: {tab_fb[i]["ves_dict"]["vwidth"]}<br/>
                                <strong>MAJ </strong>: {tab_fb[i]["ves_dict"]["vLastAIS"]}<br/>
                                <strong>Type </strong>: {tab_fb[i]["ves_dict"]["vtype"]}<br/>
                                <strong>Nom </strong>: {tab_fb[i]["ves_dict"]["vname"]}<br/>
                                <strong>Nat </strong>: {tab_fb[i]["ves_dict"]["vnat"]}<br/>
                                <strong>MMSI </strong>: {tab_fb[i]["ves_dict"]["vmmsi"]}<br/>
                                <strong>IMO </strong>: {tab_fb[i]["ves_dict"]["vimo"]}<br/>
                                <strong>De </strong>: {tab_fb[i]["ves_dict"]["vfrom"]}<br/>
                                <strong>A </strong>: {tab_fb[i]["ves_dict"]["vto"]}<br/>
                                <strong>Statut </strong>: {tab_fb[i]["ves_dict"]["vstatus"]}<br/>
                                <strong>Année </strong>: {tab_fb[i]["ves_dict"]["vbuilt"]}<br/>
                                <strong>Poids </strong>: {tab_fb[i]["ves_dict"]["vweight"]}<br/>
                                <strong>Tirant </strong>: {tab_fb[i]["ves_dict"]["vdraught"]}<br/>
                            </td>
                            <td class="vesData" id="tdSensor">
                                <strong>Vitesse </strong>: {tab_fb[i]["ves_dict"]["vspeedReal"]}<br/>
                                <strong>Cap </strong>: {tab_fb[i]["ves_dict"]["vheadReal"]}<br/>
                                <strong>Longueur </strong>: {tab_fb[i]["ves_dict"]["vlengthReal"]}<br/>
                                <strong>Distance AIS </strong>: {tab_fb[i]["ves_dict"]["vDistAIS"]}<br/>
                                <strong>Route maritime </strong>: {tab_fb[i]["ves_dict"]["inMaritimeRoad"]}<br/>
                                <strong>Zone de pèche </strong>: {tab_fb[i]["ves_dict"]["inFishingZone"]}<br/>
                                <strong>Zone côtière </strong>: {tab_fb[i]["ves_dict"]["inCoastZone"]}<br/>
                                <strong>Navire proche </strong>: {tab_fb[i]["ves_dict"]["nearOtherVessel"]}<br/>
                                <strong>Zone protégée </strong>: {tab_fb[i]["ves_dict"]["protectedZone"]}<br/>
                            </td>
                        </tr>
                        <tr id="tr_ves">
                            <td colspan="3" id="td_ves">
                                <img class="imgVes" id="imgVes" src="data:image/png;base64,{ tab_fb[i]["imgVes"] }"/>
                                <div class="loupe" id="loupe"></div>
                            </td>
                        </tr>
                    </table>
                    <table id="tab_tac">
                        <tr id="tr_tac">
                            <td id="td_img_tac">
                                <h2 class="h2Tac">Cas numéro {str(i + 1)}</h2>
                                <img id="imgTac" src="data:image/png;base64,{ tab_fb[i]["imgTac"] }"/>
                            </td>
                        </tr>
                    </table>
                    <table id="tab_dec">
                        <tr id="tr_data">
                            <td id="di1">
                                Votre décision initiale était {tab_fb[i]["decIni"]}.
                            </td>
                            <td id="ria1" colspan="2">
                                La recommandation de l'IA était {tab_fb[i]["recIA"]}, parce que {tab_fb[i]["expIA"]}.
                            </td>
                            <td id="gt1">
                                Votre décision finale était {tab_fb[i]["decFin"]}.
                            </td>
                            <td id="data1">
                                La vraie réponse était {tab_fb[i]["gt"]}.
                            </td>
                        </tr>
                    </table>
                    <div class="navigation-buttons">
                        <form class="myForm1" method="POST" action="/choice">
                            <!-- tes champs ici -->
                            <button class="btn-nav" type="submit" id="previousPage">Page<br/>choix</button>
                        </form>
                        <button class="btn-nav btn-prev" id="btn-prev">←<br/>Précédent</button>
                        <button class="btn-nav btn-next" id="btn-next">Suivant<br/>→</button>
                        <form class="myForm2" method="POST" action="/choice">
                            <!-- tes champs ici -->
                            <button class="btn-nav" type="submit" id="previousPage">Page choix</button>
                        </form>
                    </div>
                </div>
            '''
    feedback += f'''
                <div class="contexte" id="contexte-6">
                    <h2 id="h2Rank">Classement</h2>
                    <div class="rank-top-row">
                        <div class="div_rank" id="firstSes">
                            <h3>Le 1er de cette session :</h3>
                            <ul>
                                <li>a eu {tab_rank[0]} points.</li>
                                <li>a dépassé {tab_rank[1]} fois le temps pour la décision intiale.</li>
                                <li>a dépassé {tab_rank[2]} fois le temps pour la décision finale.</li>
                            </ul>
                        </div>
                        <!-- Dans le classement, le joueur juste devant lui -->
                        <div class="div_rank" id="frontPlayer">
                            <h3>Le participant juste devant vous :</h3>
                            <ul>
                                <li>a eu {tab_rank[3]} points.</li>
                                <li>a dépassé {tab_rank[4]} fois le temps pour la décision intiale.</li>
                                <li>a dépassé {tab_rank[5]} fois le temps pour la décision finale.</li>
                            </ul>
                        </div>
                    </div>
                    <div class="rank-bottom-row">
                        <div class="div_rank" id="player">
                            <h3>Vous :</h3>
                            <ul>
                                <li>avez eu {tab_rank[6]} points.</li>
                                <li>avez dépassé {tab_rank[7]} fois le temps pour la décision intiale.</li>
                                <li>avez dépassé {tab_rank[8]} fois le temps pour la décision finale.</li>
                            </ul>
                        </div>
                    </div>
                    <div class="navigation-buttons" id="nav-but-rank">
                        <form class="myForm1" method="POST" action="/choice">
                            <!-- tes champs ici -->
                            <button class="btn-nav" type="submit" id="previousPage">Page choix</button>
                        </form>
                        <button class="btn-nav btn-rank btn-prev" id="btn-prev">←<br/>Précédent</button>
                        <button class="btn-nav btn-rank btn-next" id="btn-next">Suivant<br/>→</button>
                        <form class="myForm2" method="POST" action="/choice">
                            <!-- tes champs ici -->
                            <button class="btn-nav btn-rank btn-rank" type="submit" id="previousPage">Page<br/>choix</button>
                        </form>
                    </div>
                </div>
        '''
    feedback += '''
                <div id="loupe"></div>
            </div>
    '''
    return feedback

def getRank(uid, ses):
    dir = f'{IMAGE_FOLDER}/mission{ses}/users/'
    # Liste pour stocker les DataFrames
    list_dfs = []
    tab = []
    # Boucle sur les fichiers de 1.csv à 26.csv
    nbPart = 0
    for i in range(1, 38):
        file_path = os.path.join(dir, f'{i}.csv')
        try:
            df = pd.read_csv(file_path, delimiter=';')
            df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
            df['utilisateur'] = i  # Ajouter l'ID utilisateur basé sur le nom du fichier
            df['iniClicked'] = df['iniClicked'].map({True: 0, False: 1})
            df['finClicked'] = df['finClicked'].map({True: 0, False: 1})
            list_dfs.append(df)
            nbPart += 1
        except FileNotFoundError:
            print(f'Fichier non trouvé : {file_path}')
        except Exception as e:
            print(f"Erreur lors du chargement du fichier {i}.csv: {e}")

    if list_dfs:
        all_data = pd.concat(list_dfs, ignore_index=True)
        # S'assurer que les colonnes nécessaires existent
        required_columns = ['utilisateur', 'pts', 'iniClicked', 'finClicked']
        if all(col in all_data.columns for col in required_columns):
            # Calculer les statistiques par utilisateur
            user_stats = all_data.groupby('utilisateur').agg({
                'pts': 'sum',
                'iniClicked': 'sum',
                'finClicked': 'sum'
            }).reset_index()
            # Trier par points en ordre décroissant
            user_stats_sorted = user_stats.sort_values('pts', ascending=False).reset_index(drop=True)
            # Récupérer l'utilisateur avec le plus de points
            top_user = user_stats_sorted.iloc[0]
            tab.append(top_user['pts'])
            tab.append(top_user['iniClicked'])
            tab.append(top_user['finClicked'])
            # Pour trouver l'utilisateur juste devant l'utilisateur actuel
            # Supposons que l'utilisateur actuel est identifié par 'current_user_id'
            current_user_id = int(uid)  # À remplacer par l'ID de l'utilisateur actuel
            # Trouver la position de l'utilisateur actuel dans le classement
            current_user_position = user_stats_sorted[user_stats_sorted['utilisateur'] == current_user_id].index
            if len(current_user_position) > 0:
                current_position = current_user_position[0]
                current_user = user_stats_sorted.iloc[current_position]
                if current_position > 0:  # S'assurer qu'il y a un utilisateur devant
                    user_ahead = user_stats_sorted.iloc[current_position - 1]
                    tab.append(user_ahead['pts'])
                    tab.append(user_ahead['iniClicked'])
                    tab.append(user_ahead['finClicked'])
                else:
                    tab.append(current_user['pts'])
                    tab.append(current_user['iniClicked'])
                    tab.append(current_user['finClicked'])
                tab.append(current_user['pts'])
                tab.append(current_user['iniClicked'])
                tab.append(current_user['finClicked'])
            else:
                print("Utilisateur actuel non trouvé dans les données")
        else:
            missing_columns = [col for col in required_columns if col not in all_data.columns]
            print(f"Colonnes manquantes: {missing_columns}")
    else:
        print("Aucun fichier CSV n'a pu être chargé")
    return tab, nbPart

#if __name__ == '__main__':
#
#
#

