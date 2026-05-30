const { json } = require("express");
const db = require("../dbUsers.js");

async function obternerLogs(search, fechaInicio, fechaFin, limit, offset) {

  let baseSql = `
      FROM logs l
      LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
      LEFT JOIN operaciones o ON l.id_operacion = o.id_operacion
      WHERE 1=1
    `;

  const params = [];

  if (search) {
    const s = `%${search}%`;
    baseSql += `
        AND (
          u.nombre ILIKE $${params.length + 1} OR
          o.descripcion ILIKE $${params.length + 2} OR
          l.detalle ILIKE $${params.length + 3} OR
          l.usuario_afectado ILIKE $${params.length + 4}
        )
      `;
    params.push(s, s, s, s);
  }

  if (fechaInicio) {
    baseSql += ` AND l.hora_y_fecha >= $${params.length + 1}`;
    params.push(`${fechaInicio} 00:00:00`);
  }

  if (fechaFin) {
    baseSql += ` AND l.hora_y_fecha <= $${params.length + 1}`;
    params.push(`${fechaFin} 23:59:59`);
  }

  const countSql = `SELECT COUNT(*) AS total ${baseSql}`;
  const dataSql = `
      SELECT 
        l.hora_y_fecha,
        u.nombre AS usuario,
        o.descripcion AS operacion,
        l.detalle,
        l.ip,
        l.mac,
        l.usuario_afectado
      ${baseSql}
      ORDER BY l.hora_y_fecha DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

  const countResult = await db.query(countSql, params);
  const total = Number(countResult.rows[0].total);

  const dataResult = await db.query(dataSql, [...params, Number(limit), Number(offset)]);
    
  return result = {
    rows: dataResult.rows, 
    total: total
  }; 

}

async function registrarLog(idOperacion, idUsuario, ip, detalle, usuarioAfectado) {
  db.query(
    `
      INSERT INTO logs (id_operacion, hora_y_fecha, id_usuario, mac, ip, detalle, usuario_afectado)
      VALUES ($1, NOW(), $2, NULL, $3, $4, $5)
    `,
    [idOperacion, idUsuario, detalle, ip || null, usuarioAfectado]
  );
}

async function ultimosLogs() {
  const result = await db.query(`
      SELECT 
        l.hora_y_fecha,
        u.nombre AS usuario,
        o.descripcion AS operacion,
        l.detalle,
        l.usuario_afectado
      FROM logs l
      LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
      LEFT JOIN operaciones o ON l.id_operacion = o.id_operacion
      ORDER BY l.hora_y_fecha DESC
      LIMIT 4
    `);
  return result;
}

module.exports = {
  registrarLog,
  ultimosLogs,
  obternerLogs
};


