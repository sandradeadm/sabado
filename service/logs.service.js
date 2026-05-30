const { json } = require('express');
const repo = require('../repositories/logs.repository');

async function obtenerLogs(search, fechaInicio, fechaFin, limit, offset) {
    const result = await repo.obternerLogs(search, fechaInicio, fechaFin, limit, offset);
    return result;
}

async function registrarLog(idOperacion, idUsuario, detalle, ip, usuariioAfectado){
    await repo.registrarLog(idOperacion, idUsuario, detalle, ip, usuariioAfectado);
}

async function ultimosLogs() {
    const result = await repo.ultimosLogs();
    return result;
}


module.exports = { 
    registrarLog, 
    ultimosLogs,
     obtenerLogs }