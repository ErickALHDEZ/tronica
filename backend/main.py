from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from models import Ejercicio  # Asegúrate de tener un modelo Ejercicio

# Conexión a la base de datos
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost/tronica"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

app = FastAPI()

# Permitir solicitudes desde el frontend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Reemplaza "*" con la URL de Vue.js en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ruta para obtener todos los ejercicios
@app.get("/ejercicios")
async def obtener_ejercicios():
    # Crear sesión de base de datos
    db = SessionLocal()
    
    # Obtener todos los ejercicios
    ejercicios = db.query(Ejercicio).all()
    
    # Cerrar sesión de base de datos
    db.close()
    
    return ejercicios
