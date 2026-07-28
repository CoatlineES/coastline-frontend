import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Calendar, Cloud, Sun, CloudRain, Wind, AlertCircle } from 'lucide-react';
import { Project } from '../../../../services/types';
import { DailyLog, dailyLogsService, DailyLogWorker, DailyLogTask } from '../../../../services/daily-logs.service';
import { projectPlanningService, ProjectTask } from '../../../../services/project-planning.service';
import { authService, User } from '../../../../services/auth.service';
import { usersService } from '../../../../services/users.service';
import { uploadService } from '../../../../services/upload.service';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: DailyLog | null;
  project: Project;
  onSave: () => void;
}

const WEATHER_OPTIONS = ['soleado', 'nublado', 'lluvia', 'viento'];

export function DailyLogModal({ isOpen, onClose, log, project, onSave }: DailyLogModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weather, setWeather] = useState('soleado');
  const [notes, setNotes] = useState('');
  const [hiddenNotes, setHiddenNotes] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [workers, setWorkers] = useState<Partial<DailyLogWorker>[]>([]);
  const [tasks, setTasks] = useState<Partial<DailyLogTask>[]>([]);
  
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableProjectTasks, setAvailableProjectTasks] = useState<ProjectTask[]>([]);
  const [tasksForToday, setTasksForToday] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requiredRoles = useMemo(() => {
    const roles = new Set<string>();
    tasksForToday.forEach(t => {
      t.components?.filter(c => c.resourceType === 'MANO_OBRA').forEach(c => {
        if (c.concept) roles.add(c.concept.trim());
      });
    });
    return Array.from(roles);
  }, [tasksForToday]);

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
      if (log) {
        const localD = new Date(log.date);
        const yyyy = localD.getFullYear();
        const mm = String(localD.getMonth() + 1).padStart(2, '0');
        const dd = String(localD.getDate()).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);
        setWeather(log.weather || 'soleado');
        
        // Parse notes to separate standard text from JSON entries
        const rawNotes = log.notes || '';
        const lines = rawNotes.split('\n');
        const textLines: string[] = [];
        const jsonLines: string[] = [];
        
        lines.forEach(line => {
          if (line.trim().startsWith('{') || line.trim().startsWith('[')) {
            try {
              JSON.parse(line); // Verify it's valid JSON
              jsonLines.push(line);
            } catch {
              textLines.push(line);
            }
          } else {
            textLines.push(line);
          }
        });
        
        setNotes(textLines.join('\n').trim());
        setHiddenNotes(jsonLines);
        
        setPhotos(log.photos || []);
        
        // Asignamos el ID de BBDD al tempId para poder enlazarlo
        setWorkers(log.workers.map(w => ({ ...w, tempId: w.id })));
        
        setTasks(log.tasks.map(t => ({
          ...t,
          workers: t.workers?.map(tw => ({
            ...tw,
            tempWorkerId: tw.dailyLogWorkerId || tw.dailyLogWorker?.id || tw.tempWorkerId
          })) || []
        })));
      } else {
        // Defaults
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);
        setWeather('soleado');
        setNotes('');
        setHiddenNotes([]);
        setPhotos([]);
        setWorkers([]);
        setTasks([]);
      }
    }
  }, [isOpen, log]);

  // Efecto para recargar las tareas sugeridas cuando cambia la fecha
  useEffect(() => {
    if (isOpen && project?.id && date) {
      projectPlanningService.getTasksForDate(project.id, date)
        .then(t => {
          // Sort so unplanned tasks are at the top of the suggestions
          const sorted = [...t].sort((a, b) => (b.isUnplanned ? 1 : 0) - (a.isUnplanned ? 1 : 0));
          setTasksForToday(sorted);
        })
        .catch(err => console.error('Error loading tasks for date', err));
    }
  }, [isOpen, project?.id, date]);

  // Efecto para auto-rellenar si es un parte nuevo y hay tareas programadas/imprevistas
  useEffect(() => {
    if (!log && isOpen && tasksForToday.length > 0 && tasks.length === 0) {
      // Filtrar las tareas que vamos a auto-rellenar (priorizar unplanned)
      const unplannedTasks = tasksForToday.filter(t => t.isUnplanned);
      const tasksToAutoFill = unplannedTasks.length > 0 ? unplannedTasks : tasksForToday;

      const newTasks: Partial<DailyLogTask>[] = tasksToAutoFill.map(t => ({
        projectTaskId: t.id,
        quantityDone: 0,
        workers: []
      }));
      setTasks(newTasks);

      // Auto-fill workers based on the planned workers for these tasks
      const newWorkers: Partial<DailyLogWorker>[] = [];
      const addedWorkerIds = new Set<string>();

      tasksToAutoFill.forEach(t => {
        t.components?.filter(c => c.resourceType === 'MANO_OBRA').forEach(c => {
          c.plannedWorkers?.forEach(pw => {
            const workerKey = pw.userId || pw.contractorWorkerId || 'unknown';
            if (!addedWorkerIds.has(workerKey)) {
              addedWorkerIds.add(workerKey);
              newWorkers.push({
                tempId: Math.random().toString(36).substr(2, 9),
                userId: pw.userId,
                contractorWorkerId: pw.contractorWorkerId,
                hoursNormal: 8,
                hoursExtra: 0,
                role: c.concept
              });
            }
          });
        });
      });

      if (newWorkers.length > 0) {
        setWorkers(newWorkers as any);
      }
    }
  }, [tasksForToday, log, isOpen]);

  const loadDependencies = async () => {
    try {
      // Cargar usuarios para el listado de operarios (solo los asignados al proyecto)
      if (project.workers) {
        const assignedUsers = project.workers
          .map(w => {
            if (w.user) return { ...w.user, isSub: false };
            if (w.contractorWorker) return { ...w.contractorWorker, isSub: true };
            return null;
          })
          .filter(Boolean);
        setAvailableUsers(assignedUsers as any);
      } else {
        setAvailableUsers([]);
      }

      // Cargar tareas del plan de obra del proyecto
      const plans = await projectPlanningService.getPlansByProjectId(project.id);
      const activePlan = plans.find(p => p.isActive);
      if (activePlan) {
        // Flatten tasks from tree to flat array to select them
        const flattenTasks = (tasks: ProjectTask[]): ProjectTask[] => {
          let flat: ProjectTask[] = [];
          tasks.forEach(t => {
            flat.push(t);
            if (t.children && t.children.length > 0) {
              flat = flat.concat(flattenTasks(t.children));
            }
          });
          return flat;
        };
        const allTasks = flattenTasks(activePlan.tasks);
        // Only allow selecting tasks that are not chapters/subzones (meaning they have no children and are 'TASK')
        const executableTasks = allTasks.filter(t => t.type === 'TASK' && (!t.children || t.children.length === 0));
        setAvailableProjectTasks(executableTasks);
      }
      
    } catch (err) {
      console.error('Error loading dependencies', err);
    }
  };

  // ---- Handlers ----
  const handleAddWorker = (role?: string) => {
    setWorkers([...workers, { tempId: Math.random().toString(36).substr(2, 9), hoursNormal: 8, hoursExtra: 0, role }]);
  };

  const handleUpdateWorker = (index: number, field: string, value: any) => {
    setWorkers(prev => {
      const newWorkers = [...prev];
      newWorkers[index] = { ...newWorkers[index], [field]: value };
      return newWorkers;
    });
  };

  const handleRemoveWorker = (index: number) => {
    setWorkers(workers.filter((_, i) => i !== index));
  };

  const handleAddTask = () => {
    setTasks([...tasks, { quantityDone: 0, workers: [] }]);
  };

  const handleUpdateTask = (index: number, field: string, value: any) => {
    setTasks(prev => {
      const newTasks = [...prev];
      newTasks[index] = { ...newTasks[index], [field]: value };
      return newTasks;
    });
  };

  const handleUpdateTaskWorker = (taskIndex: number, workerIndex: number, field: string, value: any) => {
    setTasks(prev => {
      const newTasks = [...prev];
      const task = newTasks[taskIndex];
      if (task.workers) {
        task.workers[workerIndex] = { ...task.workers[workerIndex], [field]: value };
      }
      return newTasks;
    });
  };

  const handleAddTaskWorker = (taskIndex: number, componentId: string) => {
    const newTasks = [...tasks];
    const task = newTasks[taskIndex];
    if (!task.workers) task.workers = [];
    task.workers.push({ projectTaskComponentId: componentId, hours: 0 });
    setTasks(newTasks);
  };

  const handleRemoveTaskWorker = (taskIndex: number, workerIndex: number) => {
    const newTasks = [...tasks];
    const task = newTasks[taskIndex];
    if (task.workers) {
      task.workers = task.workers.filter((_, i) => i !== workerIndex);
      setTasks(newTasks);
    }
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploadingImage(true);
      const newUrls: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const url = await uploadService.uploadImage(e.target.files[i]);
        newUrls.push(url);
      }
      setPhotos(prev => [...prev, ...newUrls]);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Asignar tempIds a los workers para enlazarlos
      const processedWorkers = workers
        .filter(w => w.userId || w.contractorWorkerId || w.externalName)
        .map(w => ({ ...w, tempId: w.tempId || Math.random().toString(36).substr(2, 9) }));

      const data = {
        date,
        weather,
        notes: [notes.trim(), ...hiddenNotes].filter(Boolean).join('\n'),
        photos,
        projectId: project.id,
        workers: processedWorkers,
        tasks: tasks.filter(t => t.projectTaskId).map(t => ({
          ...t,
          workers: t.workers?.filter(tw => tw.tempWorkerId) || []
        })),
      };

      if (log?.id) {
        await dailyLogsService.update(log.id, data);
      } else {
        await dailyLogsService.create(data);
      }
      
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al guardar el parte diario');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {log ? 'Editar Parte Diario' : 'Nuevo Parte Diario'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Registra la actividad del día para el proyecto {project.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Form */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <form id="daily-log-form" onSubmit={handleSubmit} className="space-y-8">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha del parte</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#002D5A] focus:border-[#002D5A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Clima</label>
                <div className="flex gap-2">
                  {WEATHER_OPTIONS.map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeather(w)}
                      className={`flex-1 py-2 px-3 flex flex-col items-center justify-center gap-1 rounded-md border text-xs capitalize transition-colors ${
                        weather === w 
                          ? 'border-[#002D5A] bg-[#002D5A]/5 text-[#002D5A] font-medium' 
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {w === 'soleado' && <Sun size={16} />}
                      {w === 'nublado' && <Cloud size={16} />}
                      {w === 'lluvia' && <CloudRain size={16} />}
                      {w === 'viento' && <Wind size={16} />}
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Workers Section */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[#002D5A] uppercase tracking-wider">Control de Personal</h3>
              </div>

              {workers.length === 0 && requiredRoles.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                  No hay operarios requeridos ni registrados
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => handleAddWorker('Otro')}
                      className="text-[#002D5A] text-sm font-medium hover:bg-[#002D5A]/10 px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1"
                    >
                      <Plus size={16} /> Agregar operario
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Agrupar por roles requeridos */}
                {[...requiredRoles, 'Otros Roles'].map(roleGroup => {
                  const isOther = roleGroup === 'Otros Roles';
                  const groupWorkers = workers.map((w, index) => ({w, index}))
                    .filter(({w}) => isOther ? (!w.role || !requiredRoles.includes(w.role)) : w.role === roleGroup);
                  
                  if (!isOther && groupWorkers.length === 0) {
                     // Mostrar bloque vacío con botón
                     return (
                       <div key={roleGroup} className="border border-slate-200 rounded-lg overflow-hidden">
                         <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                           <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">👷‍♂️ {roleGroup}</h4>
                           <button
                             type="button"
                             onClick={() => handleAddWorker(roleGroup)}
                             className="text-[#002D5A] text-xs font-medium hover:bg-[#002D5A]/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                           >
                             <Plus size={14} /> Agregar {roleGroup}
                           </button>
                         </div>
                         <div className="p-4 text-center text-xs text-slate-400 italic">
                           No hay personal asignado a este rol todavía.
                         </div>
                       </div>
                     );
                  }

                  if (isOther && groupWorkers.length === 0 && requiredRoles.length > 0) {
                     return (
                       <div key={roleGroup} className="border border-slate-200 rounded-lg overflow-hidden">
                         <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                           <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">👷‍♂️ {roleGroup}</h4>
                           <button
                             type="button"
                             onClick={() => handleAddWorker('Otro')}
                             className="text-[#002D5A] text-xs font-medium hover:bg-[#002D5A]/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                           >
                             <Plus size={14} /> Agregar personal extra
                           </button>
                         </div>
                       </div>
                     );
                  }

                  if (groupWorkers.length > 0) {
                     return (
                       <div key={roleGroup} className="border border-slate-200 rounded-lg overflow-hidden">
                         <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                           <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">👷‍♂️ {roleGroup}</h4>
                           <button
                             type="button"
                             onClick={() => handleAddWorker(isOther ? 'Otro' : roleGroup)}
                             className="text-[#002D5A] text-xs font-medium hover:bg-[#002D5A]/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                           >
                             <Plus size={14} /> Agregar {isOther ? 'extra' : roleGroup}
                           </button>
                         </div>
                         <div className="p-3 bg-white space-y-2">
                            <div className="grid grid-cols-12 gap-3 text-[10px] font-bold text-slate-400 uppercase px-1">
                              <div className="col-span-6">Operario / Empleado</div>
                              <div className="col-span-2 text-center">Horas Norm.</div>
                              <div className="col-span-2 text-center">Horas Extra</div>
                              <div className="col-span-2"></div>
                            </div>
                            {groupWorkers.map(({w: worker, index}) => (
                               <div key={index} className="grid grid-cols-12 gap-3 items-center bg-white p-2 rounded border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
                                  <div className="col-span-6">
                                    <select
                                      value={worker.userId || worker.contractorWorkerId || ''}
                                      onChange={(e) => {
                                        if (e.target.value === 'external') {
                                          handleUpdateWorker(index, 'userId', null);
                                          handleUpdateWorker(index, 'contractorWorkerId', null);
                                          handleUpdateWorker(index, 'externalName', '');
                                        } else {
                                          const selectedUser = availableUsers.find(u => u.id === e.target.value) as any;
                                          if (selectedUser?.isSub) {
                                            handleUpdateWorker(index, 'userId', null);
                                            handleUpdateWorker(index, 'contractorWorkerId', e.target.value);
                                          } else {
                                            handleUpdateWorker(index, 'userId', e.target.value);
                                            handleUpdateWorker(index, 'contractorWorkerId', null);
                                          }
                                          handleUpdateWorker(index, 'externalName', null);
                                        }
                                      }}
                                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:ring-[#002D5A] focus:border-[#002D5A]"
                                    >
                                      <option value="">Seleccionar empleado...</option>
                                      {availableUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                      ))}
                                      <option value="external">+ Personal Externo / Subcontrata</option>
                                    </select>
                                    {worker.userId === null && worker.externalName !== undefined && (
                                      <input
                                        type="text"
                                        placeholder="Nombre del operario externo..."
                                        value={worker.externalName || ''}
                                        onChange={(e) => handleUpdateWorker(index, 'externalName', e.target.value)}
                                        className="w-full mt-1.5 px-2 py-1.5 text-xs border border-slate-300 rounded focus:ring-[#002D5A] focus:border-[#002D5A]"
                                      />
                                    )}
                                  </div>
                                  <div className="col-span-2">
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      value={worker.hoursNormal || 0}
                                      onChange={(e) => handleUpdateWorker(index, 'hoursNormal', e.target.value)}
                                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded text-center focus:ring-[#002D5A] focus:border-[#002D5A]"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      value={worker.hoursExtra || 0}
                                      onChange={(e) => handleUpdateWorker(index, 'hoursExtra', e.target.value)}
                                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded text-center focus:ring-[#002D5A] focus:border-[#002D5A]"
                                    />
                                  </div>
                                  <div className="col-span-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveWorker(index)}
                                      className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                               </div>
                            ))}
                         </div>
                       </div>
                     );
                  }
                  
                  return null;
                })}
              </div>
            </div>

            {/* Tasks / Production Section */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[#002D5A] uppercase tracking-wider">Partidas Relacionadas</h3>
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="text-[#002D5A] text-sm font-medium hover:bg-[#002D5A]/10 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus size={16} /> Relacionar partida
                </button>
              </div>

              {/* Tareas Sugeridas Panel */}
              <div className="mb-6 bg-slate-100 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={18} className="text-slate-500" />
                  <h4 className="text-sm font-bold text-slate-700">Tareas programadas para este día</h4>
                </div>
                {tasksForToday.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No hay tareas programadas en el cronograma para la fecha seleccionada.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tasksForToday.map(t => {
                      const isAdded = tasks.some(existing => existing.projectTaskId === t.id);
                      return (
                        <div key={t.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                          isAdded ? 'bg-[#002D5A]/10 border-[#002D5A]/30' : 
                          t.isUnplanned ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'
                        }`}>
                          <div>
                            <div className="flex items-center gap-2">
                              {t.isUnplanned && <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded uppercase font-bold">Extra</span>}
                              <p className="text-sm font-medium text-slate-700 line-clamp-1" title={t.name}>{t.name}</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Total: {t.quantity} {t.unit}</p>
                          </div>
                          {isAdded ? (
                            <span className="text-xs font-bold text-[#002D5A] px-2 py-1 bg-[#002D5A]/10 rounded flex items-center gap-1">
                              ✓ Relacionada
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setTasks([...tasks, { projectTaskId: t.id, quantityDone: 0, workers: [] }]);
                              }}
                              className="text-xs font-medium text-[#002D5A] hover:bg-[#002D5A]/10 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 border border-[#002D5A]/20"
                            >
                              <Plus size={14} /> Relacionar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                  No hay partidas relacionadas a este parte diario
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3 text-xs font-medium text-slate-500 uppercase px-1">
                    <div className="col-span-8">Partida / Tarea del Plan</div>
                    <div className="col-span-3 text-center">Avance Estimado</div>
                    <div className="col-span-1"></div>
                  </div>
                  {tasks.map((task, index) => {
                    const selectedProjectTask = availableProjectTasks.find(t => t.id === task.projectTaskId);
                    const totalQty = selectedProjectTask?.quantity || 1;
                    
                    // Calculamos el porcentaje a mostrar en la UI basado en quantityDone
                    const percentage = task.quantityDone ? Math.round((Number(task.quantityDone) / totalQty) * 100) : 0;
                    
                    return (
                      <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="col-span-8">
                          <select
                            value={task.projectTaskId || ''}
                            onChange={(e) => handleUpdateTask(index, 'projectTaskId', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#002D5A] focus:border-[#002D5A]"
                          >
                            <option value="">Seleccionar partida...</option>
                            {availableProjectTasks.map(t => (
                              <option key={t.id} value={t.id}>{t.name} (Total: {t.quantity} {t.unit})</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            value={percentage}
                            onChange={(e) => {
                               const newPct = Number(e.target.value);
                               const newQty = (newPct / 100) * totalQty;
                               handleUpdateTask(index, 'quantityDone', newQty);
                            }}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#002D5A] focus:border-[#002D5A] text-center"
                            placeholder="Ej. 50"
                          />
                          <span className="text-sm font-medium text-slate-500 w-8">%</span>
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveTask(index)}
                            className="text-slate-400 hover:text-red-500 p-2 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* General Notes */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">Observaciones Generales</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Incidencias, falta de material, visitas de clientes, accidentes..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#002D5A] focus:border-[#002D5A] resize-none"
              ></textarea>
            </div>

            {/* Individual Parts (Hidden JSONs) */}
            {hiddenNotes.length > 0 && (
              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-3">Partes Individuales Relacionados</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {hiddenNotes.map((line, idx) => {
                    let entry: any = null;
                    try {
                      entry = JSON.parse(line);
                    } catch (e) { return null; }
                    
                    if (!entry) return null;
                    
                    // Si es un array, puede contener varios (aunque normalmente guardamos objetos sueltos)
                    const entriesToRender = Array.isArray(entry) ? entry : [entry];
                    
                    return entriesToRender.map((item, i) => (
                      <div key={`${idx}-${i}`} className="bg-slate-50 p-3 rounded-lg text-sm flex flex-col gap-2 border border-slate-100">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-800">{item.userName || item.author} <span className="font-normal text-slate-500 text-xs ml-1">({item.time})</span></span>
                          <div className="flex gap-2">
                            {item.hours && Number(item.hours) > 0 && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{item.hours}h</span>}
                            {item.quantityDone && Number(item.quantityDone) > 0 && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">{item.quantityDone} un.</span>}
                          </div>
                        </div>
                        {(item.text || item.actionType !== 'General') && (
                          <div className="text-slate-600 mt-1">
                            {item.actionType !== 'General' && <span className="font-semibold text-xs px-2 py-0.5 bg-slate-200 rounded mr-2 uppercase">{item.actionType}</span>}
                            {item.text}
                          </div>
                        )}
                        {item.photoUrls && item.photoUrls.length > 0 && (
                          <div className="flex gap-2 mt-2 overflow-x-auto">
                            {item.photoUrls.map((url: string, pIdx: number) => (
                              <a key={pIdx} href={url} target="_blank" rel="noopener noreferrer" className="block w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 hover:opacity-80 transition-opacity">
                                <img src={url} alt="Evidencia" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ));
                  })}
                </div>
              </div>
            )}

            {/* Photos Section */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-700">Evidencia Fotográfica</h3>
                <div>
                  <input
                    type="file"
                    id="log-photo-upload"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadPhoto}
                  />
                  <label 
                    htmlFor="log-photo-upload"
                    className={`text-sm font-medium px-3 py-1.5 rounded-md flex items-center gap-2 cursor-pointer transition-colors ${
                      uploadingImage 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-[#002D5A] text-white hover:bg-[#002D5A]/90'
                    }`}
                  >
                    {uploadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Agregar Fotos
                      </>
                    )}
                  </label>
                </div>
              </div>
              
              {photos.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                  No hay fotografías registradas
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((url, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                        title="Eliminar foto"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="daily-log-form"
            disabled={loading}
            className="bg-[#002D5A] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#003b7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? 'Guardando...' : 'Guardar Parte Diario'}
          </button>
        </div>
      </div>
    </div>
  );
}
