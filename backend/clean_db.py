import sqlalchemy
from app.config import settings

def clean_database():
    try:
        engine = sqlalchemy.create_engine(settings.DATABASE_URL)
        with engine.connect() as connection:
            print("Dropping ALL existing tables to start fresh...")
            
            # This query finds all tables in the public schema
            result = connection.execute(sqlalchemy.text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = [row[0] for row in result]
            
            if tables:
                for table in tables:
                    print(f"Dropping table {table} CASCADE...")
                    connection.execute(sqlalchemy.text(f"DROP TABLE IF EXISTS \"{table}\" CASCADE"))
                connection.commit()
                print("All tables dropped successfully.")
            else:
                print("No tables found to drop.")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    clean_database()
