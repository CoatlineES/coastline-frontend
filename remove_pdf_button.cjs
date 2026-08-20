const fs = require('fs');
const path = 'src/views/employee/CrmView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\s*<button\s*onClick=\{\(\) => handleExportDashboardActivities\('pdf'\)\}.*?<\/button>/s;
content = content.replace(regex, '');

fs.writeFileSync(path, content, 'utf8');
