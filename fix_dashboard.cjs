const fs = require('fs');
const path = 'src/views/employee/ExecutiveDashboardView.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/const projectStatusData = \[[\s\S]*?\];/, `const projectStatusData = [
  { name: 'Adjudicados', value: 8, color: '#f59e0b' }, // amber-500
  { name: 'En ejecución', value: 12, color: '#6366f1' }, // indigo-500
  { name: 'Ejecutados', value: 4, color: '#14b8a6' }, // teal-500
  { name: 'Facturados', value: 3, color: '#10b981' }, // emerald-500
  { name: 'Cerrados', value: 5, color: '#3b82f6' }, // blue-500
  { name: 'Cancelados', value: 2, color: '#ef4444' }, // red-500
];`);

fs.writeFileSync(path, content, 'utf8');
