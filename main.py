#Solamente estoy haciendo una prueba para conectar la base de datos.
#Pasos para correr esto:
#Instalar Python y luego las dependencias: "pip install fastapi uvicorn psycopg2-binary sqlalchemy"
#Levantar el servidor con "uvicorn main:app --reload"

#Importamos el Framework de FASTAPI para conectar nuestro backend usando Python.
from fastapi import FastAPI
#SQLAlchemy es una biblioteca de Python que proporciona herramientas SQL.
from sqlalchemy import create_engine, text

# Importamos CORSMiddleware desde starlette.middleware para habilitar CORS
from starlette.middleware.cors import CORSMiddleware

#Aquí creamos la instancia de FASTAPI.
app = FastAPI()

#-----Configuración de la base de datos-----

#Defino el URL de mi base de datos, aquí le estoy dando el formato que deberá de tener.
DATABASE_URL = "postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_BASE_DE_DATOS"

#Mientras que en esta sección utilizo .replace para no hardcodear los valores.
#Esto se hace por razones de seguridad y para hacer la conexión de BDD de manera dinámica.
DATABASE_URL = DATABASE_URL.replace("USUARIO", "postgres")
DATABASE_URL = DATABASE_URL.replace("CONTRASEÑA", "password")
DATABASE_URL = DATABASE_URL.replace("HOST", "localhost")
DATABASE_URL = DATABASE_URL.replace("PUERTO", "5432")
DATABASE_URL = DATABASE_URL.replace("NOMBRE_BASE_DE_DATOS", "tronica")

#Aquí creamos el motor de la base de datos.
#Es un objeto que gestiona la conexión y comunicación con la base de datos.
engine = create_engine(DATABASE_URL)

# -----Configuración de CORS (Cross-Origin Resource Sharing)-----
#CORS es el sistema de seguridad del navegador que impide que mi página local haga peticiones a un backend de origen distinto.
#Para permitir estas peticiones "cross-origin" dbemos configurar CORS en el backend agregando el middleware CORSMiddleware a FastApi.
#Intercepta las peticiones y agrega los headers necesarios para que el navegador permita dichas peticiones.
app.add_middleware(
    CORSMiddleware,
    # ↓ ["*"] Indica que se permitan peticiones desde cualquier origen, en prod debería especificar el origen exacto por seguridad.
    allow_origins=["*"], 
    # ↓ Permite el envío de cookies y encabezados de autorización (no siempre necesario).
    allow_credentials=True, 
    # ↓ ["*"] permite todos los métodos HTTP (GET, POST, PUT, DELETE, etc.).
    allow_methods=["*"],    
    # ↓ ["*"] permite todos los headers en las peticiones. 
    allow_headers=["*"],
)

#-----Definiendo un endpoint (una URL específica a la que tu aplicación responde)s-----

#Este ↓ es un "Decorador" de FASTAPI, es una etiqueta especial que indica
#que al llegar la petición GET al url "version-db" ejecuta la función
@app.get("/version-db")

#Aquí definimos la función, con "async" definimos que es una función asíncrona,
#lo que significa que se está ejecutando en segundo plano al mismo tiempo.

#"obtener_version_db" es el nombre de nuestra función.
async def obtener_version_db():
    """Endpoint sencillo para consultar la versión de PostgreSQL."""
    #try-except convencional para ejecutar código y manejar errores.
    try:

        #Creamos la conexión con la BDD usando el Engine que creamos anteriormente.
        #"with" asegura que la conexión se cierre al final incluso con errores.
        #"as connection" le estamos asignando su nombre.
        with engine.connect() as connection:

            #Ejecutamos una consulta SQL a la BBD.
            #"text" lo usa SQAlchemy para consultas manuales.
            #"SELECT version();" es un comando que muestra la versión de Postgres.
            #↓ "result" guarda el resultado de la consulta.
            result = connection.execute(text("SELECT version();"))

            #↓ scalar.() es un método el cuál devuelve un valor único (escalar) de una consulta.
            #En este caso lo aplicamos al objeto result, guardando el valor en la variable "version".
            version = result.scalar()

            #↓ "return devuelve" nuestra respuesta, que en esta ocasión es
            #un diccionario de Python a nuestro navegador web.
            return {"version_postgresql": version}
        
    #Devuelve el código de error como diccionario en caso de no poder conectar.
    except Exception as e:
        return {"error": f"No se pudo conectar a la base de datos: {e}"}
    
#Definimos la ruta de root
@app.get("/")
async def read_root():
    return {"mensaje": "¡Backend FastAPI conectado a PostgreSQL!"}

@app.get("/ejercicios")
async def obtener_ejercicios():
    try:
        with engine.connect() as connection:
            # Ejecutar consulta para obtener todos los ejercicios
            result = connection.execute(text("SELECT * FROM public.ejercicios"))
            
            # Convertir resultados en lista de diccionarios
            ejercicios = []
            for row in result:
                ejercicios.append({
                    "id": row[0],
                    "nombre": row[1],
                    "descripcion": row[2],
                    "ImagenUrl": row[3]
                })
            return {"ejercicios": ejercicios}
            
    except Exception as e:
        return {"error": f"Error al obtener ejercicios: {str(e)}"}
    
@app.get("/categorias")
async def obtener_categorias():
    try:
        with engine.connect() as connection:
            # Ejecutar consulta para obtener todas las categorias
            result = connection.execute(text("SELECT * FROM public.categorias"))
            
            # Convertir resultados en lista de diccionarios
            categorias = []
            for row in result:
                categorias.append({
                    "id": row[0],
                    "nombre": row[1],
                })
            return {"categorias": categorias}
            
    except Exception as e:
        return {"error": f"Error al obtener categorias: {str(e)}"}
    
@app.get("/ejercicios_categorias")
async def obtener_ejercicios_categorias():
    try:
        with engine.connect() as connection:
            # Ejecutar consulta para obtener todas las categorias
            result = connection.execute(text("SELECT * FROM public.ejercicios_categorias"))
            
            # Convertir resultados en lista de diccionarios
            ejercicios_categorias = []
            for row in result:
                ejercicios_categorias.append({
                    "ejercicio_id": row[0],
                    "categoria_id": row[1],
                })
            return {"ejercicios_categorias": ejercicios_categorias}
            
    except Exception as e:
        return {"error": f"Error al obtener la relación entre ejercicio y categorias: {str(e)}"}

#FASTAPI GENERA DOCUMENTACIÓN EN AUTOMATICO OMGGGGG
#http://localhost:8000/docs
#http://localhost:8000/redoc