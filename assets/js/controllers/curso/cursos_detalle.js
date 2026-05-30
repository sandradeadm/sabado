let materiasCache = [];
let ordenMateriasActual = "nombre";
let cursoActual = null;
let planesCache = null;
let modoMateria = "crear";
let alumnosCache = [];
let profesoresCache = [];

document.addEventListener("DOMContentLoaded", () => {
  const ordenMaterias = document.getElementById("ordenMaterias");
  if (ordenMaterias) {
    ordenMaterias.addEventListener("change", (event) => {
      ordenMateriasActual = event.target.value;
      renderMaterias(materiasCache);
    });
  }

  const btnEditarCurso = document.getElementById("btnEditarCurso");
  if (btnEditarCurso) {
    btnEditarCurso.addEventListener("click", abrirEditarCurso);
  }

  const btnEliminarCurso = document.getElementById("btnEliminarCurso");
  if (btnEliminarCurso) {
    btnEliminarCurso.addEventListener("click", eliminarCurso);
  }

  const btnCancelarCurso = document.getElementById("btnCancelarCurso");
  if (btnCancelarCurso) {
    btnCancelarCurso.addEventListener("click", () => ocultarModal("modalCurso"));
  }

  const btnCancelarMateria = document.getElementById("btnCancelarMateria");
  if (btnCancelarMateria) {
    btnCancelarMateria.addEventListener("click", () => ocultarModal("modalMateria"));
  }

  const btnAgregarMateria = document.getElementById("btnAgregarMateria");
  if (btnAgregarMateria) {
    btnAgregarMateria.addEventListener("click", abrirCrearMateria);
  }

  const btnAgregarSegundoProfesor = document.getElementById("btnAgregarSegundoProfesor");
  if (btnAgregarSegundoProfesor) {
    btnAgregarSegundoProfesor.addEventListener("click", () => {
      mostrarSegundoProfesor();
    });
  }

  const btnQuitarSegundoProfesor = document.getElementById("btnQuitarSegundoProfesor");
  if (btnQuitarSegundoProfesor) {
    btnQuitarSegundoProfesor.addEventListener("click", () => {
      ocultarSegundoProfesor();
    });
  }

  const formCursoEditar = document.getElementById("formCursoEditar");
  if (formCursoEditar) {
    formCursoEditar.addEventListener("submit", actualizarCurso);
  }

  const formMateriaEditar = document.getElementById("formMateriaEditar");
  if (formMateriaEditar) {
    formMateriaEditar.addEventListener("submit", guardarMateria);
  }

  const cursoSeleccionado = obtenerCursoSeleccionado();
  const idCurso = cursoSeleccionado?.id;
  if (!idCurso) {
    mostrarError("No se encontró el curso seleccionado. Volviendo al listado...");
    ocultarSkeleton();
    if (window.top && typeof window.top.cargarVista === "function") {
      setTimeout(() => {
        window.top.cargarVista("cursos/cursos_general.html");
      }, 800);
    }
    return;
  }

  cargarCurso(idCurso);
  cargarProfesoresDisponibles().catch((error) => {
    console.error(error);
  });
});

