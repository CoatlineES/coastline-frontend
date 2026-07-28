import React, { useState, useEffect } from 'react';
import { Project } from '../../../../services/types';
import { dailyLogsService, DailyLog } from '../../../../services/daily-logs.service';
import { Plus, Search, Calendar, Cloud, Sun, CloudRain, Wind, User, HardHat, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DailyLogModal } from './DailyLogModal';

interface PartesDiariosViewProps {
  project: Project;
}

export function PartesDiariosView({ project }: PartesDiariosViewProps) {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, [project.id]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await dailyLogsService.getByProject(project.id);
      setLogs(data);
    } catch (error) {
      console.error('Error loading daily logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedLog(null);
    setIsModalOpen(true);
  };

  const handleEdit = (log: DailyLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const getWeatherIcon = (weather?: string) => {
    switch (weather) {
      case 'soleado': return <Sun size={18} className="text-amber-500" />;
      case 'nublado': return <Cloud size={18} className="text-slate-400" />;
      case 'lluvia': return <CloudRain size={18} className="text-blue-500" />;
      case 'viento': return <Wind size={18} className="text-slate-500" />;
      default: return <Sun size={18} className="text-slate-300" />;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden h-full">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-bold text-[#002D5A]">Partes Diarios</h2>
          <p className="text-sm text-slate-500">Registro de actividad diaria y control de personal en obra</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por fecha, notas..." 
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A] w-64"
            />
          </div>
          <button 
            onClick={handleCreateNew}
            className="bg-[#002D5A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#003b7a] transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Nuevo Parte
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400">Cargando partes diarios...</div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-10 shadow-sm">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No hay partes diarios</h3>
            <p className="text-slate-500 mb-6 text-sm">Comienza a registrar la actividad diaria para llevar el control de horas, producción e incidencias de la obra.</p>
            <button 
              onClick={handleCreateNew}
              className="bg-[#002D5A] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#003b7a] transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Crear primer parte
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logs.map((log) => {
              const totalWorkers = log.workers.length;
              const totalHours = log.workers.reduce((acc, w) => acc + w.hoursNormal + w.hoursExtra, 0);
              const totalTasks = log.tasks.length;

              return (
                <div 
                  key={log.id} 
                  onClick={() => handleEdit(log)}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-[#002D5A] hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
                >
                  {/* Decorative line */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#002D5A] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2.5 rounded-lg text-slate-600">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">
                          {new Date(log.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          {getWeatherIcon(log.weather)}
                          <span className="capitalize">{log.weather || 'No especificado'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1 font-medium uppercase tracking-wider">
                        <HardHat size={14} />
                        Personal
                      </div>
                      <div className="font-semibold text-slate-800">
                        {totalWorkers} operarios
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {totalHours} horas totales
                      </div>
                    </div>
                    
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <div className="flex items-center gap-1.5 text-emerald-700 text-xs mb-1 font-medium uppercase tracking-wider">
                        <FileText size={14} />
                        Producción
                      </div>
                      <div className="font-semibold text-emerald-800">
                        {totalTasks} partidas
                      </div>
                      <div className="text-xs text-emerald-600/70 mt-0.5">
                        avanzadas hoy
                      </div>
                    </div>
                  </div>

                  {(() => {
                    if (!log.notes) return null;
                    const lines = log.notes.split('\n');
                    const textLines: string[] = [];
                    const entries: any[] = [];
                    lines.forEach(line => {
                      try {
                        if (line.trim().startsWith('{')) {
                          entries.push(JSON.parse(line));
                        } else if (line.trim().startsWith('[')) {
                          const arr = JSON.parse(line);
                          if (Array.isArray(arr)) {
                             entries.push(...arr);
                          }
                        } else {
                          textLines.push(line);
                        }
                      } catch {
                        textLines.push(line);
                      }
                    });
                    
                    const text = textLines.join('\n').trim();
                    
                    return (
                      <>
                        {text && (
                          <div className="text-sm text-slate-600 border-t border-slate-100 pt-3 line-clamp-2">
                            <span className="font-semibold text-slate-700">Notas:</span> {text}
                          </div>
                        )}
                        {entries.length > 0 && (
                          <div className="border-t border-slate-100 pt-3 mt-3">
                            <span className="font-semibold text-slate-700 text-sm mb-2 block">Partes Individuales:</span>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                              {entries.map((entry: any, i: number) => (
                                 <div 
                                   key={i} 
                                   className="bg-slate-50 p-2.5 rounded-lg text-xs flex flex-col gap-2 border border-slate-100 cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 transition-colors"
                                   onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/app/empleado/todos-partes?tab=INDIVIDUAL&highlight=${entry.id}`);
                                   }}
                                 >
                                   <div className="flex justify-between items-center">
                                     <span className="font-bold text-slate-800">{entry.userName || entry.author} <span className="font-normal text-slate-500">({entry.time})</span></span>
                                     <div className="flex gap-2">
                                       {entry.hours && Number(entry.hours) > 0 && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{entry.hours}h</span>}
                                       {entry.quantityDone && Number(entry.quantityDone) > 0 && <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{entry.quantityDone} un.</span>}
                                     </div>
                                   </div>
                                   {(entry.text || entry.actionType !== 'General') && (
                                     <div className="text-slate-600">
                                       {entry.actionType !== 'General' && <span className="font-semibold mr-1">[{entry.actionType}]</span>}
                                       {entry.text}
                                     </div>
                                   )}
                                   {entry.photoUrls && entry.photoUrls.length > 0 && (
                                     <div className="flex gap-1 mt-1">
                                       <span className="text-blue-500 font-medium">📸 {entry.photoUrls.length} foto(s)</span>
                                     </div>
                                   )}
                                 </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User size={12} />
                      Reportado por: {log.reportedBy?.name || 'Sistema'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <DailyLogModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          log={selectedLog}
          project={project}
          onSave={() => {
            setIsModalOpen(false);
            loadLogs();
          }}
        />
      )}
    </div>
  );
}
