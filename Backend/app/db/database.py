import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Postgres (e.g. Supabase) via DATABASE_URL, sqlite fallback for local dev/tests.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./traka.db")
# Backwards-compatible alias
SQLALCHEMY_DATABASE_URL = DATABASE_URL

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Supabase pooler requires SSL; add sslmode if the URL doesn't set it.
    if "sslmode" not in DATABASE_URL:
        sep = "&" if "?" in DATABASE_URL else "?"
        DATABASE_URL += f"{sep}sslmode=require"
        SQLALCHEMY_DATABASE_URL = DATABASE_URL
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
