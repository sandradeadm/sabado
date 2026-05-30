document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector("#tabla-tutores tbody");
    const contenedorAcciones = document.getElementById("acciones-tutores");

    fetchWithAuth("/tutores")
        .then(res => res.json())
        .then(data => {
            data.forEach(tutor => {
                // Crear la fila de la tabla
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${tutor.Id_tutor}</td>
                    <td>${tutor.Nombre}, ${tutor.Apellido.toUpperCase()}</td>
                    <td>${tutor.DNI}</td>
                    <td>${tutor.CUIL}</td>
                    <td>${tutor.Telefono}</td>
                `;
                tbody.appendChild(fila);

                // Crear los botones fuera de la tabla
                const grupoBotones = document.createElement("div");
                grupoBotones.innerHTML = `
                    <button onclick="mostrarModal(document.getElementById('modalDetalle'))">Ver Detalle</button>
                    <button onclick="mostrarModal(document.getElementById('modalEditar'))">Editar</button>
                `;
                contenedorAcciones.appendChild(grupoBotones);
            });
        })
        .catch(error => {
            console.error("Error al cargar los tutores:", error);
        });
});


document.getElementById('btnBuscartutor').addEventListener('click', async () => {
  const dniInput = document.getElementById('inputDniBuscarTutor');
  const dni = dniInput.value.trim();
  const resultadosDiv = document.getElementById('resultadosTutor');

  // Limpiar resultados previos
  resultadosDiv.innerHTML = "";

  if (!dni) return alert('Ingrese un DNI válido');

  try {
    const res = await fetchWithAuth(`/tutores/buscar?dni=${dni}`);
    const datos = await res.json();

    if (datos.length === 0) {
      resultadosDiv.innerHTML = `<p>No se encontraron alumnos para este tutor.</p>`;
    } else {
      // Mostrar tutor y alumnos (igual que antes)
      const tutor = {
        nombre: datos[0].tutor_nombre,
        apellido: datos[0].tutor_apellido,
        dni: datos[0].tutor_dni,
        cuil: datos[0].tutor_cuil,
        telefono: datos[0].tutor_telefono,
        email: datos[0].tutor_email,
        direccion: datos[0].tutor_direccion
      };

      resultadosDiv.innerHTML = `
        <fieldset class="border border-gray-300 p-4 rounded-b-none border-b-4 border-blue-800">
          <legend class="text-blue-800 font-bold px-2">Tutor</legend>
          <p><span class="text-blue-700 font-semibold">Nombre:</span> <span class="text-black">${tutor.nombre}, ${tutor.apellido.toUpperCase()}</span></p>
          <p><span class="text-blue-700 font-semibold">DNI:</span> <span class="text-black">${tutor.dni}</span></p>
          <p><span class="text-blue-700 font-semibold">CUIL:</span> <span class="text-black">${tutor.cuil}</span></p>
          <p><span class="text-blue-700 font-semibold">Teléfono:</span> <span class="text-black">${tutor.telefono || "—"}</span></p>
          <p><span class="text-blue-700 font-semibold">Email:</span> <span class="text-black">${tutor.email || "—"}</span></p>
          <p><span class="text-blue-700 font-semibold">Dirección:</span> <span class="text-black">${tutor.direccion || "—"}</span></p>
        </fieldset>
        <h3 class="mt-4 mb-2 font-bold text-lg">Alumnos asociados</h3>
      `;

      datos.forEach(alumno => {
        resultadosDiv.innerHTML += `
          <fieldset class="border border-gray-300 p-4 rounded-b-none border-b-4 border-blue-800 mb-2">
            <legend class="text-blue-800 font-bold px-2">Alumno</legend>
            <p><span class="text-blue-700 font-semibold">ID:</span> <span class="text-black">${alumno.id_alumno}</span></p>
            <p><span class="text-blue-700 font-semibold">Legajo:</span> <span class="text-black">${alumno.legajo}</span></p>
            <p><span class="text-blue-700 font-semibold">Nombre y Apellido:</span> <span class="text-black">${alumno.nombre}, ${alumno.apellido.toUpperCase()}</span></p>
            <p><span class="text-blue-700 font-semibold">DNI:</span> <span class="text-black">${alumno.dni}</span></p>
            <p><span class="text-blue-700 font-semibold">Curso actual:</span> <span class="text-black">${alumno.anio || "—"} ${alumno.division || "—"} (${alumno.anio_lectivo || "—"})</span></p>
          </fieldset>
        `;
      });
    }

    mostrarModal(document.getElementById('buscadorTutor'));

    // Vaciar input de DNI después de buscar
    dniInput.value = "";

  } catch (error) {
    console.error(error);
    alert('Error al buscar tutor');
  }
});
