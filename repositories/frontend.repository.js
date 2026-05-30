const db = require('../dbDatos');

totalAlumnos = async () => {
    const result = await db.query(`SELECT COUNT(*) AS total_alumnos FROM alumno;`);
    return result;
}

totalCursos = async () => {
    const result = await db.query(`SELECT COUNT(*) AS total_cursos FROM curso;`);
    return result;
}

module.exports = {
    totalAlumnos,
    totalCursos
}