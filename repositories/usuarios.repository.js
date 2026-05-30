const db = require("../dbUsers.js");

 async function obtenerUsuario(id) {
  const result = await db.query(
    `SELECT u.id_usuario, u.nombre, u.dni, u.id_rol, r.nombre AS rol, u.id_grupo, g.nombre AS grupo, u.deshabilitado, u.bloqueado, u.intentos
      FROM usuarios u 
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      LEFT JOIN grupos g ON u.id_grupo = g.id_grupo
      WHERE u.id_usuario = $1`,
    [id]
);
  return result.rows[0];
}
// Función para bloquear un usuario después de 3 intentos fallidos

function bloquearUsuario(id, intentos) {
  return db.query(
    "UPDATE usuarios SET bloqueado = true, intentos = $1 WHERE id_usuario = $2",
    [intentos, id]
  );
}

function desbloquearUsuario(id) {
  return db.query("UPDATE usuarios SET bloqueado = false, intentos = 0 WHERE id_usuario = $1", [id]);
}

function obtenerRoles() {
  return db.query(`SELECT id_rol, nombre FROM roles ORDER BY nombre`);
}

async function obtenerRoles() {
  const result = await db.query(`SELECT id_rol, nombre FROM roles ORDER BY nombre`);
  return result.rows;
}

async function obtenerGrupos() {
  const result = await db.query(`SELECT id_grupo, nombre FROM grupos ORDER BY nombre`);
  return result.rows;
}

function deshabilitarUsuario(id) {
  return db.query(`UPDATE usuarios SET deshabilitado = true WHERE id_usuario = $1`, [id]);
}

async function obtenerUsuariosPorRol() {
  const result = await db.query(`
    SELECT r.nombre, COUNT(u.id_usuario)::int AS cantidad
    FROM roles r
    LEFT JOIN usuarios u ON r.id_rol = u.id_rol
    GROUP BY r.id_rol, r.nombre
    ORDER BY r.nombre
  `);

  return result.rows;
}

async function listarUsuarios({ search, limit, offset }) {
  let whereClause = '';
  let params = [];
  let paramIndex = 1;

  if (search) {
    if (search.type === 'dni') {
      whereClause = `WHERE u.dni = $${paramIndex}`;
      params.push(search.value);
      paramIndex++;
    }

    if (search.type === 'nombre') {
      whereClause = `WHERE u.nombre ILIKE $${paramIndex}`;
      params.push(`%${search.value}%`);
      paramIndex++;
    }
  }

  const sql = `
    SELECT
      u.id_usuario,
      u.nombre,
      u.dni,
      u.id_rol,
      r.nombre AS rol,
      u.id_grupo,
      g.nombre AS grupo,
      u.deshabilitado,
      u.bloqueado,
      u.intentos
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    LEFT JOIN grupos g ON u.id_grupo = g.id_grupo
    ${whereClause}
    ORDER BY u.id_usuario
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const countSql = `
    SELECT COUNT(*)
    FROM usuarios u
    ${whereClause}
  `;

  const dataParams = [...params, limit, offset];

  const [usuariosResult, totalResult] = await Promise.all([
    db.query(sql, dataParams),
    db.query(countSql, params)
  ]);

  return {
    usuarios: usuariosResult.rows,
    total: parseInt(totalResult.rows[0].count, 10)
  };
}

function habilitarUsuario(id) {
  return db.query(`UPDATE usuarios SET deshabilitado = false WHERE id_usuario = $1`, [id]);
}

function cambiarGrupo(id, id_grupo) {
  return db.query(`UPDATE usuarios SET id_grupo = $1 WHERE id_usuario = $2`, [id_grupo, id]);
} 

function cambiarRol(id, id_rol){
  return db.query(`UPDATE usuarios SET id_rol = $1 WHERE id_usuario = $2`, [id_rol, id]);
}

module.exports = {
  // resetIntentos,
  // incrementarIntentos,
  obtenerGrupos,
  obtenerRoles,
  deshabilitarUsuario,
  obtenerUsuariosPorRol,
  listarUsuarios,
  bloquearUsuario,
  habilitarUsuario,
  cambiarGrupo,
  cambiarRol,
  deshabilitarUsuario,
  desbloquearUsuario,
  obtenerUsuario
};