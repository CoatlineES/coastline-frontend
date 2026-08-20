const fs = require('fs');
const path = 'src/views/employee/projects/tabs/GanttGrid.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\{isFirst && \(\s*<span className="text-\[10px\] font-bold text-white px-2 truncate relative z-20 mix-blend-screen drop-shadow-md pointer-events-none">\s*\{task\.name\}\s*<\/span>\s*\)\}/g;
content = content.replace(regex, "");
fs.writeFileSync(path, content, 'utf8');
console.log("GanttGrid updated");

const path2 = 'src/views/employee/projects/tabs/GlobalGanttTimeline.tsx';
if (fs.existsSync(path2)) {
    let content2 = fs.readFileSync(path2, 'utf8');
    const regex2 = /\{isFirst && \(\s*<span className="text-\[10px\] font-bold text-white px-2 truncate relative z-20 mix-blend-screen drop-shadow-md pointer-events-none">\s*\{task\.name\}\s*<\/span>\s*\)\}/g;
    content2 = content2.replace(regex2, "");
    fs.writeFileSync(path2, content2, 'utf8');
    console.log("GlobalGanttTimeline updated");
}

const path3 = 'src/views/employee/quotations/QuotationGantt.tsx';
if (fs.existsSync(path3)) {
    let content3 = fs.readFileSync(path3, 'utf8');
    const regex3 = /\{isFirst && \(\s*<span className="text-\[10px\] font-bold text-white px-2 truncate relative z-20 mix-blend-screen drop-shadow-md pointer-events-none">\s*\{task\.name\}\s*<\/span>\s*\)\}/g;
    content3 = content3.replace(regex3, "");
    fs.writeFileSync(path3, content3, 'utf8');
    console.log("QuotationGantt updated");
}
