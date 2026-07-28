import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Edit2, Check, X, Search, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { holidayCalendarsService, HolidayCalendar, Holiday } from '../../../services/holiday-calendars.service';

export default function HolidayCalendarsView() {
  const [calendars, setCalendars] = useState<HolidayCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection & Forms
  const [selectedCalendar, setSelectedCalendar] = useState<HolidayCalendar | null>(null);
  const [isCreatingCalendar, setIsCreatingCalendar] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarYear, setNewCalendarYear] = useState<number | ''>('');
  
  // Holiday Form
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayDesc, setNewHolidayDesc] = useState('');
  
  // Filter
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = async () => {
    try {
      setLoading(true);
      const data = await holidayCalendarsService.getAll();
      setCalendars(data);
      if (selectedCalendar) {
        const updated = data.find(c => c.id === selectedCalendar.id);
        setSelectedCalendar(updated || null);
      }
    } catch (error) {
      toast.error('Error al cargar calendarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalendarName.trim()) return;
    try {
      await holidayCalendarsService.create({ 
        name: newCalendarName, 
        year: newCalendarYear === '' ? undefined : Number(newCalendarYear) 
      });
      toast.success('Calendario creado');
      setIsCreatingCalendar(false);
      setNewCalendarName('');
      setNewCalendarYear('');
      loadCalendars();
    } catch (error) {
      toast.error('Error al crear calendario');
    }
  };

  const handleDeleteCalendar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Seguro que quieres eliminar este calendario?')) return;
    try {
      await holidayCalendarsService.delete(id);
      toast.success('Calendario eliminado');
      if (selectedCalendar?.id === id) setSelectedCalendar(null);
      loadCalendars();
    } catch (error) {
      toast.error('Error al eliminar calendario');
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCalendar || !newHolidayDate) return;
    try {
      await holidayCalendarsService.addHoliday(selectedCalendar.id, {
        date: newHolidayDate,
        description: newHolidayDesc || undefined
      });
      toast.success('Festivo añadido');
      setIsAddingHoliday(false);
      setNewHolidayDate('');
      setNewHolidayDesc('');
      loadCalendars();
    } catch (error) {
      toast.error('Error al añadir festivo');
    }
  };

  const handleDeleteHoliday = async (holidayId: string) => {
    if (!selectedCalendar) return;
    try {
      await holidayCalendarsService.removeHoliday(selectedCalendar.id, holidayId);
      toast.success('Festivo eliminado');
      loadCalendars();
    } catch (error) {
      toast.error('Error al eliminar festivo');
    }
  };

  const uniqueCountries = Array.from(
    new Set(calendars.map(c => c.name.replace(/\s\d{4}$/, '').trim()))
  ).sort();

  const filteredCalendars = calendars.filter(c => 
    countryFilter ? c.name.startsWith(countryFilter) : true
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
      {selectedCalendar ? (
        // DETAIL VIEW
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="px-8 py-6 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
            <div>
              <button 
                onClick={() => setSelectedCalendar(null)}
                className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2 transition-colors"
              >
                <ChevronRight size={14} className="rotate-180" />
                Volver a calendarios
              </button>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <CalendarIcon size={24} className="text-primary" />
                {selectedCalendar.name}
                {selectedCalendar.year && (
                  <span className="text-sm font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                    {selectedCalendar.year}
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-500 mt-1">Gestiona los días no laborables para esta región o país.</p>
            </div>
            <button 
              onClick={() => setIsAddingHoliday(true)}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus size={16} />
              Añadir Festivo
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="max-w-4xl mx-auto">
              {isAddingHoliday && (
                <form onSubmit={handleAddHoliday} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Añadir Nuevo Festivo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Fecha</label>
                      <input
                        type="date"
                        value={newHolidayDate}
                        onChange={e => setNewHolidayDate(e.target.value)}
                        className="w-full border-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Descripción (Opcional)</label>
                      <input
                        type="text"
                        value={newHolidayDesc}
                        onChange={e => setNewHolidayDesc(e.target.value)}
                        placeholder="Ej: Año Nuevo"
                        className="w-full border-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setIsAddingHoliday(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                      Añadir
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800">Días Festivos Configurados</h3>
                  <div className="text-sm text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                    Total: <span className="font-bold text-slate-700">{selectedCalendar.holidays.length}</span>
                  </div>
                </div>
                
                {selectedCalendar.holidays.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <CalendarIcon size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-1">No hay festivos</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      Este calendario aún no tiene días festivos configurados. Añade el primer día festivo usando el botón superior.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                        <th className="px-6 py-3 font-medium">Fecha</th>
                        <th className="px-6 py-3 font-medium">Día</th>
                        <th className="px-6 py-3 font-medium">Descripción</th>
                        <th className="px-6 py-3 font-medium w-24 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...selectedCalendar.holidays]
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((holiday) => {
                        const hDate = parseISO(holiday.date);
                        return (
                          <tr key={holiday.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-3">
                              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold text-sm border border-blue-100">
                                {format(hDate, 'dd MMM yyyy', { locale: es })}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-slate-600 capitalize">
                              {format(hDate, 'EEEE', { locale: es })}
                            </td>
                            <td className="px-6 py-3 text-sm text-slate-700 font-medium">
                              {holiday.description || '-'}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <button 
                                onClick={() => handleDeleteHoliday(holiday.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                title="Eliminar festivo"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // GRID VIEW
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Calendarios por País/Región</h1>
              <p className="text-sm text-slate-500 mt-1">Gestiona los días festivos agrupados por zonas geográficas (España, Madrid, Colombia, Chile, etc.)</p>
            </div>
            <button 
              onClick={() => setIsCreatingCalendar(true)}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus size={16} />
              Nuevo Calendario
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="mb-6 max-w-xs">
              <label className="block text-sm font-medium text-slate-700 mb-2">Filtrar por País/Región</label>
              <select
                value={countryFilter}
                onChange={e => setCountryFilter(e.target.value)}
                className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-primary focus:border-primary shadow-sm"
              >
                <option value="">Todos</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {isCreatingCalendar && (
              <form onSubmit={handleCreateCalendar} className="bg-white p-6 rounded-xl border border-blue-200 shadow-md mb-8 max-w-2xl mx-auto ring-4 ring-blue-50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CalendarIcon className="text-primary" size={20} />
                  Crear Nuevo Calendario
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Región o País</label>
                    <input
                      autoFocus
                      type="text"
                      value={newCalendarName}
                      onChange={e => setNewCalendarName(e.target.value)}
                      placeholder="Ej: España (General), Colombia, Madrid..."
                      className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Año (Opcional)</label>
                    <input
                      type="number"
                      value={newCalendarYear}
                      onChange={e => setNewCalendarYear(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Ej: 2026"
                      className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsCreatingCalendar(false)} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="px-5 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                    Guardar Calendario
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-40 text-slate-500">Cargando calendarios...</div>
            ) : calendars.length === 0 && !isCreatingCalendar ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                  <CalendarIcon size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-medium text-slate-800 mb-2">Aún no hay calendarios</h3>
                <p className="text-slate-500 max-w-md">Comienza creando un calendario para tu región principal (ej. España, Chile) usando el botón de la parte superior.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCalendars.map(cal => (
                  <div 
                    key={cal.id} 
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-primary/30 flex flex-col group overflow-hidden cursor-pointer"
                    onClick={() => setSelectedCalendar(cal)}
                  >
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center">
                          <CalendarIcon size={24} />
                        </div>
                        <button 
                          onClick={(e) => handleDeleteCalendar(cal.id, e)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="Eliminar calendario"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1" title={cal.name}>
                        {cal.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {cal.year && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Año {cal.year}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {cal.holidays.length} días festivos
                        </span>
                      </div>
                    </div>
                    
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-sm font-medium text-primary flex items-center justify-between group-hover:bg-primary group-hover:text-white transition-colors">
                      Gestionar días libres
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
