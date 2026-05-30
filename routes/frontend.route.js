const express = require('express');
const router = express.Router();
const controller = require('../controller/frontend.controller.js');

router.get('/inicio', controller.renderizarInicio);

module.exports = router;