const db = require('../dbDatos');

exports.eliminarMateria = async (id) => {
    const result = await db.query(
        'DELETE FROM materia WHERE id_materia = $1 RETURNING *;',
        [id]
    );
    return result.rows[0];
}

exports.actualizarMateria = async (id, materia, client) => {
    const { nombre_materia, idCurso } = materia;

    const result = await client.query(
        'UPDATE materia SET nombre_materia = $2, id_curso = $3 WHERE id_materia = $1 RETURNING *;',
        [id, nombre_materia, idCurso]
    );
    return result.rows[0];
}

exports.crearMateria = async (materia, client) => {

    const { nombre_materia, idCurso } = materia;
    
    const result = await client.query(
        'INSERT INTO materia (nombre_materia, id_curso) VALUES ($1, $2) RETURNING *;',
        [nombre_materia, idCurso]
    );
    return result.rows[0];
}

exports.existeMateria = async (idMateria) => {
  const result = await db.query(`
     SELECT EXISTS (
       SELECT 1
       FROM materia
       WHERE id_materia = $1
       );
    `, [idMateria]);
    return result.rows[0].exists;
}

exports.obtenerMaterias = async () => {
    const { rows } = await db.query(`SELECT 
    m.id_materia,
    m.nombre_materia,
    json_agg(
        json_build_object(
            'id_profesor', p.id_profesor,
            'nombre', p.nombre,
            'apellido', p.apellido,
            'rol', mp.rol_profesor
        )
    ) AS profesores
FROM materia m
LEFT JOIN materia_profesores mp 
    ON m.id_materia = mp.id_materia
LEFT JOIN profesores p 
    ON mp.id_profesor = p.id_profesor
GROUP BY m.id_materia;`);
    return rows;
}

exports.obtenerMateriaPorId = async (id) => {
    const result = await db.query(`SELECT 
    m.id_materia,
    m.nombre_materia, 
    json_agg(
        json_build_object(
            'id_profesor', p.id_profesor,
            'nombre', p.nombre,
            'apellido', p.apellido,
            'rol', mp.rol_profesor
        )
    ) AS profesores
FROM materia m 
LEFT JOIN materia_profesores mp 
    ON m.id_materia = mp.id_materia
LEFT JOIN profesores p 
    ON mp.id_profesor = p.id_profesor
WHERE m.id_materia = $1
GROUP BY m.id_materia;`, [id]);
    return result.rows[0];
}

exports.relacionarMateriaProfesor = async (id, profe, client) => {
    const { profesorId, rolProfesor } = profe;
    console.log(profe);
    
    
    const result = await client.query(
        'INSERT INTO materia_profesores (id_materia, id_profesor, rol_profesor) VALUES ($1, $2, $3) RETURNING *;',
        [id, profesorId, rolProfesor]
    );
    return result.rows[0];
}

// exports.actualizarRelacionMateriaProfesor = async (idMateria, idProfesor, rolProfesor) => {
//     const result = await db.query(
//         'UPDATE materia_profesores SET rol_profesor = $3 WHERE id_materia = $1 AND id_profesor = $2 RETURNING *;',
//         [idMateria, idProfesor, rolProfesor]
//     );
//     return result.rows[0];
// }

exports.eliminarRelacionMateriaProfesor = async (id, client) => {
    const result = await client.query('DELETE FROM materia_profesores WHERE id_materia = $1  RETURNING *;',
        [id]
    );
    return result.rows[0];
}