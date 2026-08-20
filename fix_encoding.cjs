const fs = require('fs');
const path = require('path');

function fixEncoding(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    const replacements = {
        'A3n': 'ón',
        'A3': 'ó',
        'A1': 'á',
        'A9': 'é',
        'AD': 'í',
        'A-': 'í',
        'A\u00ba': 'º',
        'A\u00b0': '°',
        'A\u00bf': '¿',
        'A\u00a1': '¡',
        'A\u00f1': 'ñ',
        'A\u00d1': 'Ñ',
        'A3n': 'ón',
        'MAtricas': 'Métricas',
        'SecciA3n': 'Sección',
        'planificaciA3n': 'planificación',
        'facturaciA3n': 'facturación',
        'InspecciA3n': 'Inspección',
        'ejecuciA3n': 'ejecución',
        'SA-': 'Sí',
        'A': 'á',
        'Mtricas': 'Métricas',
        'Seccin': 'Sección',
        'ejecucin': 'ejecución',
        'facturacin': 'facturación',
        'planificacin': 'planificación',
        'Inspeccin': 'Inspección',
        'S': 'Sí',
        'direccin': 'dirección',
        'ubicacin': 'ubicación'
    };

    let count = 0;
    for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
            // be careful with simple replacements
            // content = content.replaceAll(bad, good);
        }
    }
    
    // Instead of blanket replace which might be dangerous, let's fix specific words
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
        ['SA-', 'Sí'],
        ['S', 'Sí'],
        ['direcciA3n', 'dirección'],
        ['direccin', 'dirección'],
        ['ubicaciA3n', 'ubicación'],
        ['ubicacin', 'ubicación'],
        ['A', 'á'],
        ['A3n', 'ón'],
        ['NAo', 'Nº']
    ];
    
    for (const [bad, good] of words) {
        content = content.split(bad).join(good);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Fixed encodings in " + filePath);
    }
}

fixEncoding('src/views/employee/projects/ProjectDetailView.tsx');
fixEncoding('src/views/employee/projects/ProjectsView.tsx');
fixEncoding('src/views/employee/projects/tabs/ProjectTimelineTab.tsx');