async function cargarCurso(idCurso) {
  ocultarError();
  mostrarSkeleton();

  try {
    const res = await fetchWithAuth(`/cursos/${idCurso}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      throw new Error("No se pudo cargar el curso");
    }

    const data = await res.json();
    const curso = data.curso || data;
    const materias = Array.isArray(data.materias) ? data.materias : [];

    if (!curso) {
      throw new Error("Curso no encontrado");
    }

    cursoActual = curso;
    persistirCursoSeleccionado(curso);
    renderCurso(curso);
    materiasCache = await completarMateriasConProfesores(materias);
    renderMaterias(materiasCache);
    await cargarAlumnosCurso(idCurso);

    mostrarContenido();
  } catch (error) {
    console.error(error);
    mostrarError("No se pudo cargar el curso.");
  } finally {
    ocultarSkeleton();
  }
}

function renderCurso(curso) {
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

async function cargarAlumnosCurso(idCurso) {
  mostrarEstadoAlumnos("Cargando alumnos...");

  try {
    const data = await obtenerAlumnosCurso(idCurso);
    alumnosCache = Array.isArray(data.alumnos) ? data.alumnos : [];
    actualizarResumenAlumnos(data);
    renderAlumnos(alumnosCache);
  } catch (error) {
    console.error(error);
    alumnosCache = [];
    actualizarResumenAlumnos(cursoActual);
    actualizarContadorAlumnos(0);
    mostrarEstadoAlumnos("No se pudieron cargar los alumnos de este curso.", "error");
  }
}

async function obtenerAlumnosCurso(idCurso) {
  const res = await fetchWithAuth(`/cursos/${idCurso}/alumnos`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (res.status === 404) {
    return {
      anio: cursoActual?.anio || "",
      division: cursoActual?.division || "",
      anio_lectivo: cursoActual?.anio_lectivo || "",
      alumnos: []
    };
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "No se pudieron obtener los alumnos.");
  }

  return {
    ...data,
    alumnos: Array.isArray(data.alumnos) ? data.alumnos : []
  };
}

function renderAlumnos(alumnos) {
  const tbody = document.getElementById("alumnosBody");
  const tablaWrapper = document.getElementById("alumnosTablaWrapper");

  if (!tbody || !tablaWrapper) return;

  tbody.innerHTML = "";
  actualizarContadorAlumnos(alumnos?.length || 0);

  if (!Array.isArray(alumnos) || alumnos.length === 0) {
    tablaWrapper.classList.add("hidden");
    mostrarEstadoAlumnos("Este curso todavía no tiene alumnos asignados.");
    return;
  }

  ocultarEstadoAlumnos();
  tablaWrapper.classList.remove("hidden");

  alumnos.forEach((alumno) => {
    const fila = document.createElement("tr");
    fila.className = "border-b border-slate-100 last:border-b-0";

    [alumno.legajo, alumno.nombre, alumno.apellido, alumno.dni].forEach((valor) => {
      const celda = document.createElement("td");
      celda.className = "px-4 py-3 text-sm text-gray-700";
      celda.textContent = valor || "-";
      fila.appendChild(celda);
    });

    tbody.appendChild(fila);
  });
}

function actualizarContadorAlumnos(cantidad) {
  const contador = document.getElementById("alumnosCount");
  if (!contador) return;
  contador.textContent = `${cantidad} alumno${cantidad === 1 ? "" : "s"}`;
}

function actualizarResumenAlumnos(data) {
  const resumen = document.getElementById("alumnosResumen");
  if (!resumen) return;

  const anio = data?.anio ?? cursoActual?.anio ?? "";
  const division = data?.division ?? cursoActual?.division ?? "";
  const anioLectivo = data?.anio_lectivo ?? cursoActual?.anio_lectivo ?? "";

  if (anio && division && anioLectivo) {
    resumen.textContent = `Curso ${anio} ${division} - Año lectivo ${anioLectivo}`;
    return;
  }

  resumen.textContent = "Listado de alumnos asociados al curso seleccionado.";
}

function mostrarEstadoAlumnos(mensaje, tipo = "info") {
  const estado = document.getElementById("alumnosEstado");
  const tablaWrapper = document.getElementById("alumnosTablaWrapper");

  if (tablaWrapper) tablaWrapper.classList.add("hidden");
  if (!estado) return;

  estado.textContent = mensaje;
  estado.className = "mt-4 rounded-lg border px-4 py-3 text-sm";

  if (tipo === "error") {
    estado.classList.add("border-red-200", "bg-red-50", "text-red-700");
    return;
  }

  estado.classList.add("border-slate-200", "bg-slate-50", "text-slate-600");
}

function ocultarEstadoAlumnos() {
  const estado = document.getElementById("alumnosEstado");
  if (estado) estado.classList.add("hidden");
}

function obtenerCursoSeleccionado() {
  const cursoGuardado = localStorage.getItem("cursoSeleccionado");

  if (cursoGuardado) {
    try {
      const curso = JSON.parse(cursoGuardado);
      const idCurso = curso?.id ?? curso?.id_curso;

      if (idCurso) {
        localStorage.setItem("id_curso", String(idCurso));
        return {
          ...curso,
          id: idCurso,
          id_curso: curso?.id_curso ?? idCurso
        };
      }
    } catch (error) {
      console.warn("No se pudo leer cursoSeleccionado desde localStorage.", error);
    }
  }

  const idCurso = localStorage.getItem("id_curso");
  if (!idCurso) return null;

  return {
    id: idCurso,
    id_curso: idCurso
  };
}

function persistirCursoSeleccionado(curso) {
  if (!curso) return;

  const idCurso = curso.id ?? curso.id_curso;
  if (!idCurso) return;

  localStorage.setItem("id_curso", String(idCurso));
  localStorage.setItem("cursoSeleccionado", JSON.stringify({
    id: idCurso,
    id_curso: idCurso,
    anio: curso.anio || "",
    division: curso.division || "",
    anio_lectivo: curso.anio_lectivo || "",
    id_plan: curso.id_plan ?? null,
    nombre_plan: curso.nombre_plan || ""
  }));
}

function limpiarCursoSeleccionado() {
  localStorage.removeItem("id_curso");
  localStorage.removeItem("cursoSeleccionado");
}

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
  if (!profesor || typeof profesor !== "object") {
    return null;
  }

  const idProfesor = profesor.id_profesor ?? profesor.id ?? profesor.profesorId ?? null;
  const nombre = String(
    profesor.nombre ?? profesor.nombre_profesor ?? profesor.nombre_materia ?? ""
  ).trim();
  const apellido = String(profesor.apellido ?? "").trim();
  const rolProfesor = String(
    profesor.rol_profesor ?? profesor.rolProfesor ?? profesor.rol ?? ""
  ).trim() || "Titular";

  if (!idProfesor && !nombre && !apellido) {
    return null;
  }

  return {
    id_profesor: idProfesor,
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

function obtenerResumenProfesores(materia) {
  const profesores = obtenerProfesoresMateria(materia);
  if (!profesores.length) {
    return "Sin asignar";
  }

  return profesores.map(obtenerNombreProfesorCompleto).join(" / ");
}

function obtenerClaveOrdenProfesor(materia) {
  const resumen = obtenerResumenProfesores(materia);
  return resumen === "Sin asignar" ? "\uffff" : resumen.toLowerCase();
}

function renderProfesoresMateria(materia) {
  const profesores = obtenerProfesoresMateria(materia);

  if (!profesores.length) {
    return `
      <p><span class="font-medium">Profesores:</span> Sin asignar</p>
    `;
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

function actualizarEstadoProfesoresMateria(mensaje, tipo = "info") {
  const estado = document.getElementById("materiaProfesoresEstado");
  if (!estado) return;

  const estilos = {
    info: "text-slate-500",
    success: "text-green-700",
    error: "text-red-700"
  };

  estado.className = `mt-1 text-xs ${estilos[tipo] || estilos.info}`;
  estado.textContent = mensaje;
}

function mostrarSegundoProfesor() {
  const bloque = document.getElementById("bloqueProfesor2");
  const botonAgregar = document.getElementById("btnAgregarSegundoProfesor");

  if (bloque) bloque.classList.remove("hidden");
  if (botonAgregar) botonAgregar.classList.add("hidden");
}

function ocultarSegundoProfesor() {
  const bloque = document.getElementById("bloqueProfesor2");
  const botonAgregar = document.getElementById("btnAgregarSegundoProfesor");
  const selectProfesor2 = document.getElementById("materiaProfesor2");
  const selectRol2 = document.getElementById("materiaRol2");

  if (selectProfesor2) selectProfesor2.value = "";
  if (selectRol2) selectRol2.value = "Titular";
  if (bloque) bloque.classList.add("hidden");
  if (botonAgregar) botonAgregar.classList.remove("hidden");
}

function renderProfesoresSelects(profesores, seleccionados = []) {
  const profesoresDisponibles = [...profesores];

  seleccionados
    .map(normalizarProfesor)
    .filter((profesor) => profesor?.id_profesor)
    .forEach((profesor) => {
      const yaExiste = profesoresDisponibles.some(
        (disponible) => String(disponible.id_profesor) === String(profesor.id_profesor)
      );

      if (!yaExiste) {
        profesoresDisponibles.push(profesor);
      }
    });

  const configuraciones = [
    { selectId: "materiaProfesor1", seleccionado: seleccionados[0]?.id_profesor ?? "" },
    { selectId: "materiaProfesor2", seleccionado: seleccionados[1]?.id_profesor ?? "" }
  ];

  configuraciones.forEach(({ selectId, seleccionado }) => {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Sin asignar";
    select.appendChild(placeholder);

    profesoresDisponibles.forEach((profesor) => {
      const option = document.createElement("option");
      option.value = String(profesor.id_profesor);
      option.textContent = obtenerNombreProfesorCompleto(profesor);
      select.appendChild(option);
    });

    select.value = String(seleccionado || "");
  });
}

async function obtenerProfesoresDesdeEndpoint(url) {
  return fetchWithAuth(url);
}

async function cargarProfesoresDisponibles(force = false) {
  if (!force && profesoresCache.length) {
    renderProfesoresSelects(profesoresCache);
    actualizarEstadoProfesoresMateria("Profesores cargados correctamente.", "success");
    return profesoresCache;
  }

  actualizarEstadoProfesoresMateria("Consultando profesores disponibles...", "info");

  try {
    const response = await obtenerProfesoresDesdeEndpoint("/profesores");

    if (!response.ok) {
      throw new Error(`Respuesta ${response.status}`);
    }

    const data = await response.json();
    const profesores = Array.isArray(data)
      ? data
          .map(normalizarProfesor)
          .filter(Boolean)
          .sort((a, b) => obtenerNombreProfesorCompleto(a).localeCompare(obtenerNombreProfesorCompleto(b)))
      : [];

    profesoresCache = profesores;
    renderProfesoresSelects(profesoresCache);
    actualizarEstadoProfesoresMateria(
      profesoresCache.length
        ? "Profesores cargados correctamente."
        : "No hay profesores disponibles para seleccionar.",
      profesoresCache.length ? "success" : "info"
    );
    return profesoresCache;
  } catch (error) {
    profesoresCache = [];
    renderProfesoresSelects([]);
    actualizarEstadoProfesoresMateria(
      `No se pudieron obtener los profesores${error?.message ? `: ${error.message}` : "."}`,
      "error"
    );
    throw error;
  }
}

function construirProfesoresSeleccionados() {
  const configuraciones = [
    { selectId: "materiaProfesor1", rolId: "materiaRol1" },
    { selectId: "materiaProfesor2", rolId: "materiaRol2" }
  ];

  const profesores = configuraciones
    .map(({ selectId, rolId }) => {
      const select = document.getElementById(selectId);
      const rol = document.getElementById(rolId);
      const profesorId = select?.value ? Number(select.value) : null;

      if (!profesorId) {
        return null;
      }

      return {
        profesorId,
        rolProfesor: rol?.value || "Titular"
      };
    })
    .filter(Boolean);

  const ids = profesores.map(({ profesorId }) => profesorId);
  if (new Set(ids).size !== ids.length) {
    throw new Error("No se puede seleccionar el mismo profesor dos veces.");
  }

  return profesores;
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
    const materiaId = String(materia.id_materia);
    return `
      <div class="bg-white border rounded-lg p-4 hover:shadow transition">
        <h3 class="font-semibold text-lg">${escaparHtml(materia.nombre_materia || "Materia sin nombre")}</h3>
        <div class="mt-2 text-sm text-gray-600 space-y-2">
          ${renderProfesoresMateria(materia)}
        </div>
        <div class="mt-3 flex items-center justify-end gap-2">
          <button class="px-3 py-1 text-xs rounded-md border" onclick="abrirEditarMateria('${materiaId}')">Editar</button>
          <button class="px-3 py-1 text-xs rounded-md bg-red-500 text-white" onclick="eliminarMateria('${materiaId}')">Eliminar</button>
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

function mostrarContenido() {
  const cursoContenido = document.getElementById("cursoContenido");
  if (cursoContenido) cursoContenido.classList.remove("hidden");
}

function mostrarSkeleton() {
  const cursoSkeleton = document.getElementById("cursoSkeleton");
  const cursoContenido = document.getElementById("cursoContenido");
  if (cursoContenido) cursoContenido.classList.add("hidden");
  if (cursoSkeleton) cursoSkeleton.classList.remove("hidden");
}

function ocultarSkeleton() {
  const cursoSkeleton = document.getElementById("cursoSkeleton");
  if (cursoSkeleton) cursoSkeleton.classList.add("hidden");
}

function mostrarError(mensaje) {
  const cursoError = document.getElementById("cursoError");
  if (cursoError) {
    cursoError.textContent = mensaje;
    cursoError.classList.remove("hidden");
  }
}

function ocultarError() {
  const cursoError = document.getElementById("cursoError");
  if (cursoError) cursoError.classList.add("hidden");
}

async function abrirEditarCurso() {
  if (!cursoActual) return;
  await cargarPlanes();
  const cursoAnio = document.getElementById("cursoAnio");
  const cursoDivision = document.getElementById("cursoDivision");
  const cursoAnioLectivo = document.getElementById("cursoAnioLectivo");
  const cursoPlan = document.getElementById("cursoPlan");

  if (cursoAnio) cursoAnio.value = cursoActual.anio || "";
  if (cursoDivision) cursoDivision.value = cursoActual.division || "";
  if (cursoAnioLectivo) cursoAnioLectivo.value = cursoActual.anio_lectivo || "";
  if (cursoPlan) cursoPlan.value = cursoActual.id_plan || "";

  mostrarModal("modalCurso");
}

async function cargarPlanes() {
  if (planesCache) {
    renderPlanesSelect(planesCache);
    return;
  }
  try {
    const res = await fetchWithAuth("/planes");
    const data = await res.json();
    planesCache = Array.isArray(data) ? data : [];
    renderPlanesSelect(planesCache);
  } catch (error) {
    console.error(error);
  }
}

function renderPlanesSelect(planes) {
  const cursoPlan = document.getElementById("cursoPlan");
  if (!cursoPlan) return;
  cursoPlan.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Seleccione un plan";
  cursoPlan.appendChild(placeholder);
  planes.forEach(plan => {
    const option = document.createElement("option");
    option.value = plan.id_plan;
    option.textContent = plan.nombre_plan;
    cursoPlan.appendChild(option);
  });
}

async function actualizarCurso(event) {
  event.preventDefault();
  if (!cursoActual) return;

  const anio = document.getElementById("cursoAnio").value;
  const division = document.getElementById("cursoDivision").value;
  const anioLectivo = document.getElementById("cursoAnioLectivo").value;
  const idPlan = document.getElementById("cursoPlan").value;

  try {
    const res = await fetchWithAuth(`/cursos/${cursoActual.id_curso}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anio,
        division,
        id_plan: idPlan,
        anio_lectivo: anioLectivo
      })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "No se pudo actualizar el curso.");
      return;
    }

    ocultarModal("modalCurso");
    cargarCurso(cursoActual.id_curso);
  } catch (error) {
    console.error(error);
    alert("No se pudo actualizar el curso.");
  }
}

async function eliminarCurso() {
  if (!cursoActual) return;
  const confirmar = confirm("¿Eliminar el curso? Esta acción no se puede deshacer.");
  if (!confirmar) return;

  try {
    const res = await fetchWithAuth(`/cursos/${cursoActual.id_curso}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "No se pudo eliminar el curso.");
      return;
    }
    limpiarCursoSeleccionado();
    if (window.top && typeof window.top.cargarVista === "function") {
      window.top.cargarVista("cursos/cursos_general.html");
      return;
    }
    window.location.href = "/views/cursos/cursos_general.html";
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el curso.");
  }
}

async function abrirEditarMateria(idMateria) {
  const materia = materiasCache.find(m => String(m.id_materia) === String(idMateria));
  if (!materia) return;

  const profesoresMateria = obtenerProfesoresMateria(materia);
  await cargarProfesoresDisponibles().catch((error) => {
    console.error(error);
  });

  modoMateria = "editar";
  const titulo = document.getElementById("tituloModalMateria");
  if (titulo) titulo.textContent = "Actualizar materia";
  document.getElementById("materiaId").value = materia.id_materia;
  document.getElementById("materiaNombre").value = materia.nombre_materia || "";
  renderProfesoresSelects(profesoresCache, profesoresMateria);
  document.getElementById("materiaRol1").value = profesoresMateria[0]?.rol_profesor || "Titular";
  document.getElementById("materiaRol2").value = profesoresMateria[1]?.rol_profesor || "Titular";
  if (profesoresMateria[1]) {
    mostrarSegundoProfesor();
  } else {
    ocultarSegundoProfesor();
  }
  mostrarModal("modalMateria");
}

async function abrirCrearMateria() {
  await cargarProfesoresDisponibles().catch((error) => {
    console.error(error);
  });

  modoMateria = "crear";
  const titulo = document.getElementById("tituloModalMateria");
  if (titulo) titulo.textContent = "Agregar materia";
  document.getElementById("materiaId").value = "";
  document.getElementById("materiaNombre").value = "";
  renderProfesoresSelects(profesoresCache);
  document.getElementById("materiaRol1").value = "Titular";
  document.getElementById("materiaRol2").value = "Titular";
  ocultarSegundoProfesor();
  mostrarModal("modalMateria");
}

async function guardarMateria(event) {
  event.preventDefault();
  const nombre = document.getElementById("materiaNombre").value.trim();
  let profesores = [];

  try {
    profesores = construirProfesoresSeleccionados();
  } catch (error) {
    alert(error.message);
    return;
  }

  const payload = {
    materia: {
      nombre_materia: nombre,
      idCurso: cursoActual?.id_curso
    },
    profesores
  };

  try {
    if (modoMateria === "crear") {
      const res = await fetchWithAuth(`/materias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo crear la materia.");
        return;
      }
    } else {
      const idMateria = document.getElementById("materiaId").value;
      if (!idMateria) return;
      const res = await fetchWithAuth(`/materias/${idMateria}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo actualizar la materia.");
        return;
      }
    }
    ocultarModal("modalMateria");
    cargarCurso(cursoActual.id_curso);
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar la materia.");
  }
}

async function eliminarMateria(idMateria) {
  const confirmar = confirm("¿Eliminar la materia? Esta acción no se puede deshacer.");
  if (!confirmar) return;

  try {
    const res = await fetchWithAuth(`/materias/${idMateria}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "No se pudo eliminar la materia.");
      return;
    }
    cargarCurso(cursoActual.id_curso);
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar la materia.");
  }
}

function mostrarModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("hidden");
  if (modal) modal.classList.add("flex");
}

function ocultarModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("hidden");
  if (modal) modal.classList.remove("flex");
}
