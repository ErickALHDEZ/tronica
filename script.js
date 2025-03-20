//Espera a que la página se cargue por completo antes de ejecutar un script.
//Con el objetivo de encontrar y manipular correctamente elementos HTML.
//Esto engloba todo el código dentro del script.
//Document es el objeto que representa la página web cargada en el navegador.
//addEventListener es un método que hace lo que su nombre sugiere, lo agregamos al objeto.
//DOMContentLoaded indica qué tipo de evento se está escuchando, a que cargue el DOM.
//↓ DOM == La forma en como Js accede al contenido HTML de la página, Document Object Model.
document.addEventListener('DOMContentLoaded', function() {
    //ejerciciosData solamente es un array, al igual que relacionesData.
    let ejerciciosData = [];
    //Categorías es un hash map o diccionario donde básicamente es una lista indexada.
    let categoriasMap = new Map();
    let relacionesData = [];

    //En JS una promesa es un objeto que representa el eventual resultado de una operación asíncrona, o sea en paralelo y su valor resultante.
    //↓ .all indica que esta promesa se resolverá solo cuando todas las promesas del array sean resueltas.
    Promise.all([
        //fetch == Función que realiza solicitud de red.
        //↓ En este caso lo hace al backend en mi main.py para obtener todos los datos necesarios
        fetch('http://localhost:8000/ejercicios').then(r => r.json()),
        fetch('http://localhost:8000/categorias').then(r => r.json()),
        fetch('http://localhost:8000/ejercicios_categorias').then(r => r.json())
    ])
    //.Then (después de) se ejecuta todo lo que está dentro de paréntesis una vez se resuelva el Promise.all.
    //Promise.all ha devuelto un array donde se almacenan los resultados de los 3 fetch,
    //entonces mediante array destructuring, añadimos dichos resultados a las variables dentro del paréntesis.
    .then(([ejerciciosResultados, categoriasResultados, relacionesResultados]) => {
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