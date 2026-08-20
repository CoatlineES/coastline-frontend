const fs = require('fs');
const path = 'src/services/project-planning.service.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /export interface ProjectTask \{\s*id: string;\s*planId: string;\s*parentId: string \| null;\s*name: string;/;
const replacement = `export interface ProjectTask {
  id: string;
  planId: string;
  parentId: string | null;
  name: string;
  alias?: string | null;`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Service types updated");
} else {
    console.log("Service types regex not found");
}
