const fs = require('fs');
function fixSpecificEncodings(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const words = [
        ['MAtricas', 'Métricas'],
        ['Mtricas', 'Métricas'],
        ['SecciA3n', 'Sección'],
        ['Seccin', 'Sección'],
        ['planificaciA3n', 'planificación'],
        ['planificacin', 'planificación'],
        ['facturaciA3n', 'facturación'],
        ['facturacin', 'facturación'],
        ['ejecuciA3n', 'ejecución'],
        ['ejecucin', 'ejecución'],
        ['InspecciA3n', 'Inspección'],
        ['Inspeccin', 'Inspección'],
        ['direcciA3n', 'dirección'],
        ['direccin', 'dirección'],
        ['ubicaciA3n', 'ubicación'],
        ['ubicacin', 'ubicación'],
        ['MÃ©tricas', 'Métricas'],
        ['SecciÃ³n', 'Sección'],
        ['planificaciÃ³n', 'planificación'],
        ['facturaciÃ³n', 'facturación'],
        ['ejecuciÃ³n', 'ejecución'],
        ['InspecciÃ³n', 'Inspección'],
        ['direcciÃ³n', 'dirección'],
        ['ubicaciÃ³n', 'ubicación'],
        ['NAo ', 'Nº '],
        ['SA- ', 'Sí ']
    ];
    for (const [bad, good] of words) {
        content = content.split(bad).join(good);
    }
    fs.writeFileSync(filePath, content, 'utf8');
}
fixSpecificEncodings('src/views/employee/projects/ProjectDetailView.tsx');
fixSpecificEncodings('src/views/employee/projects/ProjectsView.tsx');
fixSpecificEncodings('src/views/employee/projects/tabs/ProjectTimelineTab.tsx');
