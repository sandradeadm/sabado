const express = require('express');
const router = express.Router();
const controller = require('../controller/materias.controller.js');

router.get('/', controller.obtenerMaterias);
router.post('/', controller.crearMateria);
router.put('/:id', controller.actualizarMateria);
router.delete('/:id', controller.eliminarMateria);
router.get('/:id', controller.obtenerMateriaPorId);

module.exports = router;