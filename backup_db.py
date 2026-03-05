import shutil
import os
import datetime

# Configuration
SOURCE_DB = "backend/veggieflow.db"
BACKUP_DIR = "backups"

def backup_database():
    if not os.path.exists(SOURCE_DB):
        print(f"Error: Database file {SOURCE_DB} not found!")
        return

    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
        print(f"Created backup directory: {BACKUP_DIR}")

    # Create timestamped filename
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_filename = f"veggieflow_backup_{timestamp}.db"
    destination = os.path.join(BACKUP_DIR, backup_filename)

    try:
        shutil.copy2(SOURCE_DB, destination)
        print(f"Successfully created backup: {destination}")
    except Exception as e:
        print(f"Error during backup: {e}")

if __name__ == "__main__":
    backup_database()
