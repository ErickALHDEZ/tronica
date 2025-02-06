from sqlalchemy import Column, Integer, String, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base

# Tabla intermedia para la relación muchos a muchos
ejercicio_categoria = Table(
    "ejercicio_categoria",
    Base.metadata,
    Column("ejercicio_id", Integer, ForeignKey("ejercicios.id", ondelete="CASCADE"), primary_key=True),
    Column("categoria_id", Integer, ForeignKey("categorias.id", ondelete="CASCADE"), primary_key=True)
)

class Ejercicio(Base):
    __tablename__ = "ejercicios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)

    categorias = relationship("Categoria", secondary=ejercicio_categoria, back_populates="ejercicios")

class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)

    ejercicios = relationship("Ejercicio", secondary=ejercicio_categoria, back_populates="categorias")
