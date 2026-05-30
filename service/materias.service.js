const repo = require('../repositories/materias.repository.js');
const pool = require('../dbDatos.js');


exports.crearMateria = async (materia, profesores) => {
    const client = await pool.connect();
    try {
        
    await client.query('BEGIN');
    const materiaCreada = await repo.crearMateria(materia, client);
    
    for (const profe of profesores) {
        await repo.relacionarMateriaProfesor(materiaCreada.id_materia, profe, client);
    }
    await client.query('COMMIT');
    return { message: 'Materia creada con éxito ', materiaCreada };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

exports.actualizarMateria = async (materia, profesores, Id) => {

    const existe = await repo.existeMateria(Id);
    
    if (!existe) {
        throw new Error('La materia no existe');
    }
    const client = await pool.connect();
    try {
        
    await client.query('BEGIN');
    await repo.eliminarRelacionMateriaProfesor(Id, client);

    const materiaCreada = await repo.actualizarMateria(Id, materia, client);
    
    for (const profe of profesores) {
        
        await repo.relacionarMateriaProfesor(materiaCreada.id_materia, profe, client); 
    }
    await client.query('COMMIT');
    return { message: 'Materia actualizada con éxito ', materiaCreada };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

exports.eliminarMateria = async (id) => {
    const existe = await repo.existeMateria(id);
    
    if (!existe) {
        throw new Error('La materia no existe');
    }
    return await repo.eliminarMateria(id);
} 

exports.obtenerMaterias = async () => {
    return await repo.obtenerMaterias();
}   

exports.obtenerMateriaPorId = async (id) => {
    const existe = await repo.existeMateria(id);
    if (!existe) {
        throw new Error('La materia no existe');
    }
    return await repo.obtenerMateriaPorId(id);
}