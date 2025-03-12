document.addEventListener('DOMContentLoaded', function() {
  //
  //  "document.addEventListener('DOMContentLoaded', function() { ... });"
  //  Asegura que el código Javascript dentro de esta función se ejecute
  //  SOLAMENTE DESPUÉS de que el navegador haya terminado de cargar y parsear
  //  todo el documento HTML (es decir, cuando el HTML esté completamente listo).
  //  Esto es importante para que Javascript pueda encontrar y manipular
  //  elementos HTML como el div con id "version-container".
  //

  fetch('http://localhost:8000/version-db') // Reemplaza con la URL de tu backend si es diferente
  //  "fetch('http://localhost:8000/version-db')" inicia una petición de red
  //  (una solicitud HTTP GET) a la URL 'http://localhost:8000/version-db'.
  //  Asumimos que tu backend FastAPI está corriendo en esta dirección.
  //  Esta petición está destinada a obtener la versión de PostgreSQL desde el backend.
  //  "fetch()" devuelve una "Promesa" (Promise) que representa el resultado futuro de la petición.

      .then(response => response.json())
      //  ".then(response => response.json())" se ejecuta CUANDO la petición fetch se completa exitosamente
      //  y se recibe una respuesta del servidor (backend).
      //  "response" es un objeto que representa la respuesta HTTP.
      //  "response.json()" toma el cuerpo de la respuesta (que esperamos que sea JSON)
      //  y lo parsea (convierte) a un objeto Javascript.
      //  ".json()" también devuelve una Promesa que se resuelve con el objeto Javascript resultante.

      .then(data => {
          //  ".then(data => { ... })" se ejecuta CUANDO ".json()" parsea el JSON exitosamente
          //  y obtenemos los datos (el objeto Javascript) del JSON.
          //  "data" es el objeto Javascript resultante del JSON parseado.
          //  Esperamos que "data" sea un objeto como:
          //  { "version_postgresql": "PostgreSQL 13.3, ..." }  o  { "error": "Mensaje de error" }

          const versionContainer = document.getElementById('version-container');
          //  "document.getElementById('version-container')" busca en el HTML
          //  el elemento que tiene el ID 'version-container' (que es nuestro <div> en index.html).
          //  "versionContainer" ahora es una variable que referencia a ese elemento HTML.

          if (data.version_postgresql) {
              //  "if (data.version_postgresql)" verifica SI la propiedad "version_postgresql"
              //  existe en el objeto "data" (lo que indica que la petición fue exitosa
              //  y recibimos la versión de la base de datos).
              versionContainer.textContent = 'Versión de PostgreSQL: ' + data.version_postgresql;
              //  Si existe "data.version_postgresql", entonces:
              //  "versionContainer.textContent = ..."  establece el contenido de texto
              //  del div "version-container" con un mensaje que incluye la versión de PostgreSQL.
          } else if (data.error) {
              //  "else if (data.error)" verifica SI la propiedad "error" existe en el objeto "data"
              //  (lo que indica que hubo un error en el backend, por ejemplo,
              //  al conectar con la base de datos).
              versionContainer.textContent = 'Error: ' + data.error;
              //  Si existe "data.error", entonces:
              //  "versionContainer.textContent = ..."  establece el contenido de texto
              //  del div "version-container" con un mensaje de error.
          } else {
              //  "else" se ejecuta SI NO existe ni "data.version_postgresql" ni "data.error"
              //  en el objeto "data" (esto sería un caso inesperado o una respuesta del backend
              //  que no coincide con el formato esperado).
              versionContainer.textContent = 'No se pudo obtener la versión.';
              //  En este caso, mostramos un mensaje genérico indicando que no se pudo obtener la versión.
          }
      })

      .catch(error => {
          //  ".catch(error => { ... })" se ejecuta SI ocurre un error durante la petición fetch
          //  (por ejemplo, si el backend no está disponible, o si hay un error de red).
          //  "error" es un objeto que describe el error que ocurrió.

          console.error('Error al obtener la versión:', error);
          //  "console.error('Error al obtener la versión:', error);" muestra un mensaje de error
          //  en la consola del navegador (para fines de desarrollo y debugging).

          const versionContainer = document.getElementById('version-container');
          //  "document.getElementById('version-container')" busca de nuevo el div "version-container".
          versionContainer.textContent = 'Error al conectar con el backend.';
          //  "versionContainer.textContent = ..."  establece el contenido de texto
          //  del div "version-container" con un mensaje de error genérico indicando
          //  que hubo un problema al conectar con el backend.
      });
});