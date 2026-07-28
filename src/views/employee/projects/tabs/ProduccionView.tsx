import React, { useState, useEffect } from 'react';
import { Project } from '../../../../services/types';
import { projectPlanningService } from '../../../../services/project-planning.service';
import { Activity, RefreshCw, BarChart2, AlertCircle } from 'lucide-react';

interface ProduccionViewProps {
  project: Project;
}

export function ProduccionView({ project }: ProduccionViewProps) {
  const [production, setProduction] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduction();
  }, [project.id]);

  const loadProduction = async () => {
    try {
      setLoading(true);
      const data = await projectPlanningService.getProductionSummary(project.id);
      setProduction(data);
    } catch (error) {
      console.error('Error loading production summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-slate-400">Cargando avance de producción...</div>;
  }

  // Calculate totals
  const totalPlanned = production.reduce((sum, item) => sum + (item.planned || 0), 0);
  const totalExecuted = production.reduce((sum, item) => sum + (item.executed || 0), 0);
  const averageProgress = production.length > 0 
    ? Math.round((production.reduce((sum, item) => sum + item.percentage, 0) / production.length)) 
    : 0;

  return (
    <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col h-full">
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-bold text-[#002D5A]">Control de Producción</h2>
          <p className="text-sm text-slate-500">Avance físico de las partidas según las cantidades de los partes diarios.</p>
        </div>
        <button onClick={loadProduction} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        
        {production.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-10 shadow-sm">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#002D5A]">
              <BarChart2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No hay partidas en ejecución</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Para ver el avance de producción, asegúrate de tener un plan de obra activo con tareas que tengan cantidades planificadas.
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-w-6xl mx-auto">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                  <Activity size={24} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Avance Promedio</div>
                  <div className="text-2xl font-bold text-slate-800">{averageProgress}%</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className="bg-slate-50 text-slate-600 p-3 rounded-lg">
                  <BarChart2 size={24} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Total Unidades Planificadas</div>
                  <div className="text-2xl font-bold text-slate-800">{totalPlanned.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Total Unidades Ejecutadas</div>
                  <div className="text-2xl font-bold text-slate-800">{totalExecuted.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium w-1/3">Partida</th>
                      <th className="px-6 py-4 font-medium text-center">Planificado</th>
                      <th className="px-6 py-4 font-medium text-center">Ejecutado (Acumulado)</th>
                      <th className="px-6 py-4 font-medium text-center">Progreso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {production.map((item) => {
                      // Determine progress color
                      let progressColor = "bg-blue-500";
                      let textColor = "text-blue-600";
                      let bgColor = "bg-blue-50";
                      
                      if (item.percentage >= 100) {
                        progressColor = "bg-emerald-500";
                        textColor = "text-emerald-700";
                        bgColor = "bg-emerald-50";
                      } else if (item.percentage > 0 && item.percentage < 100) {
                        progressColor = "bg-amber-500";
                        textColor = "text-amber-600";
                        bgColor = "bg-amber-50";
                      } else {
                        progressColor = "bg-slate-300";
                        textColor = "text-slate-500";
                        bgColor = "bg-slate-50";
                      }

                      // Check for over-execution
                      const isOver = item.percentage > 100;

                      return (
                        <tr key={item.taskId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-medium text-slate-800">{item.name}</span>
                          </td>
                          <td className="px-6 py-4 text-center text-slate-600">
                            {item.planned > 0 ? `${item.planned} ${item.unit}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-center font-medium">
                            <span className={item.executed > 0 ? "text-emerald-600" : "text-slate-400"}>
                              {item.executed > 0 ? `${item.executed} ${item.unit}` : '0'}
                            </span>
                            {isOver && (
                              <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
                                +{item.percentage - 100}% Exceso
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 w-1/4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-2 rounded-full ${progressColor}`} 
                                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className={`text-xs font-bold px-2 py-1 rounded-md ${bgColor} ${textColor} w-14 text-center`}>
                                {item.percentage}%
                              </span>
                            </div>
                          </td>
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
