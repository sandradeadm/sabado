const express = require('express');
const router = express.Router();
const controller = require('../controller/tutor.controller.js');

router.get('/', controller.obtenerTutores);
router.get('/buscar', controller.buscarTutor);

module.exports = router;