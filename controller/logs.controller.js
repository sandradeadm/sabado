const service = require('../service/logs.service.js');

async function obternerLogs(req, res) {
    try {
        const { search = '', fechaInicio = '', fechaFin = '', limit = 10, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        const result = await service.obtenerLogs(search, fechaInicio, fechaFin, limit, offset);

        res.json({
            logs: result.rows,
            total: result.total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(result.total / limit)
        });
        
    } catch (error) {

        console.error('Error en /api/logs:', error);
        res.status(500).json({ error: 'Error al obtener los logs.' });
        
    }

}

async function hacerLog(req, res) {

    try {
        const { id_operacion, id_usuario, detalle, ip, usuario_afectado } = req.body;
        await service.registrarLog(id_operacion, id_usuario, detalle, ip, usuario_afectado);
        res.json(200);

    } catch (error) {

        console.error('Error al insertar log:', error);
        res.status(500).json({ error: 'Error al insertar log.' });
    
    }
}

async function ultimosLogs(req, res) {

    try {
        
        const result = await service.ultimosLogs();
        res.json(
            result.rows.map(log => ({
                fecha: log.hora_y_fecha,
                usuario: log.usuario,
                accion: log.operacion,
                detalle: log.detalle,
                usuario_afectado: log.usuario_afectado
            }))
      
        );
    } catch (error) {
        
        console.error('Error en el endpoint de logs', error);
        res.status(500).json({ error: 'Error al obtener los últimos logs.' });

    }
}

module.exports = { hacerLog, ultimosLogs, obternerLogs }