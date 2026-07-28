import React, { useState, useEffect } from 'react';
import { dailyLogsService, DailyLog } from '../../services/daily-logs.service';
import { myDayService } from '../../services/my-day.service';
import toast from 'react-hot-toast';
import { Search, Calendar, Cloud, Sun, CloudRain, Wind, User, HardHat, FileText, Activity, Clock, TrendingUp, CheckCircle, Briefcase, Camera, UserCircle2, AlertTriangle, Package, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface FeedEntry {
  id: string;
  time: string;
  author?: string;
  userName?: string;
  actionType: string;
  text: string;
  taskId?: string;
  taskName?: string;
  roleName?: string;
  componentId?: string;
  hours?: number;
  quantityDone?: number;
  photoUrls?: string[];
  // Relational data added for global view
  projectId: string;
  projectName: string;
  projectDate: string;
}

export default function TodosPartesView() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'PROYECTO' | 'INDIVIDUAL') || 'PROYECTO';
  const highlightId = searchParams.get('highlight');

  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [feedEntries, setFeedEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [activeTab, setActiveTab] = useState<'PROYECTO' | 'INDIVIDUAL'>(initialTab);
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | null>(highlightId);
  const navigate = useNavigate();

  useEffect(() => {
    loadLogs().then(() => {
      if (highlightId) {
        setTimeout(() => {
          const el = document.getElementById(`entry-${highlightId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
        setTimeout(() => {
          setHighlightedEntryId(null);
        }, 3000);
      }
    });
  }, [highlightId]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await dailyLogsService.getAll();
      setLogs(data);

      // Extract individual feed entries
      const entries: FeedEntry[] = [];
      data.forEach(log => {
        if (log.notes) {
          const lines = log.notes.split('\n');
          lines.forEach(line => {
            try {
              if (line.trim().startsWith('{')) {
                const parsed = JSON.parse(line);
                const taskNameFallback = log.tasks?.find(t => t.projectTaskId === parsed.taskId)?.projectTask?.name;
                entries.push({
                  ...parsed,
                  taskName: parsed.taskName || taskNameFallback,
                  projectId: log.projectId,
                  projectName: log.project?.name || 'Desconocido',
                  projectDate: log.date
                });
              }
            } catch (e) {}
          });
        }
      });
      // Sort entries by date (desc) and time (desc)
      entries.sort((a, b) => {
        const dateA = new Date(a.projectDate).getTime();
        const dateB = new Date(b.projectDate).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return (b.time || '').localeCompare(a.time || '');
      });
      setFeedEntries(entries);
    } catch (error) {
      console.error('Error loading daily logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedEntry = async (e: React.MouseEvent, entryId: string, projectId: string, dateStr: string) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que quieres borrar esta entrada individual? Se restarán las horas y avances reportados.')) {
      return;
    }
    try {
      await myDayService.deleteFeedEntry(entryId, projectId, dateStr);
      toast.success('Entrada individual eliminada');
      loadLogs(); // Refresh everything
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const handleGoToIndividual = (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    setActiveTab('INDIVIDUAL');
    setHighlightedEntryId(entryId);
    setTimeout(() => {
      const el = document.getElementById(`entry-${entryId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    setTimeout(() => {
      setHighlightedEntryId(null);
    }, 3000);
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

  const uniqueProjects = Array.from(new Set(logs.map(log => log.project?.name))).filter(Boolean).sort();
  const uniqueUsers = Array.from(new Set(feedEntries.map(entry => entry.userName || entry.author))).filter(Boolean).sort();

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const projectName = (log.project?.name || 'Desconocido').toLowerCase();
    const reportedBy = (log.reportedBy?.name || 'Desconocido').toLowerCase();
    let notes = (log.notes || '').toLowerCase();
    
    // Si es JSON, tratamos de extraer el texto para la búsqueda
    try {
      if (notes.startsWith('{') || notes.startsWith('[')) {
        const parsed = JSON.parse(notes);
        if (Array.isArray(parsed)) {
          notes = parsed.map(n => n.text).join(' ').toLowerCase();
        } else {
          notes = (parsed.text || '').toLowerCase();
        }
      }
    } catch (e) {}
    
    const matchesSearch = projectName.includes(term) || reportedBy.includes(term) || notes.includes(term);
    const matchesProjectFilter = filterProject ? (log.project?.name === filterProject) : true;
    
    return matchesSearch && matchesProjectFilter;
  });

  const filteredFeed = feedEntries.filter(entry => {
    const term = searchTerm.toLowerCase();
    const projectName = entry.projectName.toLowerCase();
    const userName = (entry.userName || entry.author || '').toLowerCase();
    const text = (entry.text || '').toLowerCase();
    
    const matchesSearch = projectName.includes(term) || userName.includes(term) || text.includes(term);
    const matchesUserFilter = filterUser ? ((entry.userName || entry.author) === filterUser) : true;
    
    return matchesSearch && matchesUserFilter;
  });

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen overflow-hidden">
      {/* HEADER GERENCIAL */}
      <div className="bg-gradient-to-r from-[#001c3a] to-[#003a7a] px-8 pt-12 pb-16 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Activity size={300} />
        </div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-[1600px] mx-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Supervisión Global de Partes</h2>
            <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
              Monitoreo centralizado de la actividad operativa, horas invertidas y avances en todos los proyectos activos.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md">
              <button
                onClick={() => setActiveTab('PROYECTO')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'PROYECTO' ? 'bg-white text-[#002D5A] shadow' : 'text-blue-100 hover:text-white'}`}
              >
                Agrupado por Proyecto
              </button>
              <button
                onClick={() => setActiveTab('INDIVIDUAL')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'INDIVIDUAL' ? 'bg-white text-[#002D5A] shadow' : 'text-blue-100 hover:text-white'}`}
              >
                Reportes Individuales
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              {activeTab === 'PROYECTO' ? (
                <div className="relative">
                  <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="pl-4 pr-10 py-2.5 text-sm bg-white/10 border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all backdrop-blur-sm cursor-pointer min-w-[200px]"
                  >
                    <option value="" className="text-slate-800">Todos los proyectos</option>
                    {uniqueProjects.map((p, i) => (
                      <option key={i} value={p as string} className="text-slate-800">{p}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="pl-4 pr-10 py-2.5 text-sm bg-white/10 border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all backdrop-blur-sm cursor-pointer min-w-[200px]"
                  >
                    <option value="" className="text-slate-800">Todos los operarios</option>
                    {uniqueUsers.map((u, i) => (
                      <option key={i} value={u as string} className="text-slate-800">{u}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              )}

              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-white transition-colors" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={activeTab === 'PROYECTO' ? "Buscar proyecto..." : "Buscar operario, nota..."} 
                  className="pl-10 pr-4 py-2.5 text-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-blue-200 focus:outline-none focus:bg-white/20 focus:border-white/30 w-64 transition-all backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="px-8 -mt-8 relative z-20 max-w-[1600px] mx-auto w-full">
        {activeTab === 'PROYECTO' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">Días Reportados</div>
                <div className="text-2xl font-bold text-slate-800">{logs.length}</div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">Horas Totales (Proyectos)</div>
                <div className="text-2xl font-bold text-slate-800">
                  {logs.reduce((acc, log) => acc + log.workers.reduce((wAcc, w) => wAcc + w.hoursNormal + w.hoursExtra, 0), 0)}h
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <HardHat size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">Total Jornales</div>
                <div className="text-2xl font-bold text-slate-800">
                  {logs.reduce((acc, log) => acc + log.workers.length, 0)}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">Avances Globales</div>
                <div className="text-2xl font-bold text-slate-800">
                  {logs.reduce((acc, log) => acc + log.tasks.length, 0)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">Reportes Individuales</div>
                <div className="text-2xl font-bold text-slate-800">{feedEntries.length}</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">Incidencias Reportadas</div>
                <div className="text-2xl font-bold text-slate-800">
                  {feedEntries.filter(e => e.actionType === 'Incidencia').length}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Camera size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">Reportes con Fotos</div>
                <div className="text-2xl font-bold text-slate-800">
                  {feedEntries.filter(e => e.photoUrls && e.photoUrls.length > 0).length}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Package size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">Pedidos de Material</div>
                <div className="text-2xl font-bold text-slate-800">
                  {feedEntries.filter(e => e.actionType === 'Material').length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-8 pt-8 pb-12">
        <div className="max-w-[1600px] mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002D5A] mr-3"></div>
              Cargando registros globales...
            </div>
          ) : activeTab === 'PROYECTO' ? (
            filteredLogs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center max-w-2xl mx-auto mt-10 shadow-sm">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <FileText size={48} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">No se encontraron partes</h3>
                <p className="text-slate-500 text-base leading-relaxed">
                  {searchTerm ? 'No hay resultados que coincidan con tu búsqueda. Intenta con otros términos.' : 'Aún no se han registrado partes diarios en la plataforma.'}
                </p>
              </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLogs.map((log) => {
                const totalWorkers = log.workers.length;
                const totalHours = log.workers.reduce((acc, w) => acc + w.hoursNormal + w.hoursExtra, 0);
                const totalTasks = log.tasks.length;
                
                let displayNotes = '';
                let hasPhotos = (log.photos && log.photos.length > 0);
                const jsonEntries: any[] = [];
                
                if (log.notes) {
                  const lines = log.notes.split('\n');
                  const textLines: string[] = [];
                  lines.forEach(line => {
                    try {
                      if (line.trim().startsWith('{')) {
                        const parsed = JSON.parse(line);
                        jsonEntries.push(parsed);
                        if (parsed.photoUrls && parsed.photoUrls.length > 0) hasPhotos = true;
                      } else if (line.trim().startsWith('[')) {
                        const parsed = JSON.parse(line);
                        if (Array.isArray(parsed)) {
                           jsonEntries.push(...parsed);
                           if (parsed.some((n: any) => n.photoUrls && n.photoUrls.length > 0)) hasPhotos = true;
                        }
                      } else {
                        textLines.push(line);
                      }
                    } catch {
                      textLines.push(line);
                    }
                  });
                  displayNotes = textLines.join('\n').trim();
                }

                return (
                  <div 
                    key={log.id}
                    onClick={() => navigate(`/app/empleado/proyectos/${log.projectId}`)}
                    className="bg-white rounded-2xl border border-slate-200 p-0 hover:border-[#002D5A]/30 hover:shadow-xl hover:shadow-[#002D5A]/5 cursor-pointer transition-all group relative flex flex-col h-full overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#002D5A] to-[#005a9e] opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-50 border border-slate-100 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-slate-600 shadow-inner shrink-0">
                            <span className="text-xs font-bold uppercase text-slate-400 leading-none mb-1">
                              {new Date(log.date).toLocaleDateString('es-ES', { month: 'short' })}
                            </span>
                            <span className="text-2xl font-bold leading-none text-slate-800">
                              {new Date(log.date).toLocaleDateString('es-ES', { day: '2-digit' })}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Briefcase size={14} className="text-secondary" />
                              <span className="font-bold text-sm text-[#002D5A] hover:underline truncate max-w-[200px]">
                                {log.project?.name || 'Proyecto no disponible'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                {getWeatherIcon(log.weather)}
                                <span className="capitalize text-xs font-medium">{log.weather || 'N/A'}</span>
                              </span>
                              <span className="flex items-center gap-1 text-xs">
                                <User size={12} className="text-slate-400" />
                                <span className="truncate max-w-[120px]">{log.reportedBy?.name || 'Sistema'}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-gradient-to-br from-slate-50 to-white p-3 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                          <div className="absolute right-0 bottom-0 p-1 opacity-5">
                            <Clock size={40} />
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                            Rendimiento
                          </div>
                          <div className="font-bold text-xl text-slate-800 mb-0.5">
                            {totalHours}<span className="text-xs font-medium text-slate-500 ml-1">hrs</span>
                          </div>
                          <div className="text-[11px] font-medium text-slate-500">
                            <span className="font-bold text-[#002D5A]">{totalWorkers}</span> operarios
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-emerald-50/50 to-white p-3 rounded-xl border border-emerald-100/50 shadow-sm relative overflow-hidden">
                          <div className="absolute right-0 bottom-0 p-1 opacity-5">
                            <CheckCircle size={40} />
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                            Avance
                          </div>
                          <div className="font-bold text-xl text-emerald-800 mb-0.5">
                            {totalTasks}<span className="text-xs font-medium text-emerald-600/70 ml-1">partidas</span>
                          </div>
                          <div className="text-[11px] font-medium text-emerald-600">
                            trabajadas
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto bg-slate-50/80 rounded-xl p-3 border border-slate-100 relative">
                        {hasPhotos && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold uppercase text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                            <Camera size={10} /> Fotos
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                          <FileText size={12} /> Observaciones Generales
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                          {displayNotes && displayNotes.trim() !== '' ? displayNotes : <span className="italic text-slate-400">Sin observaciones adicionales.</span>}
                        </p>
                      </div>

                      {jsonEntries.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                            <FileText size={12} /> Partes Individuales:
                          </div>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            {jsonEntries.map((entry, idx) => (
                              <div 
                                key={idx} 
                                className="bg-slate-50/80 p-2 rounded-lg text-[11px] border border-slate-100 flex flex-col gap-1.5 cursor-pointer hover:bg-slate-100 hover:border-blue-200 transition-all"
                                onClick={(e) => handleGoToIndividual(e, entry.id)}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-800">{entry.userName || entry.author} <span className="font-normal text-slate-500 text-[10px] ml-0.5">({entry.time})</span></span>
                                  <div className="flex gap-1.5">
                                    {entry.hours && Number(entry.hours) > 0 && <span className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded font-bold text-[10px]">{entry.hours}h</span>}
                                    {entry.quantityDone && Number(entry.quantityDone) > 0 && <span className="bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded font-bold text-[10px]">{entry.quantityDone} un.</span>}
                                  </div>
                                </div>
                                {(entry.text || entry.actionType !== 'General') && (
                                  <div className="text-slate-600 leading-tight">
                                    {entry.actionType !== 'General' && <span className="font-semibold px-1 py-0.5 bg-slate-200 rounded mr-1 uppercase text-[9px]">{entry.actionType}</span>}
                                    {entry.text}
                                  </div>
                                )}
                                {entry.photoUrls && entry.photoUrls.length > 0 && (
                                  <div className="flex items-center gap-1 mt-0.5 text-blue-500 font-medium text-[10px]">
                                    <Camera size={10} /> {entry.photoUrls.length} foto(s)
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )
          ) : filteredFeed.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center max-w-2xl mx-auto mt-10 shadow-sm">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <UserCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">No hay reportes individuales</h3>
                <p className="text-slate-500 text-base leading-relaxed">
                  No se encontraron entradas individuales que coincidan con la búsqueda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFeed.map((entry, index) => {
                  const hasPhotos = entry.photoUrls && entry.photoUrls.length > 0;
                  const displayNotes = entry.text || '';
                  
                  return (
                    <div 
                      key={`${entry.id}-${index}`} 
                      id={`entry-${entry.id}`}
                      className={`bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border transition-all duration-500 cursor-pointer flex flex-col h-full group relative ${
                        highlightedEntryId === entry.id 
                          ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-[1.02]' 
                          : 'border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-[#002D5A]/20'
                      }`}
                      onClick={() => navigate(`/app/empleado/proyectos/${entry.projectId}`)}
                    >
                      {/* Delete button in absolute top right */}
                      <div className="absolute top-4 right-4 z-10">
                        <button 
                          onClick={(e) => handleDeleteFeedEntry(e, entry.id, entry.projectId, entry.projectDate)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                          title="Borrar entrada"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </div>

                      <div className="flex items-start justify-between mb-4 pr-8">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> {new Date(entry.projectDate).toLocaleDateString('es-ES')}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {entry.time}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-[#002D5A] group-hover:text-blue-600 transition-colors line-clamp-1">
                            {entry.projectName}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-6 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm text-slate-400">
                          <UserCircle2 size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm leading-tight">{entry.userName || entry.author}</span>
                          <div className="flex flex-wrap gap-2 mt-1 items-center">
                            {entry.actionType !== 'General' && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider w-fit
                                ${entry.actionType === 'Incidencia' ? 'bg-red-50 text-red-600 border border-red-100' : 
                                  entry.actionType === 'Material' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                                  'bg-emerald-50 text-emerald-600 border border-emerald-100'}
                              `}>
                                {entry.actionType}
                              </span>
                            )}
                            {entry.taskName && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1 max-w-[200px] truncate" title={entry.taskName}>
                                <HardHat size={10} /> {entry.taskName}
                              </span>
                            )}
                            {entry.roleName && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100 flex items-center gap-1 max-w-[200px] truncate" title={entry.roleName}>
                                <UserCircle2 size={10} /> {entry.roleName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Meta Data (Hours, Quantity) */}
                      {(entry.hours || entry.quantityDone) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {entry.hours && Number(entry.hours) > 0 ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl shadow-sm w-fit">
                              <span className="text-base">⏱️</span>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-blue-600/70 font-bold uppercase leading-none">Horas</span>
                                <span className="text-[13px] font-bold text-blue-800 leading-tight">{entry.hours}h</span>
                              </div>
                            </div>
                          ) : null}
                          
                          {entry.quantityDone && Number(entry.quantityDone) > 0 ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm w-fit">
                              <span className="text-base">📈</span>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-emerald-600/70 font-bold uppercase leading-none">Avance</span>
                                <span className="text-[13px] font-bold text-emerald-800 leading-tight">{entry.quantityDone} un.</span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Photos Display */}
                      {hasPhotos && (
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 snap-x">
                          {entry.photoUrls!.map((url: string, idx: number) => (
                            <div key={idx} className="shrink-0 snap-center w-20 h-20 rounded-xl overflow-hidden border border-slate-200/80 shadow-sm" onClick={(e) => { e.stopPropagation(); window.open(url, '_blank'); }}>
                              <img src={url} alt="Adjunto" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes Box */}
                      <div className="mt-auto bg-slate-50/80 rounded-xl p-3 border border-slate-100 relative">
                        {hasPhotos && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold uppercase text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                            <Camera size={10} /> Fotos
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                          <FileText size={12} /> Detalles
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                          {displayNotes && displayNotes.trim() !== '' ? displayNotes : <span className="italic text-slate-400">Sin detalles adicionales.</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
