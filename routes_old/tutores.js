const express = require('express');
const router = express.Router();
const pool = require('../dbDatos');

router.get('/', async (req, res) => {
    try{
        const resultado = await pool.query('SELECT * FROM tutor;');
        res.json(resultado.rows);
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tutores'});
    }
});
router.get('/buscar', async (req, res) => {
  const { dni } = req.query;

  if (!dni) {
    return res.status(400).json({ error: 'Debe proporcionar un DNI de tutor' });
  }

  try {
    const query = `
      SELECT 
        a.id_alumno, a.legajo, a.nombre, a.apellido, a.dni, a.cuil, a.email,
        a.fecha_nacimiento, a.direccion, a.hermanos, a.link_docu,
        t.id_tutor, t.nombre AS tutor_nombre, t.apellido AS tutor_apellido,
        t.dni AS tutor_dni, t.cuil AS tutor_cuil, t.telefono AS tutor_telefono,
        t.email AS tutor_email, t.direccion AS tutor_direccion,
        c.anio, c.division, c.anio_lectivo
      FROM tutor t
      LEFT JOIN alumno_tutor at ON t.id_tutor = at.id_tutor
      LEFT JOIN alumno a ON at.id_alumno = a.id_alumno
      LEFT JOIN alumno_curso ac ON a.id_alumno = ac.id_alumno
      LEFT JOIN curso c ON ac.id_curso = c.id_curso
        AND c.anio_lectivo = EXTRACT(YEAR FROM CURRENT_DATE)::TEXT

      WHERE t.dni = $1
      ORDER BY a.id_alumno ASC
    `;

    const resultado = await pool.query(query, [dni]);
    res.json(resultado.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener alumnos del tutor' });
  }
});


module.exports = router;