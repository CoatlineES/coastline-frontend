const fs = require('fs');
const path = 'src/views/employee/projects/ProjectCreateModal.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/operationalPhase: 'PENDING_PLANNING',/g, "");
content = content.replace(/status: 'ACTIVE'/g, "status: 'AWARDED'");

fs.writeFileSync(path, content, 'utf8');
console.log("CreateModal fixed");
