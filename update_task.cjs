const fs = require('fs');
const path = 'C:\\Users\\whilmis\\.gemini\\antigravity-ide\\brain\\b3ae988f-4969-46c4-926f-2a4773015f53\\task.md';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/- \[ \] 8/g, '- [x] 8');
fs.writeFileSync(path, content, 'utf8');
