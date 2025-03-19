document.addEventListener('DOMContentLoaded', function() {
    let ejerciciosData = [];
    let categoriasMap = new Map();
    let relacionesData = [];

    // Obtener todos los datos necesarios
    Promise.all([
        fetch('http://localhost:8000/ejercicios').then(r => r.json()),
        fetch('http://localhost:8000/categorias').then(r => r.json()),
        fetch('http://localhost:8000/ejercicios_categorias').then(r => r.json())
    ])
    .then(([ejerciciosRes, categoriasRes, relacionesRes]) => {
        ejerciciosData = ejerciciosRes.ejercicios || [];
        relacionesData = relacionesRes.ejercicios_categorias || [];
        
        // Crear mapa de categorías
        (categoriasRes.categorias || []).forEach(cat => {
            categoriasMap.set(cat.id, cat.nombre);
        });

        generarBotonesFiltro(categoriasRes.categorias);
        actualizarTabla();
    })
    .catch(error => {
        console.error('Error al cargar datos:', error);
    });

    function generarBotonesFiltro(categorias) {
        const contenedor = document.getElementById('filtros-container');
        
        // Botón "Todos"
        const botonTodos = document.createElement('button');
        botonTodos.textContent = 'Todos';
        botonTodos.addEventListener('click', () => actualizarTabla());
        contenedor.appendChild(botonTodos);

        // Botones por categoría
        categorias.forEach(categoria => {
            const boton = document.createElement('button');
            boton.textContent = categoria.nombre;
            boton.dataset.categoriaId = categoria.id;
            boton.addEventListener('click', () => filtrarPorCategoria(categoria.id));
            contenedor.appendChild(boton);
        });
    }

    function filtrarPorCategoria(categoriaId) {
        const ejerciciosFiltrados = ejerciciosData.filter(ejercicio => {
            return relacionesData.some(rel => 
                rel.ejercicio_id === ejercicio.id && 
                rel.categoria_id === categoriaId
            );
        });
        actualizarTabla(ejerciciosFiltrados);
    }

    function actualizarTabla(ejercicios = ejerciciosData) {
        const tbody = document.getElementById('cuerpo-tabla');
        tbody.innerHTML = '';

        ejercicios.forEach(ejercicio => {
            const categoriasEjercicio = relacionesData
                .filter(rel => rel.ejercicio_id === ejercicio.id)
                .map(rel => categoriasMap.get(rel.categoria_id))
                .join(', ');

            const fila = `
                <tr>
                    <td>${ejercicio.nombre}</td>
                    <td>${ejercicio.descripcion}</td>
                    <td>${categoriasEjercicio}</td>
                </tr>
            `;
            tbody.innerHTML += fila;
        });
    }
});