#!/usr/bin/env python3
import mysql.connector
from urllib.parse import urlparse

DATABASE_URL = 'mysql://root:dzADEIqMtSkFfNoDFDTIFKTVXkRIwZIH@ballast.proxy.rlwy.net:44986/railway'
parsed = urlparse(DATABASE_URL)
conn = mysql.connector.connect(
    host=parsed.hostname,
    port=parsed.port,
    user=parsed.username,
    password=parsed.password,
    database=parsed.path.lstrip('/')
)
cursor = conn.cursor(dictionary=True)
cursor.execute('SHOW TRIGGERS')
triggers = cursor.fetchall()
print('Triggers encontrados:')
for trigger in triggers:
    print(trigger)
cursor.close()
conn.close()
