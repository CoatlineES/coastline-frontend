const fs = require('fs');

function updateFile(path) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    
    // Original regex that matches my previous replacement
    const regex = /title=\{task\.alias \? `\$\{task\.name\} \(\$\{task\.alias\}\)` : task\.name\}\s*>\s*\{task\.name\}\s*\{task\.alias && \(\s*<span className="text-slate-400 font-normal italic ml-1">\s*\(\{task\.alias\}\)\s*<\/span>\s*\)\}\s*<\/span>/g;
    
    const replacement = `title={task.alias || task.name}
              >
                {task.alias || task.name}
              </span>`;
              
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Updated", path);
}

updateFile('src/views/employee/projects/tabs/GanttTimeline.tsx');
updateFile('src/views/employee/projects/tabs/GlobalGanttTimeline.tsx');
updateFile('src/views/employee/quotations/QuotationGantt.tsx');
