const fs = require('fs');
const path = 'src/views/employee/projects/tabs/TaskBreakdownModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state for alias
const stateRegex = /const \[localName, setLocalName\] = useState\(task\.name \|\| ''\);/;
const stateReplacement = `const [localName, setLocalName] = useState(task.name || '');\n  const [localAlias, setLocalAlias] = useState(task.alias || '');`;
content = content.replace(stateRegex, stateReplacement);

// 2. Add alias to payload
const payloadRegex = /name: localName,/;
const payloadReplacement = `name: localName,\n        alias: localAlias || null,`;
content = content.replace(payloadRegex, payloadReplacement);

// 3. Add alias input field
const inputRegex = /<input\s*type="text"\s*value=\{localName\}\s*onChange=\{e => setLocalName\(e\.target\.value\)\}\s*className="text-lg font-bold text-\[#001c3a\] bg-white border border-slate-200 rounded px-2 py-1 focus:border-primary outline-none w-full max-w-xl"\s*placeholder="Nombre de la Tarea"\s*\/>/;
const inputReplacement = `<div className="w-full max-w-xl flex flex-col gap-1">
                  <input
                    type="text"
                    value={localName}
                    onChange={e => setLocalName(e.target.value)}
                    className="text-lg font-bold text-[#001c3a] bg-white border border-slate-200 rounded px-2 py-1 focus:border-primary outline-none w-full"
                    placeholder="Nombre de la Tarea"
                  />
                  <input
                    type="text"
                    value={localAlias}
                    onChange={e => setLocalAlias(e.target.value)}
                    className="text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:border-primary outline-none w-full placeholder-slate-400 italic"
                    placeholder="Alias de la tarea (opcional)"
                  />
                </div>`;
content = content.replace(inputRegex, inputReplacement);

fs.writeFileSync(path, content, 'utf8');
console.log("TaskBreakdownModal updated");
