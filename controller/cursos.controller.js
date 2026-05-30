const services = require('../service/cursos.service.js');

cursoIndividual = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await services.cursoIndividual(id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

async function obtenerCursos(req, res) {
  try {
    const result = await services.obtenerCursos();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

materiasPorCurso = async (req, res) => {
  const { idCurso } = req.params;
  try {
    const result = await services.materiasPorCurso(idCurso);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

async function crearCursos(req, res) {
  const { anio, division, id_plan, anio_lectivo } = req.body;
  try {
    await services.crearCurso(anio, division, id_plan, anio_lectivo);
    return res.json({ mensaje: 'Curso insertado correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

async function alumnosPorCursos(req, res) {
  const { id } = req.params;
  try {
    const result = await services.alumnosPorCurso(id);
    const { anio, division, anio_lectivo } = result[0];
    res.status(200).json({
      anio,
      division,
      anio_lectivo,
      alumnos: result
        .filter(({ id_alumno }) => id_alumno != null)
        .map(({ id_alumno, legajo, nombre, apellido, dni }) => ({
          id_alumno, legajo, nombre, apellido, dni,
        })),
    });
  } catch (error) {
    if (error.message === 'Curso no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    console.log('Error en /cursos/:id/alumnos:', error);
    res.status(500).json({ error: error.message });
  }
}

actualizarCurso = async (req, res) => {
  const { id } = req.params;
  const { anio, division, id_plan, anio_lectivo } = req.body;
  try {
    const result = await services.actualizarCurso(id, anio, division, id_plan, anio_lectivo);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

eliminarCurso = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await services.eliminarCurso(id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

asignarCurso = async (req, res) => {
  const { idAlumno, idCurso } = req.body;
  try {
    return res.json(await services.asignarCurso(idAlumno, idCurso));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

cursoPorAlumno = async (req, res) => {
  const { idAlumno } = req.params;
  try {
    const result = await services.cursoPorAlumno(idAlumno);
    if (!result) {
      return res.status(404).json({ error: 'El alumno no tiene curso asignado' });
    }
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

// ════════════════════════════════════════════════════════════════
// NUEVO: Alumnos sin curso (tab masiva)
// ════════════════════════════════════════════════════════════════
alumnosSinCurso = async (req, res) => {
  try {
    const result = await services.alumnosSinCurso();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

// ════════════════════════════════════════════════════════════════
// NUEVO: Buscar alumnos sin curso (tab manual) — GET ?q=termino
// ════════════════════════════════════════════════════════════════
buscarAlumnosSinCurso = async (req, res) => {
  const { q } = req.query;
  try {
    const result = await services.buscarAlumnosSinCurso(q || '');
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

// ════════════════════════════════════════════════════════════════
// NUEVO: Asignación masiva
// ════════════════════════════════════════════════════════════════
asignarMasivo = async (req, res) => {
  const { idAlumnos, idCurso } = req.body;
  try {
    if (!Array.isArray(idAlumnos) || !idAlumnos.length) {
      return res.status(400).json({ error: 'No se enviaron alumnos para asignar.' });
    }
    const result = await services.asignarMasivo(idAlumnos, idCurso);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  alumnosPorCursos,
  obtenerCursos,
  crearCursos,
  asignarCurso,
  cursoIndividual,
  materiasPorCurso,
  actualizarCurso,
  eliminarCurso,
  cursoPorAlumno,
  // NUEVOS
  alumnosSinCurso,
  buscarAlumnosSinCurso,
  asignarMasivo,
};