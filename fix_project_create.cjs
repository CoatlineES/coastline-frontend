const fs = require('fs');
const path = 'src/views/employee/projects/ProjectCreateModal.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/status: 'ACTIVE',\r?\n\s*operationalPhase: 'PENDING_PLANNING',/g, "status: 'AWARDED',");
content = content.replace(/status: 'ACTIVE', operationalPhase: 'PENDING_PLANNING',/g, "status: 'AWARDED',");

fs.writeFileSync(path, content, 'utf8');
