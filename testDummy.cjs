const fs = require('fs');
const parser = require('@babel/parser');
const file = 'src/views/employee/projects/tabs/GanttGrid.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('          {/* RENDER UNPLANNED TASKS */}'));
const modalStart = lines.findIndex(l => l.includes("{selectedTaskComponent?.component?.resourceType === 'MANO_OBRA' ? ("));
const newText = [
  ...lines.slice(0, start),
  '          {/* RENDER UNPLANNED TASKS */}',
  '          {visibleTasksGroups.listUnplanned.map((task, index) => <div key={task.id} />)}',
  '          {/* RENDER PLANNED TASKS */}',
  '          {visibleTasksGroups.listPlanned.map((task, index) => <div key={task.id} />)}',
  '        </div>',
  '      </div>',
  '',
  ...lines.slice(modalStart)
].join('\n');
try {
  parser.parse(newText, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  console.log('Dummy map body compiles!');
} catch (e) {
  console.log('Error with dummy:', e.message, e.loc);
}
