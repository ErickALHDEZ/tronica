/*
Espera a que la página se cargue por completo antes de ejecutar un script.
Con el objetivo de encontrar y manipular correctamente elementos HTML.
Esto engloba todo el código dentro del script.
Document es el objeto que representa la página web cargada en el navegador.
addEventListener es un método que hace lo que su nombre sugiere, lo agregamos al objeto.
DOMContentLoaded indica qué tipo de evento se está escuchando, a que cargue el DOM.
↓ DOM == La forma en como Js accede al contenido HTML de la página, Document Object Model.
*/
document.addEventListener('DOMContentLoaded', function() {
    //ejerciciosData solamente es un array, al igual que relacionesData.
    //let es una de las tres formas de declarar variables en js.
    //Indica que tiene alcance de bloque, solo es accesible dentro de las llaves {} donde se define, en este caso el EventListener.
    //Esta puede ser reasignada y cambiar a lo largo del programa, de la misma manera que un var.
    //Categorías es un hash map o diccionario donde básicamente es una lista indexada.
    let ejerciciosData = [];
    let categoriasMap = new Map();
    let relacionesData = [];

    //En JS una promesa es un objeto que representa el eventual resultado de una operación asíncrona, o sea en paralelo y su valor resultante.
    //↓ .all indica que esta promesa se resolverá solo cuando todas las promesas del array sean resueltas.
    Promise.all([
        /*
        fetch == Función que realiza solicitud de red, esta devuelve una promesa, la cual .then() espera para ejecutar el resto del código.
        En lugar de esperar a que la respuesta del servidor llegue de forma síncrona (lo que bloquearía la ejecución de tu código)
        fetch() devuelve un objeto Promise, el cual representa la promesa de que eventualmente recibirá una respuesta del servidor.
        ↓ En este caso lo hace al backend en mi main.py para obtener todos los datos necesarios.

        Una función de flecha es una sintaxis más corta para escribir funciones anónimas.
        Por lo tanto, todas las funciones de flecha son, por definición, funciones anónimas.
        Eso es una función que no tiene un nombre asignado, es un concepto común en lenguajes como python.
        No la declaras y la defines sin un identificador, son para tareas puntuales y de poca duración.
        Ejemplo: const miFuncionAnonima = function() { console.log("Hola desde una función anónima"); };
        La función no tiene nombre pero se le asigna a la variable lo que permite invocarla a través de ella de la sig forma:
        miFuncionAnonima();

        En nuestro caso, la función anonima: then(r => r.json()),
        significa: "Cuando la promesa de fetch() se resuelva, toma la respuesta (r) y conviértela a JSON".

        r es la variable que representa el objeto response, devuelto por la función fetch, contiene la información de la respuesta HTTP.
        Incluyendo los encabezados, el estado y el cuerpo de la respuesta, siendo este el formato estándar que incluye:
        Header: información sobre la solicitud o la respuesta.
        Body: Los datos reales que se están transfiriendo.
        Código de estado, for esempo 404 not found.
        */
        fetch('http://localhost:8000/ejercicios').then(r => r.json()),
        fetch('http://localhost:8000/categorias').then(r => r.json()),
        fetch('http://localhost:8000/ejercicios_categorias').then(r => r.json())
    ])
    /*
    .Then (después de) se ejecuta todo lo que está dentro de paréntesis una vez se resuelva el Promise.all.
    Promise.all ha devuelto un array donde se almacenan los resultados de los 3 fetch,
    Si te das cuenta, en la línea 17 abrimos el array y lo cerramos en la 42.
    entonces mediante array destructuring, añadimos dichos resultados a las variables dentro del paréntesis.
    La sintaxis ([ejerciciosRes, categoriasRes, relacionesRes]) permite extraer estos tres elementos del array,
    y asignarlos a las variables ejerciciosRes, categoriasRes y relacionesRes, respectivamente.
    Es lo mismo a que hicieramos:

        .then((resultados) => {
            const ejerciciosRes = resultados[0];
            const categoriasRes = resultados[1];
            const relacionesRes = resultados[2];
            etc etc etc.
        });

    Básicamente estoy abriendo un array con tres variables y a cada una le asigno
    el valor dentro del array anterior de respuestas del fetch.
    */
    .then(([ejerciciosResultados, categoriasResultados, relacionesResultados]) => {
        /*
        ejerciciosData fue el objeto definido en la línea 16.
        Aquí le estamos diciendo que nuestro objeto su nuevo valor será
        La variable que acabamos de asignar con el valor del array del fetch.
        y luego mediante el operador OR || indicamos que en el caso de que sea null o undefined, será un array vacío para evitar errores.

        .ejercicios es la propiedad dentro del json que contiene toda la información de mi tabla.
        Si yo hiciera "console.log("Resultados ejercicios:", ejerciciosResultados);" yo vería que que aparece:
        ejercicios: (53) [{…}, {…}, etc etc. con todo lo que trajo mi consulta, así que le digo que ejerciciosData ahora tiene dichos valores.
        en @app.get("/ejercicios") dentro de main.py definí un diccionario en python, es por eso que sé que es la propiedad que busco con ese nombre.
        */
        ejerciciosData = ejerciciosResultados.ejercicios || [];
        relacionesData = relacionesResultados.ejercicios_categorias || [];
        
        // Crear mapa de categorías
        (categoriasResultados.categorias || []).forEach(cat => {
            categoriasMap.set(cat.id, cat.nombre);
        });

        generarBotonesFiltro(categoriasResultados.categorias);
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