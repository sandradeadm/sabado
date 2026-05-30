// ════════════════════════════════════════════════════════════════
// Constantes de operaciones
// ════════════════════════════════════════════════════════════════
const LOG_OP = {
  // Existentes
  ACCESO_APARTADO:    11,
  // Alumnos
  ALTA_ALUMNO:        12,
  EDITAR_ALUMNO:      13,
  BUSQUEDA_ALUMNO:    14,
  VER_DETALLE_ALUMNO: 15,
  // Cursos
  ALTA_CURSO:         16,
  EDITAR_CURSO:       17,
  ELIMINAR_CURSO:     18,
  ASIGNAR_CURSO:      19,
  BUSQUEDA_CURSO:     20,
  VER_DETALLE_CURSO:  21,
};

// ════════════════════════════════════════════════════════════════
// Función central para registrar en bitácora
// ════════════════════════════════════════════════════════════════
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