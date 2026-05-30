const repo = require('../repositories/cursos.repository.js');

cursoIndividual =  async (id) => {
    const curso = await repo.cursoIndividual(id);
    if (!curso) {
        throw new Error('Curso no encontrado');
    }
    const materias = await repo.materiasPorCurso(id, curso.id_plan);
    return { curso, materias };
}

async function obtenerCursos() {
    
    const { rows } = await repo.obternerCursos();
    return rows ;
}

async function crearCurso(anio, division, id_plan, anio_lectivo) {
    const { rows } = await repo.findCursoExistente(
        anio_lectivo, anio, division,
    );

    if (rows[0].exists) {
        throw new Error(`El curso ${anio}${division} del año ${anio_lectivo} ya existe`);
    }


    await repo.crearCurso(anio, division, id_plan, anio_lectivo);

    return "Curso insertado correctamente";
}

async function alumnosPorCurso(idCurso) {
    const result = await repo.alumnosPorCurso(idCurso);

    if (!result.length) {
        throw new Error('Curso no encontrado');
    }

    return result;
}

async function actualizarCurso(idCurso, anio, division, idPlan, anioLectivo) {
    const curso = await repo.cursoIndividual(idCurso);
    if (!curso) {
        throw new Error('Curso no encontrado');
    }

    const duplicado = await repo.cursoDuplicado(anioLectivo, anio, division, idCurso);
    if (duplicado) {
        throw new Error(`El curso ${anio}${division} del año ${anioLectivo} ya existe`);
    }

    const idPlanFinal = idPlan === "" ? null : idPlan;
    return await repo.actualizarCurso(idCurso, anio, division, idPlanFinal, anioLectivo);
}

async function eliminarCurso(idCurso) {
    const curso = await repo.cursoIndividual(idCurso);
    if (!curso) {
        throw new Error('Curso no encontrado');
    }
    return await repo.eliminarCurso(idCurso);
}


asignarCurso = async (idAlumno, idCurso) => {
    const { rows } = await repo.alumnoYaAsignado(idAlumno, idCurso);

    if (rows[0].exists) {
        throw new Error("El alumno ya esta asignado a un curso");
    }

    const result = await repo.asignarCurso(idAlumno, idCurso);
    console.log(result);
    
    return "Curso asignado correctamente";
}

async function alumnosSinCurso() {
    return await repo.alumnosSinCurso();
}

async function buscarAlumnoSinCurso(termino) {
    if (!termino || termino.trim().length < 2) {
        throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
    }
    return await repo.buscarAlumnoSinCurso(termino.trim());
}

async function asignarCursoMasivo(idAlumnos, idCurso) {
    if (!Array.isArray(idAlumnos) || idAlumnos.length === 0) {
        throw new Error('Debe seleccionar al menos un alumno');
    }
    const curso = await repo.cursoIndividual(idCurso);
    if (!curso) throw new Error('Curso no encontrado');
    return await repo.asignarCursoMasivo(idAlumnos, idCurso);
}

module.exports = {
    obtenerCursos,
    crearCurso,
    alumnosPorCurso,
    asignarCurso,
    asignarCursoMasivo,
    alumnosSinCurso,
    buscarAlumnoSinCurso,
    cursoIndividual,
    actualizarCurso,
    eliminarCurso
}
