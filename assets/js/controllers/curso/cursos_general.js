// ════════════════════════════════════════════════════════════════
// Variables globales
// ════════════════════════════════════════════════════════════════
let materiasCache = [];
let ordenMateriasActual = "nombre";
let cursosCache = [];

// Asignar alumnos
let cursoParaAsignar = null;
let alumnosSinCursoCacheG = [];
let alumnosSeleccionadosG = new Set();
let masivaYaCargadaG = false;

// Buscador de cursos
let chipAnioActivo = "";

// Paleta de colores compartida por año
const COLORES_ANIO = {
    "1°": { bg: "bg-blue-50",    border: "border-blue-200",    badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
    "2°": { bg: "bg-violet-50",  border: "border-violet-200",  badge: "bg-violet-100 text-violet-700",  dot: "bg-violet-500" },
    "3°": { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700",dot: "bg-emerald-500" },
    "4°": { bg: "bg-amber-50",   border: "border-amber-200",   badge: "bg-amber-100 text-amber-700",    dot: "bg-amber-500" },
    "5°": { bg: "bg-rose-50",    border: "border-rose-200",    badge: "bg-rose-100 text-rose-700",      dot: "bg-rose-500" },
    "6°": { bg: "bg-cyan-50",    border: "border-cyan-200",    badge: "bg-cyan-100 text-cyan-700",      dot: "bg-cyan-500" },
    "7°": { bg: "bg-orange-50",  border: "border-orange-200",  badge: "bg-orange-100 text-orange-700",  dot: "bg-orange-500" },
};
const COLOR_DEFAULT = { bg: "bg-slate-50", border: "border-slate-200", badge: "bg-slate-100 text-slate-700", dot: "bg-slate-400" };

// ════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ════════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {

    // ── Tabla de cursos ──
    const tbody = document.querySelector("#tabla-cursos tbody");
    if (tbody) {
        tbody.addEventListener("click", (event) => {
            const boton = event.target.closest("[data-action='ver-detalle-curso']");
            if (!boton) return;
            const curso = {
                id: boton.dataset.idCurso,
                id_curso: boton.dataset.idCurso,
                anio: boton.dataset.anio,
                division: boton.dataset.division,
                anio_lectivo: boton.dataset.anioLectivo,
                id_plan: boton.dataset.idPlan || null
            };
            // ── Log ver detalle desde tabla ──
            registrarLog(
                LOG_OP.VER_DETALLE_CURSO,
                `Ver detalle del curso: ${curso.anio} año — División ${curso.division} (${curso.anio_lectivo})`
            );
            abrirDetalleCurso(curso);
        });

        fetchWithAuth("/cursos")
            .then(res => res.json())
            .then(data => {
                cursosCache = Array.isArray(data) ? data : [];
                cursosCache.forEach(curso => {
                    const fila = document.createElement("tr");
                    fila.className = "hover:bg-gray-100";
                    fila.innerHTML = `
                        <td class="px-4 py-2 text-sm text-gray-700">${curso.id_curso}</td>
                        <td class="px-4 py-2 text-sm text-gray-700">${curso.anio}</td>
                        <td class="px-4 py-2 text-sm text-gray-700">${curso.division}</td>
                        <td class="px-4 py-2 text-sm text-gray-700">${curso.nombre_plan || "-"}</td>
                        <td class="px-4 py-2 text-sm text-gray-700">${curso.anio_lectivo}</td>
                        <td class="px-4 py-2 text-center">
                            <button
                                type="button"
                                class="inline-flex items-center justify-center gap-1 rounded-full bg-green-50 py-0.5 pl-2.5 pr-2 text-sm font-medium text-green-600 hover:bg-green-100 transition"
                                data-action="ver-detalle-curso"
                                data-id-curso="${curso.id_curso}"
                                data-anio="${curso.anio}"
                                data-division="${curso.division}"
                                data-anio-lectivo="${curso.anio_lectivo}"
                                data-id-plan="${curso.id_plan ?? ""}"
                            >Ver más</button>
                        </td>
                    `;
                    tbody.appendChild(fila);
                });
            })
            .catch(err => console.error("Error al cargar cursos:", err));
    }

    // ── Planes para crear curso ──
    fetchWithAuth('/planes')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('selectPlanes');
            if (!select) return;
            data.forEach(plan => {
                const option = document.createElement('option');
                option.value = plan.id_plan;
                option.textContent = plan.nombre_plan;
                select.appendChild(option);
            });
        });

    // ── Abrir modal crear curso ──
    const btnAbrirCrearCurso = document.getElementById("btnAbrirCrearCurso");
    if (btnAbrirCrearCurso) {
        btnAbrirCrearCurso.addEventListener("click", () => {
            document.getElementById("formCurso")?.reset();
            limpiarFeedbackG("feedbackCrearCurso");
            mostrarModalTW("modalCrearCurso");
        });
    }

    const btnCerrarCrearCurso = document.getElementById("btnCerrarCrearCurso");
    if (btnCerrarCrearCurso) btnCerrarCrearCurso.addEventListener("click", () => ocultarModalTW("modalCrearCurso"));

    const btnCancelarCrearCurso = document.getElementById("btnCancelarCrearCurso");
    if (btnCancelarCrearCurso) btnCancelarCrearCurso.addEventListener("click", () => ocultarModalTW("modalCrearCurso"));

    // ── Formulario crear curso ──
    const formCurso = document.getElementById("formCurso");
    if (formCurso) {
        formCurso.addEventListener("submit", async function (e) {
            e.preventDefault();
            const btnSubmit = document.getElementById("btnSubmitCrearCurso");
            if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = "Creando..."; }
            limpiarFeedbackG("feedbackCrearCurso");

            const data = Object.fromEntries(new FormData(this).entries());
            try {
                const response = await fetchWithAuth("/cursos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                const resData = await response.json();
                if (!response.ok) {
                    mostrarFeedbackG("feedbackCrearCurso", resData.error || "Ocurrió un error al crear el curso.", "error");
                } else {
                    // ── Log alta curso ──
                    registrarLog(
                        LOG_OP.ALTA_CURSO,
                        `Alta de curso: ${data.anio} año — División ${data.division} (Año lectivo: ${data.anio_lectivo})`
                    );
                    mostrarFeedbackG("feedbackCrearCurso", resData.mensaje || "Curso creado correctamente.", "success");
                    this.reset();
                    setTimeout(() => {
                        ocultarModalTW("modalCrearCurso");
                        location.reload();
                    }, 1200);
                }
            } catch (error) {
                console.error("Error al crear el curso:", error);
                mostrarFeedbackG("feedbackCrearCurso", "Error de conexión al crear el curso.", "error");
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                        </svg>
                        Crear Curso`;
                }
            }
        });
    }

    // ── Ordenar materias ──
    const ordenMaterias = document.getElementById("ordenMaterias");
    if (ordenMaterias) {
        ordenMaterias.addEventListener("change", (event) => {
            ordenMateriasActual = event.target.value;
            renderMaterias(materiasCache);
        });
    }

    // ════════════════════════════════════════════════════════════
    // Listeners — Buscador de cursos
    // ════════════════════════════════════════════════════════════
    const btnAbrirBuscador = document.getElementById("btnAbrirBuscadorCurso");
    if (btnAbrirBuscador) btnAbrirBuscador.addEventListener("click", abrirBuscadorCurso);

    const btnCerrarBuscador = document.getElementById("btnCerrarBuscadorCurso");
    if (btnCerrarBuscador) btnCerrarBuscador.addEventListener("click", () => ocultarModalTW("modalBuscadorCurso"));

    const inputBuscador = document.getElementById("inputBuscarCursoEspecifico");
    if (inputBuscador) {
        inputBuscador.addEventListener("input", () => {
            const btnLimpiar = document.getElementById("btnLimpiarBusquedaCurso");
            if (btnLimpiar) btnLimpiar.classList.toggle("hidden", !inputBuscador.value);
            aplicarFiltrosBuscador();
        });
    }

    const btnLimpiar = document.getElementById("btnLimpiarBusquedaCurso");
    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", () => {
            const input = document.getElementById("inputBuscarCursoEspecifico");
            if (input) input.value = "";
            btnLimpiar.classList.add("hidden");
            aplicarFiltrosBuscador();
        });
    }

    // Chips de año
    document.querySelectorAll(".chip-anio").forEach(chip => {
        chip.addEventListener("click", () => {
            chipAnioActivo = chip.dataset.anio;
            document.querySelectorAll(".chip-anio").forEach(c =>
                c.classList.remove("ring-2", "ring-offset-1", "ring-blue-400", "font-bold")
            );
            chip.classList.add("ring-2", "ring-offset-1", "ring-blue-400", "font-bold");
            aplicarFiltrosBuscador();
        });
    });

    // ════════════════════════════════════════════════════════════
    // Listeners — Asignar Alumnos
    // ════════════════════════════════════════════════════════════
    const btnAbrirAsignar = document.getElementById("btnAbrirAsignarAlumnos");
    if (btnAbrirAsignar) btnAbrirAsignar.addEventListener("click", abrirModalSeleccionarCurso);

    const btnCerrarSeleccion = document.getElementById("btnCerrarSeleccionarCurso");
    if (btnCerrarSeleccion) btnCerrarSeleccion.addEventListener("click", () => ocultarModalTW("modalSeleccionarCurso"));

    const inputFiltrar = document.getElementById("inputFiltrarCurso");
    if (inputFiltrar) inputFiltrar.addEventListener("input", filtrarListaCursos);

    const btnCerrarAsignar = document.getElementById("btnCerrarAsignarGeneral");
    if (btnCerrarAsignar) btnCerrarAsignar.addEventListener("click", () => ocultarModalTW("modalAsignarAlumnosGeneral"));

    const btnVolver = document.getElementById("btnVolverSeleccionCurso");
    if (btnVolver) btnVolver.addEventListener("click", volverASeleccionCurso);

    const tabManualG = document.getElementById("tabManualG");
    if (tabManualG) tabManualG.addEventListener("click", () => cambiarTabG("manual"));

    const tabMasivaG = document.getElementById("tabMasivaG");
    if (tabMasivaG) tabMasivaG.addEventListener("click", () => cambiarTabG("masiva"));

    const btnBuscarAlumnoG = document.getElementById("btnBuscarAlumnoG");
    if (btnBuscarAlumnoG) btnBuscarAlumnoG.addEventListener("click", buscarAlumnoManualG);

    const inputBuscarG = document.getElementById("inputBuscarAlumnoG");
    if (inputBuscarG) inputBuscarG.addEventListener("keydown", e => { if (e.key === "Enter") buscarAlumnoManualG(); });

    const checkTodosG = document.getElementById("checkTodosG");
    if (checkTodosG) checkTodosG.addEventListener("change", toggleSeleccionarTodosG);

    const btnMasivoG = document.getElementById("btnAsignarMasivoG");
    if (btnMasivoG) btnMasivoG.addEventListener("click", ejecutarAsignacionMasivaG);
});

// ════════════════════════════════════════════════════════════════
// BUSCADOR DE CURSOS
// ════════════════════════════════════════════════════════════════

async function abrirBuscadorCurso() {
    // ── Log búsqueda curso ──
    registrarLog(
        LOG_OP.BUSQUEDA_CURSO,
        `Apertura del buscador de cursos`
    );

    chipAnioActivo = "";
    document.querySelectorAll(".chip-anio").forEach(c =>
        c.classList.remove("ring-2", "ring-offset-1", "ring-blue-400", "font-bold")
    );
    const chipTodos = document.querySelector(".chip-anio[data-anio='']");
    if (chipTodos) chipTodos.classList.add("ring-2", "ring-offset-1", "ring-blue-400", "font-bold");

    const input = document.getElementById("inputBuscarCursoEspecifico");
    if (input) input.value = "";
    const btnLimpiar = document.getElementById("btnLimpiarBusquedaCurso");
    if (btnLimpiar) btnLimpiar.classList.add("hidden");

    mostrarModalTW("modalBuscadorCurso");

    if (cursosCache.length > 0) {
        renderResultadosBuscador(cursosCache);
        return;
    }

    const estadoEl = document.getElementById("estadoBuscadorCurso");
    const resultadosEl = document.getElementById("resultadosBuscadorCurso");
    if (estadoEl) {
        estadoEl.textContent = "Cargando cursos...";
        estadoEl.className = "rounded-xl border border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500 text-center";
        estadoEl.classList.remove("hidden");
    }
    if (resultadosEl) resultadosEl.classList.add("hidden");

    try {
        const res = await fetchWithAuth("/cursos");
        const data = await res.json();
        cursosCache = Array.isArray(data) ? data : [];
        renderResultadosBuscador(cursosCache);
    } catch (error) {
        console.error(error);
        if (estadoEl) {
            estadoEl.innerHTML = `
                <div class="flex flex-col items-center gap-2 py-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-sm text-red-500">No se pudo cargar la lista de cursos.</p>
                </div>
            `;
        }
    }
}

// ── Log búsqueda con término/filtro ──
let _logBuscadorTimeout = null;
function aplicarFiltrosBuscador() {
    const termino = (document.getElementById("inputBuscarCursoEspecifico")?.value || "").toLowerCase().trim();

    let filtrados = cursosCache;

    if (chipAnioActivo) {
        filtrados = filtrados.filter(c => c.anio === chipAnioActivo);
    }

    if (termino) {
        filtrados = filtrados.filter(c =>
            String(c.anio).toLowerCase().includes(termino) ||
            String(c.division).toLowerCase().includes(termino) ||
            String(c.anio_lectivo).toLowerCase().includes(termino) ||
            (c.nombre_plan || "").toLowerCase().includes(termino) ||
            String(c.id_curso).includes(termino)
        );
        // Debounce para no loguear en cada tecla
        clearTimeout(_logBuscadorTimeout);
        _logBuscadorTimeout = setTimeout(() => {
            registrarLog(
                LOG_OP.BUSQUEDA_CURSO,
                `Búsqueda de curso con filtro: "${termino}"${chipAnioActivo ? ` — Año: ${chipAnioActivo}` : ""} — ${filtrados.length} resultado(s)`
            );
        }, 800);
    }

    renderResultadosBuscador(filtrados);
}

function renderResultadosBuscador(cursos) {
    const estadoEl = document.getElementById("estadoBuscadorCurso");
    const resultadosEl = document.getElementById("resultadosBuscadorCurso");
    const contadorEl = document.getElementById("contadorResultadosBuscador");
    if (!resultadosEl) return;

    resultadosEl.innerHTML = "";

    const termino = (document.getElementById("inputBuscarCursoEspecifico")?.value || "").trim();
    if (contadorEl) {
        contadorEl.textContent = (termino || chipAnioActivo)
            ? `${cursos.length} resultado${cursos.length === 1 ? "" : "s"}`
            : `${cursos.length} curso${cursos.length === 1 ? "" : "s"} en total`;
    }

    if (!cursos.length) {
        if (estadoEl) {
            estadoEl.innerHTML = `
                <div class="flex flex-col items-center gap-3 py-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <p class="text-sm font-medium text-slate-500">No se encontraron cursos</p>
                    <p class="text-xs text-slate-400">Probá con otro filtro o término de búsqueda</p>
                </div>
            `;
            estadoEl.classList.remove("hidden");
        }
        resultadosEl.classList.add("hidden");
        return;
    }

    if (estadoEl) estadoEl.classList.add("hidden");
    resultadosEl.classList.remove("hidden");

    cursos.forEach(curso => {
        const c = COLORES_ANIO[curso.anio] || COLOR_DEFAULT;

        const card = document.createElement("div");
        card.className = `group relative rounded-xl border-2 ${c.border} ${c.bg} p-4 cursor-pointer hover:shadow-md transition-all duration-150 select-none`;
        card.style.transform = "translateY(0)";

        card.addEventListener("mouseenter", () => { card.style.transform = "translateY(-2px)"; });
        card.addEventListener("mouseleave", () => { card.style.transform = "translateY(0)"; });

        card.innerHTML = `
            <div class="absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${c.dot}"></div>
            <div class="pl-3">
                <div class="flex items-start justify-between gap-2 mb-2">
                    <div>
                        <p class="text-base font-bold text-gray-900 leading-tight">${escaparHtml(curso.anio)} Año</p>
                        <p class="text-sm text-gray-600">División ${escaparHtml(curso.division)}</p>
                    </div>
                    <span class="flex-shrink-0 inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${c.badge}">
                        ${escaparHtml(String(curso.anio_lectivo))}
                    </span>
                </div>
                <p class="text-xs text-gray-500 truncate mb-3">
                    ${curso.nombre_plan
                        ? `<span class="font-medium text-gray-600">${escaparHtml(curso.nombre_plan)}</span>`
                        : '<span class="italic">Sin plan asignado</span>'
                    }
                </p>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-400">ID #${curso.id_curso}</span>
                    <button class="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition">
                        Ver más
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        const irAlDetalle = () => {
            // ── Log ver detalle desde buscador ──
            registrarLog(
                LOG_OP.VER_DETALLE_CURSO,
                `Ver detalle del curso: ${curso.anio} año — División ${curso.division} (${curso.anio_lectivo})`
            );
            ocultarModalTW("modalBuscadorCurso");
            abrirDetalleCurso({
                id: curso.id_curso,
                id_curso: curso.id_curso,
                anio: curso.anio,
                division: curso.division,
                anio_lectivo: curso.anio_lectivo,
                id_plan: curso.id_plan || null
            });
        };

        card.querySelector("button").addEventListener("click", (e) => { e.stopPropagation(); irAlDetalle(); });
        card.addEventListener("click", irAlDetalle);

        resultadosEl.appendChild(card);
    });
}

// ════════════════════════════════════════════════════════════════
// PASO 1 — SELECCIONAR CURSO (Asignar Alumnos)
// ════════════════════════════════════════════════════════════════

async function abrirModalSeleccionarCurso() {
    const inputFiltrar = document.getElementById("inputFiltrarCurso");
    if (inputFiltrar) inputFiltrar.value = "";
    mostrarModalTW("modalSeleccionarCurso");

    if (cursosCache.length > 0) {
        renderListaCursosAsignar(cursosCache);
        return;
    }

    const estadoEl = document.getElementById("estadoCursosList");
    const listaEl = document.getElementById("listaCursosAsignar");
    if (estadoEl) {
        estadoEl.textContent = "Cargando cursos...";
        estadoEl.className = "rounded-xl border border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500 text-center";
        estadoEl.classList.remove("hidden");
    }
    if (listaEl) listaEl.classList.add("hidden");

    try {
        const res = await fetchWithAuth("/cursos");
        const data = await res.json();
        cursosCache = Array.isArray(data) ? data : [];
        renderListaCursosAsignar(cursosCache);
    } catch (error) {
        console.error(error);
        if (estadoEl) {
            estadoEl.innerHTML = `
                <div class="flex flex-col items-center gap-2 py-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-sm text-red-500">No se pudo cargar la lista de cursos.</p>
                </div>
            `;
        }
    }
}

function renderListaCursosAsignar(cursos) {
    const estadoEl = document.getElementById("estadoCursosList");
    const listaEl = document.getElementById("listaCursosAsignar");
    const contadorEl = document.getElementById("contadorCursosFiltrados");
    if (!listaEl) return;

    listaEl.innerHTML = "";

    if (!cursos.length) {
        if (estadoEl) {
            estadoEl.innerHTML = `
                <div class="flex flex-col items-center gap-2 py-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-sm text-slate-500">No se encontraron cursos</p>
                </div>
            `;
            estadoEl.classList.remove("hidden");
        }
        listaEl.classList.add("hidden");
        if (contadorEl) contadorEl.classList.add("hidden");
        return;
    }

    if (estadoEl) estadoEl.classList.add("hidden");
    listaEl.classList.remove("hidden");

    const filtro = document.getElementById("inputFiltrarCurso")?.value.trim();
    if (contadorEl) {
        if (filtro) {
            contadorEl.textContent = `${cursos.length} resultado${cursos.length === 1 ? "" : "s"}`;
            contadorEl.classList.remove("hidden");
        } else {
            contadorEl.classList.add("hidden");
        }
    }

    cursos.forEach(curso => {
        const c = COLORES_ANIO[curso.anio] || COLOR_DEFAULT;

        const card = document.createElement("div");
        card.className = `group relative rounded-xl border-2 ${c.border} ${c.bg} p-4 cursor-pointer hover:shadow-md transition-all duration-150 select-none`;
        card.style.transform = "translateY(0)";
        card.dataset.idCurso = curso.id_curso;

        card.addEventListener("mouseenter", () => { card.style.transform = "translateY(-2px)"; });
        card.addEventListener("mouseleave", () => { card.style.transform = "translateY(0)"; });

        card.innerHTML = `
            <div class="absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${c.dot}"></div>
            <div class="pl-3">
                <div class="flex items-start justify-between gap-2 mb-2">
                    <div>
                        <p class="text-base font-bold text-gray-900 leading-tight">${escaparHtml(curso.anio)} Año</p>
                        <p class="text-sm text-gray-600">División ${escaparHtml(curso.division)}</p>
                    </div>
                    <span class="flex-shrink-0 inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${c.badge}">
                        ${escaparHtml(String(curso.anio_lectivo))}
                    </span>
                </div>
                <p class="text-xs text-gray-500 truncate">
                    ${curso.nombre_plan
                        ? `<span class="font-medium text-gray-600">${escaparHtml(curso.nombre_plan)}</span>`
                        : '<span class="italic">Sin plan asignado</span>'
                    }
                </p>
                <div class="mt-3 flex items-center justify-between">
                    <span class="text-xs text-gray-400">ID #${curso.id_curso}</span>
                    <span class="text-xs font-semibold text-blue-600 flex items-center gap-1">
                        Seleccionar
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </span>
                </div>
            </div>
        `;

        card.addEventListener("click", () => seleccionarCursoParaAsignar(curso));
        listaEl.appendChild(card);
    });
}

function filtrarListaCursos() {
    const termino = document.getElementById("inputFiltrarCurso").value.toLowerCase().trim();
    const filtrados = cursosCache.filter(c =>
        String(c.anio).toLowerCase().includes(termino) ||
        String(c.division).toLowerCase().includes(termino) ||
        String(c.anio_lectivo).toLowerCase().includes(termino) ||
        (c.nombre_plan || "").toLowerCase().includes(termino)
    );
    renderListaCursosAsignar(filtrados);
}

function seleccionarCursoParaAsignar(curso) {
    cursoParaAsignar = curso;

    const subtitulo = document.getElementById("subtituloCursoAsignar");
    if (subtitulo) subtitulo.textContent = `${curso.anio} año — División ${curso.division} (${curso.anio_lectivo})`;

    alumnosSeleccionadosG.clear();
    masivaYaCargadaG = false;
    alumnosSinCursoCacheG = [];
    limpiarFeedbackG("feedbackManualG");
    limpiarFeedbackG("feedbackMasivaG");

    const input = document.getElementById("inputBuscarAlumnoG");
    if (input) input.value = "";
    const resultados = document.getElementById("resultadosBusquedaG");
    if (resultados) resultados.innerHTML = "";

    cambiarTabG("manual");
    ocultarModalTW("modalSeleccionarCurso");
    mostrarModalTW("modalAsignarAlumnosGeneral");
}

function volverASeleccionCurso() {
    ocultarModalTW("modalAsignarAlumnosGeneral");
    abrirModalSeleccionarCurso();
}

// ════════════════════════════════════════════════════════════════
// PASO 2 — ASIGNAR ALUMNOS
// ════════════════════════════════════════════════════════════════

function cambiarTabG(tab) {
    const tabManualG = document.getElementById("tabManualG");
    const tabMasivaG = document.getElementById("tabMasivaG");
    const panelManualG = document.getElementById("panelManualG");
    const panelMasivaG = document.getElementById("panelMasivaG");

    if (tab === "manual") {
        tabManualG.className = "px-4 py-3 text-sm font-medium border-b-2 border-blue-600 text-blue-600 -mb-px";
        tabMasivaG.className = "px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 -mb-px";
        panelManualG.classList.remove("hidden");
        panelMasivaG.classList.add("hidden");
    } else {
        tabMasivaG.className = "px-4 py-3 text-sm font-medium border-b-2 border-blue-600 text-blue-600 -mb-px";
        tabManualG.className = "px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 -mb-px";
        panelMasivaG.classList.remove("hidden");
        panelManualG.classList.add("hidden");
        if (!masivaYaCargadaG) cargarAlumnosSinCursoG();
    }
}

async function cargarAlumnosSinCursoG() {
    const estadoEl = document.getElementById("estadoMasivaG");
    const listaEl = document.getElementById("listaMasivaWrapperG");

    if (estadoEl) {
        estadoEl.textContent = "Cargando alumnos...";
        estadoEl.className = "rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600";
        estadoEl.classList.remove("hidden");
    }
    if (listaEl) listaEl.classList.add("hidden");

    try {
        const res = await fetchWithAuth("/cursos/alumnos-sin-curso");
        if (!res.ok) throw new Error("Error al obtener alumnos");
        const data = await res.json();
        alumnosSinCursoCacheG = Array.isArray(data) ? data : [];
        masivaYaCargadaG = true;
        alumnosSeleccionadosG.clear();
        const checkTodos = document.getElementById("checkTodosG");
        if (checkTodos) checkTodos.checked = false;
        actualizarContadorMasivaG();
        renderListaMasivaG(alumnosSinCursoCacheG);
    } catch (error) {
        console.error(error);
        if (estadoEl) {
            estadoEl.textContent = "No se pudo cargar la lista de alumnos.";
            estadoEl.className = "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700";
        }
    }
}

function renderListaMasivaG(alumnos) {
    const estadoEl = document.getElementById("estadoMasivaG");
    const listaEl = document.getElementById("listaMasivaWrapperG");
    if (!listaEl) return;
    listaEl.innerHTML = "";

    if (!alumnos.length) {
        if (estadoEl) {
            estadoEl.textContent = "No hay alumnos sin curso asignado.";
            estadoEl.className = "rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600";
            estadoEl.classList.remove("hidden");
        }
        listaEl.classList.add("hidden");
        return;
    }

    if (estadoEl) estadoEl.classList.add("hidden");
    listaEl.classList.remove("hidden");

    alumnos.forEach(alumno => {
        const fila = document.createElement("label");
        fila.className = "flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer select-none";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = String(alumno.id_alumno);
        checkbox.className = "w-4 h-4 cursor-pointer flex-shrink-0";
        checkbox.checked = alumnosSeleccionadosG.has(alumno.id_alumno);
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) alumnosSeleccionadosG.add(alumno.id_alumno);
            else {
                alumnosSeleccionadosG.delete(alumno.id_alumno);
                const ct = document.getElementById("checkTodosG");
                if (ct) ct.checked = false;
            }
            actualizarContadorMasivaG();
        });

        const info = document.createElement("div");
        info.className = "flex-1 min-w-0";
        info.innerHTML = `
            <p class="text-sm font-medium text-slate-800">${escaparHtml(alumno.apellido)}, ${escaparHtml(alumno.nombre)}</p>
            <p class="text-xs text-slate-500">DNI: ${escaparHtml(alumno.dni || "-")} · Legajo: ${escaparHtml(alumno.legajo || "-")}</p>
        `;

        fila.appendChild(checkbox);
        fila.appendChild(info);
        listaEl.appendChild(fila);
    });
}

