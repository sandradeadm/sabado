// Registra el acceso al apartado y carga datos al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    const usuarioStr = localStorage.getItem('usuario');
    let id_usuario = null;
    if (usuarioStr) {
        try {
            const usuarioObj = JSON.parse(usuarioStr);
            id_usuario = usuarioObj.id_usuario;
        } catch(e) {
            id_usuario = null;
        }
    }
    if (id_usuario) {
        await fetchWithAuth('/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_operacion: 11, // acceso_apartado
                id_usuario,
                ip: null,
                detalle: `El usuario ${id_usuario} accedió al apartado Administración de Usuarios`,
                usuario_afectado: null
            })
        });
    }
    cargarUsuarios();
    cargarUsuariosPorRol();
});
