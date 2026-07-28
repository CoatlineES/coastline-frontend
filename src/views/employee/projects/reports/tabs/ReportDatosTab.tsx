import React, { useState, useEffect } from 'react';
import { InspectionReport } from '../../../../../types/inspection-report';
import { UserResponse } from '../../../../../services/types';
import { projectsService } from '../../../../../services/projects.service';

interface ReportDatosTabProps {
  report: InspectionReport;
  onChange: (updates: Partial<InspectionReport>) => void;
}

export function ReportDatosTab({ report, onChange }: ReportDatosTabProps) {
  const [tecnicos, setTecnicos] = useState<UserResponse[]>([]);

  useEffect(() => {
    if (report?.projectId) {
      projectsService.getById(report.projectId).then(project => {
        if (project && project.workers) {
          const validWorkers = project.workers.filter(w => w.user);
          const sortedWorkers = [...validWorkers].sort((a: any, b: any) => {
            const aIsTecnico = a.role === 'TECNICO' || a.user?.role?.name === 'TECNICO' || a.user?.role === 'TECNICO';
            const bIsTecnico = b.role === 'TECNICO' || b.user?.role?.name === 'TECNICO' || b.user?.role === 'TECNICO';
            if (aIsTecnico && !bIsTecnico) return -1;
            if (!aIsTecnico && bIsTecnico) return 1;
            return a.user?.name?.localeCompare(b.user?.name) || 0;
          });
          // Añadimos una propiedad extra _isAssignedTecnico para usarla en la vista
          const sortedUsers = sortedWorkers.map(w => ({ 
            ...w.user, 
            _isAssignedTecnico: w.role === 'TECNICO' || (w.user as any)?.role?.name === 'TECNICO' || (w.user as any)?.role === 'TECNICO' 
          }));
          setTecnicos(sortedUsers as any[]);
        }
      }).catch(err => console.error('Error fetching project team', err));
    }
  }, [report?.projectId]);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Paso 2 — Datos del informe</h2>
        <p className="text-sm text-slate-500">Configura la información general que aparecerá en la cabecera y portada.</p>
      </div>

      <div className="p-8 space-y-8">
        {/* IMPORT SECTION */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Importar datos automáticamente</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-slate-600">Datos del cliente</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-slate-600">Datos del proyecto</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Cliente</label>
            <input
              type="text"
              value={report.clientName || ''}
              onChange={e => onChange({ clientName: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Proyecto</label>
            <input
              type="text"
              value={report.number}
              disabled
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Técnico</label>
            <select
              value={report.technician || ''}
              onChange={e => onChange({ technician: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              <option value="">Selecciona un técnico...</option>
              {tecnicos.map(t => {
                const isTecnico = (t as any)._isAssignedTecnico;
                return (
                  <option key={t.id} value={t.name}>
                    {t.name} {isTecnico ? '(Técnico)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Fecha</label>
            <input
              type="date"
              value={report.date ? new Date(report.date).toISOString().split('T')[0] : ''}
              onChange={e => onChange({ date: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
