// ════════════════════════════════════════════════════════════════
// Estado global
// ════════════════════════════════════════════════════════════════
let alumnoActual = null;
let alumnosResultados = [];

// ════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnCerrarBuscarEditar')?.addEventListener('click', cerrarModalBE);
  document.getElementById('btnBuscarAlumnoModal')?.addEventListener('click', buscarAlumno);
  document.getElementById('inputBusquedaAlumno')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') buscarAlumno();
  });
  document.getElementById('btnVolverBusqueda')?.addEventListener('click', volverABusquedaBE);
  document.getElementById('btnModoEdicion')?.addEventListener('click', activarEdicion);
  document.getElementById('tabEditAlumno')?.addEventListener('click', () => cambiarTabEdicion('alumno'));
  document.getElementById('tabEditTutor')?.addEventListener('click',  () => cambiarTabEdicion('tutor'));
  document.getElementById('formEditarAlumnoModal')?.addEventListener('submit', guardarCambios);
  document.getElementById('btnCancelarEdicionBE')?.addEventListener('click', cancelarEdicion);
  document.getElementById('modalBuscarEditar')?.addEventListener('click', function(e) {
    if (e.target === this) cerrarModalBE();
  });
});

// ════════════════════════════════════════════════════════════════
// HELPERS MODAL TW
// ════════════════════════════════════════════════════════════════
function mostrarModalTW(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('hidden'); m.classList.add('flex'); }
}
function ocultarModalTW(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
}

// ════════════════════════════════════════════════════════════════
// ABRIR / CERRAR
// ════════════════════════════════════════════════════════════════
function abrirModalBuscarEditar() {
  resetearBusqueda();
  mostrarPanelBusqueda();
  mostrarModalTW('modalBuscarEditar');
  setTimeout(() => document.getElementById('inputBusquedaAlumno')?.focus(), 100);
}

// Entrada directa desde tabla (Ver más / Editar)
function abrirDetalleDirecto(alumno, modoEdit = false) {
  alumnoActual = alumno;
  alumnosResultados = [alumno];
  resetearBusqueda();
  mostrarModalTW('modalBuscarEditar');

  actualizarHeader(
    modoEdit ? 'Editar alumno' : 'Detalle del alumno',
    `${alumno.nombre} ${alumno.apellido?.toUpperCase()} — DNI ${alumno.dni}`
  );
  const subtitulo = document.getElementById('subtituloDetalleBE');
  if (subtitulo) subtitulo.textContent = `${alumno.nombre} ${alumno.apellido?.toUpperCase()} — DNI ${alumno.dni}`;

  document.getElementById('panelBusquedaBE')?.classList.add('hidden');
  document.getElementById('panelDetallesBE')?.classList.remove('hidden');
  document.getElementById('vistaDetalles')?.classList.remove('hidden');
  document.getElementById('panelEdicionBE')?.classList.add('hidden');
  document.getElementById('btnModoEdicion')?.classList.remove('hidden');

  rellenarVistaDetalles();
  cargarCursoDelAlumno(alumno.id_alumno);

  if (modoEdit) {
    llenarFormularioEdicion();
    limpiarFeedbackEdit();
    mostrarPanelEdicion();
  }
}

function cerrarModalBE() {
  ocultarModalTW('modalBuscarEditar');
}

function resetearBusqueda() {
  const input = document.getElementById('inputBusquedaAlumno');
  if (input) input.value = '';
  const resultados = document.getElementById('resultadosBusqueda');
  if (resultados) resultados.innerHTML = '';
  const estado = document.getElementById('estadoBusquedaBE');
  if (estado) estado.classList.add('hidden');
}

// ════════════════════════════════════════════════════════════════
// NAVEGACIÓN
// ════════════════════════════════════════════════════════════════
function mostrarPanelBusqueda() {
  document.getElementById('panelBusquedaBE')?.classList.remove('hidden');
  document.getElementById('panelDetallesBE')?.classList.add('hidden');
  actualizarHeader('Buscar alumno', 'Buscá por DNI, legajo, nombre, apellido o DNI del tutor');
}

function mostrarPanelEdicion() {
  document.getElementById('vistaDetalles')?.classList.add('hidden');
  document.getElementById('panelEdicionBE')?.classList.remove('hidden');
  document.getElementById('btnModoEdicion')?.classList.add('hidden');
  cambiarTabEdicion('alumno');
  actualizarHeader('Editar alumno', alumnoActual ? `${alumnoActual.nombre} ${alumnoActual.apellido?.toUpperCase()}` : '');
}

function actualizarHeader(titulo, subtitulo) {
  const h = document.getElementById('headerBuscarEditar');
  if (!h) return;
  h.querySelector('h3').textContent = titulo;
  h.querySelector('p').textContent = subtitulo;
}