function toggleSeleccionarTodosG() {
    const checkTodos = document.getElementById("checkTodosG");
    const checkboxes = document.querySelectorAll("#listaMasivaWrapperG input[type='checkbox']");
    checkboxes.forEach(cb => {
        cb.checked = checkTodos.checked;
        const id = Number(cb.value);
        if (checkTodos.checked) alumnosSeleccionadosG.add(id);
        else alumnosSeleccionadosG.delete(id);
    });
    actualizarContadorMasivaG();
}

function actualizarContadorMasivaG() {
    const count = alumnosSeleccionadosG.size;
    const countEl = document.getElementById("countSeleccionadosG");
    const btnMasivo = document.getElementById("btnAsignarMasivoG");
    if (countEl) countEl.textContent = `${count} seleccionado${count === 1 ? "" : "s"}`;
    if (btnMasivo) {
        btnMasivo.textContent = `Asignar seleccionados (${count})`;
        btnMasivo.disabled = count === 0;
        btnMasivo.style.opacity = count === 0 ? "0.5" : "1";
        btnMasivo.style.cursor = count === 0 ? "not-allowed" : "pointer";
    }
}

async function buscarAlumnoManualG() {
    const input = document.getElementById("inputBuscarAlumnoG");
    const termino = input ? input.value.trim() : "";
    limpiarFeedbackG("feedbackManualG");
    const resultadosEl = document.getElementById("resultadosBusquedaG");
    if (resultadosEl) resultadosEl.innerHTML = "";

    if (termino.length < 2) {
        mostrarFeedbackG("feedbackManualG", "Ingresá al menos 2 caracteres para buscar.", "info");
        return;
    }

    // ── Log búsqueda alumno para asignar ──
    registrarLog(
        LOG_OP.BUSQUEDA_ALUMNO,
        `Búsqueda de alumno sin curso para asignar. Término: "${termino}" — Curso destino: ${cursoParaAsignar?.anio} División ${cursoParaAsignar?.division} (${cursoParaAsignar?.anio_lectivo})`
    );

    try {
        const res = await fetchWithAuth(`/cursos/alumnos-sin-curso/buscar?q=${encodeURIComponent(termino)}`);
        if (!res.ok) throw new Error("Error al buscar");
        const data = await res.json();
        renderResultadosBusquedaG(Array.isArray(data) ? data : []);
    } catch (error) {
        mostrarFeedbackG("feedbackManualG", "No se pudo realizar la búsqueda.", "error");
    }
}

