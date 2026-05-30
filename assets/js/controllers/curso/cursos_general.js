document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.querySelector("#tabla-cursos tbody");
    if (!tbody) return;

    tbody.addEventListener("click", (event) => {
        const botonDetalle = event.target.closest("[data-action='ver-detalle-curso']");
        if (!botonDetalle) return;

        abrirDetalleCurso({
            id: botonDetalle.dataset.idCurso,
            id_curso: botonDetalle.dataset.idCurso,
            anio: botonDetalle.dataset.anio,
            division: botonDetalle.dataset.division,
            anio_lectivo: botonDetalle.dataset.anioLectivo,
            id_plan: botonDetalle.dataset.idPlan || null
        });
    });

    fetchWithAuth("/cursos")
    .then(res => res.json())
    .then(data => {
        data.forEach(curso => {
            const fila = document.createElement("tr");
            fila.className = "hover:bg-gray-100";  //color de fondo al pasar el mouse
            fila.innerHTML = `

            <td class="px-4 py-2 text-sm text-gray-700">${curso.id_curso}</td>
            <td class="px-4 py-2 text-sm text-gray-700">${curso.anio}</td>
            <td class="px-4 py-2 text-sm text-gray-700">${curso.division}</td>
            <td class="px-4 py-2 text-sm text-gray-700">${curso.nombre_plan}</td>
             <td class="px-4 py-2 text-sm text-gray-700">${curso.anio_lectivo}</td>


                    <td class="px-4 py-2 text-center">
                        <button
                            type="button"
                            class="inline-flex items-center justify-center gap-1 rounded-full bg-green-50 py-0.5 pl-2.5 pr-2 text-sm font-medium text-green-600 dark:bg-green-500/15 dark:text-green-500"
                            data-action="ver-detalle-curso"
                            data-id-curso="${curso.id_curso}"
                            data-anio="${curso.anio}"
                            data-division="${curso.division}"
                            data-anio-lectivo="${curso.anio_lectivo}"
                            data-id-plan="${curso.id_plan ?? ""}"
                        >Ver más</button>
                    </td>
                    
                `

                tbody.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("Error al cargar los alumnos:", error);
        });
})


document.addEventListener("DOMContentLoaded", () => {
  const selectCurso = document.getElementById("selectCurso");

  if (selectCurso) {
    for (let anio = 1; anio <= 7; anio++) {
      let optgroup = document.createElement("optgroup");
      optgroup.label = `${anio}° Año`;

      for (let division = 1; division <= 4; division++) {
        let option = document.createElement("option");
        option.value = `${anio}°${division}°`;
        option.textContent = `${anio}°${division}°`;
        optgroup.appendChild(option);
      }

      selectCurso.appendChild(optgroup);
    }
  }
});

  fetchWithAuth('/planes')
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('selectPlanes');
      data.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id_plan;
        option.textContent = plan.nombre_plan;
        select.appendChild(option);
      });
    });

  // Manejar el submit del formulario
document.getElementById("formCurso").addEventListener("submit", async function(e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetchWithAuth("/cursos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const resData = await response.json();

    if (!response.ok) {
      alert(resData.error || "Ocurrió un error al crear el curso");
    } else {
      alert(resData.mensaje);
      location.reload();
    }
  } catch (error) {
    console.error("Error al agregar curso:", error);
    alert("Error al crear el curso");
  }
});



