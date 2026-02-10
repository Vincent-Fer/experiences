import mysql.connector
from datetime import datetime, timedelta, time, timezone
import time as times

# Configuration MySQL
DB_CONFIG = {
    'host': 'your_adress',
    'user': 'your_login',
    'password': 'your_password!',   
    'database': 'your_base'
}

INTER_SESSION = 60 # EN HEURE

TIME_FEEDBACK = 12 # EN HEURE

MIN_TO_DEL_TIMER = 10 # NOMBRE DE MINUTE AFK AVANT DE SUPPRIMER UN COUNTDOWN

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

def createTable():
    """Crée la table users si elle n'existe pas"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        uid INT PRIMARY KEY AUTOINCREMENT,
        login TEXT NOT NULL,
        password TEXT NOT NULL,
        lastSession INT NOT NULL,
        timeLastSession BIGINT NOT NULL,
        lastSessionSeen INT NOT NULL,
        nbPoints INTEGER NOT NULL,
        grp INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL
    )
    ''')
    conn.commit()
    cursor.close()
    conn.close()

def readDb():
    db = get_db_connection()
    cursor = db.cursor()
    # Lecture des données
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows

def insertUser(login, password, lastSession, lastSessionSeen, nbPts, grp, name, email):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("INSERT INTO users (login, password, lastSession, lastSessionSeen, timeLastSession, nbPoints, grp, name, email) SELECT %s, %s, %s, %s, %s, %s, %s, %s, %s WHERE NOT EXISTS (SELECT 1 FROM users WHERE login = %s)",
    (login, password, lastSession, lastSessionSeen, times.time_ns() // 1_000_000, nbPts, grp, name, email, login))
    db.commit()
    print(f'{cursor.rowcount} ligne(s) insérée(s).')
    cursor.close()
    db.close()
    return 'Done'

def modifyUser(login, varToMod, newValue):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(f"UPDATE users SET {varToMod} = %s WHERE login = %s", (newValue, login))
    if(varToMod=="lastSession"):
        cursor.execute(f"UPDATE users SET timeLastSession = %s WHERE login = %s", (times.time_ns() // 1_000_000, login))
    db.commit()
    cursor.close()
    db.close()
    return 'Done'

def modifyUserById(uid, varToMod, newValue):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(f"UPDATE users SET {varToMod} = %s WHERE uid = %s", (newValue, uid))
    db.commit()
    cursor.close()
    db.close()
    return 'Done'

def getUser(uid):
    db = get_db_connection()
    cursor = db.cursor()
    # Lecture des données
    cursor.execute("SELECT lastSession, grp FROM users WHERE uid = %s", (str(uid),))
    res = cursor.fetchall()[0]
    cursor.close()
    db.close()
    return uid, res[0], res[1]

def canFeedback(uid):
    ms = times.time_ns() // 1_000_000
    ses, sesTime = getSes(uid)
    diffTime = ms - sesTime
    diff_heures = diffTime / (1000 * 60 * 60)
    timeNextDay = get_next_day_06h00_ms_local(sesTime)

    if ms >= timeNextDay and diff_heures >= TIME_FEEDBACK:
        return True, ses, "ok"

    if TIME_FEEDBACK == 0:
        return True, ses, "ok"
    # Temps restant jusqu'à 12h
    reste_12h_ms = max(0, (TIME_FEEDBACK * 60 * 60 * 1000) - diffTime)
    # Temps restant jusqu'au lendemain 00h01
    reste_jour_ms = max(0, timeNextDay - ms)
    # On prend le maximum des deux (il faut que les deux conditions soient remplies)
    temps_restant_ms = max(reste_12h_ms, reste_jour_ms)

    seconds = int(temps_restant_ms // 1000)
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return False, ses, f"{hours:02}h{minutes:02}m{secs:02}s"

def addSes(uid, nbPts):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(f"UPDATE users SET lastSession = lastSession + 1 WHERE uid = %s", (str(uid),))
    cursor.execute(f"UPDATE users SET timeLastSession = %s WHERE uid = %s", (times.time_ns() // 1_000_000, str(uid)))
    cursor.execute(f"UPDATE users SET nbPoints = nbPoints + %s WHERE uid = %s", (int(nbPts), str(uid)))
    cursor.execute(f"UPDATE users SET lastSessionSeen = %s WHERE uid = %s", (0, str(uid)))
    cursor.execute(f"UPDATE users SET name = %s WHERE uid = %s", (str(times.time_ns() // 1_000_000), str(uid)))
    db.commit()
    cursor.close()
    db.close()
    return 'Done'

def getSes(uid):
    db = get_db_connection()
    cursor = db.cursor()
    # Lecture des données
    cursor.execute("SELECT lastSession, timeLastSession FROM users WHERE uid = %s", (str(uid),))
    ses = cursor.fetchall()[0]
    cursor.close()
    db.close()
    return ses[0], ses[1]

def get_next_day_06h00_ms_local(sesTime):
    # Crée un objet timezone UTC+2
    tz = timezone(timedelta(hours=2))

    # Convertit le timestamp en datetime UTC+1
    now = datetime.fromtimestamp(sesTime / 1000, tz=tz)

    # Calcule la date du lendemain
    next_day = now.date() + timedelta(days=1)

    # Crée le datetime du lendemain à 06h00 en UTC+1
    next_day_06h00 = datetime.combine(next_day, time(hour=6, minute=0), tzinfo=tz)

    # Retourne le timestamp en ms
    timestamp_ms = int(next_day_06h00.timestamp() * 1000)
    return timestamp_ms

def get_third_day_06h00_ms_local(sesTime):
    # Crée un objet timezone UTC+2
    tz = timezone(timedelta(hours=2))

    # Convertit le timestamp en datetime UTC+2
    now = datetime.fromtimestamp(sesTime / 1000, tz=tz)

    # Calcule la date du lendemain
    next_day = now.date() + timedelta(days=1)

    # Crée le datetime du lendemain à 06h00 en UTC+1
    next_day_06h00 = datetime.combine(next_day, time(hour=6, minute=0), tzinfo=tz)

    timestamp_ms = int(next_day_06h00.timestamp() * 1000)

    now = datetime.fromtimestamp(timestamp_ms / 1000, tz=tz)
    
    third_day = now.date() + timedelta(days=2)

    third_day_06h00 = datetime.combine(third_day, time(hour=6, minute=0), tzinfo=tz)

    timestamp_3rd_ms = int(third_day_06h00.timestamp() * 1000)

    return int(timestamp_3rd_ms)

def interSessionTime(uid):
    ms = times.time_ns() // 1_000_000
    ses, sesTime = getSes(uid)
    if int(ses) == 0:
        return True, ses, "ok"

    timeThirdDay = get_third_day_06h00_ms_local(sesTime)
    if ms >= timeThirdDay:
        return True, ses, "ok"

    # Temps restant jusqu'au 3ème jour à 6h du matin
    temps_restant_ms = max(0, timeThirdDay - ms)
    seconds = int(temps_restant_ms // 1000)
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return False, ses, f"{hours:02}h{minutes:02}m{secs:02}s"

def interFeedbackTime(uid):
    ms = times.time_ns() // 1_000_000
    cond, sesTime = getLastSessionSeen(uid)

    if int(cond) == 0:
        return False, "0"

    next_day = get_next_day_06h00_ms_local(sesTime)
    if int(cond) == 1 and ms >= next_day:
        return True, "ok"

    temps_restant_ms = max(0, next_day - ms)
    seconds = int(temps_restant_ms // 1000)
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return False, f"{hours:02}h{minutes:02}m{secs:02}s"

def verify_credentials(username_to_check, password_to_check):
    db = get_db_connection()
    cursor = db.cursor()
    # Lecture des données
    cursor.execute("SELECT uid, lastSession, grp FROM users WHERE login = %s AND password = %s",(username_to_check, password_to_check))
    usr = cursor.fetchall()
    cursor.close()
    db.close()
    if (len(usr) == 0):
        return False, None, None, None
    else:
        return True, usr[0][0], usr[0][1], usr[0][2]

def setLastSessionSeen(uid, lastSessionSeen):
    cond, lastTime = getLastSessionSeen(uid)
    if(int(cond)==0):
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(f"UPDATE users SET lastSessionSeen = %s WHERE uid = %s", (lastSessionSeen, str(uid)))
        cursor.execute(f"UPDATE users SET name = %s WHERE uid = %s", (str(times.time_ns() // 1_000_000), str(uid)))
        db.commit()
        cursor.close()
        db.close()
        return 'Done'
    return 'Déjà regardé.'

def getLastSessionSeen(uid):
    db = get_db_connection()
    cursor = db.cursor()
    # Lecture des données
    cursor.execute("SELECT lastSessionSeen, name FROM users WHERE uid = %s", (str(uid),))
    ses = cursor.fetchall()[0]
    cursor.close()
    db.close()
    if(ses[0]==0):
        return False, int(ses[1])
    elif(ses[0]==1):
        return True, int(ses[1])

def get_timer_state(uid, ses, code):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT code, phase, countdown, last_active FROM timers WHERE code = %s",(str(code),))
    row = cursor.fetchone()
    state = None
    if row:
        keys = ['code', 'phase', 'countdown', 'last_active']
        state = dict(zip(keys, row))
        current_time_ms = times.time_ns() // 1_000_000  # Temps actuel en ms
        last_active = state['last_active']
        # Supprimer si inactif depuis plus de 10 minutes
        if current_time_ms - last_active > MIN_TO_DEL_TIMER * 60 * 1000:
            cursor.execute(
                "DELETE FROM timers WHERE code = %s",
                (code,)
            )
            db.commit()
            cursor.close()
            db.close()
            return None
    cursor.close()
    db.close()
    return state if row else None

def set_timer_state(uid, ses, code, phase, countdown):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO timers (code, phase, countdown, last_active) VALUES (%s, %s, %s, %s) "
        "ON DUPLICATE KEY UPDATE phase=VALUES(phase), countdown=VALUES(countdown), last_active=VALUES(last_active)",
        (code, phase, countdown, times.time_ns() // 1_000_000)
    )
    db.commit()
    cursor.close()
    db.close()
    return True;

# if __name__ == '__main__':
