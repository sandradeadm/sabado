// para los dni, asi se ponen con punto
function formatearDNI(input) {
  let value = input.value.replace(/\D/g, '').slice(0, 8);

  if (value.length >= 7) {
    value = value.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
  } else if (value.length >= 6) {
    value = value.replace(/(\d{1})(\d{3})(\d{3})/, '$1.$2.$3');
  }

  input.value = value;
}

// esto da formato a los cuil pons
function formatearCUIL(input) {
  let value = input.value.replace(/\D/g, '').slice(0, 11); // Solo números, máx 11 dígitos

  if (value.length === 11) {
    value = value.replace(/(\d{2})(\d{8})(\d{1})/, '$1-$2-$3');
  }

  input.value = value;
}



// solo permite letras y espacios
function soloLetras(input) {
  input.value = input.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
}

// solo numeros con longitud máxima
function soloNumeros(input, maxLength) {
  input.value = input.value.replace(/\D/g, '').slice(0, maxLength);
}

window.addEventListener('DOMContentLoaded', () => {
  // campos de alumno
  const dni = document.getElementById('dni');
  const nombre = document.getElementById('nombre');
  const apellido = document.getElementById('apellido');
  const cuil = document.getElementById('cuil');
  const legajo = document.getElementById('legajo');

  // campos de tutor
  const tutor_dni = document.getElementById('tutor_dni');
  const tutor_cuil = document.getElementById('tutor_cuil');
  const tutor_nombre = document.getElementById('tutor_nombre');
  const tutor_apellido = document.getElementById('tutor_apellido');

  // para editar
  const editFields = {
    edit_dni: formatearDNI,
    edit_nombre: soloLetras,
    edit_apellido: soloLetras,
    edit_cuil: formatearCUIL,
    edit_legajo: (el) => soloNumeros(el, 8),
    edit_tutor_dni: formatearDNI,
    edit_tutor_cuil: formatearCUIL,
    edit_tutor_nombre: soloLetras,
    edit_tutor_apellido: soloLetras,
  };


  if (dni) dni.addEventListener('input', () => formatearDNI(dni));
  if (nombre) nombre.addEventListener('input', () => soloLetras(nombre));
  if (apellido) apellido.addEventListener('input', () => soloLetras(apellido));
  if (cuil) cuil.addEventListener('input', () => formatearCUIL(cuil));
  if (legajo) legajo.addEventListener('input', () => soloNumeros(legajo, 8));

  if (tutor_dni) tutor_dni.addEventListener('input', () => formatearDNI(tutor_dni));
  if (tutor_cuil) tutor_cuil.addEventListener('input', () => formatearCUIL(tutor_cuil));
  if (tutor_nombre) tutor_nombre.addEventListener('input', () => soloLetras(tutor_nombre));
  if (tutor_apellido) tutor_apellido.addEventListener('input', () => soloLetras(tutor_apellido));

  // Editar alumno (verifica si existen)
  for (const [id, handler] of Object.entries(editFields)) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => handler(el));
    }
  }
});