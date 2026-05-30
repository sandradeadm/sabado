const service = require('../service/tutor.service.js');

async function obtenerTutores(req, res) {
    try {
        const resultado = await service.obtenerTutores();
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tutores' });
    }
}

async function buscarTutor(req, res) {
    const { dni } = req.query;
    // console.log(req);
    
    
    if (!dni) {
        return res.status(400).json({ error: 'Debe proporcionar un DNI de tutor' });
    }
    try {
        const result = await service.buscarTutor(dni);
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }   
}

module.exports = { obtenerTutores, buscarTutor };