function renderResultadosBusquedaG(alumnos) {
    const contenedor = document.getElementById("resultadosBusquedaG");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (!alumnos.length) {
        contenedor.innerHTML = `
            <p class="text-sm text-slate-500 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                No se encontraron alumnos sin curso para esa búsqueda.
            </p>`;
        return;
    }

    alumnos.forEach(alumno => {
        const card = document.createElement("div");
        card.className = "flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3";
        card.innerHTML = `
            <div>
                <p class="text-sm font-medium text-slate-800">${escaparHtml(alumno.apellido)}, ${escaparHtml(alumno.nombre)}</p>
                <p class="text-xs text-slate-500">DNI: ${escaparHtml(alumno.dni || "-")} · Legajo: ${escaparHtml(alumno.legajo || "-")}</p>
            </div>
            <button class="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-md font-medium transition">
                Asignar
            </button>
        `;
        card.querySelector("button").addEventListener("click", (e) => {
            asignarAlumnoManualG(alumno.id_alumno, alumno.nombre, alumno.apellido, e.target);
        });
        contenedor.appendChild(card);
    });
}

async function asignarAlumnoManualG(idAlumno, nombre, apellido, boton) {
    if (!cursoParaAsignar) return;
    if (boton) { boton.disabled = true; boton.textContent = "Asignando..."; }
    limpiarFeedbackG("feedbackManualG");

    try {
        const res = await fetchWithAuth("/cursos/asignar-curso", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idAlumno, idCurso: cursoParaAsignar.id_curso })
        });
        const data = await res.json();
        if (!res.ok) {
            mostrarFeedbackG("feedbackManualG", data.error || "No se pudo asignar el alumno.", "error");
            if (boton) { boton.disabled = false; boton.textContent = "Asignar"; }
            return;
        }
        // ── Log asignación manual ──
        registrarLog(
            LOG_OP.ASIGNAR_CURSO,
            `Alumno asignado manualmente: ${apellido}, ${nombre} → Curso: ${cursoParaAsignar.anio} División ${cursoParaAsignar.division} (${cursoParaAsignar.anio_lectivo})`,
            `${nombre} ${apellido}`
        );
        mostrarFeedbackG("feedbackManualG", `${apellido}, ${nombre} fue asignado al curso correctamente.`, "success");
        if (boton) boton.closest("div.flex")?.remove();
        masivaYaCargadaG = false;
        alumnosSinCursoCacheG = [];
    } catch (error) {
        mostrarFeedbackG("feedbackManualG", "Error al asignar el alumno.", "error");
        if (boton) { boton.disabled = false; boton.textContent = "Asignar"; }
    }
}

