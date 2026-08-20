const fs = require('fs');
const path = 'src/views/employee/projects/ProjectsView.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `const toastId = toast.loading('Generando reporte Excel...');
                    let filtersInfo = '';
                    if (searchTerm) filtersInfo += \`Búsqueda: "\${searchTerm}" | \`;
                    if (activeTab === 'demos') filtersInfo += \`Tipo: Demos/Plantillas | \`;
                    if (showOnlyActive) filtersInfo += \`Estado: Solo Activos | \`;
                    filtersInfo = filtersInfo ? filtersInfo.slice(0, -3) : 'Todos los proyectos';
                    
                    await exportProjectsListToExcel(filteredProjects, filtersInfo);`;

const replacement = `const toastId = toast.loading('Generando reporte Excel...');
                    
                    // Asegurar que exportamos TODOS (Reales y Demos) respetando la búsqueda y el estado activo
                    const exportProjects = projects.filter(p => {
                      if (showOnlyActive && !['AWARDED', 'IN_PROGRESS'].includes(p.status)) return false;
                      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (p.account?.name && p.account.name.toLowerCase().includes(searchTerm.toLowerCase()));
                      return matchesSearch;
                    });

                    let filtersInfo = '';
                    if (searchTerm) filtersInfo += \`Búsqueda: "\${searchTerm}" | \`;
                    if (showOnlyActive) filtersInfo += \`Estado: Solo Activos | \`;
                    filtersInfo = filtersInfo ? filtersInfo.slice(0, -3) : 'Todos los proyectos (Reales y Demos)';
                    
                    await exportProjectsListToExcel(exportProjects, filtersInfo);`;

// Reemplazar Búsqueda para lidiar con el string escapado
const targetRegex = /const toastId = toast\.loading\('Generando reporte Excel\.\.\.'\);[\s\S]*?await exportProjectsListToExcel\(filteredProjects, filtersInfo\);/;

if (targetRegex.test(content)) {
    content = content.replace(targetRegex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success");
} else {
    console.log("Not found");
}
