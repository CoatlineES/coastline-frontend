import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ClipboardList, Camera, ImageIcon, Send, Loader2, Mic, UserCircle2, AlertTriangle, Package, ShieldCheck, MicOff, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { myDayService, MyDayTask } from '../../services/my-day.service';
import { projectsService } from '../../services/projects.service';
import { CameraModal } from '../../components/common/CameraModal';
import { projectPlanningService, ProjectTask as PlanTask } from '../../services/project-planning.service';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usersService } from '../../services/users.service';

interface FeedEntry {
  id: string;
  time: string;
  author?: string;
  userName?: string;
  actionType: string;
  text: string;
  taskId?: string;
  componentId?: string;
  hours?: number;
  quantityDone?: number;
  photoUrls?: string[];
}

export default function PartesDiariosView() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const initialProject = searchParams.get('project') || '';

  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(initialProject);
  const [suggestedTasks, setSuggestedTasks] = useState<MyDayTask[]>([]);
  
  // Form state
  const [text, setText] = useState('');
  const [actionType, setActionType] = useState('General');
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [taskHours, setTaskHours] = useState('');
  const [taskQuantity, setTaskQuantity] = useState('');
  const [activePlanTasks, setActivePlanTasks] = useState<PlanTask[]>([]);

  // Feed & loading states
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [expandedFeed, setExpandedFeed] = useState<number | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  
  // Photo state
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const [contractorWorkers, setContractorWorkers] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  const isContractor = typeof user?.role === 'object' ? (user.role as any).name === 'CONTRATISTA' : user?.role === 'CONTRATISTA';

  useEffect(() => {
    if (isContractor && user?.id) {
      usersService.getContractorWorkers(user.id).then(res => {
        const data = res.data || res;
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setContractorWorkers(list);
        const storedId = localStorage.getItem('contractor_worker_id');
        if (storedId && list.find((w: any) => w.id === storedId)) {
          setSelectedWorkerId(storedId);
        } else if (list.length > 0) {
          setSelectedWorkerId(list[0].id);
          localStorage.setItem('contractor_worker_id', list[0].id);
        }
      }).catch(console.error);
    }
  }, [isContractor, user?.id]);

  useEffect(() => {
    if (isContractor && !selectedWorkerId) return;
    fetchInitialData();
  }, [selectedWorkerId, isContractor]);

  const handleWorkerChange = (id: string) => {
    setSelectedWorkerId(id);
    localStorage.setItem('contractor_worker_id', id);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false; // Solo resultados finales para evitar duplicados al teclear
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setText(prev => prev ? prev + ' ' + transcript : transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast.error('Tu navegador no soporta el dictado por voz.');
        return;
      }
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (selectedProject && selectedDate) {
      fetchFeed();
      fetchProjectPlan(selectedProject);
    }
  }, [selectedProject, selectedDate]);

  // Auto-select first suggested task when project changes
  useEffect(() => {
    if (selectedProject && suggestedTasks.length > 0) {
      const projectSuggestions = suggestedTasks.filter(t => t.plan?.projectId === selectedProject);
      if (projectSuggestions.length > 0) {
        // Prioritize tasks where the user is specifically assigned to a component
        const explicitlyAssignedTask = projectSuggestions.find(t => 
          t.components?.some(c => c.plannedWorkers && c.plannedWorkers.length > 0)
        );
        
        if (explicitlyAssignedTask) {
          setSelectedTask(explicitlyAssignedTask.id);
        } else {
          setSelectedTask(projectSuggestions[0].id);
        }
      } else {
        setSelectedTask('');
      }
    }
  }, [selectedProject, suggestedTasks]);

  // Auto-fill hours and quantity when task or component changes
  useEffect(() => {
    if (selectedTask) {
      const task = activePlanTasks.find(t => t.id === selectedTask) || suggestedTasks.find(t => t.id === selectedTask);
      if (task) {
        // If there's no selected component, check if the user is explicitly assigned to one
        if (!selectedComponent) {
          const suggestedTask = suggestedTasks.find(t => t.id === selectedTask);
          if (suggestedTask && suggestedTask.components) {
            const assignedComponent = suggestedTask.components.find(c => c.plannedWorkers && c.plannedWorkers.length > 0);
            if (assignedComponent) {
              setSelectedComponent(assignedComponent.id);
            }
          }
        }

        // Auto-fill 100% of quantity
        if (task.quantity && !taskQuantity) {
          setTaskQuantity(task.quantity.toString());
        }
        
        // Auto-fill hours based on component or task duration
        if (selectedComponent && !taskHours) {
          const comp = task.components?.find((c: any) => c.id === selectedComponent);
          if (comp && comp.unit === 'h' && task.quantity) {
            const totalHours = (task.quantity * comp.quantity).toFixed(1);
            setTaskHours(totalHours);
          } else if ((task as any).durationMinutes) {
            setTaskHours(((task as any).durationMinutes / 60).toFixed(1));
          }
        } else if (!selectedComponent && !taskHours && (task as any).durationMinutes) {
          setTaskHours(((task as any).durationMinutes / 60).toFixed(1));
        }
      }
    }
  }, [selectedTask, selectedComponent, activePlanTasks, suggestedTasks]);

  const fetchProjectPlan = async (projectId: string) => {
    try {
      const plans = await projectPlanningService.getPlansByProjectId(projectId);
      let activePlan = plans.find(p => p.isActive);
      if (!activePlan && plans.length > 0) activePlan = plans[0]; // Fallback to newest plan
      
      if (activePlan) {
        const tree = await projectPlanningService.getPlanTree(activePlan.id);
        
        // Flatten the task tree to a simple list for the dropdown
        const flattenedTasks: PlanTask[] = [];
        const flatten = (tasks: PlanTask[]) => {
          for (const t of tasks) {
            if (t.type === 'TASK' || t.type === 'task') {
              flattenedTasks.push(t);
            }
            if (t.children && t.children.length > 0) {
              flatten(t.children);
            }
          }
        };
        if (tree.tasks) flatten(tree.tasks);
        
        setActivePlanTasks(flattenedTasks);
      } else {
        setActivePlanTasks([]);
      }
    } catch (error) {
      console.error('Error fetching plan tasks', error);
      setActivePlanTasks([]);
    }
  };

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [tasksData, allProjects] = await Promise.all([
        myDayService.getSuggestedTasks(),
        projectsService.getAll({ status: 'ACTIVE' }) // Or fetch all if they want
      ]);
      
      // Prioritize unplanned tasks (Tareas Correctivas)
      const sortedTasks = [...tasksData].sort((a, b) => {
        if (a.isUnplanned && !b.isUnplanned) return -1;
        if (!a.isUnplanned && b.isUnplanned) return 1;
        return 0;
      });
      
      setSuggestedTasks(sortedTasks);
      
      // If the backend doesn't filter by user, we might want to just show all active projects
      // For a worker, projectsService.getAll() usually returns projects they are assigned to.
      setProjects(allProjects.map(p => ({ id: p.id, name: p.name })));
      
      if (sortedTasks.length > 0 && sortedTasks[0].plan?.projectId) {
        setSelectedProject(sortedTasks[0].plan.projectId);
      } else if (allProjects.length > 0) {
        setSelectedProject(allProjects[0].id);
      }
    } catch (error) {
      toast.error('Error cargando proyectos');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeed = async () => {
    try {
      const data = await myDayService.getFeed(selectedProject, selectedDate);
      setFeed(data);
    } catch (error) {
      console.error('Error fetching feed', error);
      setFeed([]);
    }
  };

  const handleDeleteFeedEntry = async (entryId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres borrar esta entrada? Se restarán las horas y avances reportados.')) {
      return;
    }
    
    try {
      await myDayService.deleteFeedEntry(entryId, selectedProject, selectedDate);
      toast.success('Entrada eliminada');
      fetchFeed(); // Refresh the feed
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const handlePublish = async () => {
    if (!selectedProject) {
      toast.error('Selecciona un proyecto primero');
      return;
    }
    
    if (!text.trim() && actionType === 'General' && !selectedTask) {
      toast.error('Escribe algo o vincula una tarea');
      return;
    }

    if (selectedTask) {
      const projectSuggestions = suggestedTasks.filter(t => t.plan?.projectId === selectedProject);
      const assignedTasks = projectSuggestions.filter(t => t.components?.some(c => c.plannedWorkers && c.plannedWorkers.length > 0));
      
      const isTaskSuggested = projectSuggestions.some(t => t.id === selectedTask);
      const isCurrentTaskAssigned = assignedTasks.some(t => t.id === selectedTask);
      
      if (!isTaskSuggested) {
        if (!window.confirm('Esta partida no está planificada para el día de hoy. ¿Estás seguro de que deseas registrar actividad en ella?')) {
          return;
        }
      } else if (assignedTasks.length > 0 && !isCurrentTaskAssigned) {
        if (!window.confirm('Tienes otra(s) partida(s) asignada(s) específicamente a ti para hoy. ¿Estás seguro de que deseas registrar actividad en esta?')) {
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);

      // Upload photos first if any
      const uploadedUrls: string[] = [];
      if (selectedPhotos.length > 0) {
        toast.loading('Subiendo fotos...', { id: 'upload' });
        const { uploadService } = await import('../../services/upload.service');
        for (const photo of selectedPhotos) {
          const url = await uploadService.uploadImage(photo);
          uploadedUrls.push(url);
        }
        toast.dismiss('upload');
      }

      const taskObj = selectedTask ? projectTasks.find(t => t.id === selectedTask) : undefined;
      const taskName = taskObj?.name;
      const assignedManpower = taskObj?.components?.find((c: any) => c.resourceType === 'MANPOWER' && c.plannedWorkers && c.plannedWorkers.length > 0);
      const roleName = assignedManpower?.concept || undefined;

      await myDayService.logFeedEntry({
        projectId: selectedProject,
        dateStr: selectedDate,
        text,
        actionType,
        taskId: selectedTask || undefined,
        taskName,
        roleName,
        componentId: selectedComponent || undefined,
        hours: taskHours ? Number(taskHours) : undefined,
        quantityDone: taskQuantity ? Number(taskQuantity) : undefined,
        photoUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined
      });

      toast.success('Entrada publicada');
      
      // Reset form
      setText('');
      setActionType('General');
      setSelectedTask('');
      setSelectedComponent('');
      setTaskHours('');
      setTaskQuantity('');
      setSelectedPhotos([]);
      setPhotoPreviews([]);
      
      // Refresh feed
      fetchFeed();
    } catch (error: any) {
      toast.dismiss('upload');
      toast.error(error.response?.data?.error || error.message || 'Error al publicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedPhotos(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPhotoPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]); // Free memory
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleCameraCapture = (file: File) => {
    setSelectedPhotos(prev => [...prev, file]);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreviews(prev => [...prev, previewUrl]);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const projectTasks = suggestedTasks.filter(t => t.plan.project.id === selectedProject);

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto w-full space-y-8 pb-24 bg-slate-50/30 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondary/10 rounded-2xl border border-secondary/20 shadow-inner">
            <ClipboardList className="text-secondary" size={28} />
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-800 tracking-tight">
            Parte Diario
          </h1>
        </div>
        {isContractor && contractorWorkers.length > 0 && (
          <div className="flex flex-col">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Viendo datos de:</label>
             <select 
               value={selectedWorkerId} 
               onChange={e => handleWorkerChange(e.target.value)}
               className="bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#001c3a]/20 font-medium"
             >
               <option value="">Yo ({user?.name.split(' ')[0]})</option>
               {contractorWorkers.map(w => (
                 <option key={w.id} value={w.id}>{w.name}</option>
               ))}
             </select>
          </div>
        )}
      </header>

      {/* Fecha */}
      <div className="flex items-center gap-2 max-w-[220px]">
        <div className="relative w-full group">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" size={18} />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl text-base md:text-sm text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all shadow-sm cursor-pointer hover:bg-white"
          />
        </div>
      </div>

      {/* Caja de Publicación */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden relative z-10 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        
        {/* Selector de Proyecto */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/30">
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full bg-white border border-slate-200/80 text-slate-700 text-base md:text-sm font-medium rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 block p-3.5 shadow-sm transition-all hover:border-slate-300 appearance-none cursor-pointer min-h-[48px]"
          >
            <option value="" disabled>Selecciona un proyecto para empezar...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Textarea */}
        <div className="p-5 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="¿Qué ha pasado hoy? Observaciones, incidencias..."
            className="w-full h-28 bg-slate-50/50 border border-slate-200/60 rounded-2xl p-5 text-base md:text-sm resize-none focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white transition-all text-slate-700 leading-relaxed placeholder:text-slate-400"
          />
          <button 
            onClick={toggleListening}
            className={`absolute bottom-8 right-8 p-3 transition-all rounded-full border shadow-sm active:scale-90 ${
              isListening 
                ? 'bg-red-50 text-red-500 border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' 
                : 'bg-white text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 border-slate-200'
            }`}
            title={isListening ? 'Detener dictado' : 'Iniciar dictado'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>

        {/* Formulario de Tarea Inline */}
        {selectedProject && (activePlanTasks.length > 0 || suggestedTasks.filter(t => t.plan?.projectId === selectedProject).length > 0) ? (
          <div className="p-5 border-b border-slate-100 bg-slate-50/40 space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Partida a ejecutar (Plan)</label>
              <select 
                value={selectedTask}
                onChange={(e) => {
                  setSelectedTask(e.target.value);
                  setSelectedComponent('');
                  setTaskHours('');
                  setTaskQuantity('');
                }}
                className="w-full bg-white border border-slate-200/80 text-slate-700 text-base md:text-sm font-medium rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 p-3 shadow-sm transition-all hover:border-slate-300 min-h-[48px]"
              >
                <option value="">Selecciona otra tarea si es necesario...</option>
                
                {suggestedTasks.filter(t => t.plan?.projectId === selectedProject).length > 0 && (
                  <optgroup label="Sugeridas para Hoy">
                    {suggestedTasks.filter(t => t.plan?.projectId === selectedProject).map(t => {
                      const isAssigned = t.components?.some(c => c.plannedWorkers && c.plannedWorkers.length > 0);
                      return (
                        <option key={t.id} value={t.id}>{isAssigned ? '🎯' : '⭐'} {t.name}</option>
                      );
                    })}
                  </optgroup>
                )}

                <optgroup label="Todas las partidas del plan">
                  {activePlanTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Componente de Mano de Obra */}
            {selectedTask && (activePlanTasks.find(t => t.id === selectedTask) || suggestedTasks.find(t => t.id === selectedTask))?.components?.filter((c: any) => c.resourceType === 'MANO_OBRA').length ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Mano de Obra (Recurso asignado)</label>
                <select 
                  value={selectedComponent}
                  onChange={(e) => {
                    setSelectedComponent(e.target.value);
                    setTaskHours(''); // Clear to allow auto-fill to trigger
                  }}
                  className="w-full bg-white border border-slate-200/80 text-slate-700 text-base md:text-sm font-medium rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 p-3 shadow-sm transition-all hover:border-slate-300 min-h-[48px]"
                >
                  <option value="">General / No especificar</option>
                  {(activePlanTasks.find(t => t.id === selectedTask) || suggestedTasks.find(t => t.id === selectedTask))?.components?.filter((c: any) => c.resourceType === 'MANO_OBRA').map((c: any) => {
                    const suggestedTask = suggestedTasks.find(t => t.id === selectedTask);
                    const isAssigned = suggestedTask?.components?.find(sc => sc.id === c.id && sc.plannedWorkers && sc.plannedWorkers.length > 0);
                    return (
                      <option key={c.id} value={c.id}>
                        {isAssigned ? '🎯 ' : ''}{c.concept} {isAssigned ? '(Tu Rol Asignado)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Horas dedicadas</label>
                <input 
                  type="number" min="0" step="0.5"
                  value={taskHours} onChange={e => setTaskHours(e.target.value)}
                  className="w-full bg-white border border-slate-200/80 text-base md:text-sm font-medium rounded-xl p-3 shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all hover:border-slate-300 min-h-[48px]"
                  placeholder="Ej: 4"
                />
              </div>
              {selectedTask && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Avance (Unidades)</label>
                  <input 
                    type="number" min="0" step="0.01"
                    value={taskQuantity} onChange={e => setTaskQuantity(e.target.value)}
                    className="w-full bg-white border border-slate-200/80 text-base md:text-sm font-medium rounded-xl p-3 shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all hover:border-slate-300 min-h-[48px]"
                    placeholder="Cantidad..."
                  />
                </div>
              )}
            </div>
          </div>
        ) : selectedProject && activePlanTasks.length === 0 ? (
          <div className="p-4 border-b border-slate-100 bg-slate-50/30">
            <p className="text-sm text-slate-500 text-center">No hay tareas planificadas para este proyecto hoy.</p>
          </div>
        ) : null}

        {/* Controles Inferiores */}
        <div className="px-5 pb-5 pt-3 flex flex-col gap-6">
          
          {/* Sección Fotos y Previsualizaciones */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={galleryInputRef} 
                onChange={handlePhotoSelect} 
                multiple
              />

              <button 
                type="button"
                onClick={() => setShowCameraModal(true)}
                className="group flex flex-1 sm:flex-none items-center justify-center gap-2.5 px-5 py-3 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
              >
                <Camera size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
                <span className="font-semibold text-slate-700 group-hover:text-slate-900 text-sm">Cámara</span>
              </button>
              <button 
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="group flex flex-1 sm:flex-none items-center justify-center gap-2.5 px-5 py-3 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
              >
                <ImageIcon size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
                <span className="font-semibold text-slate-700 group-hover:text-slate-900 text-sm">Galería</span>
              </button>
            </div>

            {photoPreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-1 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                {photoPreviews.map((preview, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <img src={preview} alt="preview" className="w-20 h-20 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg transform scale-90 group-hover:scale-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Sección Acción y Botón Publicar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-2 flex-wrap bg-slate-50/80 p-1.5 rounded-xl border border-slate-100">
                <button 
                  onClick={() => setActionType(actionType === 'Incidencia' ? 'General' : 'Incidencia')}
                  className={`flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-bold transition-all active:scale-95 ${actionType === 'Incidencia' ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <AlertTriangle size={16} /> Incidencia
                </button>
                <button 
                  onClick={() => setActionType(actionType === 'Material' ? 'General' : 'Material')}
                  className={`flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-bold transition-all active:scale-95 ${actionType === 'Material' ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <Package size={16} /> Material
                </button>
                <button 
                  onClick={() => setActionType(actionType === 'Coat-QC' ? 'General' : 'Coat-QC')}
                  className={`flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-bold transition-all active:scale-95 ${actionType === 'Coat-QC' ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <ShieldCheck size={16} /> Coat-QC
                </button>
              </div>
              <button
                onClick={handlePublish}
                disabled={isSubmitting || (!text.trim() && actionType === 'General' && !selectedTask && selectedPhotos.length === 0)}
                className="w-full md:w-auto min-h-[56px] px-8 py-3.5 bg-secondary text-white text-base md:text-sm font-bold rounded-2xl md:rounded-xl hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 shadow-xl shadow-secondary/20"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={20} className="drop-shadow-sm" />
                )}
                Publicar entrada
              </button>
            </div>
          </div>
        </div>
      </div>
      


      {/* Feed */}
      <div className="mt-14 relative">
        <h3 className="text-lg font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
          Actividad Reciente
          <span className="bg-slate-100 text-slate-500 text-xs py-0.5 px-2.5 rounded-full">{feed.length}</span>
        </h3>
        
        {feed.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200/60 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
              <ClipboardList className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-500 font-medium text-lg">Aún no hay entradas hoy.</p>
            <p className="text-slate-400 text-sm mt-1">Sé el primero en compartir qué está pasando.</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:ml-[1.4rem] before:h-full before:w-0.5 before:bg-slate-200">
            {feed.map((entry) => (
              <div key={entry.id} className="relative flex gap-5 md:gap-6 group">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border-[3px] border-white shadow-sm relative z-10 text-slate-400">
                  <UserCircle2 size={24} />
                </div>
                <div 
                  className={`flex-1 bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative transition-all duration-300 ${entry.taskId ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-slate-300/80' : 'hover:shadow-md'}`}
                  onClick={() => entry.taskId && setExpandedFeed(expandedFeed === entry.id ? null : entry.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="font-bold text-slate-800 tracking-tight">{entry.userName || entry.author}</span>
                      {entry.actionType !== 'General' && (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider
                          ${entry.actionType === 'Incidencia' ? 'bg-red-50 text-red-600 border border-red-100' : 
                            entry.actionType === 'Material' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'}
                        `}>
                          {entry.actionType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-md">{entry.time}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFeedEntry(entry.id);
                        }}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100"
                        title="Borrar entrada"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[15px] leading-relaxed text-slate-600 whitespace-pre-wrap">{entry.text}</p>
                  
                  {entry.photoUrls && entry.photoUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {entry.photoUrls.map((url: string, idx: number) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="block overflow-hidden rounded-xl border border-slate-200/80 shadow-sm">
                          <img src={url} alt="Adjunto" className="w-24 h-24 object-cover hover:scale-110 transition-transform duration-500" />
                        </a>
                      ))}
                    </div>
                  )}
                  
                  {/* Expanded Task Details */}
                  {expandedFeed === entry.id && entry.taskId && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20 bg-slate-50 px-2 py-1 rounded text-center">Partida</span>
                        <span className="text-sm font-semibold text-slate-700">{activePlanTasks.find(t => t.id === entry.taskId)?.name || suggestedTasks.find(t => t.id === entry.taskId)?.name || 'Tarea Desconocida'}</span>
                      </div>
                      {entry.componentId && (
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20 bg-slate-50 px-2 py-1 rounded text-center">Recurso</span>
                          <span className="text-sm font-semibold text-slate-700">{activePlanTasks.find(t => t.id === entry.taskId)?.components?.find(c => c.id === entry.componentId)?.concept || 'Desconocido'}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {entry.hours && Number(entry.hours) > 0 ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                            <span className="text-base">⏱️</span>
                            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">{entry.hours} horas</span>
                          </div>
                        ) : null}
                        {entry.quantityDone && Number(entry.quantityDone) > 0 ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg shadow-sm">
                            <span className="text-base">📈</span>
                            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Avance: {entry.quantityDone}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                  {entry.taskId && expandedFeed !== entry.id && (
                    <div className="absolute right-6 bottom-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ver más</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CameraModal 
        isOpen={showCameraModal} 
        onClose={() => setShowCameraModal(false)} 
        onCapture={handleCameraCapture} 
      />
    </div>
  );
}
