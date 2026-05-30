// Función para buscador dinámico con múltiples parámetros
function configurarBuscadorEntidad({ 
  inputs,        // array con { id: "inputX", campo: "nombre_columna" }
  botonId, 
  endpoint, 
  callbackAbrirModal 
}) {
  document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById(botonId);
    if (!boton) {
      console.error(`No se encontró el botón con id: ${botonId}`);
      return;
    }

    boton.addEventListener("click", async () => {
      // Leer todos los valores de los inputs
      const valores = inputs.map(({ id, campo }) => {
        const input = document.getElementById(id);
        if (!input) {
          console.error(`No se encontró el input con id: ${id}`);
          return null;
        }
        return { campo, valor: input.value.trim() };
      });

      // Validar que no estén vacíos
      if (valores.some(v => !v.valor)) {
        alert("Complete todos los campos de búsqueda");
        return;
      }

      try {
        // Construir query string
        const queryParams = valores
          .map(v => `${encodeURIComponent(v.campo)}=${encodeURIComponent(v.valor)}`)
          .join("&");

        const response = await fetchWithAuth(`${endpoint}?${queryParams}`);
        if (!response.ok) throw new Error(`Error al obtener datos de ${endpoint}`);

        const entidad = await response.json(); // /buscar devuelve UN registro

        if (!entidad) {
          alert("No se encontró ningún registro con esos datos");
          return;
        }

        callbackAbrirModal(entidad);

        // limpiar inputs
        valores.forEach(v => {
          const input = document.getElementById(inputs.find(i => i.campo === v.campo).id);
          if (input) input.value = "";
        });

      } catch (error) {
        console.error(`Error al buscar en ${endpoint}:`, error);
        alert("Error en la búsqueda");
      }
    });
  });
}
