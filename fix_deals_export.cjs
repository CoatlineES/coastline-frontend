const fs = require('fs');
const path = 'src/views/employee/CrmView.tsx';
let c = fs.readFileSync(path, 'utf8');

const regex1 = /const \[allDeals, allActivities\] = await Promise\.all\(\[\s*dealsService\.getAll\(\{\} as any\),\s*activitiesService\.getAll\(\{\}\)\s*\]\);/;
const replacement1 = `const [allDeals, allActivities] = await Promise.all([
                      dealsService.getAll({ search: debouncedSearchQuery, ...debouncedDealsFilters } as any),
                      activitiesService.getAll({})
                    ]);`;

if (regex1.test(c)) {
    c = c.replace(regex1, replacement1);
    console.log("Replaced service call");
} else {
    console.log("Service call regex failed");
}

const regex2 = /const filtersInfo = 'Todos \(Total hist[^\']*?\)';\s*await exportDealsKpiToExcel\(exportData, filtersInfo\);/;
const replacement2 = `let filtersInfo = '';
                    if (debouncedSearchQuery) filtersInfo += \`Búsqueda: "\${debouncedSearchQuery}" | \`;
                    if (debouncedDealsFilters.stage) filtersInfo += \`Etapa: \${debouncedDealsFilters.stage} | \`;
                    if (debouncedDealsFilters.amountMin || debouncedDealsFilters.amountMax) filtersInfo += \`Monto: \${debouncedDealsFilters.amountMin || '*'} a \${debouncedDealsFilters.amountMax || '*'} | \`;
                    if (debouncedDealsFilters.startDate || debouncedDealsFilters.endDate) filtersInfo += \`Creación: \${debouncedDealsFilters.startDate || '*'} a \${debouncedDealsFilters.endDate || '*'} | \`;
                    if (debouncedDealsFilters.closeDateFrom || debouncedDealsFilters.closeDateTo) filtersInfo += \`Cierre: \${debouncedDealsFilters.closeDateFrom || '*'} a \${debouncedDealsFilters.closeDateTo || '*'} | \`;
                    if (debouncedDealsFilters.accountId) filtersInfo += \`Filtro Empresa Aplicado | \`;
                    if (debouncedDealsFilters.contactId) filtersInfo += \`Filtro Contacto Aplicado | \`;
                    if (debouncedDealsFilters.userId) filtersInfo += \`Filtro Responsable Aplicado | \`;
                    filtersInfo = filtersInfo ? filtersInfo.slice(0, -3) : 'Todos (Total hist\u00f3rico)';
                    
                    await exportDealsKpiToExcel(exportData, filtersInfo);`;

if (regex2.test(c)) {
    c = c.replace(regex2, replacement2);
    console.log("Replaced filtersInfo");
} else {
    console.log("filtersInfo regex failed");
}

fs.writeFileSync(path, c, 'utf8');
