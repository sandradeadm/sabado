// Función para registrar una acción en el log/bitácora
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
