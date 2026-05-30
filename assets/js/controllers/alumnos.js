// ════════════════════════════════════════════════════════════════
// Tabla de alumnos
// ════════════════════════════════════════════════════════════════
const tbody      = document.querySelector("#alumnosTable tbody");
const selectAnio = document.getElementById("selectCursoAnio");
const selectDiv  = document.getElementById("selectCursoDivision");

function cargarAlumnos() {
  const anio     = selectAnio.value;
  const division = selectDiv.value;

  let url = "/alumnos";
  const params = [];
  if (anio)     params.push(`anio=${anio}`);
  if (division) params.push(`division=${division}`);
  if (params.length) url += '?' + params.join('&');

  fetchWithAuth(url, { method: "GET" })
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = '';

      if (!data.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">
              No se encontraron alumnos para los filtros seleccionados.
            </td>
          </tr>`;
        return;
      }

      data.forEach(alumno => {
        const fila = document.createElement("tr");
        fila.className = "hover:bg-gray-50 transition-colors";
        fila.innerHTML = `
          <td class="px-4 py-3 text-sm text-gray-600">${alumno.id_alumno}</td>
          <td class="px-4 py-3 text-sm text-gray-700 font-medium">${alumno.legajo}</td>
          <td class="px-4 py-3 text-sm text-gray-900 font-medium">
            ${alumno.nombre} <span class="font-bold">${alumno.apellido.toUpperCase()}</span>
          </td>
          <td class="px-4 py-3 text-sm text-gray-700">${alumno.dni}</td>
          <td class="px-4 py-3">
            <div class="flex gap-2 justify-center">
              <button
                class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                onclick='verMasDesdeTabla(${JSON.stringify(alumno)})'>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                </svg>
                Ver más
              </button>
              <button
                class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
                onclick='editarDesdeTabla(${JSON.stringify(alumno)})'>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
                Editar
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(fila);
      });
    })
    .catch(error => console.error("Error al cargar los alumnos:", error));
}

// Filtros
selectAnio.addEventListener("change", cargarAlumnos);
selectDiv.addEventListener("change",  cargarAlumnos);
document.addEventListener("DOMContentLoaded", cargarAlumnos);

// ════════════════════════════════════════════════════════════════
// Ver más desde tabla — log: VER_DETALLE_ALUMNO
// ════════════════════════════════════════════════════════════════
function verMasDesdeTabla(alumno) {
  registrarLog(
    LOG_OP.VER_DETALLE_ALUMNO,
    `Ver detalle del alumno: ${alumno.nombre} ${alumno.apellido} (DNI: ${alumno.dni})`,
    `${alumno.nombre} ${alumno.apellido}`
  );
  if (typeof abrirDetalleDirecto === 'function') {
    abrirDetalleDirecto(alumno, false);
  }
}

// ════════════════════════════════════════════════════════════════
// Editar desde tabla — log: EDITAR_ALUMNO (apertura del modal)
// ════════════════════════════════════════════════════════════════
function editarDesdeTabla(alumno) {
  registrarLog(
    LOG_OP.EDITAR_ALUMNO,
    `Apertura de edición del alumno: ${alumno.nombre} ${alumno.apellido} (DNI: ${alumno.dni})`,
    `${alumno.nombre} ${alumno.apellido}`
  );
  if (typeof abrirDetalleDirecto === 'function') {
    abrirDetalleDirecto(alumno, true);
  }
}

// ════════════════════════════════════════════════════════════════
// Nueva Inscripción — log: ALTA_ALUMNO
// ════════════════════════════════════════════════════════════════
document.getElementById("formAlumno").addEventListener("submit", async function (e) {
  e.preventDefault();
  const btnSubmit  = document.getElementById('btnSubmitInscripcion');
  const feedbackEl = document.getElementById('feedbackInscripcion');
  if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Guardando...'; }

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  data.hermanos   = data.hermanos === "true";
  data.legajo     = Number(data.legajo);
  data.dni        = Number(data.dni);
  data.cuil       = Number(data.cuil);
  data.tutor_dni  = Number(data.tutor_dni);
  data.tutor_cuil = Number(data.tutor_cuil);

  try {
    const response = await fetchWithAuth("/alumnos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Error al insertar alumno");
    }

    // ── Log alta alumno ──
    registrarLog(
      LOG_OP.ALTA_ALUMNO,
      `Alta de alumno: ${data.nombre} ${data.apellido} (DNI: ${data.dni}, Legajo: ${data.legajo})`,
      `${data.nombre} ${data.apellido}`
    );

    if (feedbackEl) {
      feedbackEl.textContent = '✓ Alumno inscripto correctamente.';
      feedbackEl.className = 'rounded-xl px-4 py-3 text-sm border mt-4 bg-green-50 border-green-200 text-green-700';
      feedbackEl.classList.remove('hidden');
    }

    setTimeout(() => {
      const modal = document.getElementById('modalFormAlumno');
      if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
      this.reset();
      cargarAlumnos();
    }, 1200);

  } catch (error) {
    console.error("Error:", error);
    if (feedbackEl) {
      feedbackEl.textContent = 'Error: ' + error.message;
      feedbackEl.className = 'rounded-xl px-4 py-3 text-sm border mt-4 bg-red-50 border-red-200 text-red-700';
      feedbackEl.classList.remove('hidden');
    }
  } finally {
    if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Agregar Alumno'; }
  }
});

// ════════════════════════════════════════════════════════════════
// Formulario editar legacy (modal tabla directa)
// ════════════════════════════════════════════════════════════════
document.getElementById("formAlumnoEditar")?.addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  data.legajo     = Number(data.legajo);
  data.dni        = Number(data.dni);
  data.cuil       = Number(data.cuil);
  data.tutor_dni  = Number(data.tutor_dni);
  data.tutor_cuil = Number(data.tutor_cuil);
  data.hermanos   = data.hermanos === "true";

  try {
    const response = await fetchWithAuth(`/alumnos/${data.id_alumno}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Error al actualizar alumno");

    registrarLog(
      LOG_OP.EDITAR_ALUMNO,
      `Edición de alumno (ID: ${data.id_alumno}, DNI: ${data.dni})`,
      `${data.nombre} ${data.apellido}`
    );

    alert("Alumno actualizado correctamente");
    location.reload();
  } catch (error) {
    alert("Error al actualizar");
    console.error(error);
  }
});