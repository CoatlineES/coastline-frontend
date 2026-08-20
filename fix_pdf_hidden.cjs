const fs = require('fs');
const path = 'src/views/employee/CrmView.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('<div className="hidden">\n        <ActivityKpiPdfReport', '<div className="absolute left-[-9999px] top-[-9999px]">\n        <ActivityKpiPdfReport');

fs.writeFileSync(path, content, 'utf8');
