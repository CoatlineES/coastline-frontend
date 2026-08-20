const fs = require('fs');
const path = 'src/views/employee/CrmView.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/accountsService\.getAll\(\{ search, \.\.\.debouncedAccountsFilters \}\),/g, 'accountsService.getAll({ search: debouncedSearchQuery, ...debouncedAccountsFilters }),');
c = c.replace(/if \(search\) filtersInfo \+\= \`Búsqueda: "\$\{search\}" \| \`;/g, 'if (debouncedSearchQuery) filtersInfo += \`Búsqueda: "${debouncedSearchQuery}" | \`;');

fs.writeFileSync(path, c, 'utf8');
console.log('Fixed search variable scope issue');
