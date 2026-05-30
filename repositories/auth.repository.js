const db = require("../dbUsers.js");

async function encontrarPorUsuariODni(valor) {
  const result = await db.query(
    `
    SELECT u.*, r.nombre AS rol
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.nombre = $1 OR u.dni = $1
    LIMIT 1
  `,
    [valor]
  );
  // console.log(result);
  
    return result.rows || null; 
};

function crearUsuario(user) {
  return db.query(
    `
    INSERT INTO usuarios (nombre, pass, dni, id_rol, id_grupo, deshabilitado, bloqueado, intentos)
    VALUES ($1,$2,$3,$4,$5,false,false,0)
    RETURNING *;
  `,
    [user.nombre, user.password, user.dni, user.id_rol, user.id_grupo]
  );
};

function obtenerPassHist(id_usuario) {
  return db.query(`SELECT fecha_cambio FROM pass_historica WHERE id_usuario = $1 ORDER BY fecha_cambio DESC LIMIT 1`, [id_usuario]);
};

function insertarPassHisto(idUsuario, password) {
  return db.query(`INSERT INTO pass_historica (id_usuario, pass_ult, fecha_cambio) VALUES ($1, $2, NOW())`, [idUsuario, password]);
};

async function existeDni(dni) {
  const result = await db.query(
    `SELECT id_usuario FROM usuarios WHERE dni = $1 LIMIT 1`, [dni]
  );
  return result.rows || 0;
};

async function cambiarPassword(nuevaPassword, id) {
  return await db.query(
    `UPDATE usuarios SET pass = $1 WHERE id_usuario = $2`,
    [nuevaPassword, id]
  );
};

function resetIntentos(id) {
  return db.query(`UPDATE usuarios SET intentos = 0 WHERE id_usuario = $1`, [
    id,
  ]);
}

function incrementarIntentos(id, intentos) {
  return db.query(
    "UPDATE usuarios SET intentos = $1, bloqueado = $2 WHERE id_usuario = $3",
    [intentos, intentos >= 3, id]
  );
}


module.exports = {
  encontrarPorUsuariODni,
  crearUsuario,
  obtenerPassHist,
  insertarPassHisto,
  existeDni,
  cambiarPassword,
  resetIntentos,
  incrementarIntentos
};
