const fs = require('fs');
const path = 'src/views/employee/projects/ProjectDetailView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove empty Etapa pipeline flex div
content = content.replace(/<div className="flex justify-between items-center">\s*<span className="text-sm text-slate-500">Etapa pipeline<\/span>\s*<\/div>/g, '');

fs.writeFileSync(path, content, 'utf8');
console.log("Cleaned up empty Etapa pipeline div");
