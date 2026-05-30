const ExcelJS = require('exceljs');

async function hacerExcel({
    res,
    sheetName,
    fileName,
    columns,
    data
}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = columns;

    worksheet.getRow(1).font = { bold: true };

    data.forEach(row => worksheet.addRow(row));

    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
    );

    await workbook.xlsx.write(res);

    res.end();
}

module.exports = { hacerExcel };
