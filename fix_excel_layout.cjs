const fs = require('fs');
const path = 'src/utils/exportProjectsListToExcel.ts';
let content = fs.readFileSync(path, 'utf8');

// I will just replace from "// SecciA3n: Por Estado" to the end of the styles block
const splitToken = `  // Secci`; // This might be SecciA3n or similar
const parts = content.split('  summarySheet.getRow(11).values = [\'PROYECTOS POR ESTADO\'];');

if(parts.length === 2) {
    const newBottom = `  summarySheet.getRow(13).values = ['PROYECTOS POR ESTADO'];
  summarySheet.getCell('A13').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A13').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  summarySheet.mergeCells('A13:B13');

  summarySheet.addRow(['Adjudicados:', byStatus['Adjudicado']]);
  summarySheet.addRow(['En ejecución:', byStatus['En ejecuciA3n'] || byStatus['En ejecución'] || 0]);
  summarySheet.addRow(['Ejecutados:', byStatus['Ejecutado']]);
  summarySheet.addRow(['Facturados:', byStatus['Facturado']]);
  summarySheet.addRow(['Cerrados:', byStatus['Cerrado']]);
  summarySheet.addRow(['Cancelados:', byStatus['Cancelado']]);

  // Sección: Por Tipo
  summarySheet.getRow(22).values = ['PROYECTOS POR TIPO'];
  summarySheet.getCell('A22').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A22').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  summarySheet.mergeCells('A22:B22');

  summarySheet.addRow(['Reales:', byType['Real']]);
  summarySheet.addRow(['Demos / Plantillas:', byType['Demo/Plantilla']]);

  // Estilos de filas
  [5,6,7,8,9,10, 14,15,16,17,18,19, 23,24].forEach(rowIdx => {
    summarySheet.getCell(\`A\${rowIdx}\`).font = { bold: true };
    summarySheet.getCell(\`B\${rowIdx}\`).alignment = { horizontal: 'right' };
    summarySheet.getCell(\`A\${rowIdx}\`).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
    summarySheet.getCell(\`B\${rowIdx}\`).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
  });

  summarySheet.getColumn('A').width = 25;
  summarySheet.getColumn('B').width = 20;

` + parts[1].split(`summarySheet.getColumn('B').width = 20;`)[1];
    
    fs.writeFileSync(path, parts[0] + newBottom, 'utf8');
    console.log("Success");
} else {
    console.log("Could not split");
}
