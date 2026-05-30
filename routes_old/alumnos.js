const express = require('express');
const router = express.Router();
const pool = require('../dbDatos');



router.get('/', async (req, res) => {
  const { anio, division } = req.query;

  try {
    let query = `
      SELECT 
        a.*, 
        t.id_tutor, t.nombre AS tutor_nombre, t.apellido AS tutor_apellido,
        t.dni AS tutor_dni, t.cuil AS tutor_cuil, t.telefono AS tutor_telefono,
        t.email AS tutor_email, t.direccion AS tutor_direccion,
        c.anio, c.division, c.anio_lectivo
      FROM alumno a
      LEFT JOIN alumno_tutor at ON a.id_alumno = at.id_alumno
      LEFT JOIN tutor t ON at.id_tutor = t.id_tutor
      LEFT JOIN alumno_curso ac ON a.id_alumno = ac.id_alumno
      LEFT JOIN curso c ON ac.id_curso = c.id_curso
      WHERE c.anio_lectivo = TO_CHAR(CURRENT_DATE, 'YYYY')
    `;

    if (anio) query += ` AND c.anio = '${anio}'`;
    if (division) query += ` AND c.division = '${division}'`;

    query += ' ORDER BY a.id_alumno ASC';

    const resultado = await pool.query(query);
    res.json(resultado.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
});


// Buscar alumno por DNI y Apellido
router.get('/buscar', async (req, res) => {
  const { dni } = req.query;  // solo necesitamos el DNI

  if (!dni) {
    return res.status(400).json({ error: "Se requiere el DNI para la búsqueda" });
  }

  try {
    const resultado = await pool.query(`
      SELECT 
        a.*, t.id_tutor, t.nombre AS tutor_nombre, t.apellido AS tutor_apellido,
        t.dni AS tutor_dni, t.cuil AS tutor_cuil, t.telefono AS tutor_telefono,
        t.email AS tutor_email, t.direccion AS tutor_direccion
      FROM alumno a
      LEFT JOIN alumno_tutor at ON a.id_alumno = at.id_alumno
      LEFT JOIN tutor t ON at.id_tutor = t.id_tutor
      WHERE a.dni = $1
    `, [dni]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    res.json(resultado.rows[0]); // devuelve solo un alumno
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar alumno" });
  }
});

//Crear nuevo alumno junto a su tutor
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { 
      legajo, nombre, apellido, dni, cuil,
      email, direccion, link_docu, hermanos, fecha_nacimiento,
      tutor_nombre, tutor_apellido, tutor_dni, tutor_cuil, tutor_telefono,
      tutor_email, tutor_direccion
    } = req.body;

    // 1. Buscar tutor existente por DNI
    let tutorResult = await client.query(
      `SELECT id_tutor FROM tutor WHERE dni = $1`,
      [tutor_dni]
    );

    let id_tutor;
    if (tutorResult.rows.length > 0) {
      id_tutor = tutorResult.rows[0].id_tutor;
    } else {
      // Insertar tutor si no existe
      const nuevoTutor = await client.query(`
        INSERT INTO tutor (nombre, apellido, dni, cuil, telefono, email, direccion)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id_tutor
      `, [tutor_nombre, tutor_apellido, tutor_dni, tutor_cuil, tutor_telefono, tutor_email, tutor_direccion]);

      id_tutor = nuevoTutor.rows[0].id_tutor;
    }

    // 2. Insertar alumno
    const nuevoAlumno = await client.query(`
      INSERT INTO alumno (legajo, nombre, apellido, dni, cuil, email, direccion, link_docu, hermanos, fecha_nacimiento)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id_alumno
    `, [legajo, nombre, apellido, dni, cuil, email, direccion, link_docu, hermanos, fecha_nacimiento]);

    const id_alumno = nuevoAlumno.rows[0].id_alumno;

    // 3. Relacionar en alumno_tutor
    await client.query(`
      INSERT INTO alumno_tutor (id_alumno, id_tutor)
      VALUES ($1, $2)
    `, [id_alumno, id_tutor]);

    await client.query('COMMIT');
    res.status(201).json({ message: "Alumno y tutor insertados con éxito" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error al insertar alumno/tutor:", error);
    res.status(500).json({ error: "Error al insertar alumno y tutor" });
  } finally {
    client.release();
  }
});


router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      legajo, nombre, apellido, dni, cuil,
      email, direccion, link_docu, hermanos, fecha_nacimiento,
      tutor_nombre, tutor_apellido, tutor_dni, tutor_cuil, tutor_telefono,
      tutor_email, tutor_direccion, id_tutor
    } = req.body;

    const id_alumno = req.params.id;

    // Actualizar alumno
    await client.query(`
      UPDATE alumno SET
        legajo=$1, nombre=$2, apellido=$3, dni=$4, cuil=$5,
        email=$6, direccion=$7, link_docu=$8, hermanos=$9, fecha_nacimiento=$10
      WHERE id_alumno=$11
    `, [legajo, nombre, apellido, dni, cuil, email, direccion, link_docu, hermanos, fecha_nacimiento, id_alumno]);

    // Actualizar tutor
    if (id_tutor) {
      await client.query(`
        UPDATE tutor SET
          nombre=$1, apellido=$2, dni=$3, cuil=$4,
          telefono=$5, email=$6, direccion=$7
        WHERE id_tutor=$8
      `, [tutor_nombre, tutor_apellido, tutor_dni, tutor_cuil, tutor_telefono, tutor_email, tutor_direccion, id_tutor]);
    }

    await client.query('COMMIT');
    res.json({ message: "Alumno actualizado correctamente" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error al actualizar alumno/tutor:", error);
    res.status(500).json({ error: "Error al actualizar alumno/tutor" });
  } finally {
    client.release();
  }
});




module.exports = router;