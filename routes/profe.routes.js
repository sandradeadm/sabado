const express = require('express');
const router = express.Router();
const controller = require('../controller/profe.controller.js');
const upload = require('../middleware/profe.middleware.js');

router.get('/', controller.obtenerProfesores);
router.post('/', controller.crearProfesor);
router.put('/:id', controller.actualizarProfesor);
router.delete('/:id', controller.eliminarProfesor);

//EXCEL 
router.get('/export', controller.exportarProfesores);
router.get('/plantilla', controller.descargarPlantilla);
router.post(
    '/import',
    upload.single('archivo'),
    controller.importarProfesores
);

module.exports = router;