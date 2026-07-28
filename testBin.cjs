const fs = require('fs');
const parser = require('@babel/parser');
const file = 'src/views/employee/projects/tabs/GanttGrid.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const start = lines.findIndex(l => l.includes('          {/* RENDER UNPLANNED TASKS */}'));
const modalStart = lines.findIndex(l => l.includes("{selectedTaskComponent?.component?.resourceType === 'MANO_OBRA' ? ("));

let lastError = '';
for (let i = start + 10; i < modalStart; i++) {
  const code = [
    ...lines.slice(0, start),
    '          {/* RENDER UNPLANNED TASKS */}',
    ...lines.slice(start, i),
    '        </div>',
    '      </div>',
    '',
    ...lines.slice(modalStart)
  ].join('\n');
  try {
    parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    console.log('SUCCESS AT LINE', i);
  } catch(e) {
    if (!e.message.includes('Adjacent JSX elements') && !e.message.includes('Unexpected token')) {
      console.log('Other error:', e.message);
    }
  }
}
