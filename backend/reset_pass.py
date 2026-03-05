import sqlite3
import os
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

db_path = "veggieflow.db"
if not os.path.exists(db_path):
    print(f"Warning: {db_path} not found in current directory. Checking parent...")
    db_path = "../veggieflow.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if Manager exists
    cursor.execute("SELECT id, username FROM users WHERE username = 'Manager'")
    user = cursor.fetchone()
    
    if user:
        new_password = "password"
        hashed_password = get_password_hash(new_password)
        cursor.execute("UPDATE users SET hashed_password = ? WHERE username = 'Manager'", (hashed_password,))
        conn.commit()
        print(f"Password for user 'Manager' successfully reset to '{new_password}'")
    else:
        print("User 'Manager' not found in the database. Cannot reset password.")
        
    conn.close()
except sqlite3.Error as e:
    print(f"Database error: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
