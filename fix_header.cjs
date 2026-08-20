const fs = require('fs');
const path = 'src/views/employee/projects/ProjectDetailView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex1 = /                    \{isEditing \? \(\n                      <select\n                        value=\{formData\.operationalPhase \|\| ''\}\n                        onChange=\{\(e\) => setFormData\(\{ \.\.\.formData, operationalPhase: e\.target\.value as any \}\)\}\n                        className="text-xs font-medium px-3 py-1 bg-blue-50 border border-slate-200 rounded-full focus:outline-none"\n                      >\n                        <option value="PENDING_PLANNING">Pendiente planificaciA3n<\/option>\n                        <option value="CONSTRUCTION_PLANNING">Obra en ejecuciA3n<\/option>\n                        <option value="INSPECTION_DONE">InspecciA3n finalizada<\/option>\n                        <option value="COMPLETION">Completado<\/option>\n                        <option value="CERT_INVOICING">CertificaciA3n y facturaciA3n<\/option>\n                      <\/select>\n                    \) : \(\n                      <span className="text-xs font-medium px-3 py-1 border border-slate-200 rounded-full bg-white">\n                        \{\n                          project\.operationalPhase === 'PENDING_PLANNING' \? 'Pendiente planificaciA3n' :\n                          project\.operationalPhase === 'CONSTRUCTION_PLANNING' \? 'Obra en ejecuciA3n' :\n                          project\.operationalPhase === 'INSPECTION_DONE' \? 'InspecciA3n finalizada' :\n                          project\.operationalPhase === 'COMPLETION' \? 'Completado' :\n                          project\.operationalPhase === 'CERT_INVOICING' \? 'CertificaciA3n y facturaciA3n' :\n                          project\.operationalPhase\n                        \}\n                      <\/span>\n                    \}/;

if (regex1.test(content)) {
    content = content.replace(regex1, "");
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success regex1");
} else {
    console.log("Regex 1 not found");
}
