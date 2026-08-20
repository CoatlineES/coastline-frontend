const fs = require('fs');
const path = 'src/views/employee/projects/ProjectsView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<span className=\{\`text-xs font-medium px-2 py-0\.5 rounded border \$\{getPhaseColor\(project\.operationalPhase\)\}\`\}>\s*\{formatPhase\(project\.operationalPhase\)\}\s*<\/span>/g;
content = content.replace(regex, "");
content = content.replace(/status === 'ACTIVE'/g, "status === 'IN_PROGRESS'");
fs.writeFileSync(path, content, 'utf8');
console.log("ProjectsView fixed");
