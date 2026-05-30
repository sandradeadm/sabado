const express = require('express');
const router = express.Router();
const db = require('../dbUsers');

// GET /api/logs?search=...&fechaInicio=...&fechaFin=...&limit=...&page=...
router.get('/', async (req, res) => {
  try {
    const { search = '', fechaInicio = '', fechaFin = '', limit = 10, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let countSql = `
      SELECT COUNT(*) AS total
      FROM logs l
      LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
      LEFT JOIN operaciones o ON l.id_operacion = o.id_operacion
      WHERE 1=1
    `;
    let dataSql = `
      SELECT 
        l.hora_y_fecha,
        u.nombre AS usuario,
        o.descripcion AS operacion,
        l.detalle,
        l.ip,
        l.mac,
        l.usuario_afectado
      FROM logs l
      LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
      LEFT JOIN operaciones o ON l.id_operacion = o.id_operacion
      WHERE 1=1
    `;
    const params = [];
    const paramsCount = [];
    let paramIndex = 1;

    // Filtros para búsqueda y fechas
    if (search) {
      const cond = `
        AND (
          u.nombre ILIKE $${paramIndex} OR
          o.descripcion ILIKE $${paramIndex + 1} OR
          l.detalle ILIKE $${paramIndex + 2} OR
          l.usuario_afectado ILIKE $${paramIndex + 3}
        )
      `;
      countSql += cond;
      dataSql += cond;
      const s = `%${search}%`;
      params.push(s, s, s, s);
      paramsCount.push(s, s, s, s);
      paramIndex += 4;
    }
    if (fechaInicio) {
      const cond = ` AND DATE(l.hora_y_fecha) >= $${paramIndex}`;
      countSql += cond;
      dataSql += cond;
      params.push(fechaInicio);
      paramsCount.push(fechaInicio);
      paramIndex++;
    }
    if (fechaFin) {
      const cond = ` AND DATE(l.hora_y_fecha) <= $${paramIndex}`;
      countSql += cond;
      dataSql += cond;
      params.push(fechaFin);
      paramsCount.push(fechaFin);
      paramIndex++;
    }

    dataSql += ` ORDER BY l.hora_y_fecha DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), Number(offset));

    const countResult = await db.query(countSql, paramsCount);
    const total = Number(countResult.rows ? countResult.rows[0].total : countResult[0].total);

    const dataResult = await db.query(dataSql, params);

    res.json({
      logs: dataResult.rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error en /api/logs:', err);
    res.status(500).json({ error: 'Error al obtener los logs.' });
  }
});

// GET /api/logs/ultimos (devuelve los últimos 4 logs para "Actividad Reciente")
router.get('/ultimos', async (req, res) => {
  try {
    const dataSql = `
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
    `;
    const result = await db.query(dataSql, []);
    // Retornamos los logs en formato esperado por el frontend
    res.json(
      result.rows.map(log => ({
        fecha: log.hora_y_fecha,
        usuario: log.usuario,
        accion: log.operacion,
        detalle: log.detalle,
        usuario_afectado: log.usuario_afectado
      }))
    );
  } catch (err) {
    console.error('Error en /api/logs/ultimos:', err);
    res.status(500).json({ error: 'Error al obtener los últimos logs.' });
  }
});

// POST /api/logs
router.post('/', async (req, res) => {
  try {
    const { id_operacion, id_usuario, detalle, ip, usuario_afectado } = req.body;
    await db.query(`
      INSERT INTO logs (id_operacion, hora_y_fecha, id_usuario, mac, ip, detalle, usuario_afectado)
      VALUES ($1, NOW(), $2, NULL, $3, $4, $5)
    `, [id_operacion, id_usuario, ip || null, detalle, usuario_afectado || null]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error al insertar log:', err);
    res.status(500).json({ error: 'Error al insertar log.' });
  }
});

module.exports = router;