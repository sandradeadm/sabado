// Estado global
let alumnoActual = null;
let modoEdicion = false;
let alumnosResultados = []; // Array para guardar los resultados

document.addEventListener('DOMContentLoaded', () => {
  const btnBuscar = document.getElementById('btnBuscarAlumnoModal');
  const btnModoEdicion = document.getElementById('btnModoEdicion');
  const btnVolverBusqueda = document.getElementById('btnVolverBusqueda');
  const formEditar = document.getElementById('formEditarAlumnoModal');

  btnBuscar?.addEventListener('click', buscarAlumno);
  btnModoEdicion?.addEventListener('click', activarModoEdicion);
  btnVolverBusqueda?.addEventListener('click', volverABusqueda);
  formEditar?.addEventListener('submit', guardarCambios);
});

// Obtener token del localStorage
function obtenerToken() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log('Token obtenido:', token ? 'Si existe' : 'No existe');
  return token;
}

async function buscarAlumno() {
  const termino = document.getElementById('inputBusquedaAlumno').value.trim();
  
  console.log('Buscando:', termino);
  
  if (!termino) {
    alert('Por favor ingresa un término de búsqueda');
    return;
  }

  const token = obtenerToken();
  if (!token) {
    alert('No hay sesión activa. Por favor inicia sesión.');
    return;
  }

  try {
    const url = `/api/alumnos/buscar-avanzado?q=${encodeURIComponent(termino)}`;
    console.log('URL:', url);
    console.log('Token:', token.substring(0, 20) + '...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);

    if (response.status === 401) {
      alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resultados = await response.json();
    console.log('Resultados recibidos:', resultados);
    
    mostrarResultados(resultados);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    document.getElementById('resultadosBusqueda').innerHTML = 
      '<div class="text-red-500 text-center p-4 bg-red-50 rounded">Error al buscar. Intenta nuevamente.</div>';
  }
}

function mostrarResultados(resultados) {
  const contenedor = document.getElementById('resultadosBusqueda');

  console.log('Mostrando resultados:', resultados);

  if (!resultados || !Array.isArray(resultados) || resultados.length === 0) {
    console.warn('Sin resultados');
    contenedor.innerHTML = 
      '<div class="text-yellow-600 text-center p-4 bg-yellow-50 rounded">No se encontraron resultados</div>';
    return;
  }

  console.log('Cantidad de resultados:', resultados.length);

  // Guardar los resultados en el array global
  alumnosResultados = resultados;

  contenedor.innerHTML = resultados
    .map((alumno, index) => {
      console.log(`Alumno ${index}:`, alumno);
      return `
        <div class="resultado-item alumno" onclick="seleccionarAlumno(${index})">
          <strong>${alumno.nombre || '-'} ${alumno.apellido || '-'}</strong>
          <small>Legajo: <strong>${alumno.legajo || '-'}</strong></small>
          <small>DNI: <strong>${alumno.dni || '-'}</strong></small>
          <small>Tutor: <strong>${alumno.tutor_nombre || 'No asignado'}</strong></small>
        </div>
      `;
    })
    .join('');
}

function seleccionarAlumno(index) {
  try {
    console.log('Seleccionando alumno en índice:', index);
    alumnoActual = alumnosResultados[index];
    console.log('Alumno seleccionado:', alumnoActual);
    modoEdicion = false;
    mostrarDetalles();
  } catch (error) {
    console.error('Error al seleccionar alumno:', error);
    alert('Error al seleccionar alumno');
  }
}

function mostrarDetalles() {
  if (!alumnoActual) {
    console.error('No hay alumno actual');
    return;
  }

  console.log('Mostrando detalles de:', alumnoActual.nombre);

  // Cambiar a tab de edición
  document.getElementById('tabBusqueda').classList.remove('active');
  document.getElementById('tabEdicion').classList.add('active');

  // Llenar datos en vista de lectura
  document.getElementById('det_legajo').textContent = alumnoActual.legajo || '-';
  document.getElementById('det_nombre').textContent = alumnoActual.nombre || '-';
  document.getElementById('det_apellido').textContent = alumnoActual.apellido || '-';
  document.getElementById('det_dni').textContent = alumnoActual.dni || '-';
  document.getElementById('det_cuil').textContent = alumnoActual.cuil || '-';
  document.getElementById('det_email').textContent = alumnoActual.email || '-';
  document.getElementById('det_direccion').textContent = alumnoActual.direccion || '-';
  document.getElementById('det_fecha_nacimiento').textContent = alumnoActual.fecha_nacimiento ? formatearFecha(alumnoActual.fecha_nacimiento) : '-';

  document.getElementById('det_tutor_nombre').textContent = alumnoActual.tutor_nombre || '-';
  document.getElementById('det_tutor_apellido').textContent = alumnoActual.tutor_apellido || '-';
  document.getElementById('det_tutor_dni').textContent = alumnoActual.tutor_dni || '-';
  document.getElementById('det_tutor_cuil').textContent = alumnoActual.tutor_cuil || '-';
  document.getElementById('det_tutor_telefono').textContent = alumnoActual.tutor_telefono || '-';
  document.getElementById('det_tutor_email').textContent = alumnoActual.tutor_email || '-';
  document.getElementById('det_tutor_direccion').textContent = alumnoActual.tutor_direccion || '-';

  // Llenar formulario de edición
  llenarFormularioEdicion();

  // Mostrar SOLO vista de detalles (sin botones de acción arriba)
  document.getElementById('vistaDetalles').classList.remove('hidden');
  document.getElementById('botonesAccion').classList.remove('hidden');
  document.getElementById('formEditarAlumnoModal').classList.add('hidden');
  document.getElementById('btnModoEdicion').classList.remove('hidden');
}

function llenarFormularioEdicion() {
  document.getElementById('edit_legajo_modal').value = alumnoActual.legajo || '';
  document.getElementById('edit_nombre_modal').value = alumnoActual.nombre || '';
  document.getElementById('edit_apellido_modal').value = alumnoActual.apellido || '';
  document.getElementById('edit_dni_modal').value = alumnoActual.dni || '';
  document.getElementById('edit_cuil_modal').value = alumnoActual.cuil || '';
  document.getElementById('edit_email_modal').value = alumnoActual.email || '';
  document.getElementById('edit_direccion_modal').value = alumnoActual.direccion || '';
  document.getElementById('edit_link_docu_modal').value = alumnoActual.link_docu || '';
  document.getElementById('edit_fecha_nacimiento_modal').value = alumnoActual.fecha_nacimiento || '';
  document.getElementById('edit_hermanos_modal').value = alumnoActual.hermanos ? 'true' : 'false';

  document.getElementById('edit_tutor_nombre_modal').value = alumnoActual.tutor_nombre || '';
  document.getElementById('edit_tutor_apellido_modal').value = alumnoActual.tutor_apellido || '';
  document.getElementById('edit_tutor_dni_modal').value = alumnoActual.tutor_dni || '';
  document.getElementById('edit_tutor_cuil_modal').value = alumnoActual.tutor_cuil || '';
  document.getElementById('edit_tutor_telefono_modal').value = alumnoActual.tutor_telefono || '';
  document.getElementById('edit_tutor_email_modal').value = alumnoActual.tutor_email || '';
  document.getElementById('edit_tutor_direccion_modal').value = alumnoActual.tutor_direccion || '';
}

function activarModoEdicion() {
  modoEdicion = true;
  document.getElementById('vistaDetalles').classList.add('hidden');
  document.getElementById('botonesAccion').classList.add('hidden');
  document.getElementById('formEditarAlumnoModal').classList.remove('hidden');
  document.getElementById('btnModoEdicion').classList.add('hidden');
}

function volverABusqueda() {
  alumnoActual = null;
  modoEdicion = false;
  
  document.getElementById('tabBusqueda').classList.add('active');
  document.getElementById('tabEdicion').classList.remove('active');
  
  document.getElementById('inputBusquedaAlumno').value = '';
  document.getElementById('resultadosBusqueda').innerHTML = '';
}

async function guardarCambios(e) {
  e.preventDefault();

  const token = obtenerToken();
  if (!token) {
    alert('Sesión expirada. Por favor inicia sesión nuevamente.');
    return;
  }

  const datosActualizados = {
    id_alumno: alumnoActual.id_alumno,
    id_tutor: alumnoActual.id_tutor,
    legajo: document.getElementById('edit_legajo_modal').value,
    nombre: document.getElementById('edit_nombre_modal').value,
    apellido: document.getElementById('edit_apellido_modal').value,
    dni: document.getElementById('edit_dni_modal').value,
    cuil: document.getElementById('edit_cuil_modal').value,
    email: document.getElementById('edit_email_modal').value,
    direccion: document.getElementById('edit_direccion_modal').value,
    link_docu: document.getElementById('edit_link_docu_modal').value,
    fecha_nacimiento: document.getElementById('edit_fecha_nacimiento_modal').value,
    hermanos: document.getElementById('edit_hermanos_modal').value === 'true',
    tutor_nombre: document.getElementById('edit_tutor_nombre_modal').value,
    tutor_apellido: document.getElementById('edit_tutor_apellido_modal').value,
    tutor_dni: document.getElementById('edit_tutor_dni_modal').value,
    tutor_cuil: document.getElementById('edit_tutor_cuil_modal').value,
    tutor_telefono: document.getElementById('edit_tutor_telefono_modal').value,
    tutor_email: document.getElementById('edit_tutor_email_modal').value,
    tutor_direccion: document.getElementById('edit_tutor_direccion_modal').value,
  };

  console.log('Guardando cambios:', datosActualizados);

  try {
    const response = await fetch('/api/alumnos/actualizar', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosActualizados)
    });

    if (response.status === 401) {
      alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      return;
    }

    if (response.ok) {
      alert('Cambios guardados exitosamente');
      volverABusqueda();
    } else {
      const errorData = await response.json();
      alert('Error al guardar: ' + (errorData.error || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar cambios');
  }
}

function formatearFecha(fecha) {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-ES');
}