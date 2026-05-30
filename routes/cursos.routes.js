const express = require('express');
const router = express.Router();
const controller = require('../controller/cursos.controller.js');

router.get('/', controller.obtenerCursos);
router.get('/:id/alumnos', controller.alumnosPorCursos);
router.get('/:id', controller.cursoIndividual);
router.put('/:id', controller.actualizarCurso);
router.delete('/:id', controller.eliminarCurso);
router.post('/', controller.crearCursos);
router.post('/asignar-curso', controller.asignarCurso);

router.get('/cursos/:idCurso', controller.materiasPorCurso);

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
