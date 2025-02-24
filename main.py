from fastapi import FastAPI
from sqlalchemy import create_engine, text

app = FastAPI()

# **Configuración de la base de datos**
DATABASE_URL = "postgresql://postgres:password@localhost/tronica"

# Reemplaza con tus propios datos de conexión
DATABASE_URL = DATABASE_URL.replace("USUARIO", "postgres")
DATABASE_URL = DATABASE_URL.replace("CONTRASEÑA", "password")
DATABASE_URL = DATABASE_URL.replace("HOST", "localhost") # o la dirección de tu servidor PostgreSQL
DATABASE_URL = DATABASE_URL.replace("PUERTO", "5432")   # Puerto por defecto de PostgreSQL
DATABASE_URL = DATABASE_URL.replace("NOMBRE_BASE_DATOS", "tronica")


engine = create_engine(DATABASE_URL)

@app.get("/version-db")
async def obtener_version_db():
    """
    Endpoint sencillo para consultar la versión de PostgreSQL.
    """
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            version = result.scalar()
            return {"version_postgresql": version}
    except Exception as e:
        return {"error": f"No se pudo conectar a la base de datos: {e}"}

@app.get("/")
async def read_root():
    return {"mensaje": "¡Backend FastAPI conectado a PostgreSQL!"}