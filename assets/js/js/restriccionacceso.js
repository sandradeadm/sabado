document.addEventListener('DOMContentLoaded', function() {
    // ========== RESTRICCIÓN DE ACCESO POR ROL ==========
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) {
        window.location.href = "Login.html";
        return;
    } else {
        const usuario = JSON.parse(usuarioStr);
        const rol = usuario.rol ? usuario.rol.toLowerCase() : "";
        if (rol !== "administrador" && rol !== "soporte") {
            alert("Acceso restringido. Solo Administradores y Soporte pueden acceder.");
            window.location.href = "inicio.html";
            return;
        }
    }
    })