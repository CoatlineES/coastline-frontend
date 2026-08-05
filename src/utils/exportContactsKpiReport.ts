import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportContactsKpiToExcel = async (data: any, filtersInfo: string) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Coastline CRM';
  workbook.created = new Date();

  // ──────────────────────────────────────────────
  // HOJA 1: RESUMEN Y KPIs
  // ──────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('Resumen de Contactos', { views: [{ showGridLines: false }] });
  
  summarySheet.mergeCells('A1:L1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'INFORME DE KPIs POR CONTACTOS, CARGOS Y EMPRESAS';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  
  summarySheet.mergeCells('A2:L2');
  const filterCell = summarySheet.getCell('A2');
  filterCell.value = `Filtros Aplicados: ${filtersInfo || 'Todos'}`;
  filterCell.font = { italic: true, color: { argb: 'FF666666' } };
  filterCell.alignment = { horizontal: 'center' };

  summarySheet.mergeCells('A3:L3');
  const tipCell = summarySheet.getCell('A3');
  tipCell.value = ' 👉  INFORMACIÓN IMPORTANTE: El desglose detallado contacto por contacto se encuentra en la pestaña "Detalle de Contactos"';
  tipCell.font = { bold: true, color: { argb: 'FF0F172A' }, size: 11 };
  tipCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  tipCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(3).height = 25;

  // Calculate global KPIs and breakdowns
  let totalActivities = 0, totalCalls = 0, totalEmails = 0, totalMeetings = 0;
  let totalCompleted = 0;
  let totalPlannedWithDate = 0, totalPlannedWithoutDate = 0;

  const positionsData: Record<string, any> = {};
  const companiesData: Record<string, any> = {};

  data.forEach((contact: any) => {
    totalActivities += contact.totalActivities || 0;
    totalCompleted += contact.completedActivities || 0;
    totalPlannedWithDate += contact.plannedWithDate || 0;
    totalPlannedWithoutDate += contact.plannedWithoutDate || 0;
    totalCalls += contact.breakdown?.calls || 0;
    totalEmails += contact.breakdown?.emails || 0;
    totalMeetings += contact.breakdown?.meetings || 0;

    const pos = contact.position || 'Sin Cargo';
    if (!positionsData[pos]) {
      positionsData[pos] = {
        contactos: 0,
        totalActivities: 0,
        completed: 0,
        plannedWithDate: 0,
        plannedWithoutDate: 0,
        calls: 0,
        emails: 0,
        meetings: 0
      };
    }
    positionsData[pos].contactos++;
    positionsData[pos].totalActivities += contact.totalActivities || 0;
    positionsData[pos].completed += contact.completedActivities || 0;
    positionsData[pos].plannedWithDate += contact.plannedWithDate || 0;
    positionsData[pos].plannedWithoutDate += contact.plannedWithoutDate || 0;
    positionsData[pos].calls += contact.breakdown?.calls || 0;
    positionsData[pos].emails += contact.breakdown?.emails || 0;
    positionsData[pos].meetings += contact.breakdown?.meetings || 0;

    const comp = contact.accountName || 'Desconocida';
    if (!companiesData[comp]) {
      companiesData[comp] = {
        contactos: 0,
        totalActivities: 0,
        completed: 0,
        plannedWithDate: 0,
        plannedWithoutDate: 0,
        calls: 0,
        emails: 0,
        meetings: 0
      };
    }
    companiesData[comp].contactos++;
    companiesData[comp].totalActivities += contact.totalActivities || 0;
    companiesData[comp].completed += contact.completedActivities || 0;
    companiesData[comp].plannedWithDate += contact.plannedWithDate || 0;
    companiesData[comp].plannedWithoutDate += contact.plannedWithoutDate || 0;
    companiesData[comp].calls += contact.breakdown?.calls || 0;
    companiesData[comp].emails += contact.breakdown?.emails || 0;
    companiesData[comp].meetings += contact.breakdown?.meetings || 0;
  });

  // --- SECCIÓN 1: MÉTRICAS GLOBALES ---
  summarySheet.getRow(5).values = ['RESUMEN DE MÉTRICAS GLOBALES'];
  summarySheet.getCell('A5').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  summarySheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.mergeCells('A5:B5');
  summarySheet.getRow(5).height = 25;

  const summaryDataList = [
    ['Total Contactos:', data.length],
    ['Total Actividades:', totalActivities],
    ['Completadas:', totalCompleted],
    ['Planeadas (Con fecha):', totalPlannedWithDate],
    ['Planeadas (Sin fecha):', totalPlannedWithoutDate],
    ['Llamadas:', totalCalls],
    ['Correos:', totalEmails],
    ['Reuniones:', totalMeetings]
  ];

  let currentRow = 6;
  summaryDataList.forEach(item => {
    const row = summarySheet.getRow(currentRow);
    row.getCell(1).value = item[0];
    row.getCell(2).value = item[1];
    
    row.getCell(1).font = { bold: true, color: { argb: 'FF333333' } };
    row.getCell(2).font = { bold: true, color: { argb: 'FF002D5A' } };
    row.getCell(2).alignment = { horizontal: 'right' };
    row.getCell(1).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
    row.getCell(2).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
    
    currentRow++;
  });

  summarySheet.getColumn('A').width = 35;
  summarySheet.getColumn('B').width = 25;

  const renderBreakdownTable = (title: string, dataObj: Record<string, any>, rowStart: number, firstColTitle: string, lastColLabel: string) => {
    let r = rowStart;
    summarySheet.getRow(r).values = [title];
    summarySheet.getCell(`A${r}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    summarySheet.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
    summarySheet.getCell(`A${r}`).alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.mergeCells(`A${r}:I${r}`);
    summarySheet.getRow(r).height = 25;

    r++;
    const headers = [
      firstColTitle, 'CONTACTOS', 'TOTAL ACT.', 'COMPLETADAS', 'PLAN. (FECHA)',
      'PLAN. (S/ FECHA)', 'LLAMADAS', 'CORREOS', 'REUNIONES'
    ];
    
    const headerRow = summarySheet.getRow(r);
    headers.forEach((header, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
      };
    });
    headerRow.height = 35;

    let isAlt = false;
    Object.entries(dataObj)
      .sort((a, b) => b[1].totalActivities - a[1].totalActivities)
      .forEach(([key, sData]) => {
        r++;
        const row = summarySheet.getRow(r);
        row.values = [
          key, sData.contactos, sData.totalActivities, sData.completed,
          sData.plannedWithDate, sData.plannedWithoutDate, sData.calls,
          sData.emails, sData.meetings
        ];
        
        row.getCell(1).font = { bold: true, color: { argb: 'FF333333' } };
        for (let i = 2; i <= 9; i++) {
          row.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
        }
        for (let i = 1; i <= 9; i++) {
          row.getCell(i).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
          if (isAlt) {
            row.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          }
        }
        isAlt = !isAlt;
      });

    // Totals row
    r++;
    const tRow = summarySheet.getRow(r);
    tRow.values = [
      'TOTALES', data.length, totalActivities, totalCompleted,
      totalPlannedWithDate, totalPlannedWithoutDate, totalCalls,
      totalEmails, totalMeetings
    ];
    tRow.getCell(1).font = { bold: true, color: { argb: 'FF002D5A' } };
    tRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    
    for (let i = 2; i <= 9; i++) {
      tRow.getCell(i).font = { bold: true, color: { argb: 'FF002D5A' } };
      tRow.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      tRow.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
    }
    tRow.height = 20;

    return r;
  };

  // --- SECCIÓN 2: DESGLOSE POR CARGO ---
  currentRow += 2;
  currentRow = renderBreakdownTable('DESGLOSE DE ACTIVIDADES POR CARGO', positionsData, currentRow, 'CARGO', 'CARGOS');

  // --- SECCIÓN 3: DESGLOSE POR EMPRESA ---
  currentRow += 3;
  currentRow = renderBreakdownTable('DESGLOSE DE ACTIVIDADES POR EMPRESA', companiesData, currentRow, 'EMPRESA', 'EMPRESAS');

  // Adjust columns for breakdown tables
  summarySheet.getColumn('C').width = 15;
  summarySheet.getColumn('D').width = 15;
  summarySheet.getColumn('E').width = 15;
  summarySheet.getColumn('F').width = 15;
  summarySheet.getColumn('G').width = 15;
  summarySheet.getColumn('H').width = 12;
  summarySheet.getColumn('I').width = 12;

  // ──────────────────────────────────────────────
  // HOJA 2: DETALLE DE CONTACTOS
  // ──────────────────────────────────────────────
  const detailSheet = workbook.addWorksheet('Detalle de Contactos', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  
  detailSheet.columns = [
    { header: 'CONTACTO', key: 'name', width: 30 },
    { header: 'EMAIL', key: 'email', width: 25 },
    { header: 'CARGO', key: 'position', width: 25 },
    { header: 'TELÉFONO', key: 'phone', width: 15 },
    { header: 'EMPRESA', key: 'accountName', width: 35 },
    { header: 'TOTAL ACT.', key: 'totalActivities', width: 15 },
    { header: 'COMPLETADAS', key: 'completedActivities', width: 15 },
    { header: 'PLAN. (FECHA)', key: 'plannedWithDate', width: 15 },
    { header: 'PLAN. (S/ FECHA)', key: 'plannedWithoutDate', width: 18 },
    { header: 'LLAMADAS', key: 'calls', width: 12 },
    { header: 'CORREOS', key: 'emails', width: 12 },
    { header: 'REUNIONES', key: 'meetings', width: 12 },
    { header: 'ÚLTIMO CONTACTO', key: 'lastContactDate', width: 20 },
    { header: 'PRÓXIMO CONTACTO', key: 'nextContactDate', width: 20 }
  ];

  const detailHeaderRow = detailSheet.getRow(1);
  detailHeaderRow.height = 35;
  for (let col = 1; col <= 14; col++) {
    const cell = detailHeaderRow.getCell(col);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D5A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
    };
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('es-ES');
  };

  let isAlternateDetailRow = false;
  data.forEach((contact: any) => {
    const row = detailSheet.addRow({
      name: contact.name,
      email: contact.email || '-',
      position: contact.position,
      phone: contact.phone || '-',
      accountName: contact.accountName,
      totalActivities: contact.totalActivities,
      completedActivities: contact.completedActivities || 0,
      plannedWithDate: contact.plannedWithDate || 0,
      plannedWithoutDate: contact.plannedWithoutDate || 0,
      calls: contact.breakdown?.calls || 0,
      emails: contact.breakdown?.emails || 0,
      meetings: contact.breakdown?.meetings || 0,
      lastContactDate: formatDate(contact.lastContactDate),
      nextContactDate: formatDate(contact.nextContactDate)
    });
    
    for (let col = 6; col <= 14; col++) {
      row.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' };
    }
    for (let col = 1; col <= 5; col++) {
      row.getCell(col).alignment = { vertical: 'middle' };
    }

    for (let col = 1; col <= 14; col++) {
      row.getCell(col).border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
      if (isAlternateDetailRow) {
        row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    }
    isAlternateDetailRow = !isAlternateDetailRow;
  });

  // Totals row for Detail Sheet
  const totalsRowDetail = detailSheet.addRow({
    name: 'TOTALES GLOBALES',
    email: '',
    position: '',
    phone: '',
    accountName: '',
    totalActivities: totalActivities,
    completedActivities: totalCompleted,
    plannedWithDate: totalPlannedWithDate,
    plannedWithoutDate: totalPlannedWithoutDate,
    calls: totalCalls,
    emails: totalEmails,
    meetings: totalMeetings,
    lastContactDate: '',
    nextContactDate: ''
  });

  totalsRowDetail.height = 20;
  for (let col = 1; col <= 14; col++) {
    const cell = totalsRowDetail.getCell(col);
    cell.font = { bold: true, color: { argb: 'FF002D5A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    if (col >= 6) {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    } else {
      cell.alignment = { vertical: 'middle' };
    }
  }

  // Enable AutoFilter for the detail table
  if (data.length > 0) {
    detailSheet.autoFilter = {
      from: 'A1',
      to: { row: data.length + 1, column: 14 }
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const dateStr = new Date().toISOString().split('T')[0];
  saveAs(blob, `Informe_KPIs_Contactos_${dateStr}.xlsx`);
};
