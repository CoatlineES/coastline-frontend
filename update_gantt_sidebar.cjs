const fs = require('fs');

function updateFile(path) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    
    const regex = /title=\{task\.name\}\s*>\s*\{task\.name\}\s*<\/span>/g;
    const replacement = `title={task.alias ? \`\${task.name} (\${task.alias})\` : task.name}
              >
                {task.name}
                {task.alias && (
                  <span className="text-slate-400 font-normal italic ml-1">
                    ({task.alias})
                  </span>
                )}
              </span>`;
              
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Updated", path);
}

updateFile('src/views/employee/projects/tabs/GanttTimeline.tsx');
updateFile('src/views/employee/projects/tabs/GlobalGanttTimeline.tsx');
updateFile('src/views/employee/quotations/QuotationGantt.tsx');
