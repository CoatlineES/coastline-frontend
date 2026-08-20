const fs = require('fs');
const path = 'src/utils/exportProjectsListToExcel.ts';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `  summarySheet.addRow(['Total Proyectos:', totalProjects]);
  summarySheet.addRow(['Total Cotizado:', totalQuoted]);
  summarySheet.getCell('B6').numFmt = '#,##0.00" €"';
  summarySheet.addRow(['Total Certificado:', totalCertified]);
  summarySheet.getCell('B7').numFmt = '#,##0.00" €"';
  summarySheet.addRow(['Total Facturado:', totalInvoiced]);
  summarySheet.getCell('B8').numFmt = '#,##0.00" €"';`;

// Note: In the file, the '€' is encoded strangely as ',' or something depending on encoding, so it's safer to use regex.
const regex = /summarySheet\.addRow\(\['Total Proyectos:', totalProjects\]\);[\s\S]*?summarySheet\.getCell\('B8'\)\.numFmt = '#,##0\.00" [^"]*"';/;

const replacement = `  summarySheet.addRow(['Total Proyectos (Todos):', totalProjects]);
  summarySheet.addRow(['Proyectos Reales:', byType['Real']]);
  summarySheet.addRow(['Demos / Plantillas:', byType['Demo/Plantilla']]);
  
  summarySheet.addRow(['Total Cotizado:', totalQuoted]);
  summarySheet.getCell('B8').numFmt = '#,##0.00" €"';
  summarySheet.addRow(['Total Certificado:', totalCertified]);
  summarySheet.getCell('B9').numFmt = '#,##0.00" €"';
  summarySheet.addRow(['Total Facturado:', totalInvoiced]);
  summarySheet.getCell('B10').numFmt = '#,##0.00" €"';`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success");
} else {
    console.log("Regex not found");
}
