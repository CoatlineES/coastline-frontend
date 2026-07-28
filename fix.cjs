const fs = require('fs');
const file = 'src/views/employee/projects/tabs/GanttGrid.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('{/* RENDER UNPLANNED TASKS */}'));
const firstMapStart = lines.findIndex((l, i) => i > startIdx && l.includes('.map((task, index) => {'));
const mapBodyStart = firstMapStart + 1;
const mapBodyEnd = lines.findIndex((l, i) => i > mapBodyStart && l.includes('return <React.Fragment key={task.id}></React.Fragment>;'));

console.log('mapBodyStart:', mapBodyStart, 'mapBodyEnd:', mapBodyEnd);

if (mapBodyStart > 0 && mapBodyEnd > mapBodyStart) {
  const mapBody = lines.slice(mapBodyStart, mapBodyEnd + 1).join('\n');
  const newRender = [
    '          {/* RENDER UNPLANNED TASKS */}',
    '          {visibleTasksGroups.listUnplanned.map((task, index) => {',
    mapBody,
    '          })}',
    '          {visibleTasksGroups.listUnplanned.length > 0 && <div className="h-1" />}',
    '          {/* RENDER PLANNED TASKS */}',
    '          {visibleTasksGroups.listPlanned.map((task, index) => {',
    mapBody,
    '          })}'
  ].join('\n');

  const modalStart = lines.findIndex(l => l.includes("{selectedTaskComponent?.component?.resourceType === 'MANO_OBRA' ? ("));
  
  const newContent = [
    ...lines.slice(0, startIdx),
    newRender,
    '        </div>',
    '      </div>',
    '',
    ...lines.slice(modalStart)
  ].join('\n');
  
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('Fixed file!');
} else {
  console.log('Failed to find map bounds');
}
