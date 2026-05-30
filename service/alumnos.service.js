const repo = require("../repositories/alumnos.repository.js");
const pool = require('../dbDatos.js');

async function obtenerAlumnos(anio, division) {
  const result = await repo.obtenerAlumnosAnioDivision(anio, division);
  return result;
}

async function buscarAlumnoPorDni(dni) {
  
  const result = await repo.buscarAlumnoPorDni(dni);
  // console.log(result);

  if (result.length === 0) {
    error: "alumno no encontrado";
  }

  return result;
}

// NUEVO: Búsqueda avanzada por DNI, Legajo, Nombre, Apellido, DNI Tutor
async function buscarAlumnoAvanzado(termino) {
  const result = await repo.buscarAlumnoAvanzado(termino);
  return result;
}

//falta probar si funcina todo bien 
async function crearAlumnoyTutor(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const id_alumno = await repo.crearAlumno(client, data);
    
    const tutorExistente = await repo.encontrarTutor(data.tutor_dni);
    if (tutorExistente > 0 ) {
      const id_tutor = tutorExistente[0].id_tutor;
      await repo.vincularAlumnoTutor(client, id_alumno, id_tutor);
    } else {
      const id_tutor = await repo.crearTutor(client, data);
      await repo.vincularAlumnoTutor(client, id_alumno, id_tutor);
    }
    await client.query("COMMIT");
    return { message: "Alumno y tutor insertados con éxito" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function actualizarAlumnoyTutor(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await repo.actualizarAlumno(client,data);
    await repo.actualizarTutor(client, data);
    await client.query("COMMIT");
    return { message: "Alumno y tutor actualizados con éxito" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}



module.exports = {
  obtenerAlumnos,
  buscarAlumnoPorDni,
  buscarAlumnoAvanzado,  // NUEVO
  crearAlumnoyTutor, 
  actualizarAlumnoyTutor
};