import sqlite3
import os

db_path = "veggieflow.db"
# also check the parent dir just in case
if not os.path.exists(db_path):
    print(f"Warning: {db_path} not found in current directory. Checking parent...")
    db_path = "../veggieflow.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, username, role FROM users")
    users = cursor.fetchall()
    
    print(f"--- Users in {db_path} ---")
    if not users:
        print("No users found in the database!")
    else:
        print("ID | Username | Role")
        print("-" * 30)
        for user in users:
            print(f"{user[0]} | {user[1]} | {user[2]}")
            
    conn.close()
except sqlite3.Error as e:
    print(f"Database error: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