function volverABusquedaBE() {
  alumnoActual = null;
  alumnosResultados = [];
  mostrarPanelBusqueda();
}

function cancelarEdicion() {
  document.getElementById('vistaDetalles')?.classList.remove('hidden');
  document.getElementById('panelEdicionBE')?.classList.add('hidden');
  document.getElementById('btnModoEdicion')?.classList.remove('hidden');
  actualizarHeader('Detalle del alumno', alumnoActual ? `${alumnoActual.nombre} ${alumnoActual.apellido?.toUpperCase()}` : '');
}

// ════════════════════════════════════════════════════════════════
// BÚSQUEDA — log: BUSQUEDA_ALUMNO
// ════════════════════════════════════════════════════════════════
async function buscarAlumno() {
  const termino  = document.getElementById('inputBusquedaAlumno')?.value.trim();
  const estadoEl = document.getElementById('estadoBusquedaBE');
  const resultadosEl = document.getElementById('resultadosBusqueda');

  if (!termino) {
    mostrarEstadoBusqueda('Ingresá al menos un término para buscar.', 'info');
    return;
  }

  if (estadoEl) {
    estadoEl.innerHTML = `
      <div class="flex items-center justify-center gap-2 text-slate-400">
        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Buscando...
      </div>`;
    estadoEl.classList.remove('hidden');
  }
  if (resultadosEl) resultadosEl.innerHTML = '';

  try {
    const response = await fetchWithAuth(`/alumnos/buscar-avanzado?q=${encodeURIComponent(termino)}`);
    if (response.status === 401) { mostrarEstadoBusqueda('Sesión expirada.', 'error'); return; }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const resultados = await response.json();
    alumnosResultados = Array.isArray(resultados) ? resultados : [];

    // ── Log búsqueda ──
    registrarLog(
      LOG_OP.BUSQUEDA_ALUMNO,
      `Búsqueda de alumno con término: "${termino}" — ${alumnosResultados.length} resultado(s)`
    );

    renderResultadosBusqueda(alumnosResultados);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    mostrarEstadoBusqueda('Error al realizar la búsqueda. Intentá nuevamente.', 'error');
  }
}

function mostrarEstadoBusqueda(mensaje, tipo = 'info') {
  const el = document.getElementById('estadoBusquedaBE');
  if (!el) return;
  let cls = 'text-slate-500 bg-slate-50 border-slate-200';
  if (tipo === 'error') cls = 'text-red-600 bg-red-50 border-red-200';
  if (tipo === 'warn')  cls = 'text-amber-600 bg-amber-50 border-amber-200';
  el.className = `rounded-xl border px-4 py-6 text-sm text-center ${cls}`;
  el.textContent = mensaje;
  el.classList.remove('hidden');
}

function renderResultadosBusqueda(resultados) {
  const estadoEl   = document.getElementById('estadoBusquedaBE');
  const contenedor = document.getElementById('resultadosBusqueda');
  if (!resultados.length) { mostrarEstadoBusqueda('No se encontraron alumnos para esa búsqueda.', 'warn'); return; }
  if (estadoEl) estadoEl.classList.add('hidden');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  resultados.forEach((alumno, index) => {
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-blue-300 hover:shadow-sm cursor-pointer transition';
    card.innerHTML = `
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-900">${esc(alumno.apellido?.toUpperCase())}, ${esc(alumno.nombre)}</p>
        <div class="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
          <span class="text-xs text-gray-500">DNI: <strong class="text-gray-700">${esc(alumno.dni || '-')}</strong></span>
          <span class="text-xs text-gray-500">Legajo: <strong class="text-gray-700">${esc(alumno.legajo || '-')}</strong></span>
          <span class="text-xs text-gray-500">Tutor: <strong class="text-gray-700">${esc(alumno.tutor_nombre || 'No asignado')}</strong></span>
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
      </svg>
    `;
    card.addEventListener('click', () => seleccionarAlumno(index));
    contenedor.appendChild(card);
  });
}

// ════════════════════════════════════════════════════════════════
// DETALLE — log: VER_DETALLE_ALUMNO
// ════════════════════════════════════════════════════════════════
async function seleccionarAlumno(index) {
  alumnoActual = alumnosResultados[index];

  // ── Log ver detalle ──
  registrarLog(
    LOG_OP.VER_DETALLE_ALUMNO,
    `Ver detalle del alumno: ${alumnoActual.nombre} ${alumnoActual.apellido} (DNI: ${alumnoActual.dni})`,
    `${alumnoActual.nombre} ${alumnoActual.apellido}`
  );

  rellenarVistaDetalles();
  document.getElementById('panelBusquedaBE')?.classList.add('hidden');
  document.getElementById('panelDetallesBE')?.classList.remove('hidden');
  document.getElementById('vistaDetalles')?.classList.remove('hidden');
  document.getElementById('panelEdicionBE')?.classList.add('hidden');
  document.getElementById('btnModoEdicion')?.classList.remove('hidden');

  actualizarHeader('Detalle del alumno', `${alumnoActual.nombre} ${alumnoActual.apellido?.toUpperCase()}`);
  const subtitulo = document.getElementById('subtituloDetalleBE');
  if (subtitulo) subtitulo.textContent = `${alumnoActual.nombre} ${alumnoActual.apellido?.toUpperCase()} — DNI ${alumnoActual.dni}`;

  await cargarCursoDelAlumno(alumnoActual.id_alumno);
}

