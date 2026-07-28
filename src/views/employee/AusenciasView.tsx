import React, { useState, useEffect, useMemo } from 'react';
import { CalendarOff, Send, Clock, CheckCircle2, XCircle, FileText, Upload, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { absencesService, Absence, CreateAbsenceDTO } from '../../services/absences.service';
import { uploadService } from '../../services/upload.service';

const ABSENCE_TYPES = {
  VACACIONES: { label: "Vacaciones Anuales", info: "22 días laborables al año.", maxDays: 22 },
  ENFERMEDAD: { label: "Baja por Enfermedad (IT)", info: "Requiere justificante médico.", maxDays: null },
  MATRIMONIO: { label: "Matrimonio", info: "15 días naturales.", maxDays: 15 },
  MUDANZA: { label: "Mudanza", info: "1 día laborable.", maxDays: 1 },
  HOSPITALIZACION: { label: "Fallecimiento / Hospitalización", info: "5 días laborables (hasta 2º grado).", maxDays: 5 },
  CITA_MEDICA: { label: "Cita Médica", info: "El tiempo indispensable.", maxDays: 1 },
  ASUNTOS_PROPIOS: { label: "Asuntos Propios", info: "Según convenio aplicable.", maxDays: null },
  OTROS: { label: "Otros", info: "Especificar en comentarios.", maxDays: null }
};

export default function AusenciasView() {
  const { user } = useAuth();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [type, setType] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [comments, setComments] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const loadAbsences = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await absencesService.getUserAbsences(user.id);
      setAbsences(data);
    } catch (err) {
      console.error('Error loading absences', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAbsences();
  }, [user]);

  // Calculate business days between two dates (excluding weekends)
  const calculateBusinessDays = (start: Date, end: Date) => {
    let count = 0;
    const curDate = new Date(start.getTime());
    while (curDate <= end) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  const getAbsenceDays = (absence: Absence) => {
    const start = new Date(absence.startDate);
    const end = new Date(absence.endDate);
    
    if (absence.type === 'MATRIMONIO') {
      // Natural days
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    // Default to business days
    return calculateBusinessDays(start, end);
  };

  const vacationStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const approvedVacations = absences.filter(
      a => a.type === 'VACACIONES' && 
           a.status === 'APPROVED' && 
           new Date(a.startDate).getFullYear() === currentYear
    );
    
    const consumedDays = approvedVacations.reduce((acc, curr) => acc + getAbsenceDays(curr), 0);
    const totalAllowed = ABSENCE_TYPES.VACACIONES.maxDays || 22;
    
    return {
      consumed: consumedDays,
      remaining: totalAllowed - consumedDays,
      total: totalAllowed
    };
  }, [absences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      let attachmentUrl = undefined;
      
      if (file) {
        setUploadingFile(true);
        attachmentUrl = await uploadService.uploadFile(file);
        setUploadingFile(false);
      }

      await absencesService.create({
        type,
        startDate,
        endDate,
        comments,
        attachmentUrl
      });
      
      setIsSuccess(true);
      setType('');
      setStartDate('');
      setEndDate('');
      setComments('');
      setFile(null);
      
      await loadAbsences();
      
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
      setUploadingFile(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que desea eliminar esta solicitud pendiente?')) return;
    try {
      await absencesService.delete(id);
      setAbsences(absences.filter(a => a.id !== id));
    } catch (err) {
      alert('Error al eliminar la solicitud.');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8">
      <header>
        <h1 className="font-display font-bold text-3xl text-slate-800">Ausencias y Vacaciones</h1>
        <p className="font-sans text-slate-500 mt-1">Gestione sus vacaciones, permisos y consulte el estado de sus solicitudes según normativa.</p>
      </header>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Vacaciones Totales (Año)</p>
            <p className="text-2xl font-bold text-slate-800">{vacationStats.total} <span className="text-sm font-normal text-slate-500">días laborables</span></p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Días Disfrutados</p>
            <p className="text-2xl font-bold text-slate-800">{vacationStats.consumed} <span className="text-sm font-normal text-slate-500">días</span></p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Días Restantes</p>
            <p className="text-2xl font-bold text-slate-800">{vacationStats.remaining} <span className="text-sm font-normal text-slate-500">días</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formulario de Solicitud */}
        <section className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 h-fit">
          <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CalendarOff size={18} className="text-secondary" /> Nueva Solicitud
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="font-sans font-bold text-sm text-slate-700">Tipo de Ausencia</label>
              <select 
                required 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="">Seleccione el motivo...</option>
                {Object.entries(ABSENCE_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              {type && (
                <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 flex items-start gap-1">
                  <FileText size={14} className="shrink-0 mt-0.5 text-secondary" />
                  {(ABSENCE_TYPES as any)[type].info}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-sans font-bold text-sm text-slate-700">Fecha Inicio</label>
                <input 
                  type="date" 
                  required 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-secondary/50" 
                />
              </div>
              <div className="space-y-2">
                <label className="font-sans font-bold text-sm text-slate-700">Fecha Fin</label>
                <input 
                  type="date" 
                  required 
                  value={endDate}
                  min={startDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-secondary/50" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-sans font-bold text-sm text-slate-700">Justificante (Opcional)</label>
              <div className="relative">
                <input 
                  type="file" 
                  id="file-upload"
                  className="hidden"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,image/*"
                />
                <label 
                  htmlFor="file-upload" 
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg px-4 py-3 text-slate-600 font-sans cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <Upload size={18} />
                  <span className="truncate max-w-[200px]">
                    {file ? file.name : 'Subir archivo (PDF, IMG)'}
                  </span>
                </label>
              </div>
              {type === 'ENFERMEDAD' && !file && (
                <p className="text-xs text-red-500 font-medium">⚠️ Recomendado subir parte médico.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-sans font-bold text-sm text-slate-700">Comentarios Adicionales</label>
              <textarea 
                rows={3} 
                value={comments}
                onChange={e => setComments(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none" 
              />
            </div>
            
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isSuccess || uploadingFile}
              className={`w-full py-3.5 mt-2 rounded-xl font-bold font-sans text-white flex items-center justify-center gap-2 transition-all shadow-md ${
                isSuccess ? 'bg-green-500' : 'bg-primary hover:bg-[#002a50]'
              } disabled:opacity-80`}
            >
              {isSubmitting || uploadingFile ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {uploadingFile ? 'Subiendo archivo...' : 'Enviando...'}
                </>
              ) : isSuccess ? (
                <><CheckCircle2 size={18} /> Solicitud Enviada</>
              ) : (
                <><Send size={18} /> Enviar a RRHH</>
              )}
            </button>
          </form>
        </section>

        {/* Historial */}
        <section className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Clock size={18} className="text-secondary" /> Mis Solicitudes
          </h2>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <span className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></span>
              </div>
            ) : absences.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <CalendarOff size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No tienes solicitudes de ausencia registradas.</p>
              </div>
            ) : (
              <table className="w-full text-left font-sans text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="pb-3 font-semibold uppercase tracking-wider">Tipo</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Fechas</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-center">Días</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-right">Estado</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {absences.map(absence => {
                    const days = getAbsenceDays(absence);
                    const s = new Date(absence.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                    const e = new Date(absence.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                    const label = (ABSENCE_TYPES as any)[absence.type]?.label || absence.type;
                    
                    return (
                      <tr key={absence.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-slate-700">{label}</div>
                          {absence.attachmentUrl && (
                            <a href={absence.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                              <FileText size={12} /> Justificante
                            </a>
                          )}
                        </td>
                        <td className="py-4 text-slate-500">{s} - {e}</td>
                        <td className="py-4 text-slate-600 text-center font-medium">{days}</td>
                        <td className="py-4 text-right">
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
                        <td className="py-4 text-right">
                          {absence.status === 'PENDING' && (
                            <button 
                              onClick={() => handleDelete(absence.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Cancelar solicitud"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
