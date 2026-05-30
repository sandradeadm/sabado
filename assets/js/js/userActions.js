// ========== ACCIONES DEL USUARIO (HABILITAR, DESHABILITAR, BLOQUEAR/DESBLOQUEAR) ==========

// ========== MODAL DE ACCIÓN DEL USUARIO ==========
// Abrir el modal para acciones del usuario seleccionado
function abrirModalAccionUsuario(id, nombre, bloqueado, deshabilitado) {
    usuarioAccionId = id;
    usuarioAccionNombre = nombre;
    usuarioAccionBloqueado = bloqueado;
    usuarioAccionDeshabilitado = deshabilitado;
    document.getElementById("accionesUsuarioNombre").textContent = nombre;
    document.getElementById("accionDesbloquear").disabled = !bloqueado;
    document.getElementById("accionDesbloquear").classList.toggle("opacity-50", !bloqueado);
    document.getElementById("accionHabilitar").disabled = !deshabilitado;
    document.getElementById("accionHabilitar").classList.toggle("opacity-50", !deshabilitado);
    document.getElementById("accionDeshabilitar").disabled = !!deshabilitado;
    document.getElementById("accionDeshabilitar").classList.toggle("opacity-50", !!deshabilitado);

    document.getElementById("accionCambiarPassword").onclick = function() {
        usuarioCambioPasswordId = id;
        usuarioCambioPasswordNombre = nombre;
        abrirModalCambiarPassword();
    };

    document.getElementById("modalAccionUsuario").style.display = "flex";
}

function cerrarModalAccionUsuario() {
    document.getElementById("modalAccionUsuario").style.display = "none";
    usuarioAccionId = null;
}

// ========== DESHABILITAR, HABILITAR, DESBLOQUEAR USUARIO ==========
// Ejecutar la acción de habilitar, deshabilitar o desbloquear, registrar la acción en el registro de auditoría
function deshabilitarUsuario() {
    if(document.getElementById("accionDeshabilitar").disabled) return;
    fetchWithAuth(`/usuarios/${usuarioAccionId}/deshabilitar`, {method: "PUT"})
        .then(res => {
            if(res.ok){
                alert("Usuario deshabilitado correctamente");
                registrarLog(
                    5,
                    `El usuario ${usuario.nombre} deshabilitó al usuario (${usuarioAccionNombre})`,
                    usuarioAccionNombre
                );
                cerrarModalAccionUsuario();
                cargarUsuarios();
                cargarUsuariosPorRol();
            } else {
                res.text().then(txt => alert("Error: " + txt));
            }
        });
}

function habilitarUsuario() {
    if(document.getElementById("accionHabilitar").disabled) return;
    fetchWithAuth(`/usuarios/${usuarioAccionId}/habilitar`, {method: "PUT"})
        .then(res => {
            if(res.ok){
                alert("Usuario habilitado correctamente");
                registrarLog(
                    6,
                    `El usuario ${usuario.nombre} habilitó al usuario (${usuarioAccionNombre})`,
                    usuarioAccionNombre
                );
                cerrarModalAccionUsuario();
                cargarUsuarios();
                cargarUsuariosPorRol();
            } else {
                res.text().then(txt => alert("Error: " + txt));
            }
        });
}

function desbloquearUsuario() {
    if(document.getElementById("accionDesbloquear").disabled) return;
    fetchWithAuth(`/usuarios/${usuarioAccionId}/desbloquear`, {method: "PUT"})
        .then(res => {
            if(res.ok){
                alert("Usuario desbloqueado correctamente");
                registrarLog(
                    8, 
                    `El usuario ${usuario.nombre} desbloqueó a (${usuarioAccionNombre})`,
                    usuarioAccionNombre
                );
                cerrarModalAccionUsuario();
                cargarUsuarios();
                cargarUsuariosPorRol();
            } else {
                res.text().then(txt => alert("Error: " + txt));
            }
        });
}
