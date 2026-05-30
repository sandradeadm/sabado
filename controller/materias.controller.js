const service = require('../service/materias.service.js');

crearMateria = async (req, res) => {
    try{
        const materia = req.body.materia;
        const profesores = req.body.profesores;
        
        const resultado = await service.crearMateria(materia, profesores);
        res.status(201).json(resultado);
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Error al crear materia'});
    }
}

actualizarMateria = async (req, res) => {
    try{
        // console.log(req);
        const id = req.params.id;
        const materia = req.body.materia;
        const profesores = req.body.profesores;

        const resultado = await service.actualizarMateria(materia, profesores, id);
        res.json(resultado);
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar materia'});
    }
}

eliminarMateria = async (req, res) => {
    try{
        const { id } = req.params;
        const resultado = await service.eliminarMateria(id);
        res.json(resultado);
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar materia'});
    }
}

obtenerMaterias = async (req, res) => {
    try{
        const resultado = await service.obtenerMaterias();
        res.json(resultado);
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener materias'});
    }
}

obtenerMateriaPorId = async (req, res) => {
    try{
        const { id } = req.params;
        const resultado = await service.obtenerMateriaPorId(id);
        res.json(resultado);
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener materia por ID'});
    }
}

module.exports = {
    obtenerMaterias,
    crearMateria,
    actualizarMateria,
    eliminarMateria, 
    obtenerMateriaPorId
}