function rellenarVistaDetalles() {
  const a = alumnoActual;
  setText('det_legajo',           a.legajo);
  setText('det_nombre',           a.nombre);
  setText('det_apellido',         a.apellido?.toUpperCase());
  setText('det_dni',              a.dni);
  setText('det_cuil',             a.cuil);
  setText('det_email',            a.email);
  setText('det_direccion',        a.direccion);
  setText('det_fecha_nacimiento', a.fecha_nacimiento ? formatearFecha(a.fecha_nacimiento) : '-');
  setText('det_hermanos',         a.hermanos ? 'Sí' : 'No');
  setText('det_tutor_nombre',     a.tutor_nombre);
  setText('det_tutor_apellido',   a.tutor_apellido?.toUpperCase());
  setText('det_tutor_dni',        a.tutor_dni);
  setText('det_tutor_cuil',       a.tutor_cuil);
  setText('det_tutor_telefono',   a.tutor_telefono);
  setText('det_tutor_email',      a.tutor_email);
  setText('det_tutor_direccion',  a.tutor_direccion);
}

async function cargarCursoDelAlumno(idAlumno) {
  const loading   = document.getElementById('cargandoCursoBE');
  const contenido = document.getElementById('cursoBEContenido');
  const sinCurso  = document.getElementById('cursoBESinAsignar');

  if (loading)   { loading.classList.remove('hidden'); loading.textContent = 'Cargando información del curso...'; }
  if (contenido)  contenido.classList.add('hidden');
  if (sinCurso)   sinCurso.classList.add('hidden');

  try {
    const res = await fetchWithAuth(`/cursos/alumno/${idAlumno}`);
    if (res.status === 404) {
      if (loading)  loading.classList.add('hidden');
      if (sinCurso) sinCurso.classList.remove('hidden');
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { curso, materias } = await res.json();

    setText('det_curso_anio',         curso.anio || '-');
    setText('det_curso_division',     `División ${curso.division || '-'}`);
    setText('det_curso_anio_lectivo', curso.anio_lectivo || '-');
    setText('det_curso_plan',         curso.nombre_plan || 'Sin plan');

    const materiasEl = document.getElementById('det_materias');
    if (materiasEl) {
      materiasEl.innerHTML = (!materias || !materias.length)
        ? '<span class="text-xs text-gray-400 italic">Sin materias asignadas</span>'
        : materias.map(m =>
            `<span class="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1">${esc(m.nombre_materia || m.nombre || '-')}</span>`
          ).join('');
    }
    if (loading)   loading.classList.add('hidden');
    if (contenido) contenido.classList.remove('hidden');
  } catch (error) {
    console.error('Error al cargar curso del alumno:', error);
    if (loading) loading.innerHTML = '<p class="text-xs text-red-500">No se pudo cargar la información del curso.</p>';
  }
}

// ════════════════════════════════════════════════════════════════
// EDICIÓN — log: EDITAR_ALUMNO (al guardar)
// ════════════════════════════════════════════════════════════════
function activarEdicion() {
  llenarFormularioEdicion();
  limpiarFeedbackEdit();
  mostrarPanelEdicion();
}

function llenarFormularioEdicion() {
  const a = alumnoActual;
  setVal('edit_legajo_modal',           a.legajo);
  setVal('edit_nombre_modal',           a.nombre);
  setVal('edit_apellido_modal',         a.apellido);
  setVal('edit_dni_modal',              a.dni);
  setVal('edit_cuil_modal',             a.cuil);
  setVal('edit_email_modal',            a.email);
  setVal('edit_direccion_modal',        a.direccion);
  setVal('edit_link_docu_modal',        a.link_docu);
  setVal('edit_fecha_nacimiento_modal', a.fecha_nacimiento || '');
  setVal('edit_hermanos_modal',         a.hermanos ? 'true' : 'false');
  setVal('edit_tutor_nombre_modal',     a.tutor_nombre);
  setVal('edit_tutor_apellido_modal',   a.tutor_apellido);
  setVal('edit_tutor_dni_modal',        a.tutor_dni);
  setVal('edit_tutor_cuil_modal',       a.tutor_cuil);
  setVal('edit_tutor_telefono_modal',   a.tutor_telefono);
  setVal('edit_tutor_email_modal',      a.tutor_email);
  setVal('edit_tutor_direccion_modal',  a.tutor_direccion);
}

function cambiarTabEdicion(tab) {
  const tabA = document.getElementById('tabEditAlumno');
  const tabT = document.getElementById('tabEditTutor');
  const pA   = document.getElementById('pEditAlumno');
  const pT   = document.getElementById('pEditTutor');
  const act  = 'px-4 py-2.5 text-sm font-medium border-b-2 border-blue-600 text-blue-600 -mb-px';
  const inact= 'px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 -mb-px';
  if (tab === 'alumno') {
    tabA.className = act;  tabT.className = inact;
    pA.classList.remove('hidden'); pT.classList.add('hidden');
  } else {
    tabT.className = act;  tabA.className = inact;
    pT.classList.remove('hidden'); pA.classList.add('hidden');
  }
}

async function guardarCambios(e) {
  e.preventDefault();
  const btnGuardar = document.getElementById('btnGuardarCambiosBE');
  if (btnGuardar) { btnGuardar.disabled = true; btnGuardar.textContent = 'Guardando...'; }
  limpiarFeedbackEdit();

  const datosActualizados = {
    id_alumno:        alumnoActual.id_alumno,
    id_tutor:         alumnoActual.id_tutor,
    legajo:           Number(getVal('edit_legajo_modal')),
    nombre:           getVal('edit_nombre_modal'),
    apellido:         getVal('edit_apellido_modal'),
    dni:              Number(getVal('edit_dni_modal').replace(/\D/g, '')),
    cuil:             Number(getVal('edit_cuil_modal').replace(/\D/g, '')),
    email:            getVal('edit_email_modal'),
    direccion:        getVal('edit_direccion_modal'),
    link_docu:        getVal('edit_link_docu_modal'),
    fecha_nacimiento: getVal('edit_fecha_nacimiento_modal'),
    hermanos:         getVal('edit_hermanos_modal') === 'true',
    tutor_nombre:     getVal('edit_tutor_nombre_modal'),
    tutor_apellido:   getVal('edit_tutor_apellido_modal'),
    tutor_dni:        Number(getVal('edit_tutor_dni_modal').replace(/\D/g, '')),
    tutor_cuil:       Number(getVal('edit_tutor_cuil_modal').replace(/\D/g, '')),
    tutor_telefono:   getVal('edit_tutor_telefono_modal'),
    tutor_email:      getVal('edit_tutor_email_modal'),
    tutor_direccion:  getVal('edit_tutor_direccion_modal'),
  };

  try {
    const response = await fetchWithAuth(`/alumnos/${datosActualizados.id_alumno}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosActualizados)
    });

    if (response.status === 401) { mostrarFeedbackEdit('Sesión expirada.', 'error'); return; }

    if (response.ok) {
      // ── Log edición exitosa ──
      registrarLog(
        LOG_OP.EDITAR_ALUMNO,
        `Edición exitosa del alumno: ${datosActualizados.nombre} ${datosActualizados.apellido} (DNI: ${datosActualizados.dni})`,
        `${datosActualizados.nombre} ${datosActualizados.apellido}`
      );

      Object.assign(alumnoActual, datosActualizados);
      mostrarFeedbackEdit('✓ Cambios guardados correctamente.', 'success');
      setTimeout(() => {
        cancelarEdicion();
        rellenarVistaDetalles();
        if (typeof cargarAlumnos === 'function') cargarAlumnos();
      }, 1000);
    } else {
      const err = await response.json();
      mostrarFeedbackEdit('Error: ' + (err.error || 'Error desconocido'), 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarFeedbackEdit('Error de conexión al guardar cambios.', 'error');
  } finally {
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        Guardar Cambios`;
    }
  }
}

// ════════════════════════════════════════════════════════════════
// UTILIDADES
// ════════════════════════════════════════════════════════════════
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '-';
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}
function getVal(id) {
  return document.getElementById(id)?.value || '';
}
function esc(v) {
  return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatearFecha(fecha) {
  if (!fecha) return '-';
  try { return new Date(fecha).toLocaleDateString('es-ES'); }
  catch { return fecha; }
}
function mostrarFeedbackEdit(mensaje, tipo) {
  const el = document.getElementById('feedbackEditarBE');
  if (!el) return;
  el.textContent = mensaje;
  el.className = 'rounded-xl px-4 py-3 text-sm border mt-2';
  if (tipo === 'success') el.classList.add('bg-green-50','border-green-200','text-green-700');
  else el.classList.add('bg-red-50','border-red-200','text-red-700');
  el.classList.remove('hidden');
}
function limpiarFeedbackEdit() {
  const el = document.getElementById('feedbackEditarBE');
  if (el) { el.textContent = ''; el.classList.add('hidden'); }
}