const fs = require('fs');
const path = 'src/views/employee/projects/ProjectsView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove the span that renders operationalPhase
const spanTarget = `<span className={\`text-xs font-medium px-2 py-0.5 rounded border \${getPhaseColor(project.operationalPhase)}\`}>
                              {formatPhase(project.operationalPhase)}
                            </span>`;
if (content.includes(spanTarget)) {
    content = content.replace(spanTarget, "");
    console.log("Removed spanTarget");
} else {
    console.log("Could not find spanTarget");
}

fs.writeFileSync(path, content, 'utf8');
