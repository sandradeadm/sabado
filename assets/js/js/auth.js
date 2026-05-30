// ========== AUTENTICACIÓN Y GESTIÓN DE SESIONES ==========
// proteccion de pagina
if (!localStorage.getItem('usuario')) {
    window.location.href = "Login.html";
}

// Obtener el usuario actual y mostrar el saludo
const usuario = JSON.parse(localStorage.getItem('usuario'));
document.getElementById('saludoUsuario').textContent = usuario ? `Hola, ${usuario.nombre}` : "Hola, Administrador";

// Restricción de acceso basada en roles
const usuarioStr = localStorage.getItem('usuario');
if (!usuarioStr) {
    // Si no hay usuario, redirigir al inicio de sesión
    window.location.href = "Login.html";
} else {
    const usuario = JSON.parse(usuarioStr);
    // Verifica rol
    const rol = usuario.rol ? usuario.rol.toLowerCase() : "";
    if (rol !== "administrador" && rol !== "soporte") {
        // Si NO es administrador o soporte, redirigir al panel de control

        alert("Acceso restringido. Solo Administradores y Soporte pueden acceder.");
        window.location.href = "index.html"; 
    }
}

// logout
// Eliminar usuario de la sesión y redirigirlo al inicio de sesión
document.getElementById('cerrarSesion').onclick = function() {
    localStorage.removeItem('usuario');
    window.location.href = "Login.html";
};

// LOGOUT queda en el log
// redirecciona al login, y queda registrado
function cerrarSesion() {
    const usuarioStr = localStorage.getItem('usuario');
    const usuarioObj = usuarioStr ? JSON.parse(usuarioStr) : {};
    registrarLog(
        2, // logout operation id
        `El usuario ${usuarioObj.id_usuario} cerró sesión`,
        usuarioObj.nombre
    );
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}