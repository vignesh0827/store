import sqlalchemy
from app.config import settings

def drop_alembic_version():
    try:
        engine = sqlalchemy.create_engine(settings.DATABASE_URL)
        with engine.connect() as connection:
            print("Checking and dropping alembic_version table if exists...")
            connection.execute(sqlalchemy.text("DROP TABLE IF EXISTS alembic_version CASCADE"))
            connection.commit()
            print("Done! alembic_version table dropped.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    drop_alembic_version()
