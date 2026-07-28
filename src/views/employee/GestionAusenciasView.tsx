import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, FileText, CalendarOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { absencesService, Absence } from '../../services/absences.service';

const ABSENCE_TYPES = {
  VACACIONES: "Vacaciones Anuales",
  ENFERMEDAD: "Baja por Enfermedad (IT)",
  MATRIMONIO: "Matrimonio",
  MUDANZA: "Mudanza",
  HOSPITALIZACION: "Fallecimiento / Hospitalización",
  CITA_MEDICA: "Cita Médica",
  ASUNTOS_PROPIOS: "Asuntos Propios",
  OTROS: "Otros"
};

export default function GestionAusenciasView() {
  const { user } = useAuth();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadAbsences = async () => {
    try {
      setIsLoading(true);
      // getAll retrieves all absences, sorted by newest first
      const data = await absencesService.getAll();
      setAbsences(data);
    } catch (err) {
      console.error('Error loading absences', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAbsences();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!window.confirm(`¿Seguro que deseas ${status === 'APPROVED' ? 'APROBAR' : 'RECHAZAR'} esta solicitud?`)) return;
    
    try {
      setProcessingId(id);
      await absencesService.updateStatus(id, status);
      // Update local state to reflect changes instantly without reloading everything
      setAbsences(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (err) {
      alert('Error al actualizar el estado.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAbsences = absences.filter(a => filter === 'ALL' || a.status === filter);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-800">Gestión de Ausencias</h1>
          <p className="font-sans text-slate-500 mt-1">Revise y apruebe las solicitudes de vacaciones y permisos del personal.</p>
        </div>
        
        {/* Filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'PENDING' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Pendientes
          </button>
          <button 
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'APPROVED' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Aprobadas
          </button>
          <button 
            onClick={() => setFilter('REJECTED')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'REJECTED' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Rechazadas
          </button>
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Todas
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <span className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></span>
            </div>
          ) : filteredAbsences.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <CalendarOff size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold text-slate-700 mb-1">No hay solicitudes</p>
              <p>No se encontraron solicitudes con el filtro actual.</p>
            </div>
          ) : (
            <table className="w-full text-left font-sans text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500">
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Empleado</th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Tipo de Ausencia</th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Fechas</th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Comentarios</th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs text-right">Estado</th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAbsences.map(absence => {
                  const s = new Date(absence.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                  const e = new Date(absence.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                  const label = (ABSENCE_TYPES as any)[absence.type] || absence.type;
                  const isProcessing = processingId === absence.id;

                  return (
                    <tr key={absence.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{absence.user?.name || 'Usuario Desconocido'}</div>
                        <div className="text-xs text-slate-500">{absence.user?.email || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-700">{label}</div>
                        {absence.attachmentUrl && (
                          <a href={absence.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-semibold">
                            <FileText size={12} /> Ver Justificante
                          </a>
                        )}
                        {absence.type === 'ENFERMEDAD' && !absence.attachmentUrl && (
                          <span className="text-[10px] text-amber-600 flex items-center gap-1 mt-1 font-medium bg-amber-50 w-fit px-1.5 py-0.5 rounded">
                            <AlertTriangle size={10} /> Sin justificante
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium whitespace-nowrap">
                        {s} - {e}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        <p className="line-clamp-2 max-w-[250px] text-xs" title={absence.comments}>
                          {absence.comments || <span className="italic text-slate-300">Sin comentarios</span>}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {absence.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-md text-xs font-bold border border-green-200">
                            <CheckCircle2 size={14} /> Aprobado
                          </span>
                        )}
                        {absence.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-md text-xs font-bold border border-yellow-200">
                            <Clock size={14} /> Pendiente
                          </span>
                        )}
                        {absence.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-md text-xs font-bold border border-red-200">
                            <XCircle size={14} /> Rechazado
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {absence.status === 'PENDING' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(absence.id, 'APPROVED')}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-lg font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              {isProcessing ? '...' : <><CheckCircle2 size={14} /> Aprobar</>}
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(absence.id, 'REJECTED')}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              {isProcessing ? '...' : <><XCircle size={14} /> Rechazar</>}
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-xs text-slate-400 font-medium italic">
                            Procesado
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
