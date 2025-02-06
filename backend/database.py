from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
import os

# Definir la base de los modelos
Base = declarative_base()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/tronica")

# Crear el motor de la base de datos
engine = create_async_engine(DATABASE_URL, echo=True)

# Crear la sesión
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Dependencia para obtener la sesión
async def get_db():
    async with async_session() as session:
        yield session
