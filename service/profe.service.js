const repo = require('../repositories/profe.repository');
const Exjs = require('exceljs');

exports.obtenerProfesores = async () => {
    const result = await repo.obtenerProfesores();
    if (result) {
        return result;
    } else {
        throw new Error('No se encontraron profesores');
    }
};

exports.crearProfesor = async (data) => {
    if (!data.nombre || !data.apellido) {
        throw new Error('Faltan campos obligatorios: nombre y apellido');
    }
    return await repo.crearProfesor(data);
};

exports.actualizarProfesor = async (id, data) => {
    const result = await repo.actualizarProfesor(id, data);
    if (result) {
        return result;
    } else {
        throw new Error('Profesor no encontrado');
    }
};

exports.eliminarProfesor = async (id) => {
    const eliminado = await repo.eliminarProfesor(id);
    if (eliminado) {
        return eliminado;
    } else {
        throw new Error('Profesor no encontrado');
    }
};


// exports.excelProfe = async (profesores) => {
//     const workbook = new Exjs.Workbook();
//     const worksheet = workbook.addWorksheet('Profesores');

//     worksheet.columns = [
//         { header: 'ID Profesor', key: 'id_profesor', width: 20 },
//         { header: 'Nombre', key: 'nombre', width: 20 },
//         { header: 'Apellido', key: 'apellido', width: 20 },
//     ];

//     worksheet.getRow(1).font = {
//         bold: true,
//         color: { argb: 'FFFFFFFF' }
//     };

//     worksheet.getRow(1).fill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: '1F4E78' }
//     };

//     worksheet.getRow(1).alignment = {
//         horizontal: 'center',
//         vertical: 'middle'
//     };

//     profesores.forEach(profesor => {
//         worksheet.addRow({
//             id_profesor: profesor.id_profesor,
//             nombre: profesor.nombre,
//             apellido: profesor.apellido
//         });
//     });

//     worksheet.eachRow((row) => {
//         row.eachCell((cell) => {
//             cell.border = {
//                 top: { style: 'thin' },
//                 left: { style: 'thin' },
//                 bottom: { style: 'thin' },
//                 right: { style: 'thin' }
//             };
//         });
//     });

//     worksheet.views = [
//         { state: 'frozen', ySplit: 1 }
//     ];

//     // Guardar archivo
//     await workbook.xlsx.writeFile('profesores.xlsx');

//     console.log('Excel generado correctamente');
// }
// async function generarExcelProfesores(profesores) {
 
// }

exports.bulkInsertProfesores = async (profesores) => {
    if (!profesores.length) {
        throw new Error('No se proporcionaron profesores para importar');
    }
    await repo.bulkInsertProfesores(profesores);
}