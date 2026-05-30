//Rellenar el tbody de alumnos
const tbody = document.querySelector("#alumnosTable tbody");
const selectAnio = document.getElementById("selectCursoAnio");
const selectDivision = document.getElementById("selectCursoDivision");

function cargarAlumnos() {
  const anio = selectAnio.value;
  const division = selectDivision.value;

  let url = "/alumnos";
  const params = [];
  if (anio) params.push(`anio=${anio}`);
  if (division) params.push(`division=${division}`);
  if (params.length) url += '?' + params.join('&');

  fetchWithAuth(url, { method: "GET" })

    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = '';
      data.forEach(alumno => {
        const fila = document.createElement("tr");
        fila.className = "hover:bg-gray-100";
        fila.innerHTML = `
          <td class="px-4 py-2 text-sm text-gray-700">${alumno.id_alumno}</td>
          <td class="px-4 py-2 text-sm text-gray-700">${alumno.legajo}</td>
          <td class="px-4 py-2 text-sm text-gray-700">${alumno.nombre} ${alumno.apellido.toUpperCase()}</td>
          <td class="px-4 py-2 text-sm text-gray-700">${alumno.dni}</td>
          <td class="px-4 py-2 flex gap-2 justify-center">
            <button
              class="inline-flex items-center justify-center gap-2 text-sm font-medium h-9 rounded-md px-3 text-green-600 hover:text-green-800 hover:bg-green-100"
              onclick='abrirFormularioEdicion(${JSON.stringify(alumno)})'>
              Editar
            </button>
            <button
              class="inline-flex items-center justify-center gap-2 text-sm font-medium h-9 rounded-md px-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              onclick='verMasAlumno(${JSON.stringify(alumno)})'>
              Ver más
            </button>
          </td>
        `;
        tbody.appendChild(fila);
      });
    })
    .catch(error => console.error("Error al cargar los alumnos:", error));
}

// Eventos de filtro
selectAnio.addEventListener("change", cargarAlumnos);
selectDivision.addEventListener("change", cargarAlumnos);

// Carga inicial
document.addEventListener("DOMContentLoaded", cargarAlumnos);


function verMasAlumno(alumno) {
  const detalleDiv = document.getElementById("detalleAlumno");

  detalleDiv.innerHTML = `
  <div class="flex gap-6">
    <!-- Columna Alumno -->
    <fieldset class="flex-1 border border-gray-300 p-4 rounded-b-none border-b-4 border-blue-800">
      <legend class="text-blue-800 font-bold px-2">${'Alumno'}</legend>
      <p><span class="text-blue-700 font-semibold">ID:</span> <span class="text-black">${alumno.id_alumno}</span></p>
      <p><span class="text-blue-700 font-semibold">Legajo:</span> <span class="text-black">${alumno.legajo}</span></p>
      <p><span class="text-blue-700 font-semibold">Nombre y Apellido:</span> <span class="text-black">${alumno.nombre}, ${alumno.apellido.toUpperCase()}</span></p>
      <p><span class="text-blue-700 font-semibold">DNI:</span> <span class="text-black">${alumno.dni}</span></p>
      <p><span class="text-blue-700 font-semibold">CUIL:</span> <span class="text-black">${alumno.cuil}</span></p>
      <p><span class="text-blue-700 font-semibold">Email:</span> <span class="text-black">${alumno.email || "—"}</span></p>
      <p><span class="text-blue-700 font-semibold">Teléfono:</span> <span class="text-black">${alumno.fecha_nacimiento || "—"}</span></p>
      <p><span class="text-blue-700 font-semibold">Dirección:</span> <span class="text-black">${alumno.direccion || "—"}</span></p>
      <p><span class="text-blue-700 font-semibold">Hermanos:</span> <span class="text-black">${alumno.hermanos}</span></p>
      <p><span class="text-blue-700 font-semibold">Link documentación:</span> <span class="text-black">${alumno.link_docu}</span></p>
<!--me dejo de funcionar lo de curso actual no se porque, igual ya no se si es tan necesario aca, despues lo veo
      <p><span class="text-blue-700 font-semibold">Curso actual:</span> <span class="text-black">${alumno.nombre_curso || "—"} (${alumno.anio_lectivo || "—"})</span></p>
-->
    </fieldset>
    <fieldset class="flex-1 border border-gray-300 p-4 rounded-b-none border-b-4 border-blue-800">
      <legend class="text-blue-800 font-bold px-2">${'Tutor'}</legend>
      <p><span class="text-blue-700 font-semibold">Nombre:</span> <span class="text-black">${alumno.tutor_nombre || "—"}, ${alumno.tutor_apellido?.toUpperCase() || "—"}</span></p>
      <p><span class="text-blue-700 font-semibold">DNI:</span> <span class="text-black">${alumno.tutor_dni || "—"}</span></p>
      <p><span class="text-blue-700 font-semibold">CUIL:</span> <span class="text-black">${alumno.tutor_cuil || "—"}</span></p>
      <p><span class="text-blue-700 font-semibold">Teléfono:</span> <span class="text-black">${alumno.tutor_telefono || "—"}</span></p>
      <p><span class="text-blue-700 font-semibold">Email:</span> <span class="text-black">${alumno.tutor_email || "—"}</span></p>
      <p><span class="text-blue-700 font-semibold">Dirección:</span> <span class="text-black">${alumno.tutor_direccion || "—"}</span></p>
    </fieldset>
  </div>
`;

  mostrarModal(document.getElementById("modalVerMas"));


}


//Maneja la data de la creacion de alumno
document.getElementById("formAlumno").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // Convertir el coso de variantes
  data.hermanos = data.hermanos === "true";
  data.legajo = Number(data.legajo);
  data.dni = Number(data.dni);
  data.cuil = Number(data.cuil);
  data.tutor_dni = Number(data.tutor_dni);
  data.tutor_cuil = Number(data.tutor_cuil);

  try {
    const response = await fetchWithAuth("/alumnos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });


    if (!response.ok) throw new Error("Error al insertar alumno con tutor");

    alert("Alumno y tutor insertados correctamente");
    location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al agregar alumno y tutor");
  }
});

//funcion que abre el modal con el formulario rellenado con la funcion global de formulariosDinamicos.js
function abrirFormularioEdicion(alumno) {
  llenarFormulario("formAlumnoEditar", alumno);
  mostrarModal(document.getElementById("modalEditarAlumno"));
}
//proceso de buscar alumno para editar
configurarBuscadorEntidad({
  inputs: [
    { id: "inputDniBuscar", campo: "dni", required: true }
  ],
  botonId: "btnBuscarAlumno",
  endpoint: "/alumnos/buscar",
  callbackAbrirModal: abrirFormularioEdicion
});




document.getElementById("formAlumnoEditar").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  data.legajo = Number(data.legajo);
  data.dni = Number(data.dni);
  data.cuil = Number(data.cuil);
  data.tutor_dni = Number(data.tutor_dni);
  data.tutor_cuil = Number(data.tutor_cuil);
  data.hermanos = data.hermanos === "true";

  try {
    const response = await fetchWithAuth(`/alumnos/${data.id_alumno}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Error al actualizar alumno");

    alert("Alumno actualizado correctamente");
    location.reload();
  } catch (error) {
    alert("Error al actualizar");
    console.error(error);
  }
});
