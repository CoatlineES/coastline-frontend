const fs = require('fs');
const path = 'src/views/employee/projects/ProjectDetailView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\{isEditing \? \([\s\S]*?value=\{formData\.operationalPhase \|\| ''\}[\s\S]*?project\.operationalPhase\s*\}\s*<\/span>\s*\)\}/g;
content = content.replace(regex, "");

// Remove from useEffect
content = content.replace(/operationalPhase: data\.operationalPhase,\n\s*/g, '');

// Timeline
const timelineRegex = /\{\['FACTURACION', 'TIMELINE'\]\.includes\(activeTab\) && \(/;
if (timelineRegex.test(content)) {
    const timelineReplacement = `{activeTab === 'TIMELINE' && (
            <ProjectTimelineTab project={project} />
          )}

          {['FACTURACION'].includes(activeTab) && (`;
    content = content.replace(timelineRegex, timelineReplacement);
}

if (!content.includes('import { ProjectTimelineTab }')) {
    content = content.replace(/import \{ ProjectReportsTab \} from '\.\/tabs\/ProjectReportsTab';/, "import { ProjectReportsTab } from './tabs/ProjectReportsTab';\nimport { ProjectTimelineTab } from './tabs/ProjectTimelineTab';");
}


// Etapa pipeline text cleanup
const etapaLabelRegex = /<div className="flex justify-between items-center">\s*<span className="text-sm text-slate-500">Etapa pipeline<\/span>\s*<\/div>/g;
content = content.replace(etapaLabelRegex, "");

fs.writeFileSync(path, content, 'utf8');
console.log("Success");
