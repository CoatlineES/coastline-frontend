const fs = require('fs');
const path = 'src/views/employee/projects/ProjectDetailView.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*\)\}/, `                </div>
              </div>
            </div>
          </div>`);

fs.writeFileSync(path, content, 'utf8');
