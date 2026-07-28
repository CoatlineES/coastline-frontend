import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Trash2 } from 'lucide-react';
import { Project } from '../../../../services/types';
import { HolidayCalendar } from '../../../../services/holiday-calendars.service';

interface CalendarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  calendars: HolidayCalendar[];
  onSave: (data: Partial<Project>) => Promise<void>;
}

export function CalendarSettingsModal({ isOpen, onClose, project, calendars, onSave }: CalendarSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [workSaturdays, setWorkSaturdays] = useState(project.workSaturdays || false);
  const [selectedCalendarId, setSelectedCalendarId] = useState(project.holidayCalendarId || '');
  const [customWorkingDays, setCustomWorkingDays] = useState<string[]>(project.customWorkingDays || []);
  const [customNonWorkingDays, setCustomNonWorkingDays] = useState<string[]>(project.customNonWorkingDays || []);
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => {
    if (isOpen) {
      setWorkSaturdays(project.workSaturdays || false);
      setSelectedCalendarId(project.holidayCalendarId || '');
      setCustomWorkingDays(project.customWorkingDays || []);
      setCustomNonWorkingDays(project.customNonWorkingDays || []);
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  // Filter calendars by year (only current and next year) and country
  const filteredCalendars = calendars.filter(cal => {
    const yearMatch = !cal.year || cal.year === currentYear || cal.year === nextYear;
    const countryMatch = countryFilter ? cal.countryCode === countryFilter : true;
    return yearMatch && countryMatch;
  });

  const uniqueCountries = Array.from(new Set(calendars.map(c => c.countryCode).filter(Boolean)));

  const handleSave = async () => {
    setLoading(true);
    try {
      // Auto-add any pending dates in the inputs before saving
      let finalWorking = [...customWorkingDays];
      let finalNonWorking = [...customNonWorkingDays];
      
      const inputWorking = document.getElementById('date-input-working') as HTMLInputElement;
      if (inputWorking && inputWorking.value && !finalWorking.includes(inputWorking.value)) {
        finalWorking.push(inputWorking.value);
        setCustomWorkingDays(finalWorking);
      }
      
      const inputNonWorking = document.getElementById('date-input-nonWorking') as HTMLInputElement;
      if (inputNonWorking && inputNonWorking.value && !finalNonWorking.includes(inputNonWorking.value)) {
        finalNonWorking.push(inputNonWorking.value);
        setCustomNonWorkingDays(finalNonWorking);
      }

      await onSave({
        holidayCalendarId: selectedCalendarId || null,
        workSaturdays,
        customWorkingDays: finalWorking,
        customNonWorkingDays: finalNonWorking
      });
      onClose();
    } catch (e) {
      console.error(e);
      alert('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const addCustomDate = (type: 'working' | 'nonWorking') => {
    const input = document.getElementById(`date-input-${type}`) as HTMLInputElement;
    if (input && input.value) {
      if (type === 'working' && !customWorkingDays.includes(input.value)) {
        setCustomWorkingDays([...customWorkingDays, input.value]);
      } else if (type === 'nonWorking' && !customNonWorkingDays.includes(input.value)) {
        setCustomNonWorkingDays([...customNonWorkingDays, input.value]);
      }
      input.value = '';
    }
  };

  const removeCustomDate = (type: 'working' | 'nonWorking', date: string) => {
    if (type === 'working') {
      setCustomWorkingDays(customWorkingDays.filter(d => d !== date));
    } else {
      setCustomNonWorkingDays(customNonWorkingDays.filter(d => d !== date));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={24} className="text-primary" />
            Configuración de Calendario y Días Laborables
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Calendario Festivo Base */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Calendario Festivo Base</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Filtrar por País</label>
                <select 
                  value={countryFilter} 
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary"
                >
                  <option value="">Todos</option>
                  {uniqueCountries.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>
              <div className="flex-[2]">
                <label className="block text-xs text-slate-500 mb-1">Seleccionar Calendario</label>
                <select 
                  value={selectedCalendarId}
                  onChange={(e) => setSelectedCalendarId(e.target.value)}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary"
                >
                  <option value="">Ninguno</option>
                  {filteredCalendars.map(cal => (
                    <option key={cal.id} value={cal.id}>{cal.name} {cal.year ? `(${cal.year})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Solo se muestran los calendarios del año actual ({currentYear}) y el siguiente ({nextYear}).</p>
          </div>

          {/* Opciones Generales */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Opciones Generales</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={workSaturdays}
                onChange={(e) => setWorkSaturdays(e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-700">Trabajar los sábados (por defecto)</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Días Excepcionales Trabajados */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Días Habilitados (Excepciones)</h3>
              <p className="text-xs text-slate-500 mb-3">Días que normalmente no se trabajan pero se habilitan para este proyecto (ej: un domingo o festivo).</p>
              
              <div className="flex gap-2 mb-3">
                <input type="date" id="date-input-working" className="text-sm border-slate-300 rounded-md py-1.5 px-3 flex-1" />
                <button onClick={() => addCustomDate('working')} className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-1.5 rounded-md">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {customWorkingDays.map(date => (
                  <div key={date} className="flex justify-between items-center bg-white border border-slate-200 px-3 py-1.5 rounded-md text-sm">
                    <span className="text-slate-700">{date}</span>
                    <button onClick={() => removeCustomDate('working', date)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {customWorkingDays.length === 0 && <span className="text-xs text-slate-400">No hay excepciones.</span>}
              </div>
            </div>

            {/* Días Excepcionales No Trabajados */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Días Bloqueados (Excepciones)</h3>
              <p className="text-xs text-slate-500 mb-3">Días que normalmente se trabajan pero se bloquean para este proyecto (ej: un evento local).</p>
              
              <div className="flex gap-2 mb-3">
                <input type="date" id="date-input-nonWorking" className="text-sm border-slate-300 rounded-md py-1.5 px-3 flex-1" />
                <button onClick={() => addCustomDate('nonWorking')} className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-1.5 rounded-md">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {customNonWorkingDays.map(date => (
                  <div key={date} className="flex justify-between items-center bg-white border border-slate-200 px-3 py-1.5 rounded-md text-sm">
                    <span className="text-slate-700">{date}</span>
                    <button onClick={() => removeCustomDate('nonWorking', date)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {customNonWorkingDays.length === 0 && <span className="text-xs text-slate-400">No hay bloqueos extras.</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}
