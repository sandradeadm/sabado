const express = require('express');
const router = express.Router();
const pool = require('../dbDatos');


router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        c.*, p.id_plan, p.nombre_plan AS nombre_plan, p.descripcion AS plan_descripcion
      FROM curso c
      LEFT JOIN plan p ON c.id_plan = p.id_plan
      ORDER BY c.id_curso ASC;
    `);
    res.json(resultado.rows);
  } catch (error){
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los cursos' });
}
});

router.post('/', async (req, res) => {
  const { anio, division, id_plan, anio_lectivo } = req.body;

  try {
    await pool.query(
      `INSERT INTO curso (anio, division, id_plan, anio_lectivo) VALUES ($1, $2, $3, $4)`,
      [anio, division, id_plan, anio_lectivo]
    );
    res.json({ mensaje: 'Curso insertado correctamente' });
  } catch (error) {
    if (error.code === '23505') {
      // Error de restricción UNIQUE
      res.status(400).json({ error: `El curso ${anio}${division} del año ${anio_lectivo} ya existe.` });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Error al insertar curso' });
    }
  }
});


// GET /alumnos-por-curso?anio=2025&curso=1°1°
router.get('/alumnosCurso', async (req, res) => {
  const { anioLectivo, anio, division } = req.query;
  if (!anioLectivo || !anio || !division) {
    return res.status(400).json({ error: 'Faltan parámetros: anioLectivo, anio y division' });
  }

  try {
    const sql = `
      SELECT a.id_alumno, a.legajo, a.nombre, a.apellido, a.dni,
             c.anio, c.division, c.anio_lectivo
      FROM alumno a
      JOIN alumno_curso ac ON ac.id_alumno = a.id_alumno
      JOIN curso c ON c.id_curso = ac.id_curso
      WHERE c.anio_lectivo = $1
        AND c.anio = $2
        AND c.division = $3
      ORDER BY a.nombre;
    `;
    const r = await pool.query(sql, [anioLectivo, anio, division]);
    res.json(r.rows);
  } catch (e) {
    console.error('Error en /alumnosCurso:', e);
    res.status(500).json({ error: 'Error en la búsqueda' });
  }
});





module.exports = router;