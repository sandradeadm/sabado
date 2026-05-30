// Tiempo de inactividad permitido (en milisegundos)
//const INACTIVITY_LIMIT = 1 * 60 * 1000; // 1 minuto

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos

let inactivityTimer;

// Reinicia el temporizador cada vez que hay actividad
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(logoutUser, INACTIVITY_LIMIT);
}

// Función para cerrar sesión 
function logoutUser() {
  alert("Por seguridad, tu sesión ha expirado por inactividad.");
  // Limpia localStorage y sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  // Borra todas las cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  // Redirige al login
  window.location.href = '/views/login.html';
}

// Escuchar eventos de actividad del usuario
['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(event => {
  window.addEventListener(event, resetInactivityTimer);
});

// Inicializa el temporizador al cargar la página
resetInactivityTimer();