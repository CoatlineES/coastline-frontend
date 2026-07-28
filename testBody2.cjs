const fs = require('fs');
const parser = require('@babel/parser');
const file = 'src/views/employee/projects/tabs/GanttGrid.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('{/* RENDER UNPLANNED TASKS */}'));
const firstMapStart = lines.findIndex((l, i) => i > startIdx && l.includes('.map((task, index) => {'));
const mapBodyStart = firstMapStart + 1;
const endOfFirstMap = lines.findIndex((l, i) => i > mapBodyStart && l.includes('return <React.Fragment key={task.id}></React.Fragment>;'));
const realMapBody = lines.slice(mapBodyStart, endOfFirstMap + 1).join('\n');

const testCode = 'const A = [(task) => {\n' + realMapBody + '\n}];';

try {
  parser.parse(testCode, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  console.log('parsed successfully!');
} catch (e) {
  console.log('Error:', e.message, e.loc);
  const codeLines = testCode.split('\n');
  for (let i = Math.max(0, e.loc.line - 5); i < Math.min(codeLines.length, e.loc.line + 5); i++) {
    console.log(i + 1 + ': ' + codeLines[i]);
  }
}
