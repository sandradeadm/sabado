const repo = require('../repositories/tutor.repository');

async function buscarTutores(dni) {
    const result = await repo.buscarTutor(dni);
    return result;
}

async function obtenerTutores() {
    return await repo.obtenerTutores();
}

module.exports = { buscarTutores, obtenerTutores };
