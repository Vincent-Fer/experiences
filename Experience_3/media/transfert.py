import sqlite3
import mysql.connector

# Configuration MySQL
DB_CONFIG = {
    'host': 'vfer.mysql.pythonanywhere-services.com',
    'user': 'vfer',         # <-- remplace par ton user
    'password': 'Kmy4y3Wkf89T952J8tynMK43!',     # <-- remplace par ton mot de passe
    'database': 'vfer$default' # <-- remplace par le nom de ta base
}

# Connexion à SQLite
sqlite_conn = sqlite3.connect('users.db')
sqlite_cursor = sqlite_conn.cursor()

# Récupérer toutes les données de la table users
sqlite_cursor.execute('SELECT uid, login, password, lastSession, lastSessionSeen, timeLastSession, nbPoints, grp, name, email FROM users')
data_users = sqlite_cursor.fetchall()

# Connexion à MySQL
mysql_conn = mysql.connector.connect(**DB_CONFIG)
mysql_cursor = mysql_conn.cursor()

# Insérer les données dans MySQL
for row in data_users:
    print(row)
    uid, login, password, lastSession, lastSessionSeen, timeLastSession, nbPoints, grp, name, email = row
    mysql_cursor.execute(
        "INSERT INTO users (uid, login, password, lastSession, lastSessionSeen, timeLastSession, nbPoints, grp, name, email) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "
        "ON DUPLICATE KEY UPDATE "
        "login=VALUES(login), password=VALUES(password), lastSession=VALUES(lastSession), lastSessionSeen=VALUES(lastSessionSeen), "
        "timeLastSession=VALUES(timeLastSession), nbPoints=VALUES(nbPoints), grp=VALUES(grp), "
        "name=VALUES(name), email=VALUES(email)",
        (uid, login, password, lastSession, lastSessionSeen, timeLastSession, nbPoints, grp, name, email)
    )

mysql_conn.commit()

# Fermeture des connexions
sqlite_conn.close()
mysql_cursor.close()
mysql_conn.close()

print('Transfert terminé avec succès')