async function ejecutarAsignacionMasivaG() {
    if (alumnosSeleccionadosG.size === 0 || !cursoParaAsignar) return;
    const btnMasivo = document.getElementById("btnAsignarMasivoG");
    if (btnMasivo) { btnMasivo.disabled = true; btnMasivo.textContent = "Asignando..."; }
    limpiarFeedbackG("feedbackMasivaG");

    const cantidadSeleccionados = alumnosSeleccionadosG.size;

    try {
        const res = await fetchWithAuth("/cursos/asignar-masivo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idAlumnos: [...alumnosSeleccionadosG],
                idCurso: cursoParaAsignar.id_curso
            })
        });
        const data = await res.json();
        if (!res.ok) {
            mostrarFeedbackG("feedbackMasivaG", data.error || "No se pudo realizar la asignación.", "error");
            actualizarContadorMasivaG();
            return;
        }
        // ── Log asignación masiva ──
        registrarLog(
            LOG_OP.ASIGNAR_CURSO,
            `Asignación masiva: ${cantidadSeleccionados} alumno(s) → Curso: ${cursoParaAsignar.anio} División ${cursoParaAsignar.division} (${cursoParaAsignar.anio_lectivo})`
        );
        mostrarFeedbackG("feedbackMasivaG", data.mensaje || "Alumnos asignados correctamente.", "success");
        alumnosSeleccionadosG.clear();
        masivaYaCargadaG = false;
        alumnosSinCursoCacheG = [];
        const checkTodos = document.getElementById("checkTodosG");
        if (checkTodos) checkTodos.checked = false;
        actualizarContadorMasivaG();
        await cargarAlumnosSinCursoG();
    } catch (error) {
        mostrarFeedbackG("feedbackMasivaG", "Error al asignar los alumnos.", "error");
        actualizarContadorMasivaG();
    }
}

