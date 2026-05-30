const repo = require('../repositories/frontend.repository.js');

renderizarInicio = async (req, res) => {
    try {
        const totalAlumnosResult = await repo.totalAlumnos();
        const totalCursosResult = await repo.totalCursos();
        const totalAlumnos = totalAlumnosResult.rows[0].total_alumnos;
        const totalCursos = totalCursosResult.rows[0].total_cursos;

        const data = {
            totalAlumnos,
            totalCursos
        }
        return data;

    } catch (error) {
        console.error('Error con la obtencion de datos: ', error);
        throw error;
    }
}

module.exports = {
    renderizarInicio
}