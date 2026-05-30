// ========== MODALIDAD DE CAMBIO DE CONTRASEÑA PARA INICIAR SESIÓN ==========
// modal de cambio de contraseña
function mostrarModalCambioPassword() {
    document.getElementById('modalCambioPassword').style.display = 'flex';
    document.getElementById('formCambioPassword').reset();
    document.getElementById('msgCambioPassword').textContent = '';
    document.getElementById('msgCambioPassword').style.color = 'red';
}

function cerrarModalCambioPassword() {
    document.getElementById('modalCambioPassword').style.display = 'none';
    usuarioCambioClave = null;
    document.getElementById('msgCambioPassword').textContent = '';
    document.getElementById('msgCambioPassword').style.color = 'red';
}

// requerimientos de contraseña y comparación entre ambas
document.getElementById('formCambioPassword').onsubmit = async function(e) {
    e.preventDefault();
    const nuevaPassword = document.getElementById('inputNuevaPassword').value.trim();
    const repetirPassword = document.getElementById('inputRepetirPassword').value.trim(); // <-- campo agregado
    const msgDiv = document.getElementById('msgCambioPassword');
    msgDiv.textContent = '';
    msgDiv.style.color = 'red';

    if (nuevaPassword !== repetirPassword) {
        msgDiv.textContent = 'Las contraseñas no coinciden.';
        return;
    }
    if (!validarPassword(nuevaPassword)) {
        msgDiv.textContent = 'La contraseña debe tener entre 8 y 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.';
        return;
    }
    // cambiar contraseña en el backend
    const res = await fetchWithAuth(`/usuarios/${usuarioCambioClave}/cambiar-password`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nuevaPassword })
    });
    if (res.ok) {
        msgDiv.style.color = 'green';
        msgDiv.textContent = 'Contraseña cambiada correctamente. Ingrese de nuevo.';
        setTimeout(()=>{
            cerrarModalCambioPassword();
        }, 1500);
    } else {
       // Leer el mensaje del backend y mostrarlo
        const msg = await res.text();
        msgDiv.textContent = msg || 'Error al cambiar la contraseña';
    }
};

// requerimientos
function validarPassword(password) {
    const minLength = 8;
    const maxLength = 16;
    if (password.length < minLength || password.length > maxLength) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*()_\-+=\[\]{};:,.<>|\/?]/.test(password)) return false;
    return true;
}
