const express = require('express');
const router = express.Router();
const db = require('../dbUsers.js');

// Función auxiliar para registrar logs en la bitácora
async function registrarLog(id_operacion, id_usuario, ip, detalle, usuario_afectado = null) {
    // mac lo voy a dejar null por ahora
    try {
        await db.query(`
            INSERT INTO logs (id_operacion, hora_y_fecha, id_usuario, mac, ip, detalle, usuario_afectado)
            VALUES ($1, NOW(), $2, NULL, $3, $4, $5)
        `, [id_operacion, id_usuario, ip || null, detalle, usuario_afectado || null]);
    } catch (err) {
        console.error('Error al registrar en la bitácora:', err);
    }
}

// Validación de contraseña segura
function validarPassword(password) {
    const minLength = 8;
    const maxLength = 16;
    if (typeof password !== 'string') return false;
    if (password.length < minLength || password.length > maxLength) return false;
    if (!/[A-Z]/.test(password)) return false; // al menos una mayúscula
    if (!/[a-z]/.test(password)) return false; // al menos una minúscula
    if (!/[0-9]/.test(password)) return false; // al menos un número
    if (!/[!@#$%^&*()_\-+=\[\]{};:,.<>|\/?]/.test(password)) return false; // al menos un especial
    return true;
}

// Endpoint con búsqueda y paginación (tabla usuarios)
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    const offsetInt = (pageInt - 1) * limitInt;

    let sql, params, countSql, paramsCount;

    if (search && search.trim() !== '') {
      sql = `
        SELECT u.id_usuario, u.nombre, u.pass, u.dni, u.id_rol, r.nombre AS rol, u.id_grupo, g.nombre AS grupo,
          u.deshabilitado, u.bloqueado, u.intentos
        FROM usuarios u
        LEFT JOIN roles r ON u.id_rol = r.id_rol
        LEFT JOIN grupos g ON u.id_grupo = g.id_grupo
        WHERE u.nombre ILIKE $1 OR u.dni ILIKE $1
        ORDER BY u.id_usuario
        LIMIT $2 OFFSET $3
      `;
      params = [`%${search}%`, limitInt, offsetInt];
      countSql = `SELECT COUNT(*) FROM usuarios u WHERE u.nombre ILIKE $1 OR u.dni ILIKE $1`;
      paramsCount = [`%${search}%`];
    } else {
      sql = `
        SELECT u.id_usuario, u.nombre, u.pass, u.dni, u.id_rol, r.nombre AS rol, u.id_grupo, g.nombre AS grupo,
          u.deshabilitado, u.bloqueado, u.intentos
        FROM usuarios u
        LEFT JOIN roles r ON u.id_rol = r.id_rol
        LEFT JOIN grupos g ON u.id_grupo = g.id_grupo
        ORDER BY u.id_usuario
        LIMIT $1 OFFSET $2
      `;
      params = [limitInt, offsetInt];
      countSql = `SELECT COUNT(*) FROM usuarios u`;
      paramsCount = [];
    }

    const usuariosResult = await db.query(sql, params);
    const totalResult = await db.query(countSql, paramsCount);

    res.json({
      usuarios: usuariosResult.rows,
      total: parseInt(totalResult.rows[0].count)
    });
  } catch (err) {
    console.error("Error en /api/usuarios:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de login con bloqueo tras 3 intentos fallidos y expiración de contraseña cada 6 meses
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;

    const sql = `
      SELECT u.id_usuario, u.nombre, u.pass, u.dni, r.nombre AS rol, u.deshabilitado, u.bloqueado, u.intentos
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      WHERE (u.nombre = $1 OR u.dni = $1)
      LIMIT 1
    `;
    const result = await db.query(sql, [usuario]);
    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Usuario no encontrado' });
    }
    const user = result.rows[0];

    if (user.deshabilitado) {
      return res.json({ success: false, message: 'Usuario deshabilitado' });
    }
    if (user.bloqueado) {
      return res.json({ success: false, message: 'Usuario bloqueado. Contacte al administrador.' });
    }

    // Verificación de contraseña
    if (user.pass === password) {
      // Verificar expiración de contraseña usando pass_historica
      const passHist = await db.query(
        `SELECT fecha_cambio FROM pass_historica WHERE id_usuario = $1 ORDER BY fecha_cambio DESC LIMIT 1`,
        [user.id_usuario]
      );

      let requiereCambioPassword = false;
      let fechaUltimoCambio = null;
      //const seisMesesMs = 1 * 60 * 1000; //esto para que expire en 1 minuto
      const seisMesesMs = 6 * 30 * 24 * 60 * 60 * 1000;// 6 meses aproximado

      if (passHist.rows.length > 0) {
        fechaUltimoCambio = new Date(passHist.rows[0].fecha_cambio);
        const fechaActual = new Date();
        if (fechaActual - fechaUltimoCambio > seisMesesMs) {
          requiereCambioPassword = true;
        }
      } else {
        // Si nunca cambió la clave, obligar a cambiarla la primera vez
        requiereCambioPassword = true;
      }

      await db.query('UPDATE usuarios SET intentos = 0 WHERE id_usuario = $1', [user.id_usuario]);

      // REGISTRAR LOG DE LOGIN EXITOSO
      await registrarLog(
        1, // id_operacion para login
        user.id_usuario,
        req.ip,
        `El usuario ${user.nombre} inició sesión`
      );

      if (requiereCambioPassword) {
        return res.json({
          success: false,
          message: 'La contraseña ha expirado. Debe cambiarla.',
          requiereCambioPassword: true,
          user: { id_usuario: user.id_usuario, nombre: user.nombre, rol: user.rol }
        });
      }

      return res.json({
        success: true,
        user: { id_usuario: user.id_usuario, nombre: user.nombre, rol: user.rol }
      });

    } else {
      const nuevosIntentos = user.intentos + 1;
      if (nuevosIntentos >= 3) {
        await db.query('UPDATE usuarios SET intentos = $1, bloqueado = true WHERE id_usuario = $2', [nuevosIntentos, user.id_usuario]);
        // REGISTRAR LOG DE BLOQUEO
        await registrarLog(
          5, // id_operacion para bloqueo
          user.id_usuario,
          req.ip,
          `El usuario ${user.nombre} fue bloqueado tras 3 intentos fallidos`
        );
        return res.json({ success: false, message: 'Usuario bloqueado por demasiados intentos. Contacte al administrador.' });
      } else {
        await db.query('UPDATE usuarios SET intentos = $1 WHERE id_usuario = $2', [nuevosIntentos, user.id_usuario]);
        return res.json({ success: false, message: `Contraseña incorrecta. Intentos: ${nuevosIntentos}` });
      }
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Obtener todos los roles 
router.get('/roles', async (req, res) => {
  try {
    const result = await db.query(`SELECT id_rol, nombre FROM roles ORDER BY nombre`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error obteniendo roles');
  }
});

// Obtener todos los grupos
router.get('/grupos', async (req, res) => {
  try {
    const result = await db.query(`SELECT id_grupo, nombre FROM grupos ORDER BY nombre`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error obteniendo grupos');
  }
});

// Agregar usuario (CON VALIDACIÓN DE CONTRASEÑA SEGURA Y registro en pass_historica)
router.post('/', async (req, res) => {
  const { nombre, password, dni, id_rol, id_grupo } = req.body;
  if (!nombre || !password || !dni || !id_rol || !id_grupo) {
    return res.status(400).send('Datos incompletos');
  }
  if (!validarPassword(password)) {
    return res.status(400).send('La contraseña debe tener entre 8 y 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.');
  }
  try {
    // PRIMERO VERIFICAR SI EL DNI YA EXISTE
    const existeDni = await db.query(
      `SELECT id_usuario FROM usuarios WHERE dni = $1 LIMIT 1`, [dni]
    );
    if (existeDni.rows.length > 0) {
      return res.status(400).send('El DNI ya se encuentra en la base de datos.');
    }

    // Crear usuario
    const insertUser = await db.query(
      `INSERT INTO usuarios (nombre, pass, dni, id_rol, id_grupo, deshabilitado, bloqueado, intentos) VALUES ($1,$2,$3,$4,$5,false,false,0) RETURNING id_usuario`,
      [nombre, password, dni, id_rol, id_grupo]
    );
    // Registrar en historial de contraseñas
    const idUsuario = insertUser.rows[0].id_usuario;
    await db.query(
      `INSERT INTO pass_historica (id_usuario, pass_ult, fecha_cambio) VALUES ($1, $2, NOW())`,
      [idUsuario, password]
    );
    res.status(201).json({ id_usuario: idUsuario, nombre });
  } catch (err) {
    res.status(500).send('Error agregando usuario');
  }
});


// Deshabilitar usuario
router.put('/:id/deshabilitar', async (req, res) => {
  try {
    await db.query('UPDATE usuarios SET deshabilitado = true WHERE id_usuario = $1', [req.params.id]);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error deshabilitando usuario:', err);
    res.status(500).send('Error deshabilitando usuario');
  }
});

// Habilitar usuario
router.put('/:id/habilitar', async (req, res) => {
  try {
    await db.query('UPDATE usuarios SET deshabilitado = false WHERE id_usuario = $1', [req.params.id]);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error habilitando usuario:', err);
    res.status(500).send('Error habilitando usuario');
  }
});

// DESBLOQUEAR
router.put('/:id/desbloquear', async (req, res) => {
  try {
    await db.query('UPDATE usuarios SET bloqueado = false, intentos = 0 WHERE id_usuario = $1', [req.params.id]);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error desbloqueando usuario:', err);
    res.status(500).send('Error desbloqueando usuario');
  }
});

// Cambiar rol de usuario
router.put('/:id/cambiar-rol', async (req, res) => {
  try {
    const { nuevoRol } = req.body;
    if (!nuevoRol) {
      return res.status(400).send('Falta el nuevo rol');
    }
    await db.query(
      'UPDATE usuarios SET id_rol = $1 WHERE id_usuario = $2',
      [nuevoRol, req.params.id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Error en /api/usuarios/:id/cambiar-rol:', err);
    res.status(500).send('Error cambiando el rol del usuario: ' + err.message);
  }
});

// Cambiar grupo de usuario
router.put('/:id/cambiar-grupo', async (req, res) => {
  try {
    const { nuevoGrupo } = req.body;
    if (!nuevoGrupo) {
      return res.status(400).send('Falta el nuevo grupo');
    }
    await db.query(
      'UPDATE usuarios SET id_grupo = $1 WHERE id_usuario = $2',
      [nuevoGrupo, req.params.id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Error en /api/usuarios/:id/cambiar-grupo:', err);
    res.status(500).send('Error cambiando el grupo del usuario: ' + err.message);
  }
});

// Cantidad de usuarios por cada rol (tablita de usuarios por rol)
router.get('/usuarios-por-rol', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.nombre, COUNT(u.id_usuario) as cantidad
      FROM roles r
      LEFT JOIN usuarios u ON r.id_rol = u.id_rol
      GROUP BY r.id_rol, r.nombre
      ORDER BY r.nombre
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error obteniendo usuarios por rol');
  }
});

// Cambiar contraseña (con validación y registro en historial VALIDACIÓN DE NO REPETIR ÚLTIMA CONTRASEÑA)
router.put('/:id/cambiar-password', async (req, res) => {
  const { nuevaPassword } = req.body;
  if (!nuevaPassword) {
    return res.status(400).send('Falta la nueva contraseña');
  }
  if (!validarPassword(nuevaPassword)) {
    return res.status(400).send('La contraseña debe tener entre 8 y 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.');
  }
  try {
    // Consulta la última contraseña usada por el usuario
    const passHist = await db.query(
      `SELECT pass_ult FROM pass_historica WHERE id_usuario = $1 ORDER BY fecha_cambio DESC LIMIT 1`,
      [req.params.id]
    );
    if (passHist.rows.length > 0) {
      const ultimaPassword = passHist.rows[0].pass_ult;
      if (nuevaPassword === ultimaPassword) {
        // DEVOLVER EL MENSAJE DE CONTRASEÑA ANTERIOR EN CASO DE PONER CONTRASEÑA ANTERIOR CUEK
        return res.status(400).send('Esta contraseña es la misma a la anterior, ingresa una nueva.');
      }
    }
    await db.query('UPDATE usuarios SET pass = $1 WHERE id_usuario = $2', [nuevaPassword, req.params.id]);
    await db.query(
      'INSERT INTO pass_historica (id_usuario, pass_ult, fecha_cambio) VALUES ($1, $2, NOW())',
      [req.params.id, nuevaPassword]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Error en cambiar-password:', err);
    res.status(500).send('Error cambiando la contraseña');
  }
});

router.get('/logout', async (req,res) =>{
  
})
module.exports = router;