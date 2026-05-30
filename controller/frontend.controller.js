const service = require('../service/frontend.service.js');

renderizarInicio = async (req, res) => 
{
    try {

        const data = await service.renderizarInicio();
        
        return res.json(data);
    } catch (error) {
        console.error('Error al renderizar la página de inicio:', error);
        res.status(500).send('Error al renderizar la página de inicio');
    }
}

module.exports = {
    renderizarInicio
}