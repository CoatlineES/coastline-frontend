const fs = require('fs');
const path = 'src/views/employee/projects/ProjectDetailView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove operationalPhase from useEffect data
content = content.replace("            operationalPhase: data.operationalPhase,\n", "");

// 2. Remove operationalPhase header block
const headerPhaseTarget = `                  {isEditing ? (
                    <select
                      value={formData.operationalPhase || ''}
                      onChange={(e) => setFormData({ ...formData, operationalPhase: e.target.value as any })}
                      className="text-xs font-medium px-3 py-1 bg-blue-50 border border-slate-200 rounded-full focus:outline-none"
                    >
                      <option value="PENDING_PLANNING">Pendiente planificaciA3n</option>
                      <option value="CONSTRUCTION_PLANNING">Obra en ejecuciA3n</option>
                      <option value="INSPECTION_DONE">InspecciA3n finalizada</option>
                      <option value="COMPLETION">Completado</option>
                      <option value="CERT_INVOICING">CertificaciA3n y facturaciA3n</option>
                    </select>
                  ) : (
                    <span className="text-xs font-medium px-3 py-1 border border-slate-200 rounded-full bg-white">
                      {
                        project.operationalPhase === 'PENDING_PLANNING' ? 'Pendiente planificaciA3n' :
                        project.operationalPhase === 'CONSTRUCTION_PLANNING' ? 'Obra en ejecuciA3n' :
                        project.operationalPhase === 'INSPECTION_DONE' ? 'InspecciA3n finalizada' :
                        project.operationalPhase === 'COMPLETION' ? 'Completado' :
                        project.operationalPhase === 'CERT_INVOICING' ? 'CertificaciA3n y facturaciA3n' :
                        project.operationalPhase
                      }
                    </span>
                  )}`;
if (content.includes(headerPhaseTarget)) {
    content = content.replace(headerPhaseTarget, "");
}

// 3. Remove operationalPhase section block
const sectionPhaseTarget = `                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Etapa pipeline</span>
                  {isEditing ? (
                     <select
                     value={formData.operationalPhase || ''}
                     onChange={(e) => setFormData({ ...formData, operationalPhase: e.target.value as any })}
                     className="w-[65%] text-sm border-b border-blue-300 focus:outline-none focus:border-blue-500 bg-blue-50 text-right px-1 py-0.5 truncate"
                   >
                     <option value="PENDING_PLANNING">Pendiente planificaciA3n</option>
                     <option value="CONSTRUCTION_PLANNING">Obra en ejecuciA3n</option>
                     <option value="INSPECTION_DONE">InspecciA3n finalizada</option>
                     <option value="COMPLETION">Completado</option>
                     <option value="CERT_INVOICING">CertificaciA3n y facturaciA3n</option>
                   </select>
                  ) : (
                    <span className="text-sm font-medium text-slate-900">
                      {
                        project.operationalPhase === 'PENDING_PLANNING' ? 'Pendiente planificaciA3n' :
                        project.operationalPhase === 'CONSTRUCTION_PLANNING' ? 'Obra en ejecuciA3n' :
                        project.operationalPhase === 'INSPECTION_DONE' ? 'InspecciA3n finalizada' :
                        project.operationalPhase === 'COMPLETION' ? 'Completado' :
                        project.operationalPhase === 'CERT_INVOICING' ? 'CertificaciA3n y facturaciA3n' :
                        project.operationalPhase
                      }
                    </span>
                  )}
                </div>`;
if (content.includes(sectionPhaseTarget)) {
    content = content.replace(sectionPhaseTarget, "");
}

// 4. TIMELINE import and block
if (!content.includes('import { ProjectTimelineTab }')) {
    content = content.replace("import { ProjectReportsTab } from './tabs/ProjectReportsTab';", "import { ProjectReportsTab } from './tabs/ProjectReportsTab';\nimport { ProjectTimelineTab } from './tabs/ProjectTimelineTab';");
}
const timelineTarget = `{['FACTURACION', 'TIMELINE'].includes(activeTab) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6 p-12 text-center text-slate-400">
              Esta secciA3n estA en desarrollo.
            </div>
          )}`;
const timelineReplacement = `{activeTab === 'TIMELINE' && (
            <ProjectTimelineTab project={project} />
          )}

          {['FACTURACION'].includes(activeTab) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6 p-12 text-center text-slate-400">
              Esta secciA3n estA en desarrollo.
            </div>
          )}`;
if (content.includes(timelineTarget)) {
    content = content.replace(timelineTarget, timelineReplacement);
}

// 5. Status ENUM
const statusTarget = `<select
                      value={formData.status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-800 rounded border border-blue-200 focus:outline-none"
                    >
                      <option value="ACTIVE">Activo</option>
                      <option value="COMPLETED">Completado</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
                  ) : (
                    <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {project.status === 'ACTIVE' ? 'Activo' : project.status === 'COMPLETED' ? 'Completado' : 'Cancelado'}
                    </span>`;
const statusReplacement = `<select
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
if (content.includes(statusTarget)) {
    content = content.replace(statusTarget, statusReplacement);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Applied structural fixes");
