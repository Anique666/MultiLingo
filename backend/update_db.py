import sqlite3
conn = sqlite3.connect('multilingo.db')
cursor = conn.cursor()
cursor.execute("UPDATE users SET username = 'anish' WHERE email = 'anish@mail.com'")
conn.commit()
conn.close()
print('Done')
