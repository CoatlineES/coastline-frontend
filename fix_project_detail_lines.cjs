const fs = require('fs');
const path = 'src/views/employee/projects/ProjectDetailView.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Delete lines (1-indexed to 0-indexed)
// line 41 -> index 40
// lines 252-275 -> index 251 to 274
// lines 363-389 -> index 362 to 388

// We will mark lines for deletion by setting them to null
lines[40] = null; // operationalPhase: data.operationalPhase,
for(let i = 251; i <= 274; i++) {
    lines[i] = null;
}
for(let i = 362; i <= 388; i++) {
    lines[i] = null;
}

// Replace line 613 (index 612)
lines[612] = `          {activeTab === 'TIMELINE' && (
            <ProjectTimelineTab project={project} />
          )}

          {['FACTURACION'].includes(activeTab) && (`;

// Remove nulls
lines = lines.filter(line => line !== null);

// Add import
const content = lines.join('\n');
if (!content.includes('import { ProjectTimelineTab }')) {
    const finalContent = content.replace("import { ProjectReportsTab } from './tabs/ProjectReportsTab';", "import { ProjectReportsTab } from './tabs/ProjectReportsTab';\nimport { ProjectTimelineTab } from './tabs/ProjectTimelineTab';");
    fs.writeFileSync(path, finalContent, 'utf8');
} else {
    fs.writeFileSync(path, content, 'utf8');
}
console.log("Success");
