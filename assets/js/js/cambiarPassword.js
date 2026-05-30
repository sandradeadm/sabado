// ========== FUNCIONALIDAD DE CAMBIO DE CONTRASEÑA ==========

// ========== CAMBIAR CONTRASEÑA ==========

//Abrir/cerrar modal para cambiar la contraseña y enviar solicitud al backend

function abrirModalCambiarPassword() {
    document.getElementById('modalCambiarPassword').style.display = 'flex';
    document.getElementById('formCambiarPassword').reset();
    document.getElementById('nombreUsuarioCambioPass').textContent = usuarioCambioPasswordNombre;
}

function cerrarModalCambiarPassword() {
    document.getElementById('modalCambiarPassword').style.display = 'none';
    usuarioCambioPasswordId = null;
    usuarioCambioPasswordNombre = "";
}

// Cambiar contraseña de usuario
document.getElementById('formCambiarPassword').addEventListener('submit', function(event) {
    event.preventDefault();
    const nuevaPassword = document.getElementById('nuevaPassword').value;
    const repetirPassword = document.getElementById('repetirPassword').value; // AGREGADO

    if (nuevaPassword !== repetirPassword) { // AGREGADO
        alert('Las contraseñas no coinciden.'); // AGREGADO
        return; // AGREGADO
    }

    if (!validarPassword(nuevaPassword)) {
        alert('La contraseña debe tener entre 8 y 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.');
        return;
    }
    fetchWithAuth(`/usuarios/${usuarioCambioPasswordId}/cambiar-password`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nuevaPassword })
    })
    .then(async res => {
        if (res.ok) {
            alert('Contraseña cambiada correctamente');
            registrarLog(
                7,
                `El usuario ${usuario.nombre} cambió la contraseña del usuario (${usuarioCambioPasswordNombre})`,
                usuarioCambioPasswordNombre
            );
            cerrarModalCambiarPassword();
            cerrarModalAccionUsuario();
            cargarUsuarios();
        } else {
            const txt = await res.text();
            alert('Error: ' + txt);
        }
    });
});
