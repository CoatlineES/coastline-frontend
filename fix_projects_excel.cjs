const fs = require('fs');

const path = 'src/utils/exportProjectsListToExcel.ts';
const content = `import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Project } from '../services/types';

const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    'ACTIVE': 'Activo',
    'COMPLETED': 'Completado',
    'CANCELLED': 'Cancelado',
  };
  return map[status] || status;
};

const translatePhase = (phase: string) => {
  const map: Record<string, string> = {
    'PENDING_PLANNING': 'Pdte. Planificaci\u00F3n',
    'CONSTRUCTION_PLANNING': 'En Planificaci\u00F3n',
    'INSPECTION_DONE': 'Inspeccionado',
    'COMPLETION': 'Finalizaci\u00F3n',
    'CERT_INVOICING': 'Certif. y Facturaci\u00F3n'
  };
  return map[phase] || phase;
};

export const exportProjectsListToExcel = async (projects: Project[], filtersInfo: string) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Coastline CRM';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Proyectos');

  // Title
  sheet.mergeCells('A1:L1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'LISTADO DE PROYECTOS';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Filters
  sheet.mergeCells('A2:L2');
  sheet.getCell('A2').value = \`Filtros: \${filtersInfo || 'Ninguno'}\`;
  sheet.getCell('A2').font = { italic: true, color: { argb: 'FF666666' } };

  // Header
  sheet.getRow(4).values = [
    'PROYECTO',
    'ESTADO',
    'FASE OPERATIVA',
    'EMPRESA',
    'CIUDAD',
    'MONTO COTIZADO',
    'MONTO CERTIFICADO',
    'MONTO FACTURADO',
    'INICIO PLANIFICADO',
    'FIN PLANIFICADO',
    'LÍNEA DE NEGOCIO',
    'TIPO'
  ];

  const headerRow = sheet.getRow(4);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;

  // Data
  projects.forEach((p) => {
    const row = sheet.addRow([
      p.name,
      translateStatus(p.status),
      translatePhase(p.operationalPhase),
      (p as any).account?.name || 'Sin Empresa',
      p.city || '-',
      p.quotedAmount || 0,
      p.certifiedAmount || 0,
      p.invoicedAmount || 0,
      p.plannedStart ? new Date(p.plannedStart).toLocaleDateString('es-ES') : '-',
      p.plannedEnd ? new Date(p.plannedEnd).toLocaleDateString('es-ES') : '-',
      (p as any).businessLine?.name || '-',
      p.projectOrigin === 'DEMO' ? 'Demo/Plantilla' : 'Real'
    ]);

    row.getCell(6).numFmt = '#,##0.00" \u20AC"';
    row.getCell(7).numFmt = '#,##0.00" \u20AC"';
    row.getCell(8).numFmt = '#,##0.00" \u20AC"';
  });

  // Widths
  sheet.getColumn(1).width = 35;
  sheet.getColumn(2).width = 15;
  sheet.getColumn(3).width = 25;
  sheet.getColumn(4).width = 30;
  sheet.getColumn(5).width = 20;
  sheet.getColumn(6).width = 20;
  sheet.getColumn(7).width = 20;
  sheet.getColumn(8).width = 20;
  sheet.getColumn(9).width = 20;
  sheet.getColumn(10).width = 20;
  sheet.getColumn(11).width = 25;
  sheet.getColumn(12).width = 20;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, \`Listado_Proyectos_\${new Date().toISOString().split('T')[0]}.xlsx\`);
};
`;

fs.writeFileSync(path, content, 'utf8');
console.log("Created exportProjectsListToExcel.ts");

// Replace usage in ProjectsView.tsx
const viewPath = 'src/views/employee/projects/ProjectsView.tsx';
let view = fs.readFileSync(viewPath, 'utf8');
view = view.replace(/exportProjectsKpiToExcel/g, 'exportProjectsListToExcel');
view = view.replace(/exportProjectsKpiReport/g, 'exportProjectsListToExcel');
fs.writeFileSync(viewPath, view, 'utf8');
console.log("Updated ProjectsView.tsx");
