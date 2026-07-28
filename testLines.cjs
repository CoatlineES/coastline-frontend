const fs = require('fs');
const parser = require('@babel/parser');
const lines = fs.readFileSync('mapBody.txt', 'utf8').split('\n');

for (let i = lines.length - 1; i > 0; i--) {
  const code = 'const A = (task) => {\n' + lines.slice(0, i).join('\n') + '\n}';
  try {
    parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    console.log('Success at length', i);
    break;
  } catch(e) {
    // continue
  }
}
