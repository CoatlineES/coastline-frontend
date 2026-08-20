const fs = require('fs');
const path = 'src/views/employee/projects/ProjectDetailView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the index of '<span className="text-sm text-slate-500">Etapa pipeline</span>'
const idx = content.indexOf('<span className="text-sm text-slate-500">Etapa pipeline</span>');
if (idx !== -1) {
    // Find the enclosing <div className="flex justify-between items-center">
    const divStart = content.lastIndexOf('<div className="flex justify-between items-center">', idx);
    // Find the next <div className="flex justify-between items-center"> which is PlanificaciA3n
    const nextDivStart = content.indexOf('<div className="flex justify-between items-center">', idx);
    
    if (divStart !== -1 && nextDivStart !== -1) {
        content = content.substring(0, divStart) + content.substring(nextDivStart);
    }
}
fs.writeFileSync(path, content, 'utf8');
