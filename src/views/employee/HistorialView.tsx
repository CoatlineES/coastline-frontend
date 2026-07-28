import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, Clock, Calendar, Briefcase, MapPin, 
  CheckCircle2, FileText, ChevronRight, Activity, 
  User, Mail, Phone, CalendarDays, Loader2, X, ListTodo
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { myDayService } from '../../services/my-day.service';
import { projectsService } from '../../services/projects.service';

export default function HistorialView() {
  const { user } = useAuth();
  const isContratista = typeof user?.role === 'object' ? (user.role as any).name === 'CONTRATISTA' : user?.role === 'CONTRATISTA';
  const isObrero = typeof user?.role === 'object' ? (user.role as any).name === 'OBRERO' : user?.role === 'OBRERO';
  const showFichajes = !isContratista && !isObrero;

  const activeWorkerName = localStorage.getItem('contractor_worker_name');
  const displayName = (isContratista && activeWorkerName) ? activeWorkerName : user?.name || 'Usuario';
  const displayRole = (isContratista && activeWorkerName) ? 'OBRERO (Subusuario)' : (typeof user?.role === 'object' ? (user.role as any).name : user?.role) || 'Empleado';

  const [activeTab, setActiveTab] = useState<'fichajes' | 'partes' | 'proyectos'>(showFichajes ? 'fichajes' : 'partes');
  
  const [fichajes, setFichajes] = useState<any[]>([]);
  const [partes, setPartes] = useState<any[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [selectedParte, setSelectedParte] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [fichajesData, partesData, proyectosData] = await Promise.all([
          myDayService.getAttendanceHistory(),
          myDayService.getWorkLogsHistory(),
          projectsService.getMyAssignedProjects()
        ]);
        
        // Formatear Fichajes
        const formattedFichajes = [];
        for (const log of fichajesData) {
          if (log.clockIn) {
            formattedFichajes.push({
              id: `in-${log.id}`,
              type: 'Entrada',
              time: new Date(log.clockIn).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              date: new Date(log.clockIn),
              location: log.clockInLocation || 'Ubicación no registrada'
            });
          }
          if (log.clockOut) {
            formattedFichajes.push({
              id: `out-${log.id}`,
              type: 'Salida',
              time: new Date(log.clockOut).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              date: new Date(log.clockOut),
              location: log.clockOutLocation || 'Ubicación no registrada'
            });
          }
        }
        
        // Ordenar Fichajes de más reciente a más antiguo
        formattedFichajes.sort((a, b) => b.date.getTime() - a.date.getTime());
        setFichajes(formattedFichajes);

        // Formatear Partes
        const formattedPartes = [];
        for (const workerLog of partesData) {
          const date = new Date(workerLog.dailyLog.date);
          const project = workerLog.dailyLog.project.name;
          const weather = workerLog.dailyLog.weather;
          
          let notesText = workerLog.dailyLog.notes || '';
          let photos: string[] = workerLog.dailyLog.photos || [];

          try {
            if (notesText && (notesText.startsWith('{') || notesText.startsWith('['))) {
              const parsedNotes = JSON.parse(notesText);
              // Handle if it's an array of logs or a single log
              if (Array.isArray(parsedNotes)) {
                 notesText = parsedNotes.map(n => n.text).filter(Boolean).join('\n');
                 parsedNotes.forEach(n => {
                   if (n.photoUrls && Array.isArray(n.photoUrls)) {
                     photos = [...photos, ...n.photoUrls];
                   }
                 });
              } else {
                 notesText = parsedNotes.text !== undefined ? parsedNotes.text : notesText;
                 if (parsedNotes.photoUrls && Array.isArray(parsedNotes.photoUrls)) {
                   photos = [...photos, ...parsedNotes.photoUrls];
                 }
              }
            }
          } catch (e) {
            // Keep original string if not JSON
            console.warn('Could not parse notes as JSON', e);
          }
          
          if (workerLog.taskWorkers && workerLog.taskWorkers.length > 0) {
            for (const tw of workerLog.taskWorkers) {
               formattedPartes.push({
                 id: tw.id,
                 project,
                 task: tw.dailyLogTask?.projectTask?.name || 'Tarea general',
                 hours: tw.hours || 0,
                 hoursExtra: workerLog.hoursExtra || 0,
                 date,
                 weather,
                 notes: notesText,
                 photos
               });
            }
          } else {
             formattedPartes.push({
               id: workerLog.id,
               project,
               task: 'Horas generales',
               hours: workerLog.hoursNormal || 0,
               hoursExtra: workerLog.hoursExtra || 0,
               date,
               weather,
               notes: notesText,
               photos
             });
          }
        }
        setPartes(formattedPartes);

        // Formatear Proyectos
        const formattedProyectos = proyectosData.map((p: any) => {
          // Backend now computes realProgress from dailyLogTasks
          const calculatedProgress = typeof p.realProgress === 'number' ? p.realProgress : 0;
          
          const projectTasks = p.projectPlans?.[0]?.tasks || [];

          return {
            id: p.id,
            name: p.name,
            role: p.responsibleId === user?.id ? 'Responsable' : 'Miembro del Equipo',
            status: p.status === 'ACTIVE' ? 'En Curso' : p.status === 'COMPLETED' ? 'Completado' : 'Cancelado',
            progress: calculatedProgress,
            startDate: p.createdAt ? new Date(p.createdAt) : new Date(),
            tasks: projectTasks,
            responsible: p.responsible?.name || 'No asignado',
            surfaceTotalM2: p.surfaceTotalM2
          };
        });
        setProyectos(formattedProyectos);


      } catch (error) {
        console.error('Error fetching historial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const tabs = [
    ...(showFichajes ? [{ id: 'fichajes', label: 'Historial de Fichajes', icon: Clock, count: fichajes.length }] : []),
    { id: 'partes', label: 'Partes de Trabajo', icon: FileText, count: partes.length },
    { id: 'proyectos', label: 'Proyectos Asignados', icon: Briefcase, count: proyectos.length }
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 pb-24">
      {/* Header y Perfil */}
      <div className="bg-gradient-to-br from-[#001c3a] to-[#003a7a] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <History size={240} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
            <User size={48} className="text-white" />
          </div>
          <div className="flex-1 space-y-2">
            <h1 className="font-display font-bold text-3xl md:text-4xl">{displayName}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 font-medium">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1.5">
                <Briefcase size={14} /> {displayRole}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Mail size={14} /> {user?.email || 'email@empresa.com'}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Phone size={14} /> +34 600 000 000
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-primary shadow-md border-b-4 border-primary' 
                : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            <tab.icon size={20} className={activeTab === tab.id ? 'text-secondary' : 'opacity-70'} />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Contenido Principal */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[500px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-3xl">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        )}

        {/* TAB FICHAJES */}
        {activeTab === 'fichajes' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Clock className="text-secondary" /> Últimos Fichajes
              </h2>
              <button className="text-sm font-semibold text-primary hover:text-[#002a50] flex items-center gap-1">
                Ver todos <ChevronRight size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {fichajes.length === 0 && !isLoading && (
                <p className="text-slate-500 text-center py-8">No hay fichajes recientes.</p>
              )}
              {fichajes.map((fichaje) => (
                <div key={fichaje.id} className="group p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      fichaje.type === 'Entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {fichaje.type === 'Entrada' ? <Activity size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{fichaje.type}</h3>
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        <CalendarDays size={14} />
                        {format(fichaje.date, "EEEE, d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 md:justify-end text-right">
                    <div className="flex flex-col md:items-end">
                      <span className="font-mono text-xl font-bold text-slate-700">{fichaje.time}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin size={12} /> {fichaje.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB PARTES */}
        {activeTab === 'partes' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-secondary" /> Historial de Partes Diarios
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {partes.length === 0 && !isLoading && (
                <p className="text-slate-500 text-center py-8">No hay partes de trabajo recientes.</p>
              )}
              {partes.map((parte) => (
                <div 
                  key={parte.id} 
                  onClick={() => setSelectedParte(parte)}
                  className="p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-lg">{parte.project}</h3>
                      </div>
                      <p className="text-slate-500 font-medium">{parte.task}</p>
                      <p className="text-sm text-slate-400 flex items-center gap-1 mt-2">
                        <CalendarDays size={14} />
                        {format(parte.date, "dd MMM yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <Clock size={16} className="text-slate-400" />
                      <span className="font-bold text-slate-700">{parte.hours}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB PROYECTOS */}
        {activeTab === 'proyectos' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="text-secondary" /> Proyectos Asignados
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {proyectos.length === 0 && !isLoading && (
                <p className="text-slate-500 col-span-2 text-center py-8">No tienes proyectos asignados.</p>
              )}
              {proyectos.map((proyecto) => (
                <div key={proyecto.id} className="group p-6 rounded-3xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/50 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Briefcase size={24} />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      {proyecto.status}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-xl mb-1 group-hover:text-primary transition-colors">
                    {proyecto.name}
                  </h3>
                  <p className="text-slate-500 font-medium mb-6">Rol: <span className="text-slate-700">{proyecto.role}</span></p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Progreso</span>
                      <span className="font-bold text-slate-700">{proyecto.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-secondary h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${proyecto.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar size={14} /> Inicio: {format(proyecto.startDate, "MMM yyyy")}
                    </span>
                    <button 
                      onClick={() => setSelectedProject(proyecto)}
                      className="text-primary font-bold hover:underline"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE DETALLES DEL PROYECTO */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 flex items-start justify-between shrink-0">
              <div className="flex gap-4 items-start">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedProject.name}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm font-medium">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                      {selectedProject.role}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md ${
                      selectedProject.status === 'En Curso' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {selectedProject.status}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar size={14} /> Inicio: {format(selectedProject.startDate, "dd MMM yyyy")}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8 bg-slate-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-sm font-medium text-slate-500 mb-1">Progreso Total</div>
                  <div className="text-2xl font-bold text-slate-800 flex items-end gap-1">
                    {selectedProject.progress}%
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div className="bg-secondary h-full rounded-full" style={{ width: `${selectedProject.progress}%` }} />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-sm font-medium text-slate-500 mb-1">Responsable</div>
                  <div className="text-lg font-bold text-slate-800 truncate">{selectedProject.responsible}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <ListTodo className="text-secondary" size={20} /> Planificación de Tareas
                </h3>
                
                {(!selectedProject.tasks || selectedProject.tasks.length === 0) ? (
                  <div className="bg-white border border-slate-100 border-dashed rounded-2xl p-8 text-center">
                    <p className="text-slate-500 font-medium">No hay tareas planificadas en este proyecto.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProject.tasks.map((task: any) => (
                      <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-700 truncate">{task.name}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <CalendarDays size={14} className="text-slate-400" />
                              {task.startDate ? format(new Date(task.startDate), 'dd MMM') : 'Sin fecha'} 
                              {' - '} 
                              {task.endDate ? format(new Date(task.endDate), 'dd MMM') : 'Sin fecha'}
                            </span>
                            {task.durationDays && (
                              <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md font-medium text-xs">
                                {task.durationDays} días
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full md:w-32 flex flex-col gap-1 shrink-0">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>Progreso</span>
                            <span>{task.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${task.progress || 0}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL DE DETALLES DEL PARTE DIARIO */}
      {selectedParte && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 flex items-start justify-between shrink-0">
              <div className="flex gap-4 items-start">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shrink-0">
                  <FileText size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Detalle del Parte</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm font-medium">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar size={14} /> {format(selectedParte.date, "dd MMM yyyy")}
                    </span>
                    {selectedParte.weather && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                        Clima: {selectedParte.weather}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedParte(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 bg-slate-50/30">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div>
                  <div className="text-sm font-medium text-slate-500 mb-1">Proyecto</div>
                  <div className="text-lg font-bold text-slate-800">{selectedParte.project}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 mb-1">Tarea</div>
                  <div className="text-lg font-bold text-slate-800">{selectedParte.task}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-sm font-medium text-slate-500 mb-1">Horas Normales</div>
                  <div className="text-2xl font-bold text-slate-800">{selectedParte.hours}h</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-sm font-medium text-slate-500 mb-1">Horas Extra</div>
                  <div className="text-2xl font-bold text-slate-800">{selectedParte.hoursExtra}h</div>
                </div>
              </div>

              {(() => {
                if (!selectedParte.notes || selectedParte.notes.trim() === '') return null;
                const lines = selectedParte.notes.split('\n');
                const textLines: string[] = [];
                const entries: any[] = [];
                lines.forEach((line: string) => {
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
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                          <FileText size={16} /> Observaciones del Día
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">{text}</p>
                      </div>
                    )}
                    {entries.length > 0 && (
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                          <FileText size={16} /> Partes Individuales
                        </div>
                        <div className="space-y-2">
                          {entries.map((entry: any, i: number) => (
                             <div key={i} className="bg-slate-50 p-3 rounded-lg text-sm flex flex-col gap-2 border border-slate-100">
                               <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                 <span className="font-bold text-slate-800">{entry.userName || entry.author} <span className="font-normal text-slate-500 text-xs ml-1">({entry.time})</span></span>
                                 <div className="flex gap-2">
                                   {entry.hours && Number(entry.hours) > 0 && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{entry.hours}h</span>}
                                   {entry.quantityDone && Number(entry.quantityDone) > 0 && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">{entry.quantityDone} un.</span>}
                                 </div>
                               </div>
                               {(entry.text || entry.actionType !== 'General') && (
                                 <div className="text-slate-600 mt-1">
                                   {entry.actionType !== 'General' && <span className="font-semibold text-xs px-2 py-0.5 bg-slate-200 rounded mr-2 uppercase">{entry.actionType}</span>}
                                   {entry.text}
                                 </div>
                               )}
                               {entry.photoUrls && entry.photoUrls.length > 0 && (
                                 <div className="flex gap-2 mt-2 overflow-x-auto">
                                   {entry.photoUrls.map((url: string, idx: number) => (
                                     <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                       <img src={url} alt="Evidencia" className="w-full h-full object-cover" />
                                     </a>
                                   ))}
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

              {selectedParte.photos && selectedParte.photos.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                    <Activity size={16} /> Fotografías Adjuntas
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedParte.photos.map((url: string, index: number) => (
                      <a 
                        key={index} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block rounded-xl overflow-hidden border border-slate-200 aspect-square hover:opacity-90 hover:border-primary transition-all group relative"
                      >
                        <img 
                          src={url} 
                          alt={`Foto ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-sm font-bold bg-black/50 px-3 py-1 rounded-full">Ver imagen</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
