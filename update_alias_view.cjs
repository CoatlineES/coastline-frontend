const fs = require('fs');
const path = 'src/views/employee/projects/ProjectsView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">\s*\{project\.name\}\s*<\/h3>/;

const replacement = `<h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {project.name}
                          </h3>
                          {project.alias && (
                            <div className="text-xs text-slate-400 font-medium italic truncate mb-1">
                              Alias: {project.alias}
                            </div>
                          )}`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success view");
} else {
    console.log("Not found target with regex");
}
