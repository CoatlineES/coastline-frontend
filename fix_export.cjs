const fs = require('fs');
const path = 'src/utils/exportProjectsListToExcel.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Update translateStatus and remove translatePhase
const newStatusFn = `const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    'AWARDED': 'Adjudicado',
    'IN_PROGRESS': 'En ejecución',
    'COMPLETED': 'Ejecutado',
    'INVOICED': 'Facturado',
    'CLOSED': 'Cerrado',
    'CANCELLED': 'Cancelado',
  };
  return map[status] || status;
};`;

content = content.replace(/const translateStatus = \(status: string\) => \{[\s\S]*?return map\[status\] \|\| status;\r?\n\};\r?\n\r?\nconst translatePhase = \(phase: string\) => \{[\s\S]*?return map\[phase\] \|\| phase;\r?\n\};/, newStatusFn);

// 2. Update byStatus dict and rows
content = content.replace(/const byStatus: Record<string, number> = \{ 'Activo': 0, 'Completado': 0, 'Cancelado': 0 \};/, "const byStatus: Record<string, number> = { 'Adjudicado': 0, 'En ejecución': 0, 'Ejecutado': 0, 'Facturado': 0, 'Cerrado': 0, 'Cancelado': 0 };");
content = content.replace(/summarySheet\.addRow\(\['Activos:', byStatus\['Activo'\]\]\);\r?\n\s*summarySheet\.addRow\(\['Completados:', byStatus\['Completado'\]\]\);\r?\n\s*summarySheet\.addRow\(\['Cancelados:', byStatus\['Cancelado'\]\]\);/, `  summarySheet.addRow(['Adjudicados:', byStatus['Adjudicado']]);
  summarySheet.addRow(['En ejecución:', byStatus['En ejecución']]);
  summarySheet.addRow(['Ejecutados:', byStatus['Ejecutado']]);
  summarySheet.addRow(['Facturados:', byStatus['Facturado']]);
  summarySheet.addRow(['Cerrados:', byStatus['Cerrado']]);
  summarySheet.addRow(['Cancelados:', byStatus['Cancelado']]);`);

// Adjust row styles
content = content.replace(/\[5,6,7,8, 12,13,14, 17,18\]\.forEach/g, "[5,6,7,8, 12,13,14,15,16,17, 20,21].forEach");
content = content.replace(/summarySheet\.getRow\(16\)/, "summarySheet.getRow(19)");
content = content.replace(/summarySheet\.getCell\('A16'\)/g, "summarySheet.getCell('A19')");
content = content.replace(/summarySheet\.mergeCells\('A16:B16'\)/, "summarySheet.mergeCells('A19:B19')");

// 3. Remove 'FASE OPERATIVA' column from both header arrays
content = content.replace(/'FASE OPERATIVA',\r?\n\s*/g, "");

// 4. Remove translatePhase(p.operationalPhase) from data push
content = content.replace(/translatePhase\(p\.operationalPhase\),\r?\n\s*/g, "");

// 5. Adjust column widths
content = content.replace(/sheet\.getColumn\(11\)\.width = 25;\r?\n\s*sheet\.getColumn\(12\)\.width = 20;/g, ""); // Remove the last two first
content = content.replace(/sheet\.getColumn\(3\)\.width = 25;/g, ""); // Phase column

fs.writeFileSync(path, content, 'utf8');
