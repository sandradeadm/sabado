const service = require('../service/profe.service.js');
const { hacerExcel } = require('../service/excel.service.js');
const ExcelJS = require('exceljs');



exports.obtenerProfesores = async (req, res) => {
    try {
        const profesores = await service.obtenerProfesores();
        // await service.excelProfe(profesores);
        res.json(profesores);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener profesores' });
        console.error('Error al obtener profesores:', error);   
    }
};

exports.crearProfesor = async (req, res) => {
    try {
        const nuevoProfesor = await service.crearProfesor(req.body);        
        res.status(201).json(nuevoProfesor);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear profesor' });
        console.error('Error al obtener profesores:', error);   

    }
};

exports.actualizarProfesor = async (req, res) => {
    try {
        const profesorActualizado = await service.actualizarProfesor(req.params.id, req.body);
        res.json(profesorActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar profesor' });
        console.error('Error al actualizar profesor:', error);
    }
};

exports.eliminarProfesor = async (req, res) => {
    try {
        const eliminado = await service.eliminarProfesor(req.params.id);
        res.json({ message: 'Profesor eliminado correctamente', eliminado });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar profesor' });
        console.error('Error al eliminar profesor:', error);
    }
};

exports.exportarProfesores = async (req, res) => {
    const profesores = await service.obtenerProfesores();

    await hacerExcel({
        res,
        sheetName: 'Profesores',
        fileName: 'profesores.xlsx',
        columns: [
            { header: 'Nombre', key: 'nombre', width: 20 },
            { header: 'Apellido', key: 'apellido', width: 20 }
        ],
        data: profesores
    });
};
exports.descargarPlantilla = async (req, res) => {
    const empty = [];

    await hacerExcel({
        res,
        sheetName: 'Profesores',
        fileName: 'profesores_plantilla.xlsx',
        columns: [
            { header: 'Nombre', key: 'nombre', width: 20 },
            { header: 'Apellido', key: 'apellido', width: 20 }
        ],
        data: empty
    });
};


exports.importarProfesores = async (req, res) => {
    try {
         const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.getWorksheet(1);

    const profesores = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip headers

        const nombre = row.getCell(1).value;
        const apellido = row.getCell(2).value;

        if (!nombre || !apellido) return;

        profesores.push({
            nombre,
            apellido
        });
    });

    
        data: profesores
    

    await service.bulkInsertProfesores(profesores);
    console.log(profesores);
    
    console.log('todo bien ');
    
    res.json({ message: 'Profesores importados correctamente', count: profesores.length }); 
        
    } catch (error) {
        res.status(500).json({ error: 'Error al importar profesores' });
        console.error('Error al importar profesores:', error);
    }
   
};