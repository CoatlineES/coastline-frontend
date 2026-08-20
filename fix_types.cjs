const fs = require('fs');
const path = 'src/services/types.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /export interface UserResponse extends User \{\s*manager\?: \{\s*id: string;\s*name: string;\s*\};\s*\}/;
const replacement = `export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: {
    name: string;
  };
  manager?: {
    id: string;
    name: string;
  };
}`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("types fixed");
} else {
    console.log("regex not found");
}
