const fs = require('fs');
const path = 'src/services/types.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("export interface Project {\n  id: string;\n  name: string;", "export interface Project {\n  id: string;\n  name: string;\n  alias?: string | null;");
content = content.replace("export interface ProjectFormData {\n  name: string;", "export interface ProjectFormData {\n  name: string;\n  alias?: string | null;");

fs.writeFileSync(path, content, 'utf8');
console.log("types updated");
