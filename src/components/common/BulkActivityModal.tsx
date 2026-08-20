import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, CalendarClock } from 'lucide-react';
import { ActivityType } from '../../services/activities.service';
import { UserResponse } from '../../services/types';

export interface BulkActivityTemplate {
  subject: string;
  activityType: ActivityType;
  notes?: string;
  daysOffset: number;
  userId: string;
}

interface BulkActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activities: BulkActivityTemplate[]) => Promise<void>;
  users: UserResponse[];
  currentUserId: string;
}

export function BulkActivityModal({ isOpen, onClose, onSubmit, users, currentUserId }: BulkActivityModalProps) {
  const [activities, setActivities] = useState<BulkActivityTemplate[]>([
    { subject: '', activityType: ActivityType.LLAMADA, daysOffset: 0, userId: currentUserId, notes: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddActivity = () => {
    setActivities([
      ...activities, 
      { subject: '', activityType: ActivityType.EMAIL, daysOffset: 3, userId: currentUserId, notes: '' }
    ]);
  };

  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof BulkActivityTemplate, value: any) => {
    const newActs = [...activities];
    newActs[index] = { ...newActs[index], [field]: value };
    setActivities(newActs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activities.some(a => !a.subject || !a.userId)) return;
    setIsSubmitting(true);
    await onSubmit(activities);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#001c3a] text-white flex items-center justify-center">
              <CalendarClock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Asignación Masiva de Actividades</h3>
              <p className="text-xs text-slate-500 font-medium">Configura la cadencia de tareas para las empresas seleccionadas</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {activities.map((act, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 relative group">
                {activities.length > 1 && (
                  <button type="button" onClick={() => handleRemoveActivity(idx)} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#001c3a]/10 text-[#001c3a] flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Actividad {idx + 1}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Asunto *</label>
                    <input required type="text" value={act.subject} onChange={(e) => handleChange(idx, 'subject', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] transition-all" placeholder="Ej. Llamada de prospección" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                    <select value={act.activityType} onChange={(e) => handleChange(idx, 'activityType', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] transition-all">
                      <option value={ActivityType.CALL}>Llamada</option>
                      <option value={ActivityType.EMAIL}>Correo</option>
                      <option value={ActivityType.REUNION_COMERCIAL}>Reunión Comercial</option>
                      <option value={ActivityType.REUNION_SEGUIMIENTO}>Reunión Seguimiento</option>
                      <option value={ActivityType.SEGUIMIENTO}>Seguimiento</option>
                      <option value={ActivityType.TASK}>Otra Tarea</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Ejecución</label>
                    <select value={act.daysOffset} onChange={(e) => handleChange(idx, 'daysOffset', Number(e.target.value))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] transition-all">
                      <option value={0}>Hoy (0 días)</option>
                      <option value={1}>Mañana (1 día)</option>
                      <option value={2}>Pasado mañana (2 días)</option>
                      <option value={3}>En 3 días</option>
                      <option value={7}>En 1 semana (7 días)</option>
                      <option value={14}>En 2 semanas (14 días)</option>
                      <option value={30}>En 1 mes (30 días)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Responsable *</label>
                    <select required value={act.userId} onChange={(e) => handleChange(idx, 'userId', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] transition-all">
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.display_name || u.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Notas adicionales (Opcional)</label>
                    <textarea value={act.notes} onChange={(e) => handleChange(idx, 'notes', e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] transition-all custom-scrollbar" placeholder="Instrucciones para la actividad..."></textarea>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" onClick={handleAddActivity} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:text-[#001c3a] hover:border-[#001c3a] hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <Plus size={16} /> Añadir otra actividad a la secuencia
            </button>
          </div>

          <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-sm transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-[#001c3a] text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md flex items-center gap-2">
              {isSubmitting ? 'Generando...' : 'Generar Plan'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
