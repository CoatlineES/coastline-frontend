const fs = require('fs');
const file = 'src/views/employee/projects/tabs/GanttGrid.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes('{/* RENDER UNPLANNED TASKS */}'));
const modalStart = lines.findIndex(l => l.includes("{selectedTaskComponent?.component?.resourceType === 'MANO_OBRA' ? ("));

console.log('Lines before:', startIdx);
console.log('Lines after:', lines.length - modalStart);
console.log('Total lines:', lines.length);

const firstMapStart = lines.findIndex((l, i) => i > startIdx && l.includes('.map((task, index) => {'));
const mapBodyStart = firstMapStart + 1;
// Search for the React.Fragment closing the map body inside the FIRST block.
const endOfFirstMap = lines.findIndex((l, i) => i > mapBodyStart && l.includes('return <React.Fragment key={task.id}></React.Fragment>;'));

console.log('First map body spans', mapBodyStart, 'to', endOfFirstMap);
const realMapBody = lines.slice(mapBodyStart, endOfFirstMap + 1);

const cleanContent = [
  ...lines.slice(0, startIdx),
  '          {/* RENDER UNPLANNED TASKS */}',
  '          {visibleTasksGroups.listUnplanned.map((task, index) => {',
  ...realMapBody,
  '          })}',
  '          {visibleTasksGroups.listUnplanned.length > 0 && <div className="h-1" />}',
  '          {/* RENDER PLANNED TASKS */}',
  '          {visibleTasksGroups.listPlanned.map((task, index) => {',
  ...realMapBody,
  '          })}',
  '        </div>',
  '      </div>',
  '',
  ...lines.slice(modalStart)
].join('\n');

fs.writeFileSync('GanttGrid_clean.tsx', cleanContent, 'utf8');
console.log('Cleaned file written to GanttGrid_clean.tsx');
