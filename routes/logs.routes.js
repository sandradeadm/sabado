const express = require('express');
const router = express.Router();
const controller = require('../controller/logs.controller.js');
    

router.get('/', controller.obternerLogs);
router.get('/ultimos', controller.ultimosLogs);
router.post('/', controller.hacerLog);

module.exports = router;