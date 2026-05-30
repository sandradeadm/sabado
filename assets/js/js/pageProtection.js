// ========== PROTECCIÓN DE PÁGINA GENÉRICA ==========
// Si no hay ningún usuario en el almacenamiento local, redirigir al inicio de sesión
// Mostrar también un saludo personalizado en la esquina superior derecha
if (!localStorage.getItem('usuario')) {
    window.location.href = "../views/login.html";
}

const usuario = JSON.parse(localStorage.getItem('usuario'));
if (document.getElementById('saludoUsuario')) {
    document.getElementById('saludoUsuario').textContent = usuario ? `Hola, ${usuario.nombre}` : "Hola, Administrador";
}

// Función para registrar registros en el registro de auditoría
async function registrarLog(id_operacion, detalle, usuario_afectado = null) {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return;
    const usuario = JSON.parse(usuarioStr);
    try {
        await fetchWithAuth('/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_operacion,
                id_usuario: usuario.id_usuario,
                ip: null,
                detalle,
                usuario_afectado
            })
        });
    } catch (err) {
        console.error('Error registrando en bitácora:', err);
    }
}

// Botón Cerrar sesión (registra el cierre de sesión en el registro de auditoría)
if (document.getElementById('cerrarSesion')) {
    document.getElementById('cerrarSesion').onclick = async function() {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            await registrarLog(
                2, // logout operacion id
                `El usuario ${usuario.nombre} cerró sesión`
            );
        }
        localStorage.removeItem('usuario');
        window.location.href = "../views/Login.html";
    };
}
