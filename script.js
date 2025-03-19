//Espera a que la página se cargue por completo antes de ejecutar un script.
//Con el objetivo de encontrar y manipular correctamente elementos HTML.
//Esto engloba todo el código dentro del script.
//Document es el objeto que representa la página web cargada en el navegador.
//addEventListener es un método que hace lo que su nombre sugiere, lo agregamos al objeto.
//DOMContentLoaded indica qué tipo de evento se está escuchando, a que cargue el DOM.
//↓ DOM == La forma en como Js accede al contenido HTML de la página, Document Object Model.

document.addEventListener('DOMContentLoaded', function() {

  //fetch == Función que realiza solicitud de red.
  //↓ En este caso lo hace al backend en mi main.py
  fetch('http://localhost:8000/version-db')

    //Se ejecuta cuando se completa con éxito el fetch.
    //Parsea la respuesta de json a un objeto Js.
    //↓ Then se refiere a lo que sucederá una vez la promesa de fetch se resuelva.
    .then(response => response.json())

    //Se ejecuta cuando el json se haya parseado con éxito (la línea anterior)
    //Data es el objeto js resultante de parsear dicho json.
    //↓ Se abre corchete para indicar todo lo que sucederá después.
    .then(data => {

        //Busca en el documento HTML el elemento con el ID "version-container".
        //Línea 9 de index.html como "<div id="version-container"></div>".
        //↓ Guarda una referencia a ese elemento en la variable versionContainer.
        const versionContainer = document.getElementById('version-container');

        //↓ Verifica si la propiedad "version_postgresql" existe en el objeto "data"
        //Línea 84 de main.py como "return {"version_postgresql": version}"
        if (data.version_postgresql) {
            
            //↓"versionContainer.textContent = ..."  establece el contenido del texto.
            versionContainer.textContent = 'Versión de PostgreSQL: ' + data.version_postgresql;

        //↓ Si no existe la versión de postgres dentro de data, verifica si existe la propiedad error en data.
        } else if (data.error) {
            versionContainer.textContent = 'Error: ' + data.error;
        } else {
            versionContainer.textContent = 'No se pudo obtener la versión.';
        }
      })

      //Facilita el manejar y depurar los errores proporcionando información.
      .catch(error => {
          console.error('Error al obtener la versión:', error);
          const versionContainer = document.getElementById('version-container');
          versionContainer.textContent = 'Error al conectar con el backend.';
      });

    fetch('http://localhost:8000/ejercicios')
    .then(response => response.json())
    .then(data => {
        const ejerciciosContainer = document.getElementById('ejercicios-container');
        
        if (data.ejercicios && data.ejercicios.length > 0) {
            const html = data.ejercicios.map(ejercicio => `
                <div class="ejercicio">
                    <h3>${ejercicio.nombre}</h3>
                    <p>${ejercicio.descripcion}</p>
                </div>
            `).join('');
            
            ejerciciosContainer.innerHTML = html;
        } else if (data.error) {
            ejerciciosContainer.textContent = 'Error: ' + data.error;
        } else {
            ejerciciosContainer.textContent = 'No se encontraron ejercicios';
        }
    })
    .catch(error => {
        console.error('Error al obtener ejercicios:', error);
        const ejerciciosContainer = document.getElementById('ejercicios-container');
        ejerciciosContainer.textContent = 'Error al cargar los ejercicios';
    });

    fetch('http://localhost:8000/categorias')
    .then(response => response.json())
    .then(data => {
        const categoriasContainer = document.getElementById('categorias-container');
        
        if (data.categorias && data.categorias.length > 0) {
            const html = data.categorias.map(categoria => `
                <div class="categoria">
                    <h3>${categoria.nombre}</h3>
                </div>
            `).join('');
            
            categoriasContainer.innerHTML = html;
        } else if (data.error) {
            categoriasContainer.textContent = 'Error: ' + data.error;
        } else {
            categoriasr.textContent = 'No se encontraron ejercicios';
        }
    })
    .catch(error => {
        console.error('Error al obtener categorias:', error);
        const categoriasContainer = document.getElementById('categorias-container');
        categoriasContainer.textContent = 'Error al cargar las categorias';
    });

    fetch('http://localhost:8000/ejercicios_categorias')
    .then(response => response.json())
    .then(data => {
        if (data.ejercicios_categorias) {
            // Almacenar los datos en una variable para uso posterior
            const relaciones = data.ejercicios_categorias;

        } else if (data.error) {
            console.error('Error en relaciones:', data.error);
        }
    })
    .catch(error => {
        console.error('Error al obtener relaciones:', error);
    });
});