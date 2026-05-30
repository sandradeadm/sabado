const express = require('express');
const router = express.Router();
const controller = require('../controller/alumnos.controller.js');

router.get('/', controller.listarAlumnos);

router.get('/buscar', controller.buscarAlumno);

router.get('/buscar-avanzado', controller.buscarAlumnoAvanzado);  

router.post('/', controller.crearAlumnoyTutor);

router.put('/:id', controller.actualizarAlumnoyTutor);

// TODO route para eliminar un alumno y su tutor

module.exports = router;