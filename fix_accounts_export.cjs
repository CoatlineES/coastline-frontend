const fs = require('fs');
const path = 'src/views/employee/CrmView.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(
    /const \[allAccounts, allActivities, allDeals, allProjects\] = await Promise\.all\(\[\s*accountsService\.getAll\(\{\}\),\s*activitiesService\.getAll\(\{\}\),/g,
    `const [allAccounts, allActivities, allDeals, allProjects] = await Promise.all([
                        accountsService.getAll({ search, ...debouncedAccountsFilters }),
                        activitiesService.getAll({}),`
);

// We need to replace the exportAccountsKpiToExcel call in the ACCOUNTS tab.
// Find the exact string.
const oldFilters = "const filtersInfo = 'Todos (Total histA3rico)';";
const newFilters = `let filtersInfo = '';
                      if (search) filtersInfo += \`Búsqueda: "\${search}" | \`;
                      if (debouncedAccountsFilters.sector) filtersInfo += \`Sector: \${debouncedAccountsFilters.sector} | \`;
                      if (debouncedAccountsFilters.activityStatus && debouncedAccountsFilters.activityStatus !== 'ALL') filtersInfo += \`Actividades: \${debouncedAccountsFilters.activityStatus} | \`;
                      if (debouncedAccountsFilters.startDate || debouncedAccountsFilters.endDate) filtersInfo += \`Creación: \${debouncedAccountsFilters.startDate || '*'} a \${debouncedAccountsFilters.endDate || '*'} | \`;
                      filtersInfo = filtersInfo ? filtersInfo.slice(0, -3) : 'Todos (Total hist\u00f3rico)';`;

// Since there are multiple "histA3rico" in the file, we only want the one before exportAccountsKpiToExcel.
c = c.replace(/const filtersInfo = 'Todos \(Total histA3rico\)';\s*await exportAccountsKpiToExcel\(exportData, filtersInfo\);/, newFilters + '\n                      await exportAccountsKpiToExcel(exportData, filtersInfo);');

fs.writeFileSync(path, c, 'utf8');
console.log('Fixed export successfully with regex');
