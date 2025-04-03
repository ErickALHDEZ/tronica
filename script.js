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

        //Diferencia entre un Map y un Hash Map en Javascript: https://x.com/erick_dev111/status/1903652712488595883
        // Crear mapa de categorías
        //.forEach() es un método de array que ejecuta una función para cada elemento del array.
        //En este caso por cada una de las categorias que trajo el fecth.
        (categoriasResultados.categorias || []).forEach(categoriaIndividual => {
             if (categoriaIndividual && typeof categoriaIndividual.id !== 'undefined') { // Añadida validación
                //categoriasMap.set lo que hace es que configura el objeto Map asignando la relación par entre el contenido del ID y el nombre, logrando que el mapa esté indexado
                //Formato: map.set(clave, valor))
                categoriasMap.set(categoriaIndividual.id, categoriaIndividual.nombre);
            }
        });

        //Llamamos a la función enviando nuestras categorias como argumentos.
        generarBotonesFiltro(categoriasResultados.categorias || []); // Añadido fallback
        actualizarTabla();
        agregarListenerExpandir(); // <<< NUEVO: Añade el listener para los botones
    })
    .catch(error => {
        console.error('Error al cargar datos:', error);
        // <<< NUEVO: Mostrar error en la tabla si falla la carga inicial
        const tbody = document.getElementById('cuerpo-tabla');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="3" style="color: red; text-align: center;">Error al cargar los datos iniciales.</td></tr>`;
        }
    });

    function generarBotonesFiltro(categorias) {
        const contenedor = document.getElementById('filtros-container');
         if (!contenedor) return; // <<< NUEVO: Salir si no se encuentra el contenedor
         contenedor.innerHTML = ''; // <<< NUEVO: Limpiar botones existentes por si se llama de nuevo

        //Creo el botón "Todos"
        const botonTodos = document.createElement('button');
        botonTodos.textContent = 'Todos';
        botonTodos.addEventListener('click', () => actualizarTabla());
        contenedor.appendChild(botonTodos);

        //El .forEach itera a través de cada objeto categoria en el array categorias.
         // <<< NUEVO: Verificar que 'categorias' sea un array antes de usar forEach
        if (Array.isArray(categorias)) {
            categorias.forEach(categoria => {
                 // <<< NUEVO: Comprobar que 'categoria' y sus propiedades necesarias existan
                 if (categoria && typeof categoria.id !== 'undefined' && typeof categoria.nombre !== 'undefined') {
                    const botonCategorias = document.createElement('button');
                    botonCategorias.textContent = categoria.nombre;
                    //Recordemos que categoria es el parámetro.
                    //boton.dataset.categoriaId: Esto accede a la propiedad categoriaId del objeto dataset del botón.
                    //Cuando utilizas boton.dataset.categoriaId = categoria.id;, si el atributo data-categoriaId no existe, JavaScript lo crea dinámicamente.
                    botonCategorias.dataset.categoriaId = categoria.id; // Usar dataset es más estándar
                    botonCategorias.addEventListener('click', () => filtrarPorCategoria(categoria.id));
                    contenedor.appendChild(botonCategorias);
                } else {
                     console.warn("Elemento de categoría inválido encontrado:", categoria); // <<< NUEVO: Advertencia si hay datos inválidos
                }
            });
        } else {
             console.error("'categorias' recibidas en generarBotonesFiltro no es un array:", categorias); // <<< NUEVO: Error si no es array
        }
    }

    function filtrarPorCategoria(categoriaId) {
        //Declaramos lo que será enviado a la función actualizarTabla

        /*
        .filter crea un nuevo array que contiene solo los elementos de ejerciciosData que cumplen con una condición dada.
        const words = ["spray", "elite", "exuberant", "destruction", "present"];

        const result = words.filter((word) => word.length > 6);

        console.log(result);
        // Expected output: Array ["exuberant", "destruction", "present"]
        */

        /*
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
                relacion.ejercicio_id === ejercicio.id &&
                relacion.categoria_id === categoriaId
            );
        });
        actualizarTabla(ejerciciosFiltrados);
    }

    //Si la función no recibe (ejerciciosFiltrados) entonces por default su argumento será ejerciciosData.
    function actualizarTabla(ejercicios = ejerciciosData) {

        //Obtiene una referencia al elemento HTML con el ID 'cuerpo-tabla' donde se insertarán las filas de datos.
        const tbody = document.getElementById('cuerpo-tabla');
         if (!tbody) return; // <<< NUEVO: Salir si no existe el tbody

        // Borra todo el contenido HTML dentro del elemento 'tbody'.
        // Esto asegura que la tabla se actualice con los nuevos datos y no se dupliquen las filas anteriores.
        tbody.innerHTML = '';

         // <<< NUEVO: Verificar que 'ejercicios' sea un array
        if (!Array.isArray(ejercicios)) {
            console.error("'ejercicios' recibidos en actualizarTabla no es un array:", ejercicios);
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Error interno al mostrar ejercicios.</td></tr>';
            return;
        }

         // <<< NUEVO: Mensaje si no hay ejercicios
         if (ejercicios.length === 0) {
             // Diferenciar si es por filtro o porque no hay datos iniciales
             if (ejercicios !== ejerciciosData) { // Si 'ejercicios' no es el array original, es porque se filtró
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No hay ejercicios que coincidan con el filtro.</td></tr>';
             } else {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No hay ejercicios para mostrar.</td></tr>';
             }
            return;
        }


        // Itera sobre cada elemento dentro del array 'ejercicios'.
        ejercicios.forEach(ejercicio => {
             // <<< NUEVO: Comprobar validez del objeto ejercicio
             if (!ejercicio || typeof ejercicio.id === 'undefined') {
                 console.warn("Elemento de ejercicio inválido encontrado en actualizarTabla:", ejercicio);
                 return; // Saltar este ejercicio si es inválido
            }

            //Filtra el array 'relacionesData' uno por uno.
            //Para cada 'relacion' en 'relacionesData', se verifica si el valor de la propiedad 'ejercicio_id' coincide con el 'id' del 'ejercicio'sobre el cual iteramos actualmente.
            //Esto devuelve un nuevo array que contiene solo las relaciones correspondientes al ejercicio actual.
            const categoriasRelaciones = relacionesData.filter(relacion => relacion.ejercicio_id === ejercicio.id);

            //Mapeamos el array de relaciones filtrado
            //Para cada 'relacion', se extrae el valor de la propiedad 'categoria_id'.
            //Luego, se utiliza este 'categoria_id' como clave para buscar el nombre de la categoría en el objeto Map llamado 'categoriasMap'.
            //Esto devuelve un nuevo array que contiene los nombres de las categorías asociadas al ejercicio actual.
            const nombresCategorias = categoriasRelaciones.map(relacion => categoriasMap.get(relacion.categoria_id) || 'Desconocida'); // <<< NUEVO: Fallback por si no encuentra el ID

            // Une los elementos del array de nombres de categorías en una única cadena de texto.
            // Los nombres de las categorías se separan por una coma y un espacio (', ').
            const categoriasTexto = nombresCategorias.join(', ');

             // --- <<< INICIO BLOQUE MODIFICADO: Crear filas con DOM en lugar de innerHTML += fila >>> ---
             // Crea una plantilla de cadena de texto (template literal) que representa una fila de tabla ('<tr>').
             // Dentro de la fila, se definen tres celdas de tabla ('<td>'):
             //   - La primera celda contiene el valor de la propiedad 'nombre' del objeto 'ejercicio'.
             //   - La segunda celda contiene la cadena de texto 'categoriasTexto' que representa las categorías del ejercicio.
             //   - La tercera celda contiene el botón "Expandir".

             // --- Fila Principal ---
            const filaPrincipal = document.createElement('tr');
            filaPrincipal.innerHTML = `
                <td>${ejercicio.nombre || 'Sin nombre'}</td>
                <td>${categoriasTexto || 'Sin categorías'}</td>
                <td>
                    <button class="expand-button" data-target-id="details-${ejercicio.id}">
                        Expandir
                    </button>
                </td>
            `;

            // --- Fila de Detalles (oculta) ---
            const filaDetalles = document.createElement('tr');
            filaDetalles.id = `details-${ejercicio.id}`;
            filaDetalles.classList.add('details-row'); // Clase CSS para ocultar/mostrar y estilizar
            // El colspan debe ser igual al número de columnas VISIBLES en la fila principal (3 en este caso: Nombre, Categorías, Acción)
            filaDetalles.innerHTML = `
                <td colspan="3" class="details-cell">
                    <h4>Descripción:</h4>
                    <p>${ejercicio.descripcion || 'No disponible.'}</p>
                    <h4>Ejemplo visual:</h4>
                    <img src="${ejercicio.imagenUrl || 'placeholder.png'}"
                         alt="Ejemplo visual de ${ejercicio.nombre || 'ejercicio'}"
                         class="visual-example-img"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" >
                     <span style="display:none; color: #888;">(Imagen no disponible)</span>
                </td>
            `;

            // Agrega la cadena HTML de la 'fila' al contenido HTML existente del elemento 'tbody'.
             // Esto inserta una nueva fila en la tabla con los datos del ejercicio actual.
             // <<< FIN BLOQUE MODIFICADO >>>
            tbody.appendChild(filaPrincipal);
            tbody.appendChild(filaDetalles);
        });
      }

      // --- <<< NUEVA FUNCION: para manejar los clics en los botones Expandir/Contraer >>> ---
      function agregarListenerExpandir() {
          const tbody = document.getElementById('cuerpo-tabla');
          if (!tbody) return; // Salir si no existe tbody

          // Usar delegación de eventos para eficiencia
          tbody.addEventListener('click', function(event) {
              // Verificar si el elemento clickeado es un botón con la clase 'expand-button'
              if (event.target.classList.contains('expand-button')) {
                  const button = event.target;
                  const targetId = button.dataset.targetId; // Obtener el ID de la fila de detalles desde data-target-id
                  const detailsRow = document.getElementById(targetId); // Encontrar la fila de detalles

                  if (detailsRow) {
                      // Comprobar el estado actual de visibilidad (usando el estilo inline)
                      const isVisible = detailsRow.style.display === 'table-row'; // 'table-row' fue como lo mostramos

                      if (isVisible) {
                          // Si está visible: ocultarla y cambiar texto del botón
                          detailsRow.style.display = 'none';
                          button.textContent = 'Expandir';
                      } else {
                          // Si está oculta: mostrarla y cambiar texto del botón
                          detailsRow.style.display = 'table-row'; // Mostrar como fila de tabla para que ocupe el espacio correctamente
                          button.textContent = 'Contraer';
                      }
                  } else {
                      console.warn("No se encontró la fila de detalles con ID:", targetId); // Advertencia si no se encuentra la fila
                  }
              }
          });
      }
});