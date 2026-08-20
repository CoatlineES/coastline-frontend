const fs = require('fs');
const path = 'src/views/employee/CrmView.tsx';
let c = fs.readFileSync(path, 'utf8');

const regex2 = /const filtersInfo = 'Todos \(Total hist[^\']*?\)';\s*await exportContactsKpiToExcel\(exportData, filtersInfo\);/;
const replacement2 = `let filtersInfo = '';
                      if (debouncedSearchQuery) filtersInfo += \`Búsqueda: "\${debouncedSearchQuery}" | \`;
                      if (debouncedContactsFilters.accountId) filtersInfo += \`Filtro Empresa Aplicado | \`;
                      if (debouncedContactsFilters.position) filtersInfo += \`Cargo: \${debouncedContactsFilters.position} | \`;
                      if (debouncedContactsFilters.activityStatus && debouncedContactsFilters.activityStatus !== 'ALL') filtersInfo += \`Actividades: \${debouncedContactsFilters.activityStatus} | \`;
                      if (debouncedContactsFilters.startDate || debouncedContactsFilters.endDate) filtersInfo += \`Creación: \${debouncedContactsFilters.startDate || '*'} a \${debouncedContactsFilters.endDate || '*'} | \`;
                      filtersInfo = filtersInfo ? filtersInfo.slice(0, -3) : 'Todos (Total hist\u00f3rico)';
                      
                      await exportContactsKpiToExcel(exportData, filtersInfo);`;

if (regex2.test(c)) {
    c = c.replace(regex2, replacement2);
    console.log("Replaced filtersInfo");
} else {
    console.log("filtersInfo regex failed");
}

fs.writeFileSync(path, c, 'utf8');
