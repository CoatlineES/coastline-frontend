const fs = require('fs');
const path = 'src/views/employee/projects/ProjectDetailView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. operationalPhase data
content = content.replace(/operationalPhase: data\.operationalPhase,\n\s*/g, '');

// 2. header block
const headerRegex = /\{isEditing \? \([\s\S]*?value=\{formData\.operationalPhase[\s\S]*?<\/span>\s*\)\}/;
content = content.replace(headerRegex, '');

// 3. Etapa pipeline block
const etapaRegex = /<div className="flex justify-between items-center">\s*<span className="text-sm text-slate-500">Etapa pipeline<\/span>[\s\S]*?<\/span>\s*\)\}\s*<\/div>/;
content = content.replace(etapaRegex, '');

// 4. TIMELINE import and usage
if (!content.includes('import { ProjectTimelineTab }')) {
    content = content.replace(/import \{ ProjectReportsTab \} from '\.\/tabs\/ProjectReportsTab';/, "import { ProjectReportsTab } from './tabs/ProjectReportsTab';\nimport { ProjectTimelineTab } from './tabs/ProjectTimelineTab';");
}

const timelineRegex = /\{\['FACTURACION', 'TIMELINE'\]\.includes\(activeTab\) && \(/;
if (timelineRegex.test(content)) {
    const timelineReplacement = `{activeTab === 'TIMELINE' && (
            <ProjectTimelineTab project={project} />
          )}

          {['FACTURACION'].includes(activeTab) && (`;
    content = content.replace(timelineRegex, timelineReplacement);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Success");
