import React from 'react';
import { X, Clock, DollarSign } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ResourceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: {
    plannedHours: number;
    actualHours: number;
    plannedCost: number;
    actualCost: number;
    tasks: any[];
  } | null;
}

export function ResourceDetailsModal({ isOpen, onClose, title, data }: ResourceDetailsModalProps) {
  if (!isOpen || !data) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-[#002D5A]">Desglose de {title}</h2>
            <p className="text-sm text-slate-500 mt-1">Comparativa de planificación vs real</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-600 mb-2 font-medium">
                <Clock size={18} className="text-blue-500" />
                Horas / Cantidad
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400">Planificado</p>
                  <p className="text-lg font-bold text-slate-800">{data.plannedHours.toFixed(1)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Realizado</p>
                  <p className={`text-lg font-bold ${data.actualHours > data.plannedHours ? 'text-red-500' : 'text-emerald-500'}`}>
                    {data.actualHours.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-600 mb-2 font-medium">
                <DollarSign size={18} className="text-emerald-500" />
                Coste Estimado (€)
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400">Planificado</p>
                  <p className="text-lg font-bold text-slate-800">{data.plannedCost.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Realizado</p>
                  <p className={`text-lg font-bold ${data.actualCost > data.plannedCost ? 'text-red-500' : 'text-emerald-500'}`}>
                    {data.actualCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-slate-800 mb-4 px-1">Desglose por Tareas</h3>
          <div className="space-y-4">
            {data.tasks.map((taskGroup, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="font-bold text-slate-700">{taskGroup.taskName}</h4>
                </div>
                <div className="p-4">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100">
                        <th className="pb-2 font-medium">Componente</th>
                        <th className="pb-2 font-medium text-right">Hrs Plan</th>
                        <th className="pb-2 font-medium text-right">Hrs Real</th>
                        <th className="pb-2 font-medium text-right">Coste Plan</th>
                        <th className="pb-2 font-medium text-right">Coste Real</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {taskGroup.components.map((comp: any) => (
                        <tr key={comp.id}>
                          <td className="py-3 text-slate-700 font-medium">{comp.concept}</td>
                          <td className="py-3 text-right text-slate-600">{comp.plannedHours.toFixed(1)}</td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${comp.actualHours > comp.plannedHours ? 'text-red-500' : 'text-emerald-500'}`}>
                              {comp.actualHours.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 text-right text-slate-600">€{comp.plannedCost.toFixed(2)}</td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${comp.actualCost > comp.plannedCost ? 'text-red-500' : 'text-emerald-500'}`}>
                              €{comp.actualCost.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            
            {data.tasks.length === 0 && (
              <div className="text-center p-8 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-500">No hay datos de planificación para {title.toLowerCase()} en este proyecto.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
