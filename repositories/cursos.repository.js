const db = require('../dbDatos');

cursoIndividual = async (id) => {
  const { rows } = await db.query(`
    SELECT 
      c.*,
      p.id_plan,
      p.nombre_plan,
      p.descripcion AS descripcion
    FROM curso c
    LEFT JOIN plan p ON c.id_plan = p.id_plan
    WHERE c.id_curso = $1
  `, [id]);
  return rows[0];
}

async function materiasPorCurso(idCurso) {
const result = await db.query(
      `SELECT *
       FROM materia
       WHERE id_curso = $1`,
      [idCurso]
    );
    return result.rows;
}

async function obternerCursos() {

  const result =  db.query(`
      SELECT 
        c.*, p.id_plan, p.nombre_plan AS nombre_plan, p.descripcion AS plan_descripcion
      FROM curso c
      LEFT JOIN plan p ON c.id_plan = p.id_plan
      ORDER BY c.id_curso ASC;
    `);
  
    return result;

}

async function crearCurso(anio, division, id_plan, anio_lectivo) {

  const { rows } = await db.query(`INSERT INTO curso (anio, division, id_plan, anio_lectivo) VALUES ($1, $2, $3, $4) RETURNING *`,
    [anio, division, id_plan, anio_lectivo]);
  return rows[0];
}

async function alumnosPorCurso(idCurso) {
  const { rows } = await db.query(`
    SELECT c.id_curso, c.anio, c.division, c.anio_lectivo,
           a.id_alumno, a.legajo, a.nombre, a.apellido, a.dni
    FROM curso c
    LEFT JOIN alumno_curso ac ON ac.id_curso = c.id_curso
    LEFT JOIN alumno a ON a.id_alumno = ac.id_alumno
    WHERE c.id_curso = $1
    ORDER BY a.apellido NULLS LAST, a.nombre NULLS LAST;
  `, [idCurso]);

  return rows;
}
async function findCursoExistente(anioLectivo, anio, division) {

  return db.query(`
     SELECT EXISTS (
       SELECT 1
       FROM curso
       WHERE anio_lectivo = $1
       AND anio = $2
       AND division = $3
       );
    `, [anioLectivo, anio, division]);

}

async function cursoDuplicado(anioLectivo, anio, division, idCurso) {
  const { rows } = await db.query(`
     SELECT EXISTS (
       SELECT 1
       FROM curso
       WHERE anio_lectivo = $1
       AND anio = $2
       AND division = $3
       AND id_curso <> $4
       );
    `, [anioLectivo, anio, division, idCurso]);
  return rows[0].exists;
}

async function actualizarCurso(idCurso, anio, division, idPlan, anioLectivo) {
  const { rows } = await db.query(`
    UPDATE curso
    SET anio = $2,
        division = $3,
        id_plan = $4,
        anio_lectivo = $5
    WHERE id_curso = $1
    RETURNING *
  `, [idCurso, anio, division, idPlan, anioLectivo]);
  return rows[0];
}

async function safeDelete(text, values) {
  try {
    await db.query(text, values);
  } catch (error) {
    if (error && (error.code === '42P01' || error.code === '42703')) {
      return;
    }
    throw error;
  }
}

async function eliminarCurso(idCurso) {
  await safeDelete('DELETE FROM alumno_curso WHERE id_curso = $1', [idCurso]);
  await safeDelete('DELETE FROM materia WHERE id_curso = $1', [idCurso]);
  const { rows } = await db.query('DELETE FROM curso WHERE id_curso = $1 RETURNING *', [idCurso]);
  return rows[0];
}

asignarCurso = async (idAlumno, idCurso) => {
  const result = await db.query(`
    INSERT INTO alumno_curso (id_alumno, id_curso)
    VALUES ($1, $2)
    RETURNING *;
  `, [idAlumno, idCurso]);

  return result.rows[0];
}

alumnoYaAsignado = async (idAlumno, idCurso) => {
  return db.query(`
    SELECT EXISTS (
      SELECT 1
      FROM alumno_curso
      WHERE id_alumno = $1
    );
  `, [idAlumno]);
}

cursoDeAlumno = async (idAlumno) => {
  return db.query(`
    SELECT c.*
    FROM curso c
    JOIN alumno_curso ac ON ac.id_curso = c.id_curso
    WHERE ac.id_alumno = $1
  `, [idAlumno]);
}

module.exports = {
  obternerCursos,
  crearCurso,
  alumnosPorCurso,
  findCursoExistente,
  cursoDuplicado,
  actualizarCurso,
  eliminarCurso,
  asignarCurso,
  alumnoYaAsignado,
  cursoDeAlumno,
  cursoIndividual,
  materiasPorCurso
}