// ════════════════════════════════════════════════════════════════
// UTILIDADES
// ════════════════════════════════════════════════════════════════

function mostrarFeedbackG(elementId, mensaje, tipo) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = mensaje;
    el.className = "rounded-lg px-4 py-3 text-sm border";
    if (tipo === "success") el.classList.add("bg-green-50", "border-green-200", "text-green-700");
    else if (tipo === "error") el.classList.add("bg-red-50", "border-red-200", "text-red-700");
    else el.classList.add("bg-slate-50", "border-slate-200", "text-slate-600");
    el.classList.remove("hidden");
}

function limpiarFeedbackG(elementId) {
    const el = document.getElementById(elementId);
    if (el) { el.textContent = ""; el.classList.add("hidden"); }
}

function mostrarModalTW(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.classList.remove("hidden"); modal.classList.add("flex"); }
}

function ocultarModalTW(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.classList.add("hidden"); modal.classList.remove("flex"); }
}

function escaparHtml(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// ════════════════════════════════════════════════════════════════
// DETALLE DE CURSO
// ════════════════════════════════════════════════════════════════

async function completarMateriasConProfesores(materias) {
    if (!Array.isArray(materias) || !materias.length) return [];
    const faltanProfesores = materias.some(m => !Array.isArray(m?.profesores));
    if (!faltanProfesores) return materias.map(m => ({ ...m, profesores: m.profesores }));
    try {
        const response = await fetchWithAuth("/materias", { method: "GET", headers: { "Content-Type": "application/json" } });
        if (!response.ok) throw new Error(`Respuesta ${response.status}`);
        const data = await response.json();
        const materiasPorId = new Map((Array.isArray(data) ? data : []).map(m => [String(m.id_materia), m]));
        return materias.map(m => {
            const mc = materiasPorId.get(String(m.id_materia));
            return { ...m, profesores: Array.isArray(mc?.profesores) ? mc.profesores : (Array.isArray(m?.profesores) ? m.profesores : []) };
        });
    } catch (error) {
        console.error("No se pudieron completar los profesores.", error);
        return materias.map(m => ({ ...m, profesores: Array.isArray(m?.profesores) ? m.profesores : [] }));
    }
}

function normalizarProfesor(profesor) {
    if (!profesor || typeof profesor !== "object") return null;
    const nombre = String(profesor.nombre ?? profesor.nombre_profesor ?? "").trim();
    const apellido = String(profesor.apellido ?? "").trim();
    const rolProfesor = String(profesor.rol_profesor ?? profesor.rol ?? "").trim() || "Titular";
    if (!nombre && !apellido) return null;
    return { nombre, apellido, rol_profesor: rolProfesor };
}

function obtenerNombreProfesorCompleto(profesor) {
    const partes = [profesor?.nombre, profesor?.apellido].map(v => String(v || "").trim()).filter(Boolean);
    return partes.length ? partes.join(" ") : "Profesor sin nombre";
}

function obtenerProfesoresMateria(materia) {
    if (!Array.isArray(materia?.profesores)) return [];
    return materia.profesores.map(normalizarProfesor).filter(Boolean).slice(0, 2);
}

function obtenerClaveOrdenProfesor(materia) {
    const profesores = obtenerProfesoresMateria(materia);
    if (!profesores.length) return "\uffff";
    return profesores.map(obtenerNombreProfesorCompleto).join(" / ").toLowerCase();
}

function renderProfesoresMateria(materia) {
    const profesores = obtenerProfesoresMateria(materia);
    if (!profesores.length) return `<p><span class="font-medium">Profesores:</span> Sin asignar</p>`;
    return `
        <div>
            <p class="font-medium text-gray-700">Profesores</p>
            <div class="mt-2 space-y-2">
                ${profesores.map(p => `
                    <div class="rounded-md bg-slate-50 px-3 py-2">
                        <p class="font-medium text-slate-700">${escaparHtml(obtenerNombreProfesorCompleto(p))}</p>
                        <p class="mt-1 flex items-center gap-2">
                            <span class="text-gray-500">Rol:</span>
                            ${renderRolBadge(p.rol_profesor || "Sin rol")}
                        </p>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

function renderRolBadge(rol) {
    const rolLower = (rol || "").toLowerCase();
    let classes = "bg-gray-100 text-gray-700";
    if (rolLower.includes("titular")) classes = "bg-blue-100 text-blue-700";
    else if (rolLower.includes("suplente")) classes = "bg-yellow-100 text-yellow-800";
    return `<span class="${classes} text-xs px-2 py-1 rounded">${escaparHtml(rol || "Sin rol")}</span>`;
}

async function cargarCurso(idCurso) {
    const cursoSkeleton = document.getElementById("cursoSkeleton");
    const cursoContenido = document.getElementById("cursoContenido");
    const cursoError = document.getElementById("cursoError");

    if (cursoError) cursoError.classList.add("hidden");
    if (cursoContenido) cursoContenido.classList.add("hidden");
    if (cursoSkeleton) cursoSkeleton.classList.remove("hidden");

    try {
        const res = await fetchWithAuth(`/cursos/${idCurso}`, { method: "GET", headers: { "Content-Type": "application/json" } });
        if (!res.ok) throw new Error("No se pudo cargar el curso");
        const data = await res.json();
        renderCurso(data.curso);
        materiasCache = await completarMateriasConProfesores(Array.isArray(data.materias) ? data.materias : []);
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
    if (titulo) titulo.textContent = `${curso.anio} Año - División ${curso.division}`;
    if (anioLectivo) anioLectivo.textContent = `Año lectivo ${curso.anio_lectivo}`;
    if (nombrePlan) nombrePlan.textContent = curso.nombre_plan || "Sin plan asignado";
    if (descripcionPlan) descripcionPlan.textContent = curso.descripcion || "Sin descripción disponible";
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
    contenedor.innerHTML = materiasOrdenadas.map(m => `
        <div class="bg-white border rounded-lg p-4 hover:shadow transition">
            <h3 class="font-semibold text-lg">${escaparHtml(m.nombre_materia || "Materia sin nombre")}</h3>
            <div class="mt-2 text-sm text-gray-600 space-y-2">${renderProfesoresMateria(m)}</div>
        </div>
    `).join("");
}

function abrirDetalleCurso(idCurso) {
    const curso = typeof idCurso === "object" && idCurso !== null ? idCurso : { id: idCurso, id_curso: idCurso };
    const cursoId = curso.id ?? curso.id_curso;
    if (!cursoId) { console.error("Falta el id del curso."); return; }

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