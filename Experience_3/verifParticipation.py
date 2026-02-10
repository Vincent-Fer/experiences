import os
import shutil
import zipfile
import csv
from datetime import datetime

def collect_user_participation(media_path):
    user_data = {}
    today = datetime.now().date()  # Date du jour sans l'heure

    for mission_folder in os.listdir(media_path):
        mission_path = os.path.join(media_path, mission_folder)
        if os.path.isdir(mission_path) and mission_folder.startswith('mission'):
            try:
                session_num = int(mission_folder.replace('mission', ''))
            except ValueError:
                continue
            users_path = os.path.join(mission_path, 'users')
            if os.path.exists(users_path) and os.path.isdir(users_path):
                for user_file in os.listdir(users_path):
                    if user_file.endswith('.csv'):
                        user_name = user_file.replace('.csv', '')
                        file_path = os.path.join(users_path, user_file)
                        creation_time = os.path.getctime(file_path)
                        creation_date = datetime.fromtimestamp(creation_time).date()  # On ne garde que la date
                        if user_name not in user_data:
                            user_data[user_name] = {
                                'last_date': creation_date,
                                'last_session': session_num
                            }
                        else:
                            if session_num > user_data[user_name]['last_session']:
                                user_data[user_name]['last_date'] = creation_date
                                user_data[user_name]['last_session'] = session_num
                            elif session_num == user_data[user_name]['last_session']:
                                if creation_date > user_data[user_name]['last_date']:
                                    user_data[user_name]['last_date'] = creation_date

    # Ajout du nombre de jours depuis la dernière participation
    for user in user_data:
        last_date = user_data[user]['last_date']
        days_since_last = (today - last_date).days
        user_data[user]['days_since_last'] = days_since_last

    return user_data

def organize_and_zip_files(media_path, logs_path, output_zip):
    user_data = collect_user_participation(media_path)
    temp_dir = 'temp_data'
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    data_dir = os.path.join(temp_dir, 'data')
    os.makedirs(data_dir)
    # Copier les fichiers csv dans data/session
    for mission_folder in os.listdir(media_path):
        mission_path = os.path.join(media_path, mission_folder)
        if os.path.isdir(mission_path) and mission_folder.startswith('mission'):
            try:
                session_num = int(mission_folder.replace('mission', ''))
            except ValueError:
                continue
            users_path = os.path.join(mission_path, 'users')
            if os.path.exists(users_path) and os.path.isdir(users_path):
                session_dir = os.path.join(data_dir, str(session_num))
                os.makedirs(session_dir, exist_ok=True)
                for user_file in os.listdir(users_path):
                    if user_file.endswith('.csv'):
                        src_file = os.path.join(users_path, user_file)
                        dst_file = os.path.join(session_dir, user_file)
                        shutil.copy2(src_file, dst_file)
    # Copie des logs
    logs_dir = os.path.join(temp_dir, 'logs')
    os.makedirs(logs_dir)
    if os.path.exists(logs_path) and os.path.isdir(logs_path):
        for log_file in os.listdir(logs_path):
            if log_file.endswith('.log'):
                src_log_file = os.path.join(logs_path, log_file)
                dst_log_file = os.path.join(logs_dir, log_file)
                shutil.copy2(src_log_file, dst_log_file)
    # Sauvegarder user_participation.csv dans temp_dir
    user_participation_file = os.path.join(temp_dir, 'user_participation.csv')
    with open(user_participation_file, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['user', 'last_date', 'last_session','days_since_last'])
        for user in sorted(user_data, key=lambda x: int(x)):  # tri numérique si possible
            data = user_data[user]
            last_date = data['last_date'].strftime('%Y-%m-%d')
            last_session = data['last_session']
            days_since_last = data['days_since_last']
            writer.writerow([user, last_date, last_session, days_since_last])
    # Créer le fichier zip
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(user_participation_file, arcname='user_participation.csv')
        for root, dirs, files in os.walk(data_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, temp_dir)
                zipf.write(file_path, arcname=arcname)
        for root, dirs, files in os.walk(logs_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, temp_dir)
                zipf.write(file_path, arcname=arcname)
    shutil.rmtree(temp_dir)

# Exemple d'utilisation :
media_path = './media'
logs_path = './logs'
output_zip = 'participations.zip'
organize_and_zip_files(media_path, logs_path, output_zip)