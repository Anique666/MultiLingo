import sqlite3
conn = sqlite3.connect('multilingo.db')
cursor = conn.cursor()
cursor.execute("SELECT * FROM users WHERE email LIKE '%anish%' or username LIKE '%anish%'")
print(cursor.fetchall())
conn.close()
