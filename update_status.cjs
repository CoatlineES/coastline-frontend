const fs = require('fs');
const path = 'src/views/employee/projects/ProjectDetailView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<select\s+value=\{formData\.status \|\| ''\}\s+onChange=\{\(e\) => setFormData\(\{ \.\.\.formData, status: e\.target\.value as any \}\)\}\s+className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-800 rounded border border-blue-200 focus:outline-none"\s*>\s*<option value="ACTIVE">Activo<\/option>\s*<option value="COMPLETED">Completado<\/option>\s*<option value="CANCELLED">Cancelado<\/option>\s*<\/select>\s*\) : \(\s*<span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">\s*\{project\.status === 'ACTIVE' \? 'Activo' : project\.status === 'COMPLETED' \? 'Completado' : 'Cancelado'\}\s*<\/span>/;

const replacement = `<select
                        value={formData.status || ''}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-800 rounded border border-blue-200 focus:outline-none"
                      >
                        <option value="AWARDED">Adjudicado</option>
                        <option value="IN_PROGRESS">En ejecución</option>
                        <option value="COMPLETED">Ejecutado</option>
                        <option value="INVOICED">Facturado</option>
                        <option value="CLOSED">Cerrado</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                    ) : (
                      <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {
                          project.status === 'AWARDED' ? 'Adjudicado' : 
                          project.status === 'IN_PROGRESS' ? 'En ejecución' : 
                          project.status === 'COMPLETED' ? 'Ejecutado' : 
                          project.status === 'INVOICED' ? 'Facturado' : 
                          project.status === 'CLOSED' ? 'Cerrado' : 
                          project.status === 'CANCELLED' ? 'Cancelado' : project.status
                        }
                      </span>`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success status");
} else {
    console.log("Not found regex");
}
