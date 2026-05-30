const express = require('express');
const router = express.Router();
const controller = require('../controller/cursos.controller.js');

// ════════════════════════════════════════════════════════════════
// Rutas estáticas — DEBEN ir ANTES de /:id
// ════════════════════════════════════════════════════════════════
router.get('/alumnos-sin-curso',         controller.alumnosSinCurso);
router.get('/alumnos-sin-curso/buscar',  controller.buscarAlumnosSinCurso);
router.get('/alumno/:idAlumno',          controller.cursoPorAlumno);

// ════════════════════════════════════════════════════════════════
// Rutas generales
// ════════════════════════════════════════════════════════════════
router.get('/',  controller.obtenerCursos);
router.post('/', controller.crearCursos);

// ════════════════════════════════════════════════════════════════
// Asignación
// ════════════════════════════════════════════════════════════════
router.post('/asignar-curso',  controller.asignarCurso);
router.post('/asignar-masivo', controller.asignarMasivo);

// ════════════════════════════════════════════════════════════════
// Rutas dinámicas — SIEMPRE al final
// ════════════════════════════════════════════════════════════════
router.get('/:id/alumnos', controller.alumnosPorCursos);
router.get('/:id',         controller.cursoIndividual);
router.put('/:id',         controller.actualizarCurso);
router.delete('/:id',      controller.eliminarCurso);

module.exports = router;
// const express = require('express');
// const router = express.Router();
// const controller = require('../controller/cursos.controller.js');

// router.get('/',controller.obtenerCursos);
// router.post('/',controller.crearCursos);

// router.get('/:id',controller.cursoIndividual);
// router.put('/:id',controller.actualizarCurso);
// router.delete('/:id',controller.eliminarCurso);

// router.get('/:id/alumnos',controller.alumnosPorCursos);
// router.post('/:id/alumnos',controller.asignarCurso);

// router.get('/:id/materias',controller.materiasPorCurso);

// module.exports = router;
