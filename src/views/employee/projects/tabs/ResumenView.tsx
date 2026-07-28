import React, { useState, useEffect } from 'react';
import { Project } from '../../../../services/types';
import { projectPlanningService } from '../../../../services/project-planning.service';
import { Activity, CheckCircle2, Clock, Users, ShieldCheck, FileText, Calendar, AlertCircle, Wrench, HardHat } from 'lucide-react';
import { ResourceDetailsModal } from './ResourceDetailsModal';

interface ResumenViewProps {
  project: Project;
}

export function ResumenView({ project }: ResumenViewProps) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resourceModal, setResourceModal] = useState<{isOpen: boolean, type: 'MANO_OBRA' | 'MAQUINARIA' | null}>({isOpen: false, type: null});

  useEffect(() => {
    loadSummary();
  }, [project.id]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await projectPlanningService.getProjectSummary(project.id);
      setSummary(data);
    } catch (error) {
      console.error('Error loading project summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-slate-400">Cargando resumen del proyecto...</div>;
  }

  if (!summary || !summary.activePlanId) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-md shadow-sm">
          <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 mb-2">No hay un plan activo</h3>
          <p className="text-slate-500 text-sm">
            Crea un plan de obra en la pestaña "Gantt" para comenzar a rastrear el avance y las métricas del proyecto.
          </p>
        </div>
      </div>
    );
  }

  const { ganttSummary, latestDailyLog, waterproofing, laborSummary, machinerySummary } = summary;

  // Cálculos rápidos
  const totalTasks = ganttSummary.total || 1;
  const progressPercent = ganttSummary.averageProgress !== undefined 
    ? ganttSummary.averageProgress 
    : Math.round((ganttSummary.completed / totalTasks) * 100) || 0;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[#002D5A]">Resumen del Proyecto</h2>
          <p className="text-slate-500 mt-1">Visión general del estado actual y progreso de la obra.</p>
        </div>
        <button onClick={loadSummary} className="text-sm font-medium text-[#002D5A] hover:bg-[#002D5A]/5 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2">
          <Activity size={16} />
          Actualizar datos
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Avance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-800">{progressPercent}%</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Avance Global</h3>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Personal Hoy (Último parte) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-50 text-orange-600 p-2.5 rounded-lg">
              <Users size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-800">{latestDailyLog ? latestDailyLog.workersCount : 0}</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Personal en último parte</h3>
          <p className="text-xs text-slate-400 mt-2">
            {latestDailyLog ? `Fecha: ${new Date(latestDailyLog.date).toLocaleDateString()}` : 'Sin registros aún'}
          </p>
        </div>

        {/* Tareas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-800">{ganttSummary.completed}/{ganttSummary.total}</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Partidas Completadas</h3>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-slate-500"><span className="text-amber-500 font-bold">{ganttSummary.inProgress}</span> en curso</span>
            <span className="text-slate-500"><span className="text-slate-400 font-bold">{ganttSummary.pending}</span> pendientes</span>
          </div>
        </div>

        {/* Estanqueidad */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-lg">
              <ShieldCheck size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-800">{waterproofing.summary.total}</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Certificados Emitidos</h3>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-slate-500"><span className="text-emerald-500 font-bold">{waterproofing.summary.approved}</span> Aprobados</span>
            <span className="text-slate-500"><span className="text-amber-500 font-bold">{waterproofing.summary.pending}</span> Ptes</span>
          </div>
        </div>
        
        {/* Mano de Obra */}
        {laborSummary && (
          <div 
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => setResourceModal({ isOpen: true, type: 'MANO_OBRA' })}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-50 text-purple-600 p-2.5 rounded-lg">
                <HardHat size={24} />
              </div>
              <span className="text-2xl font-bold text-slate-800">
                {laborSummary.actualHours.toFixed(1)}<span className="text-sm font-normal text-slate-500"> / {laborSummary.plannedHours.toFixed(1)}h</span>
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Mano de Obra</h3>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden flex">
              <div 
                className={`h-1.5 rounded-full ${laborSummary.actualHours > laborSummary.plannedHours ? 'bg-red-500' : 'bg-purple-500'}`} 
                style={{ width: `${Math.min((laborSummary.actualHours / (laborSummary.plannedHours || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Maquinaria - temporalmente oculto */}
        {/* {machinerySummary && (
          <div 
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => setResourceModal({ isOpen: true, type: 'MAQUINARIA' })}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg">
                <Wrench size={24} />
              </div>
              <span className="text-2xl font-bold text-slate-800">
                {machinerySummary.actualHours.toFixed(1)}<span className="text-sm font-normal text-slate-500"> / {machinerySummary.plannedHours.toFixed(1)}h</span>
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">Maquinaria</h3>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden flex">
              <div 
                className={`h-1.5 rounded-full ${machinerySummary.actualHours > machinerySummary.plannedHours ? 'bg-red-500' : 'bg-amber-500'}`} 
                style={{ width: `${Math.min((machinerySummary.actualHours / (machinerySummary.plannedHours || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )} */}

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente: Partes Diarios */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-[#002D5A]" />
              Último Parte Diario
            </h3>
          </div>
          <div className="p-5 flex-1">
            {latestDailyLog ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Calendar size={16} className="text-slate-400" />
                    {new Date(latestDailyLog.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">
                    {latestDailyLog.workersCount} operarios
                  </span>
                </div>
                
                {(() => {
                  if (!latestDailyLog.notes) return <div className="text-sm text-slate-500 italic">Sin observaciones destacadas.</div>;
                  
                  const lines = latestDailyLog.notes.split('\n');
                  const textLines: string[] = [];
                  lines.forEach(line => {
                    try {
                      if (line.trim().startsWith('{') || line.trim().startsWith('[')) {
                        JSON.parse(line); // Verify it's valid JSON
                      } else {
                        textLines.push(line);
                      }
                    } catch {
                      textLines.push(line);
                    }
                  });
                  
                  const text = textLines.join('\n').trim();
                  
                  if (!text) return <div className="text-sm text-slate-500 italic">Sin observaciones destacadas.</div>;
                  
                  return (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800">
                      <span className="font-semibold block mb-1">Observaciones:</span>
                      {text}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                <FileText size={32} className="mb-2 opacity-50" />
                <span className="text-sm">No hay partes diarios registrados</span>
              </div>
            )}
          </div>
        </div>

        {/* Actividad Reciente: Certificados */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#002D5A]" />
              Certificados Recientes
            </h3>
          </div>
          <div className="p-0 flex-1">
            {waterproofing.recent.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {waterproofing.recent.map((cert: any) => (
                  <div key={cert.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-medium text-sm text-slate-800">Certificado #{cert.id.substring(0, 8)}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <Calendar size={12} /> {new Date(cert.date).toLocaleDateString()}
                        <span className="mx-1">•</span>
                        {cert.technician?.name || 'Técnico'}
                      </div>
                    </div>
                    <div>
                      {cert.status === 'APPROVED' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">Aprobado</span>}
                      {cert.status === 'REJECTED' && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md font-medium">Rechazado</span>}
                      {cert.status === 'PENDING' && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-md font-medium">Pendiente</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <ShieldCheck size={32} className="mb-2 opacity-50" />
                <span className="text-sm">No hay certificados recientes</span>
              </div>
            )}
          </div>
        </div>

      </div>

      <ResourceDetailsModal 
        isOpen={resourceModal.isOpen} 
        onClose={() => setResourceModal({ isOpen: false, type: null })}
        title={resourceModal.type === 'MANO_OBRA' ? 'Mano de Obra' : 'Maquinaria'}
        data={resourceModal.type === 'MANO_OBRA' ? laborSummary : machinerySummary}
      />
    </div>
  );
}
