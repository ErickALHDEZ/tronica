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
    /*
    //ejerciciosData solamente es un array, al igual que relacionesData.
    //let es una de las tres formas de declarar variables en js.
    //Indica que tiene alcance de bloque, solo es accesible dentro de las llaves {} donde se define, en este caso el EventListener.
    //Esta puede ser reasignada y cambiar a lo largo del programa, de la misma manera que un var.
    //Categorías es un hash map o diccionario donde básicamente es una lista indexada.
    */
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
    //#region
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
   //#endregion
    .then(([ejerciciosResultados, categoriasResultados, relacionesResultados]) => {
        console.log("Resultados ejercicios:", ejerciciosResultados);
        console.log("Resultados categorias:", categoriasResultados);
        console.log("Resultados relaciones:", relacionesResultados);
        //#region 
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
       //#endregion
        ejerciciosData = ejerciciosResultados.ejercicios || [];
        relacionesData = relacionesResultados.ejercicios_categorias || [];
        
        //Diferencia entre un Map y un Hash Map en Javascript: https://x.com/erick_dev111/status/1903652712488595883
        // Crear mapa de categorías
        //.forEach() es un método de array que ejecuta una función para cada elemento del array.
        //En este caso por cada una de las categorias que trajo el fecth.
        (categoriasResultados.categorias || []).forEach(categoriaIndividual => {
            //categoriasMap.set lo que hace es que configura el objeto Map asignando la relación par entre el contenido del ID y el nombre, logrando que el mapa esté indexado
            //Formato: map.set(clave, valor))
            categoriasMap.set(categoriaIndividual.id, categoriaIndividual.nombre);
        });

        //Llamamos a la función enviando nuestras categorias como argumentos.
        generarBotonesFiltro(categoriasResultados.categorias);
        actualizarTabla();
    })
    .catch(error => {
        console.error('Error al cargar datos:', error);
    });

    //Declaramos la función usando las categorias como parámetros
    function generarBotonesFiltro(categorias) {
        //Declarado en la línea 10 de nuestro HTML
        const contenedor = document.getElementById('filtros-container');
        
        //Creo el botón "Todos"
        const botonTodos = document.createElement('button');
        botonTodos.textContent = 'Todos';
        botonTodos.addEventListener('click', () => actualizarTabla());
        //Agrega el botón "Todos" al contenedor de filtros en el HTML.
        contenedor.appendChild(botonTodos);

        //El .forEach itera a través de cada objeto categoria en el array categorias.
        categorias.forEach(categoria => {
            const botonCategorias = document.createElement('button');
            botonCategorias.textContent = categoria.nombre;
            //Recordemos que categoria es el parámetro.
            //boton.dataset.categoriaId: Esto accede a la propiedad categoriaId del objeto dataset del botón.
            //Cuando utilizas boton.dataset.categoriaId = categoria.id;, si el atributo data-categoriaId no existe, JavaScript lo crea dinámicamente.
            botonCategorias.dataset.categoriaId = categoria.id;
            botonCategorias.addEventListener('click', () => filtrarPorCategoria(categoria.id));
            contenedor.appendChild(botonCategorias);
        });
    }

    //Correspondiente al EventListener de los botones creados.
    function filtrarPorCategoria(categoriaId) {
        /*
        Declaramos lo que será enviado a la función actualizarTabla
        
        .filter crea un nuevo array que contiene solo los elementos de ejerciciosData que cumplen con una condición dada.
        
        Ejemplo: const result = words.filter((word) => word.length > 6);
        ¿por qué const y no var? 
        const evita que reasignemos la variable ejerciciosFiltrados a un nuevo array.
        Pero el contenido del array al que apunta ejerciciosFiltrados (es decir, los elementos dentro del array) cambia cada vez que se filtra.

        Imagina que ejerciciosFiltrados es una etiqueta que pegas en una caja.

        const asegura que la etiqueta siempre esté pegada a la misma caja.
        Pero el contenido de la caja (los ejercicios filtrados) puede cambiar cada vez que pulsas un botón.
        */
        const ejerciciosFiltrados = ejerciciosData.filter(ejercicio => {
            //Utiliza el método some en el array relacionesData. some devuelve true si al menos un elemento en relacionesData cumple con la condición dada.
            //En cada llamada a esta función de flecha, la variable "relacion" toma el valor del elemento actual del array relacionesData.
            return relacionesData.some(relacion => 
                //#region 
                /*
                La condición que se debe cumplir es: 

                1.- relacion.ejercicio_id === ejercicio.id: 
                El ID del ejercicio en la relación (sobre el que se itera actualmente en relacionesData) debe ser igual 
                al ID del ejercicio actual que está siendo filtrado, siendo este la iteración de uno de todos los que están en ejerciciosDatas.

                2.- relacion.categoria_id === categoriaId: 
                El ID de la categoría en la relación (sobre el que se itera actualmente en relacionesData) debe ser igual 
                al ID de la categoría que se está utilizando para el filtro (y se recibió como argumento)

                Ambas condiciones deben ser true (verdaderas) debido al operador && (AND lógico).
                */
               //#endregion
                relacion.ejercicio_id === ejercicio.id && 
                relacion.categoria_id === categoriaId
            );
        });
        //Se llama a la función y se envía como argumento el array ejerciciosFiltrados resultante de ambos bucles filtrados, que así mismo fue declarado como const anteriormente.
        actualizarTabla(ejerciciosFiltrados);
    }
    
    //Si la función no recibe (ejerciciosFiltrados) entonces por default su argumento será ejerciciosData.
    function actualizarTabla(ejercicios = ejerciciosData) {
    
        //Obtiene una referencia al elemento HTML con el ID 'cuerpo-tabla' donde se insertarán las filas de datos.
        const tbody = document.getElementById('cuerpo-tabla');
    
        // Borra todo el contenido HTML dentro del elemento 'tbody'.
        // Esto asegura que la tabla se actualice con los nuevos datos y no se dupliquen las filas anteriores.
        tbody.innerHTML = '';
        
        // Itera sobre cada elemento dentro del array 'ejercicios'.
        ejercicios.forEach(ejercicio => {
            /*
            Filtra el array 'relacionesData' uno por uno.
            Para cada 'relacion' en 'relacionesData', se verifica si el valor de la propiedad 'ejercicio_id' coincide con el 'id' del 'ejercicio'sobre el cual iteramos actualmente.
            Esto devuelve un nuevo array que contiene solo las relaciones correspondientes al ejercicio actual.
            */
            const categoriasEjercicio = relacionesData.filter(relacion => relacion.ejercicio_id === ejercicio.id)
            /*
            Mapeamos el array de relaciones filtrado
            Para cada 'relacion', se extrae el valor de la propiedad 'categoria_id'.
            Luego, se utiliza este 'categoria_id' como clave para buscar el nombre de la categoría en el objeto Map llamado 'categoriasMap'.
            //Esto devuelve un nuevo array que contiene los nombres de las categorías asociadas al ejercicio actual.
            */
            .map(relacion => categoriasMap.get(relacion.categoria_id))
        
            // Une los elementos del array de nombres de categorías en una única cadena de texto.
            // Los nombres de las categorías se separan por una coma y un espacio (', ').
            .join(', ');
        
          /*Crea una plantilla de cadena de texto (template literal) que representa una fila de tabla ('<tr>').
          Dentro de la fila, se definen tres celdas de tabla ('<td>'):
          - La primera celda contiene el valor de la propiedad 'nombre' del objeto 'ejercicio'.
          - La segunda celda contiene el valor de la propiedad 'descripcion' del objeto 'ejercicio'.
          - La tercera celda contiene la cadena de texto 'categoriasEjercicio' que representa las categorías del ejercicio.
          */
          const fila = `
              <tr>
                <td>${ejercicio.nombre}</td>
                <td>${ejercicio.descripcion}</td>
                <td>${categoriasEjercicio}</td>
              </tr>
            `;
          /*
          Agrega la cadena HTML de la 'fila' al contenido HTML existente del elemento 'tbody'.
          Esto inserta una nueva fila en la tabla con los datos del ejercicio actual.
          */
          tbody.innerHTML += fila;
        });
      }
});