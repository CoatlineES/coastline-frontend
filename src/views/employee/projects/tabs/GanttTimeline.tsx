import React, { useState, useRef, useEffect } from 'react';
import { ProjectPlan, ProjectTask, projectPlanningService } from '../../../../services/project-planning.service';
import { ChevronDown, ChevronRight, Plus, Grid, MoreVertical, Package, Trash2, Calendar, Save, Eye, EyeOff, HardHat, Tractor } from 'lucide-react';
import { GanttGrid } from './GanttGrid';
import ApuPickerModal from '../../quotations/ApuPickerModal';
import { TaskBreakdownModal } from './TaskBreakdownModal';
import { DraggableWorkersBar } from './DraggableWorkersBar';
import { Resource, resourcesService } from '../../../../services/resources.service';
import { HolidayCalendar } from '../../../../services/holiday-calendars.service';
import { Project } from '../../../../services/types';

interface GanttTimelineProps {
  plan: ProjectPlan;
  project?: Project;
  onUpdate: () => void;
  calendars?: HolidayCalendar[];
  selectedCalendarId?: string;
}

const DurationEditor = ({ task, onUpdate }: { task: ProjectTask, onUpdate: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  
  // Extract initial values
  const getInitialParts = () => {
    let d = 0, h = 0, m = 0;
    if (task.durationDays !== null) {
      d = task.durationDays;
    } else if (task.durationMinutes !== null) {
      d = Math.floor(task.durationMinutes / 540);
      const rem = task.durationMinutes % 540;
      h = Math.floor(rem / 60);
      m = rem % 60;
    }
    return { d, h, m };
  };

  const [parts, setParts] = useState(getInitialParts());
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setParts(getInitialParts());
  }, [task.durationDays, task.durationMinutes]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true); // true for capture phase to catch internal scrolls
      
      // Calculate fixed position
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const popoverHeight = 150; // Approximate height
        
        let top = rect.bottom + 4;
        // If it goes off the bottom of the screen, show it above the button
        if (top + popoverHeight > window.innerHeight) {
          top = rect.top - popoverHeight - 4;
        }
        
        setPopoverStyle({
          position: 'fixed',
          top: `${top}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
          zIndex: 9999
        });
      }
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleSave = async () => {
    const totalMins = (parts.d * 540) + (parts.h * 60) + parts.m;
    await projectPlanningService.updateTask(task.id, { 
      durationMinutes: totalMins, 
      durationDays: parts.d > 0 && parts.h === 0 && parts.m === 0 ? parts.d : null 
    });
    setIsOpen(false);
    onUpdate();
  };

  // Format display text
  const initial = getInitialParts();
  const displayParts = [];
  if (initial.d > 0) displayParts.push(`${initial.d}d`);
  if (initial.h > 0) displayParts.push(`${initial.h}h`);
  if (initial.m > 0) displayParts.push(`${initial.m}m`);
  const displayStr = displayParts.length > 0 ? displayParts.join(' ') : '0d';

  return (
    <div className="relative flex items-center justify-center p-1 border-r border-slate-200 text-slate-700 min-w-0">
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-semibold px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded transition-colors"
      >
        {displayStr}
      </button>

      {isOpen && (
        <div ref={popoverRef} style={popoverStyle} className="bg-white border border-slate-200 shadow-xl rounded-lg p-3 flex flex-col gap-3 min-w-[200px]">
          <div className="flex justify-between gap-2">
            <div className="flex flex-col gap-1 items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Días</label>
              <input type="number" min="0" value={parts.d === 0 ? '' : parts.d} onChange={e => setParts(p => ({ ...p, d: parseInt(e.target.value) || 0 }))} className="w-12 text-center border border-slate-300 rounded p-1 text-xs outline-none focus:border-blue-500" placeholder="0" />
            </div>
            <div className="flex flex-col gap-1 items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Horas</label>
              <input type="number" min="0" max="8" value={parts.h === 0 ? '' : parts.h} onChange={e => setParts(p => ({ ...p, h: parseInt(e.target.value) || 0 }))} className="w-12 text-center border border-slate-300 rounded p-1 text-xs outline-none focus:border-blue-500" placeholder="0" />
            </div>
            <div className="flex flex-col gap-1 items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Min</label>
              <input type="number" min="0" max="59" value={parts.m === 0 ? '' : parts.m} onChange={e => setParts(p => ({ ...p, m: parseInt(e.target.value) || 0 }))} className="w-12 text-center border border-slate-300 rounded p-1 text-xs outline-none focus:border-blue-500" placeholder="0" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <button onClick={() => setIsOpen(false)} className="px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded">
              Cancelar
            </button>
            <button onClick={handleSave} className="px-3 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded">
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export function GanttTimeline({ plan, project, onUpdate, calendars, selectedCalendarId }: GanttTimelineProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(plan.tasks?.map(t => t.id) || []));
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [showBaseline, setShowBaseline] = useState<boolean>(true);

  const [viewMode, setViewMode] = useState<'days' | 'hours'>('days');
  const [assignmentViewMode, setAssignmentViewMode] = useState<'MANO_OBRA' | 'MAQUINARIA' | 'MATERIALES'>('MANO_OBRA');
  
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const [dragOverComponentId, setDragOverComponentId] = useState<string | null>(null);
  const [isAddingUnplanned, setIsAddingUnplanned] = useState(false);
  const [apuTargetId, setApuTargetId] = useState<string | null>(null);
  
  const visibleRows = React.useMemo(() => {
    const rows: import('./GanttGrid').VisibleRow[] = [];
    const tasks = plan.tasks || [];
    
    // 1. Unplanned Tasks Block
    if (isAddingUnplanned) {
      rows.push({ 
        type: 'UNPLANNED_HEADER', 
        projectId: plan.id, 
        isAddingUnplanned: true,
        onAddUnplanned: (date?: Date) => handleAddSub(plan.id, 'UNPLANNED', date)
      });
      const unplannedTasks = tasks.filter(t => t.isUnplanned);
      unplannedTasks.forEach(t => {
        rows.push({ type: 'TASK', task: t, level: 0 });
      });
      rows.push({ type: 'GAP', height: 'h-4 bg-[#f8fafc]' });
    }
    
    // 2. Planned Tasks Tree
    const plannedTasks = tasks.filter(t => !t.isUnplanned);
    const flatten = (t: ProjectTask, level: number = 0) => {
      rows.push({ type: 'TASK', task: t, level });
      if (expandedNodes.has(t.id) && t.children && t.children.length > 0) {
        t.children.filter(child => !child.isUnplanned).forEach(child => flatten(child, level + 1));
      }
    };
    plannedTasks.forEach(t => flatten(t, 0));
    
    return rows;
  }, [plan, isAddingUnplanned, expandedNodes]);

  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [isTaskBreakdownOpen, setIsTaskBreakdownOpen] = useState(false);

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const leftPane = leftPaneRef.current;
    const rightPane = rightPaneRef.current;
    if (!leftPane || !rightPane) return;

    let isSyncingLeft = false;
    let isSyncingRight = false;

    const onLeftScroll = () => {
      if (isSyncingLeft) {
        isSyncingLeft = false;
        return;
      }
      isSyncingRight = true;
      rightPane.scrollTop = leftPane.scrollTop;
    };

    const onRightScroll = () => {
      if (isSyncingRight) {
        isSyncingRight = false;
        return;
      }
      isSyncingLeft = true;
      leftPane.scrollTop = rightPane.scrollTop;
    };

    leftPane.addEventListener('scroll', onLeftScroll, { passive: true });
    rightPane.addEventListener('scroll', onRightScroll, { passive: true });

    return () => {
      leftPane.removeEventListener('scroll', onLeftScroll);
      rightPane.removeEventListener('scroll', onRightScroll);
    };
  }, [plan.tasks, viewMode]); // Re-bind if task structure changes

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!leftPaneRef.current) return;
    
    const edgeSize = 150;
    const scrollSpeed = 25;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    if (y < edgeSize) {
      leftPaneRef.current.scrollTop -= scrollSpeed;
    } else if (y > rect.height - edgeSize) {
      leftPaneRef.current.scrollTop += scrollSpeed;
    }
  };

  const handleUpdateApu = async (apuTask: ProjectTask, newQuantity: number) => {
    const newExpanded = new Set(expandedNodes);
    // ... logic
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedNodes(newExpanded);
  };

  const handleAddZone = async () => {
    const name = prompt('Nombre de la nueva Zona:');
    if (!name) return;
    await projectPlanningService.createTask(plan.id, { name, type: 'ZONE' });
    onUpdate();
  };

  const handleAddSub = async (parentId: string, parentType: string, date?: Date) => {
    // Siempre añadir como Tarea para que tenga el mismo comportamiento que los importados
    const name = prompt('Nombre de la nueva Tarea:');
    if (!name) return;
    
    const taskData: any = { name, type: 'TASK' };
    
    if (parentType === 'UNPLANNED') {
      taskData.isUnplanned = true;
      if (date) {
        taskData.startDate = date.toISOString();
        taskData.durationDays = 1; // Default duration of 1 day
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
        taskData.endDate = end.toISOString();
      }
    } else {
      taskData.parentId = parentId;
    }
    
    await projectPlanningService.createTask(plan.id, taskData);
    if (!expandedNodes.has(parentId)) toggleNode(parentId);
    onUpdate();
  };

  const handleDeleteTask = async (taskId: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${name}" y todo su contenido?`)) return;
    try {
      await projectPlanningService.deleteTask(taskId);
      onUpdate();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar.");
    }
  };

  const handleImportApu = async (apu: Resource) => {
    if (!apuTargetId) return;
    await projectPlanningService.createTask(plan.id, { 
      name: apu.name, 
      type: 'TASK', 
      parentId: apuTargetId,
      resourceId: apu.id,
      quantity: 1 // Default quantity
    });
    if (!expandedNodes.has(apuTargetId)) toggleNode(apuTargetId);
    setApuTargetId(null);
    onUpdate();
  };

  const handleTaskClick = async (task: ProjectTask) => {
    // Only allow breakdown on Tasks (not Zones or Subzones, unless we want to allow it, but usually just Tasks)
    if (task.type === 'TASK') {
      setSelectedTask(task);
      setIsTaskBreakdownOpen(true);
    }
  };

  const renderVisibleRow = (row: import('./GanttGrid').VisibleRow, index: number) => {
    if (row.type === 'GAP') {
      return <div key={`gap-${index}`} className={row.height} />;
    }
    if (row.type === 'UNPLANNED_HEADER') {
      return (
        <div key={`unplanned-header-${index}`} className="flex items-center justify-between p-2 h-16 border-b border-indigo-200 bg-indigo-50" style={{ gridTemplateColumns: '1fr 130px 140px 90px 60px' }}>
          <span className="text-indigo-800 font-bold text-sm ml-2">⚠️ TAREAS CORRECTIVAS / EXTRA</span>
          {row.isAddingUnplanned && (
            <button onClick={() => handleAddSub(plan.id, 'UNPLANNED')} className="text-xs font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded flex items-center gap-1">
              <Plus size={14} /> Añadir Tarea Extra
            </button>
          )}
        </div>
      );
    }
    const { task, level } = row;
    const isExpanded = expandedNodes.has(task.id);
    const hasChildren = task.children && task.children.length > 0;
    
    return (
      <React.Fragment key={task.id}>
        <div 
          className={`grid h-16 border-b border-slate-200 transition-colors hover:bg-blue-50/40 relative group/row ${
            task.type === 'VIRTUAL_ADD_UNPLANNED' ? 'bg-indigo-50/80' :
            task.type === 'PHASE' ? 'bg-[#002D5A]/5' : 
            task.type === 'ZONE' ? 'bg-slate-50/80' : 'bg-white'
          }`}
          style={{ gridTemplateColumns: '1fr 130px 140px 90px 60px' }}
        >
          {/* Columna: Nombre */}
          <div 
            className="flex items-center p-2 border-r border-slate-200 group min-w-0"
            style={{ paddingLeft: `${(level * 1.5) + 0.5}rem` }}
          >
            {(task.type !== 'TASK' && task.type !== 'VIRTUAL_ADD_UNPLANNED') ? (
              <button onClick={() => toggleNode(task.id)} className="p-1 mr-1 text-slate-400 hover:bg-slate-200 rounded-md transition-colors shrink-0">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <div className="w-6 mr-1 shrink-0" /> // Espacio para alinear
            )}
            
            <span 
              onClick={() => handleTaskClick(task)}
              className={`text-sm truncate block ${
                task.type === 'VIRTUAL_ADD_UNPLANNED' ? 'text-indigo-800 font-bold' :
                task.isUnplanned ? 'text-indigo-700' :
                task.type === 'PHASE' ? 'font-bold text-[#002D5A] uppercase' :
                task.type === 'ZONE' ? 'font-bold text-slate-800' :
                'text-slate-700 font-medium cursor-pointer hover:text-blue-600 hover:underline'
              }`}
              title={task.name}
            >
              {task.name}
            </span>
            
            <div className="ml-auto flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0 bg-white/50 shadow-[-8px_0_10px_white]">
              {task.type !== 'TASK' && task.type !== 'VIRTUAL_ADD_UNPLANNED' && (
                <>
                  <button 
                    onClick={() => handleAddSub(task.id, task.type)}
                    className="p-1 text-slate-400 hover:bg-blue-100 hover:text-blue-600 rounded-md transition-colors mr-1"
                    title="Añadir Tarea Manual"
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    onClick={() => { setApuTargetId(task.id); }}
                    className="p-1 text-slate-400 hover:bg-blue-100 hover:text-blue-600 rounded-md transition-colors mr-1"
                    title="Importar de biblioteca"
                  >
                    <Package size={14} />
                  </button>
                </>
              )}
              {task.type !== 'VIRTUAL_ADD_UNPLANNED' && (
                <button 
                  onClick={() => handleDeleteTask(task.id, task.name)}
                  className="ml-1 p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded-md transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          

          {/* Inicio */}
          <div className="flex items-center justify-center p-1 border-r border-slate-200 text-sm font-medium text-slate-700 min-w-0">
            {task.type !== 'VIRTUAL_ADD_UNPLANNED' && (
              <input
                type="date"
              value={task.startDate ? (() => {
                const d = new Date(task.startDate);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              })() : ''}
              onChange={async (e) => {
                const val = e.target.value;
                if (val) {
                  const d = new Date(val);
                  d.setHours(8, 0, 0, 0); // Start at 8 AM instead of midnight
                  
                  if (task.type === 'ZONE' || task.type === 'SUBZONE') {
                    await projectPlanningService.shiftZoneDates(task.id, d);
                  } else {
                    await projectPlanningService.updateTask(task.id, { startDate: d.toISOString() });
                  }
                } else {
                  await projectPlanningService.updateTask(task.id, { startDate: undefined });
                }
                onUpdate();
              }}
              className="bg-transparent border border-transparent hover:border-slate-300 outline-none focus:ring-1 focus:ring-blue-500 rounded text-center w-full p-1 cursor-pointer max-w-[115px]"
            />
            )}
          </div>
          
          {/* Duración */}
          <DurationEditor task={task} onUpdate={onUpdate} />
          
          {/* Fin */}
          <div className="flex items-center justify-center p-2 border-r border-slate-200 text-sm font-medium text-slate-700 bg-slate-50/50 min-w-0 truncate">
            {task.type !== 'VIRTUAL_ADD_UNPLANNED' && (
              task.endDate ? new Date(task.endDate).toLocaleDateString('es-ES') : '-'
            )}
          </div>

          {/* % */}
          <div className="flex items-center justify-center p-2 text-sm font-bold text-slate-700 min-w-0">
            {task.type !== 'VIRTUAL_ADD_UNPLANNED' && (
              <>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={task.progress || 0}
                  onChange={async (e) => {
                    await projectPlanningService.updateTask(task.id, { progress: parseInt(e.target.value) || 0 });
                    onUpdate();
                  }}
                  className="w-full bg-transparent border-none text-center focus:ring-1 focus:ring-blue-500 rounded p-1"
                />
                <span className="text-xs ml-0.5">%</span>
              </>
            )}
          </div>
        </div>
        
        
      </React.Fragment>
    );
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      {/* TOOLBAR SUPERIOR COMPARTIDA */}
      <div className="flex flex-wrap justify-between items-center gap-2 p-2 bg-slate-50 border-b border-slate-200 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 font-medium">Ir a fecha:</label>
            <input 
              type="date" 
              value={baseDate.toISOString().split('T')[0]} 
              onChange={e => { if (e.target.value) setBaseDate(new Date(e.target.value + 'T12:00:00')) }}
              className="text-xs border border-slate-300 rounded px-2 py-1 bg-white cursor-pointer focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <button onClick={() => setBaseDate(new Date())} className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium">
              Hoy
            </button>
          </div>
          
          <div className="flex items-center gap-2 border-l border-slate-300 pl-3 ml-1">
            <label className="text-xs text-orange-700 font-bold flex items-center gap-1">
              <Calendar size={14} /> Mover Fechas:
            </label>
            <input 
              type="date"
              title="Selecciona una nueva fecha de inicio para desplazar todo el plan"
              className="text-xs border border-orange-300 rounded px-2 py-1 bg-orange-50 text-orange-700 cursor-pointer focus:ring-1 focus:ring-orange-500 outline-none font-semibold"
              onChange={async (e) => {
                const val = e.target.value;
                if (!val) return;
                const d = new Date(val + 'T12:00:00');
                if (confirm(`¿Estás seguro de desplazar TODA la planificación a partir del ${val}? Se mantendrán las duraciones y secuencias.`)) {
                  try {
                    await projectPlanningService.shiftPlanDates(plan.id, d);
                    onUpdate();
                    alert('Planificación desplazada con éxito.');
                  } catch (err: any) {
                    alert('Error al desplazar: ' + err.message);
                  }
                }
                e.target.value = ''; // Reset input
              }}
            />
          </div>
          
          <div className="flex items-center gap-2 border-l border-slate-300 pl-3 ml-1">
            <button
              title="Guarda las fechas actuales como Línea Base para comparativas futuras"
              onClick={async () => {
                if (confirm('¿Deseas guardar la planificación actual como la Línea Base Inicial? Las fechas de fondo se sobrescribirán con las actuales.')) {
                  try {
                    await projectPlanningService.saveBaseline(plan.id);
                    setShowBaseline(true);
                    onUpdate();
                  } catch (err: any) {
                    alert('Error al guardar línea base: ' + err.message);
                  }
                }
              }}
              className="text-xs px-2 py-1 rounded bg-teal-50 text-teal-700 border border-teal-300 hover:bg-teal-100 hover:text-teal-800 transition-colors font-medium flex items-center gap-1"
            >
              <Save size={14} /> Guardar Línea Base
            </button>
            <button
              onClick={() => setShowBaseline(!showBaseline)}
              className={`text-xs px-2 py-1 rounded border transition-colors flex items-center gap-1 ${
                showBaseline ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {showBaseline ? <EyeOff size={14} /> : <Eye size={14} />} {showBaseline ? 'Ocultar Base' : 'Ver Base'}
            </button>
            <button
              onClick={() => setIsAddingUnplanned(!isAddingUnplanned)}
              className={`text-xs px-2 py-1 rounded border transition-colors flex items-center gap-1 ml-2 ${
                isAddingUnplanned ? 'bg-indigo-100 border-indigo-300 text-indigo-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              title="Mostrar/Ocultar el carril de Tareas Correctivas"
            >
              {isAddingUnplanned ? <EyeOff size={14} /> : <Eye size={14} />} 
              {isAddingUnplanned ? 'Ocultar Tareas Correctivas' : 'Ver Tareas Correctivas'}
            </button>
          </div>
          {viewMode === 'hours' && (
             <span className="text-[10px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">Mostrando 7 días en horas</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-md border border-slate-300 shadow-inner">
            <button 
              onClick={() => setAssignmentViewMode('MANO_OBRA')} 
              className={`text-[11px] flex items-center gap-1 px-3 py-1 rounded-sm transition-all duration-200 ${assignmentViewMode === 'MANO_OBRA' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              title="Ver asignaciones de Mano de Obra"
            >
              <HardHat size={12} /> Mano de Obra
            </button>
            <button 
              onClick={() => setAssignmentViewMode('MAQUINARIA')} 
              className={`text-[11px] flex items-center gap-1 px-3 py-1 rounded-sm transition-all duration-200 ${assignmentViewMode === 'MAQUINARIA' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              title="Ver asignaciones de Maquinaria"
            >
              <Tractor size={12} /> Maquinaria
            </button>
            <button 
              onClick={() => setAssignmentViewMode('MATERIALES')} 
              className={`text-[11px] flex items-center gap-1 px-3 py-1 rounded-sm transition-all duration-200 ${assignmentViewMode === 'MATERIALES' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              title="Ver asignaciones de Materiales / Recursos"
            >
              <Package size={12} /> Recursos
            </button>
          </div>

          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-md border border-slate-300 shadow-inner">
            <button 
              onClick={() => setViewMode('days')} 
              className={`text-xs px-4 py-1 rounded-sm transition-all duration-200 ${viewMode === 'days' ? 'bg-white shadow-sm font-semibold text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Días
            </button>
            <button 
              onClick={() => setViewMode('hours')} 
              className={`text-xs px-4 py-1 rounded-sm transition-all duration-200 ${viewMode === 'hours' ? 'bg-white shadow-sm font-semibold text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Horas
            </button>
          </div>
        </div>
      </div>

      <DraggableWorkersBar projectId={project?.id} />

      <div className="flex flex-1 overflow-hidden w-full" onDragOver={handleDragOver}>
        {/* LEFT PANE - TREE GRID */}
        <div className="w-[55%] flex flex-col border-r border-slate-300 shadow-[4px_0_10px_rgba(0,0,0,0.03)] z-10 bg-white shrink-0">
          {/* Tree Grid Header */}
          <div 
            className="grid border-b-2 border-slate-300 bg-slate-100 uppercase text-[11px] font-bold text-slate-600 tracking-wider h-14 shrink-0"
            style={{ gridTemplateColumns: '1fr 130px 140px 90px 60px' }}
          >
            <div className="px-3 border-r border-slate-200 flex items-center justify-between min-w-0">
              <span className="truncate">Estructura / Tarea</span>
              <button onClick={handleAddZone} className="text-blue-600 hover:bg-blue-200 bg-blue-100 p-1.5 rounded transition-colors shadow-sm shrink-0 ml-2" title="Añadir Zona">
                <Plus size={16} />
              </button>
            </div>
            <div className="px-3 border-r border-slate-200 flex items-center justify-center">Inicio</div>
            <div className="px-3 border-r border-slate-200 flex flex-col items-center justify-center leading-tight">
               <span>Duración</span>
            </div>
            <div className="px-3 border-r border-slate-200 flex items-center justify-center">Fin</div>
            <div className="px-3 flex items-center justify-center">%</div>
          </div>
        
          {/* Tree Grid Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar" ref={leftPaneRef}>
            
            {/* --- UNPLANNED TASKS HEADER --- */}
            {/* Removed standalone header as it is now integrated into derivedPlan as a virtual row */}

            {/* --- REGULAR TASKS SECTION --- */}
            {visibleRows.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No hay zonas ni tareas creadas.<br/>Haz clic en el '+' arriba para comenzar.
              </div>
            ) : (
              visibleRows.map((row, index) => renderVisibleRow(row, index))
            )}
          </div>
        </div>

        {/* RIGHT PANE - GANTT TIMELINE GRID */}
        <div className="w-[45%] flex bg-white relative">
          <GanttGrid 
            plan={plan}
            visibleRows={visibleRows}
            project={project}
            expandedNodes={expandedNodes} 
            onUpdate={onUpdate}
            viewMode={viewMode}
            assignmentViewMode={assignmentViewMode}
            scrollRef={rightPaneRef}
            baseDate={baseDate}
            showBaseline={showBaseline}
            isAddingUnplanned={isAddingUnplanned}
            setIsAddingUnplanned={setIsAddingUnplanned}
            calendars={calendars}
            selectedCalendarId={selectedCalendarId}
            onTaskDoubleClick={handleTaskClick}
          />
        </div>
      </div>

      <ApuPickerModal
        isOpen={!!apuTargetId}
        onClose={() => setApuTargetId(null)}
        onSelect={handleImportApu as any}
        resourceType={"APU" as any}
      />

      {isTaskBreakdownOpen && selectedTask && (
        <TaskBreakdownModal
          task={selectedTask}
          onClose={() => {
            setIsTaskBreakdownOpen(false);
            setSelectedTask(null);
          }}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
