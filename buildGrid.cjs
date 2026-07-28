const fs = require('fs');

const origText = fs.readFileSync('gantt_original_stripped.tsx', 'utf8');

const part1Text = fs.readFileSync('gantt_original_from_transcript_part1.txt', 'utf8');
const p1Lines = part1Text.split('\n').slice(6, -2).map(l => l.replace(/^\d+:\s/, ''));

// line 800 in orig is '<span className={executionStatus !== 'none' ? 'font-bold' : 'font-semibold'}>'
const p1Idx = p1Lines.findIndex(l => l.includes("executionStatus !== 'none'"));

let result = origText;
if (p1Idx !== -1) {
  const remainingP1 = p1Lines.slice(p1Idx + 1);
  result += '\n' + remainingP1.join('\n');
} else {
  console.log('overlap not found!');
}

const part2Text = fs.readFileSync('gantt_original_from_transcript_part2.txt', 'utf8');
const p2Lines = part2Text.split('\n').slice(6, -2).map(l => l.replace(/^\d+:\s/, ''));

// find where p1 ends in p2
const p1EndLine = p1Lines[p1Lines.length - 1].trim();
const p2OverlapIdx = p2Lines.findIndex(l => l.trim() === p1EndLine);
if (p2OverlapIdx !== -1) {
    result += '\n' + p2Lines.slice(p2OverlapIdx + 1).join('\n');
} else {
    console.log('p2 overlap not found');
}

// Ensure the export exists
if (!result.includes('export default GanttGrid;')) {
    result += '\n\nexport default GanttGrid;\n';
}

fs.writeFileSync('src/views/employee/projects/tabs/GanttGrid.tsx', result, 'utf8');
console.log('Reconstructed file to src/views/employee/projects/tabs/GanttGrid.tsx, lines:', result.split('\n').length);