btnBuscarCurso.addEventListener("click", async () => {
  const anioLectivo = document.getElementById("inputAnio").value.trim();
  const anio = document.getElementById("selectCursoAnio").value;
  const division = document.getElementById("selectCursoDivision").value;

  if (!anioLectivo || !anio || !division) {
    alert("Por favor ingrese año lectivo y seleccione curso y división.");
    return;
  }

  try {
    const res = await fetchWithAuth(`/cursos/alumnosCurso?anioLectivo=${encodeURIComponent(anioLectivo)}&anio=${encodeURIComponent(anio)}&division=${encodeURIComponent(division)}`);
    const alumnos = await res.json();

    const contenidoResultados = document.getElementById("contenidoResultados");
    const modal = document.getElementById("modalResultados");
    const tituloModal = modal.querySelector("h2");

    if (alumnos.length === 0) {
      contenidoResultados.innerHTML = "<p>No se encontraron alumnos para esos datos.</p>";
    } else {
      tituloModal.textContent = `Curso ${alumnos[0].anio}${alumnos[0].division} — Año ${alumnos[0].anio_lectivo}`;

      // Tabla de resultados
      let html = `
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gradient-to-r from-blue-600 to-blue-700 text-white cursor-default">
              <th class="px-4 py-3 text-left font-medium">ID</th>
              <th class="px-4 py-3 text-left font-medium">Legajo</th>
              <th class="px-4 py-3 text-left font-medium">Nombre</th>
              <th class="px-4 py-3 text-left font-medium">DNI</th>
            </tr>
          </thead>
          <tbody>
      `;
      alumnos.forEach(a => {
        html += `
          <tr>
            <td class="px-4 py-2 text-sm text-gray-700">${a.id_alumno}</td>
            <td class="px-4 py-2 text-sm text-gray-700">${a.legajo}</td>
            <td class="px-4 py-2 text-sm text-gray-700">${a.nombre}, ${a.apellido.toUpperCase()}</td>
            <td class="px-4 py-2 text-sm text-gray-700">${a.dni}</td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      contenidoResultados.innerHTML = html;
    }

    mostrarModal(modal);

    // Limpiar campos
    document.getElementById("inputAnio").value = "";
    document.getElementById("selectCursoAnio").value = "";
    document.getElementById("selectCursoDivision").value = "";
  } catch (err) {
    console.error("Error en búsqueda:", err);
    document.getElementById("contenidoResultados").innerHTML = "<p>Error al buscar alumnos.</p>";
    mostrarModal(document.getElementById("modalResultados"));
  }
});

let materiasCache = [];
let ordenMateriasActual = "nombre";

function escaparHtml(valor) {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

async function completarMateriasConProfesores(materias) {
    if (!Array.isArray(materias) || !materias.length) {
      return [];
    }

    const faltanProfesores = materias.some((materia) => !Array.isArray(materia?.profesores));
    if (!faltanProfesores) {
      return materias.map((materia) => ({
        ...materia,
        profesores: Array.isArray(materia?.profesores) ? materia.profesores : []
      }));
    }

    try {
      const response = await fetchWithAuth("/materias", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Respuesta ${response.status}`);
      }

      const data = await response.json();
      const materiasPorId = new Map(
        (Array.isArray(data) ? data : []).map((materia) => [String(materia.id_materia), materia])
      );

      return materias.map((materia) => {
        const materiaConProfesores = materiasPorId.get(String(materia.id_materia));

        return {
          ...materia,
          profesores: Array.isArray(materiaConProfesores?.profesores)
            ? materiaConProfesores.profesores
            : Array.isArray(materia?.profesores)
              ? materia.profesores
              : []
        };
      });
    } catch (error) {
      console.error("No se pudieron completar los profesores de las materias.", error);
      return materias.map((materia) => ({
        ...materia,
        profesores: Array.isArray(materia?.profesores) ? materia.profesores : []
      }));
    }
  }

function normalizarProfesor(profesor) {
    if (!profesor || typeof profesor !== "object") return null;

  const nombre = String(
    profesor.nombre ?? profesor.nombre_profesor ?? profesor.nombre_materia ?? ""
  ).trim();
  const apellido = String(profesor.apellido ?? "").trim();
  const rolProfesor = String(
    profesor.rol_profesor ?? profesor.rolProfesor ?? profesor.rol ?? ""
  ).trim() || "Titular";

  if (!nombre && !apellido) return null;

  return {
    nombre,
    apellido,
    rol_profesor: rolProfesor
  };
}

function obtenerNombreProfesorCompleto(profesor) {
  const partes = [profesor?.nombre, profesor?.apellido]
    .map((valor) => String(valor || "").trim())
    .filter(Boolean);

  return partes.length ? partes.join(" ") : "Profesor sin nombre";
}

function obtenerProfesoresMateria(materia) {
  if (!Array.isArray(materia?.profesores)) {
    return [];
  }

  return materia.profesores
    .map(normalizarProfesor)
    .filter(Boolean)
    .slice(0, 2);
}

function obtenerClaveOrdenProfesor(materia) {
  const profesores = obtenerProfesoresMateria(materia);
  if (!profesores.length) {
    return "\uffff";
  }

  return profesores.map(obtenerNombreProfesorCompleto).join(" / ").toLowerCase();
}

function renderProfesoresMateria(materia) {
  const profesores = obtenerProfesoresMateria(materia);

  if (!profesores.length) {
    return `<p><span class="font-medium">Profesores:</span> Sin asignar</p>`;
  }

  return `
    <div>
      <p class="font-medium text-gray-700">Profesores</p>
      <div class="mt-2 space-y-2">
        ${profesores.map((profesor) => `
          <div class="rounded-md bg-slate-50 px-3 py-2">
            <p class="font-medium text-slate-700">${escaparHtml(obtenerNombreProfesorCompleto(profesor))}</p>
            <p class="mt-1 flex items-center gap-2">
              <span class="text-gray-500">Rol:</span>
              ${renderRolBadge(profesor.rol_profesor || "Sin rol")}
            </p>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}


async function cargarCurso(idCurso) {
  const cursoSkeleton = document.getElementById("cursoSkeleton");
  const cursoContenido = document.getElementById("cursoContenido");
  const cursoError = document.getElementById("cursoError");

  if (cursoError) cursoError.classList.add("hidden");
  if (cursoContenido) cursoContenido.classList.add("hidden");
  if (cursoSkeleton) cursoSkeleton.classList.remove("hidden");

  try {
    const res = await fetchWithAuth(`/cursos/${idCurso}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      throw new Error("No se pudo cargar el curso");
    }

    const data = await res.json();
    const curso = data.curso;
    const materias = Array.isArray(data.materias) ? data.materias : [];

    renderCurso(curso);
    materiasCache = await completarMateriasConProfesores(materias);
    renderMaterias(materiasCache);

    if (cursoContenido) cursoContenido.classList.remove("hidden");
  } catch (error) {
    console.error(error);
    if (cursoError) cursoError.classList.remove("hidden");
  } finally {
    if (cursoSkeleton) cursoSkeleton.classList.add("hidden");
  }
}

function renderCurso(curso) {
  if (!curso) return;
  const titulo = document.getElementById("cursoTitulo");
  const anioLectivo = document.getElementById("anioLectivo");
  const nombrePlan = document.getElementById("nombrePlan");
  const descripcionPlan = document.getElementById("descripcionPlan");

  if (titulo) {
    titulo.textContent = `${curso.anio} Año - División ${curso.division}`;
  }
  if (anioLectivo) {
    anioLectivo.textContent = `Año lectivo ${curso.anio_lectivo}`;
  }
  if (nombrePlan) {
    nombrePlan.textContent = curso.nombre_plan || "Sin plan asignado";
  }
  if (descripcionPlan) {
    descripcionPlan.textContent = curso.descripcion || "Sin descripción disponible";
  }
}

function renderMaterias(materias) {
  const contenedor = document.getElementById("listaMaterias");
  const emptyState = document.getElementById("materiasEmpty");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (!materias || materias.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  const materiasOrdenadas = [...materias];
  if (ordenMateriasActual === "profesor") {
    materiasOrdenadas.sort((a, b) => obtenerClaveOrdenProfesor(a).localeCompare(obtenerClaveOrdenProfesor(b)));
  } else {
    materiasOrdenadas.sort((a, b) => (a.nombre_materia || "").localeCompare(b.nombre_materia || ""));
  }

  const cards = materiasOrdenadas.map(materia => {
    return `
      <div class="bg-white border rounded-lg p-4 hover:shadow transition">
        <h3 class="font-semibold text-lg">${escaparHtml(materia.nombre_materia || "Materia sin nombre")}</h3>
        <div class="mt-2 text-sm text-gray-600 space-y-2">
          ${renderProfesoresMateria(materia)}
        </div>
      </div>
    `;
  }).join("");

  contenedor.innerHTML = cards;
}

function renderRolBadge(rol) {
  const rolLower = (rol || "").toLowerCase();
  let classes = "bg-gray-100 text-gray-700";

  if (rolLower.includes("titular")) {
    classes = "bg-blue-100 text-blue-700";
  } else if (rolLower.includes("suplente")) {
    classes = "bg-yellow-100 text-yellow-800";
  }

  return `<span class="${classes} text-xs px-2 py-1 rounded">${escaparHtml(rol || "Sin rol")}</span>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const ordenMaterias = document.getElementById("ordenMaterias");
  if (ordenMaterias) {
    ordenMaterias.addEventListener("change", (event) => {
      ordenMateriasActual = event.target.value;
      renderMaterias(materiasCache);
    });
  }
});

function abrirDetalleCurso(idCurso) {
  const curso = typeof idCurso === "object" && idCurso !== null
    ? idCurso
    : { id: idCurso, id_curso: idCurso };
  const cursoId = curso.id ?? curso.id_curso;

  if (!cursoId) {
    console.error("No se pudo abrir el detalle del curso porque falta el id.");
    return;
  }

  const idNormalizado = Number.isNaN(Number(cursoId)) ? String(cursoId) : Number(cursoId);

  localStorage.setItem('id_curso', String(cursoId));
  localStorage.setItem('cursoSeleccionado', JSON.stringify({
    id: idNormalizado,
    id_curso: idNormalizado,
    anio: curso.anio || "",
    division: curso.division || "",
    anio_lectivo: curso.anio_lectivo || "",
    id_plan: curso.id_plan === "" || curso.id_plan == null ? null : Number(curso.id_plan)
  }));

  if (window.top && typeof window.top.cargarVista === "function") {
    window.top.cargarVista('cursos/cursos_detalles.html');
    return;
  }
  window.location.href = "/views/cursos/cursos_detalles.html";
}
