const fs = require('fs');
const path = 'src/views/employee/projects/ProjectsView.tsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = `                            <span className={\`text-xs font-medium px-2 py-0.5 rounded border \${getPhaseColor(project.operationalPhase)}\`}>
                              {formatPhase(project.operationalPhase)}
                            </span>`;
if (content.includes(target1)) {
    content = content.replace(target1, "");
    console.log("Removed target1");
}

const target2 = `status === 'ACTIVE'`;
if (content.includes(target2)) {
    content = content.replace(/status === 'ACTIVE'/g, "status === 'IN_PROGRESS'");
    console.log("Replaced ACTIVE with IN_PROGRESS");
}

fs.writeFileSync(path, content, 'utf8');
