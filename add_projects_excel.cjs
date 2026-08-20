const fs = require('fs');
const path = 'src/views/employee/projects/ProjectsView.tsx';
let c = fs.readFileSync(path, 'utf8');

if (!c.includes('exportProjectsKpiToExcel')) {
    c = c.replace(/import ProjectCreateModal from '\.\/ProjectCreateModal';/, `import ProjectCreateModal from './ProjectCreateModal';
import { exportProjectsKpiToExcel } from '../../../utils/exportProjectsKpiReport';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';`);
}

const buttonsRegex = /<button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">\s*<Filter size=\{18\} \/>\s*Filtros\s*<\/button>/;

const newButtons = `<button
              onClick={async () => {
                try {
                  const toastId = toast.loading('Generando reporte Excel...');
                  let filtersInfo = '';
                  if (searchTerm) filtersInfo += \`Búsqueda: "\${searchTerm}" | \`;
                  if (activeTab === 'demos') filtersInfo += \`Tipo: Demos/Plantillas | \`;
                  if (showOnlyActive) filtersInfo += \`Estado: Solo Activos | \`;
                  filtersInfo = filtersInfo ? filtersInfo.slice(0, -3) : 'Todos los proyectos';
                  
                  await exportProjectsKpiToExcel(filteredProjects, filtersInfo);
                  toast.success('Reporte generado correctamente', { id: toastId });
                } catch (err) {
                  toast.error('Error al exportar proyectos');
                  console.error(err);
                }
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2 shadow-sm active:scale-95 text-sm"
            >
              <Download size={18} />
              Excel
            </button>
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              <Filter size={18} />
              Filtros
            </button>`;

if (buttonsRegex.test(c)) {
    c = c.replace(buttonsRegex, newButtons);
    fs.writeFileSync(path, c, 'utf8');
    console.log("Modified ProjectsView.tsx successfully");
} else {
    console.log("Could not find buttons to replace");
}
