const services = require('../service/alumnos.service.js');

async function listarAlumnos(req, res) {
  const { anio, division } = req.query; 
    try {
        const result = await services.obtenerAlumnos(anio, division);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener alumnos' });
    }
}

async function buscarAlumno(req, res) {
    const { dni } = req.query;
    try {
        const result = await services.buscarAlumnoPorDni(dni);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar alumno' });
    }
}

// NUEVO: Búsqueda avanzada (DNI, Legajo, Nombre, Apellido, DNI Tutor)
async function buscarAlumnoAvanzado(req, res) {
    const { q } = req.query;
    try {
        if (!q) {
            return res.status(400).json({ error: 'Parámetro de búsqueda requerido' });
        }
        const result = await services.buscarAlumnoAvanzado(q);
        res.json(result || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar alumno' });
    }
}

async function crearAlumnoyTutor(req, res) {
    try {
        const data = req.body;
        
        const message = await services.crearAlumnoyTutor(data);
        res.status(201).json(message);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar alumno y tutor' });

    }
}

async function actualizarAlumnoyTutor(req, res) {
    try {
       const data = req.body;
        const message = await services.actualizarAlumnoyTutor(data);
        res.json(message);
        } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar alumno y tutor' });
    }
}

module.exports = {
    listarAlumnos,
    buscarAlumno, 
    buscarAlumnoAvanzado,  
    crearAlumnoyTutor, 
    actualizarAlumnoyTutor,
}