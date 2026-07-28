import React, { useState, useEffect } from 'react';
import { Project } from '../../../../services/types';
import { projectPlanningService } from '../../../../services/project-planning.service';
import { Users, Clock, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';

interface OperariosViewProps {
  project: Project;
}

export function OperariosView({ project }: OperariosViewProps) {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkers();
  }, [project.id]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const data = await projectPlanningService.getWorkersSummary(project.id);
      setWorkers(data);
    } catch (error) {
      console.error('Error loading workers summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-slate-400">Cargando resumen de operarios...</div>;
  }

  const totalNormalHours = Math.round(workers.reduce((sum, w) => sum + w.hoursNormal, 0) * 100) / 100;
  const totalExtraHours = Math.round(workers.reduce((sum, w) => sum + w.hoursExtra, 0) * 100) / 100;

  return (
    <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col h-full">
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-bold text-[#002D5A]">Resumen de Operarios</h2>
          <p className="text-sm text-slate-500">Acumulado de horas trabajadas según los partes diarios.</p>
        </div>
        <button onClick={loadWorkers} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        
        {workers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-10 shadow-sm">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#002D5A]">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No hay operarios registrados</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Las horas se calculan automáticamente en base a los partes diarios. Aún no hay partes registrados para esta obra.
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl mx-auto">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Total Personas</div>
                  <div className="text-2xl font-bold text-slate-800">{workers.length}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Horas Normales (Total)</div>
                  <div className="text-2xl font-bold text-slate-800">{totalNormalHours}h</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className="bg-amber-50 text-amber-600 p-3 rounded-lg">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Horas Extras (Total)</div>
                  <div className="text-2xl font-bold text-slate-800">{totalExtraHours}h</div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">Operario / Subcontrata</th>
                      <th className="px-6 py-4 font-medium text-center">Tipo</th>
                      <th className="px-6 py-4 font-medium text-center">Días en Obra</th>
                      <th className="px-6 py-4 font-medium text-center">Total Horas Normales</th>
                      <th className="px-6 py-4 font-medium text-center">Total Horas Extras</th>
                      <th className="px-6 py-4 font-medium text-center text-[#002D5A]">Horas Totales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workers.map((worker) => {
                      const total = worker.hoursNormal + worker.hoursExtra;
                      return (
                        <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                worker.type === 'INTERNAL' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {worker.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-800">{worker.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {worker.type === 'INTERNAL' ? (
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md">
                                <UserCheck size={12} /> Empleado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md">
                                Externo
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center text-slate-600">{worker.daysWorked}</td>
                          <td className="px-6 py-4 text-center text-emerald-600 font-medium">{worker.hoursNormal}h</td>
                          <td className="px-6 py-4 text-center text-amber-600 font-medium">{worker.hoursExtra > 0 ? `${worker.hoursExtra}h` : '-'}</td>
                          <td className="px-6 py-4 text-center text-[#002D5A] font-bold text-base">{total}h</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
