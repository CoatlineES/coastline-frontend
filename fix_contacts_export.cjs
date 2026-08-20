const fs = require('fs');
const path = 'src/views/employee/CrmView.tsx';
let c = fs.readFileSync(path, 'utf8');

const target = `const [allContacts, allActivities] = await Promise.all([
                        contactsService.getAll({}),
                        activitiesService.getAll({})
                      ]);`;

const replacement = `const [allContacts, allActivities] = await Promise.all([
                        contactsService.getAll({ search: debouncedSearchQuery, ...debouncedContactsFilters }),
                        activitiesService.getAll({})
                      ]);`;

c = c.replace(target, replacement);

const targetFilters = `const filtersInfo = 'Todos (Total histA3rico)';
                      await exportContactsKpiToExcel(exportData, filtersInfo);`;

const replacementFilters = `let filtersInfo = '';
                      if (debouncedSearchQuery) filtersInfo += \`Búsqueda: "\${debouncedSearchQuery}" | \`;
                      if (debouncedContactsFilters.accountId) filtersInfo += \`Filtro Empresa Aplicado | \`;
                      if (debouncedContactsFilters.position) filtersInfo += \`Cargo: \${debouncedContactsFilters.position} | \`;
                      if (debouncedContactsFilters.activityStatus && debouncedContactsFilters.activityStatus !== 'ALL') filtersInfo += \`Actividades: \${debouncedContactsFilters.activityStatus} | \`;
                      if (debouncedContactsFilters.startDate || debouncedContactsFilters.endDate) filtersInfo += \`Creación: \${debouncedContactsFilters.startDate || '*'} a \${debouncedContactsFilters.endDate || '*'} | \`;
                      filtersInfo = filtersInfo ? filtersInfo.slice(0, -3) : 'Todos (Total hist\u00f3rico)';
                      
                      await exportContactsKpiToExcel(exportData, filtersInfo);`;

c = c.replace(/const filtersInfo = 'Todos \(Total histA3rico\)';\s*await exportContactsKpiToExcel\(exportData, filtersInfo\);/, replacementFilters);

fs.writeFileSync(path, c, 'utf8');
console.log('Fixed Contacts export successfully');
