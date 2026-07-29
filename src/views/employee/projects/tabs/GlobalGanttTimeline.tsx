import React, { useState, useRef, useEffect } from 'react';
import { ProjectPlan, ProjectTask, projectPlanningService } from '../../../../services/project-planning.service';
import { ChevronDown, ChevronRight, Grid, MoreVertical, Calendar, Save, Eye, EyeOff, HardHat, Tractor, Package, ChevronsDown, ChevronsUp, Plus } from 'lucide-react';
import { GanttGrid } from './GanttGrid';
import { DraggableWorkersBar } from './DraggableWorkersBar';
import { HolidayCalendar } from '../../../../services/holiday-calendars.service';
import { TaskBreakdownModal } from './TaskBreakdownModal';

interface GlobalGanttTimelineProps {
  plans: ProjectPlan[];
  onUpdate: () => void;
  calendars?: HolidayCalendar[];
}

export function GlobalGanttTimeline({ plans, onUpdate, calendars }: GlobalGanttTimelineProps) {
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [showBaseline, setShowBaseline] = useState<boolean>(true);
  const [isAddingUnplanned, setIsAddingUnplanned] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'hours'>('days');
  const [assignmentViewMode, setAssignmentViewMode] = useState<'MANO_OBRA' | 'MAQUINARIA' | 'MATERIALES'>('MANO_OBRA');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  const [selectedTaskForBreakdown, setSelectedTaskForBreakdown] = useState<ProjectTask | null>(null);
  const [isTaskBreakdownOpen, setIsTaskBreakdownOpen] = useState(false);
  
  const gridScrollRef = useRef<HTMLDivElement>(null);
  
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);

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
  }, []); // refs are stable, no need to re-bind

  // Build Unified Plan and Map
  const { globalPlan, plansMap, allTasks } = React.useMemo(() => {
    const map = new Map<string, ProjectPlan>();
    const roots: ProjectTask[] = [];
    
    plans.forEach(p => {
      map.set(p.id, p);
      
      let minStart = Infinity;
      let maxEnd = -Infinity;
      const computeDates = (tasks: ProjectTask[]) => {
        for (const t of tasks) {
          if (t.startDate) minStart = Math.min(minStart, new Date(t.startDate).getTime());
          if (t.endDate) maxEnd = Math.max(maxEnd, new Date(t.endDate).getTime());
          if (t.children && t.children.length > 0) computeDates(t.children);
        }
      };
        const filteredTasks = (p.tasks || []).filter(t => isAddingUnplanned ? true : !t.isUnplanned);
        computeDates(filteredTasks);

      const finalStart = minStart !== Infinity ? new Date(minStart).toISOString() : p.project?.plannedStart || new Date().toISOString();
      const finalEnd = maxEnd !== -Infinity ? new Date(maxEnd).toISOString() : p.project?.plannedEnd || new Date().toISOString();

      const children = [...filteredTasks];

      const rootTask: ProjectTask = {
        id: p.project?.id || p.id,
        planId: p.id,
        parentId: null,
        name: p.project?.name || 'Proyecto',
        description: p.project?.address || '',
        startDate: finalStart,
        endDate: finalEnd,
        duration: 0,
        progress: 0,
        order: 0,
        type: 'PROJECT', // acts as the root
        children: children
      };
      roots.push(rootTask);
    });
    
    const aggregatedPlan: ProjectPlan = {
      id: 'global-plan',
      version: '1',
      isActive: true,
      projectId: 'global',
      tasks: roots
    };
    
    return { globalPlan: aggregatedPlan, plansMap: map, allTasks: roots };
  }, [plans, isAddingUnplanned]);

  const visibleRows = React.useMemo(() => {
    const rows: import('./GanttGrid').VisibleRow[] = [];
    const tasks = globalPlan.tasks || [];
    
    tasks.forEach(projectRoot => {
      if (isAddingUnplanned) {
        rows.push({ 
          type: 'UNPLANNED_HEADER', 
          isAddingUnplanned: true, 
          projectId: projectRoot.planId,
          onAddUnplanned: (date?: Date) => handleAddSub(projectRoot.planId!, 'UNPLANNED', date)
        });
        const unplannedTasks = (projectRoot.children || []).filter(t => t.isUnplanned);
        unplannedTasks.forEach(t => {
          rows.push({ type: 'TASK', task: t, level: 1 });
        });
      }
      
      const flatten = (t: ProjectTask, level: number = 0) => {
        rows.push({ type: 'TASK', task: t, level });
        if (expandedNodes.has(t.id) && t.children && t.children.length > 0) {
          t.children.filter(child => !child.isUnplanned).forEach(child => flatten(child, level + 1));
        }
      };
      
      flatten(projectRoot, 0);
      rows.push({ type: 'GAP', height: 'h-4 bg-[#f8fafc]' });
    });
    
    return rows;
  }, [globalPlan, isAddingUnplanned, expandedNodes]);

  // Initially collapse all projects (as asked in implementation plan and confirmed)
  
  const handleAddSub = async (planId: string, parentType: string, date?: Date) => {
    const name = prompt('Nombre de la nueva Tarea Extra:');
    if (!name) return;
    
    const taskData: any = { name, type: 'TASK' };
    
    if (parentType === 'UNPLANNED') {
      taskData.isUnplanned = true;
      if (date) {
        taskData.startDate = date.toISOString();
        taskData.durationDays = 1;
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
        taskData.endDate = end.toISOString();
      }
    }
    
    try {
      await projectPlanningService.createTask(planId, taskData);
      onUpdate();
    } catch (error) {
      console.error(error);
      alert('Error al crear la tarea extra');
    }
  };

  const handleExpandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (tasks: ProjectTask[]) => {
      tasks.forEach(t => {
        allIds.add(t.id);
        if (t.children && t.children.length > 0) collectIds(t.children);
      });
    };
    collectIds(globalPlan.tasks || []);
    setExpandedNodes(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set());
  };

  const handleDropWorker = async (e: React.DragEvent<HTMLDivElement>, task: ProjectTask) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
      if (!data) return;
      const payload = JSON.parse(data);
      if (payload.type !== 'worker') return;
      
      let targetComponent = task.components?.find(c => {
         if (assignmentViewMode === 'MANO_OBRA') return c.resourceType === 'MANO_OBRA' || c.resourceType === 'MANO_DE_OBRA';
         if (assignmentViewMode === 'MAQUINARIA') return c.resourceType === 'MAQUINARIA' || c.resourceType === 'EQUIPO';
         return c.resourceType === 'MATERIALES' || c.resourceType === 'MATERIAL' || c.resourceType === 'RECURSO';
      });
      
      if (!targetComponent) {
        if (window.confirm(`Esta tarea no tiene componentes de ${assignmentViewMode}. ¿Desea crear uno automáticamente para asignar al operario?`)) {
          targetComponent = await projectPlanningService.addTaskComponent(task.id, {
             concept: 'Asignación General',
             resourceType: assignmentViewMode,
             quantity: 1,
             unitCost: 0
          });
        } else {
          return;
        }
      }

      await projectPlanningService.assignWorkerToComponent(task.id, targetComponent.id, { 
        userId: payload.userId, 
        contractorWorkerId: payload.contractorWorkerId 
      });
      onUpdate();
      
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.clash) {
         if (window.confirm(`El operario ya está asignado a otras tareas en estas fechas:\n\n${err.response.data.clashes.join('\\n')}\n\n¿Desea asignarlo de todos modos?`)) {
            const data = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
            const parsed = JSON.parse(data);
            const targetComponent = task.components?.find(c => {
               if (assignmentViewMode === 'MANO_OBRA') return c.resourceType === 'MANO_OBRA' || c.resourceType === 'MANO_DE_OBRA';
               if (assignmentViewMode === 'MAQUINARIA') return c.resourceType === 'MAQUINARIA' || c.resourceType === 'EQUIPO';
               return c.resourceType === 'MATERIALES' || c.resourceType === 'MATERIAL' || c.resourceType === 'RECURSO';
            });
            if (targetComponent) {
              await projectPlanningService.assignWorkerToComponent(task.id, targetComponent.id, {
                userId: parsed.userId,
                contractorWorkerId: parsed.contractorWorkerId,
                force: true
              });
              onUpdate();
            }
         }
      } else {
         console.error(err);
         alert('Error al asignar operario');
      }
    }
  };

  const handleTaskClick = (task: ProjectTask) => {
    if (task.type === 'TASK') {
      setSelectedTaskForBreakdown(task);
      setIsTaskBreakdownOpen(true);
    }
  };

  const renderVisibleRow = (row: import('./GanttGrid').VisibleRow, index: number) => {
    if (row.type === 'GAP') {
      return <div key={`gap-${index}`} className={row.height} />;
    }
    if (row.type === 'UNPLANNED_HEADER') {
      return (
        <div key={`unplanned-header-${index}`} className="flex items-center justify-between p-2 h-16 border-b border-indigo-200 bg-indigo-50" style={{ gridTemplateColumns: '1fr 90px 70px' }}>
          <span className="text-indigo-800 font-bold text-sm ml-2">⚠️ TAREAS CORRECTIVAS / EXTRA</span>
          {row.isAddingUnplanned && (
            <button 
              onClick={() => row.projectId && handleAddSub(row.projectId, 'UNPLANNED')}
              className="text-xs font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
              title="Añadir Tarea Extra"
            >
              <Plus size={14} /> Añadir Tarea Extra
            </button>
          )}
        </div>
      );
    }
    const { task, level } = row;
    const isExpanded = expandedNodes.has(task.id);
    const hasChildren = task.children && task.children.length > 0;
    const isProjectRoot = task.type === 'PROJECT';
    
    return (
      <React.Fragment key={task.id}>
        <div 
          className={`grid h-16 border-b border-slate-200 transition-colors ${
            isProjectRoot ? 'bg-slate-100 font-semibold hover:bg-slate-200/50' :
            task.type === 'VIRTUAL_ADD_UNPLANNED' ? 'bg-indigo-50/80' :
            task.type === 'PHASE' ? 'bg-[#002D5A]/5 hover:bg-blue-50/40' : 
            task.type === 'ZONE' ? 'bg-slate-50/80 hover:bg-blue-50/40' : 'hover:bg-blue-50/40'
          }`}
          style={{ gridTemplateColumns: '1fr 90px 70px' }}
          onDragOver={(e) => {
            if (task.type !== 'VIRTUAL_ADD_UNPLANNED') {
              e.preventDefault();
            }
          }}
          onDrop={(e) => {
            if (task.type !== 'VIRTUAL_ADD_UNPLANNED') {
              handleDropWorker(e, task);
            }
          }}
        >
          {/* Nombre */}
          <div 
            className="flex items-center p-2 border-r border-slate-200 group min-w-0"
            style={{ paddingLeft: `${(level * 1.5) + 0.5}rem` }}
          >
            {(isProjectRoot || (task.type !== 'TASK' && task.type !== 'VIRTUAL_ADD_UNPLANNED')) ? (
              <button onClick={() => toggleNode(task.id)} className="p-1 mr-1 text-slate-400 hover:bg-slate-200 rounded-md transition-colors shrink-0">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <div className="w-6 shrink-0" />
            )}
            
            <div className="flex-1 truncate relative">
              <span 
                onClick={() => handleTaskClick(task)}
                className={`text-[11px] uppercase tracking-wide truncate block cursor-pointer ${
                  isProjectRoot ? 'text-slate-800' : 
                  task.type === 'VIRTUAL_ADD_UNPLANNED' ? 'text-indigo-800 font-bold' :
                  task.isUnplanned ? 'text-indigo-700' :
                  task.type === 'TASK' ? 'text-slate-600 font-medium normal-case text-xs hover:text-blue-600' : 
                  'text-[#002D5A] font-semibold'
                }`}>
                {task.name}
              </span>
            </div>
          </div>

          {/* Fechas */}
          <div className="flex flex-col justify-center items-center p-2 border-r border-slate-200">
            {task.type !== 'VIRTUAL_ADD_UNPLANNED' && (
              <div className="text-xs text-slate-600 text-center">
                <div>{new Date(task.startDate).toLocaleDateString()}</div>
                {task.endDate && <div className="text-slate-400">al {new Date(task.endDate).toLocaleDateString()}</div>}
              </div>
            )}
          </div>
          
          {/* Estado/Progreso */}
          <div className="flex items-center justify-center p-2 border-r border-slate-200">
            {isProjectRoot ? (
              <span className="text-xs px-2 py-1 bg-slate-200 rounded text-slate-700">
                {task.children?.filter(t => t.type !== 'VIRTUAL_ADD_UNPLANNED').length || 0} tareas
              </span>
            ) : task.type === 'VIRTUAL_ADD_UNPLANNED' ? null : (
              <span className="text-xs font-semibold text-slate-600">
                {task.progress}%
              </span>
            )}
          </div>

        </div>

        
      </React.Fragment>
    );
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedNodes(newExpanded);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white z-20 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('days')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'days' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Días
            </button>
            <button 
              onClick={() => setViewMode('hours')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'hours' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Horas
            </button>
          </div>
          
          <div className="w-px h-6 bg-slate-300 mx-2" />
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setAssignmentViewMode('MANO_OBRA')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${assignmentViewMode === 'MANO_OBRA' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <HardHat size={16} /> Operarios
            </button>
            <button 
              onClick={() => setAssignmentViewMode('MAQUINARIA')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${assignmentViewMode === 'MAQUINARIA' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <Tractor size={16} /> Equipos
            </button>
            <button 
              onClick={() => setAssignmentViewMode('MATERIALES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${assignmentViewMode === 'MATERIALES' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <Package size={16} /> Materiales
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={handleExpandAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-slate-600 hover:text-slate-800 hover:bg-slate-200"
              title="Desplegar todas las tareas"
            >
              <ChevronsDown size={16} /> Expandir Todo
            </button>
            <button 
              onClick={handleCollapseAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-slate-600 hover:text-slate-800 hover:bg-slate-200"
              title="Contraer todas las tareas"
            >
              <ChevronsUp size={16} /> Contraer Todo
            </button>
          </div>
          
          <button 
            onClick={() => setShowBaseline(!showBaseline)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              showBaseline 
                ? 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showBaseline ? <EyeOff size={16} /> : <Eye size={16} />}
            {showBaseline ? 'Ocultar Base' : 'Ver Base'}
          </button>

          <button 
            onClick={() => setIsAddingUnplanned(!isAddingUnplanned)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ml-2 ${
              isAddingUnplanned 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isAddingUnplanned ? <EyeOff size={16} /> : <Eye size={16} />}
            {isAddingUnplanned ? 'Ocultar Tareas Extra' : 'Ver Tareas Extra'}
          </button>
        </div>
      </div>

      <DraggableWorkersBar />

      {/* Main Grid Area */}
      <div className="flex-1 flex overflow-hidden" onDragOver={handleDragOver}>
        <div className="w-[30%] min-w-[280px] max-w-[350px] shrink-0 border-r border-slate-300 bg-white z-10 shadow-sm flex flex-col">
          {/* Rows Container */}
          <div 
            className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative"
            ref={leftPaneRef}
          >
            {/* Match Right Pane's two headers (h-7 non-sticky, h-7 sticky) */}
            <div className="flex bg-slate-100 border-b border-slate-300 h-7 shrink-0 sticky top-0 z-40">
               {/* Empty top bar to match the groups header */}
            </div>
            <div className="grid h-7 bg-slate-50 border-b-2 border-slate-300 sticky top-7 z-30 shrink-0" style={{ gridTemplateColumns: '1fr 90px 70px' }}>
              <div className="px-3 font-bold text-[11px] uppercase text-[#002D5A] border-r border-slate-200 flex items-center">Proyecto / Tarea</div>
              <div className="px-3 font-bold text-[11px] uppercase text-[#002D5A] border-r border-slate-200 flex items-center justify-center">Fechas</div>
              <div className="px-3 font-bold text-[11px] uppercase text-[#002D5A] flex items-center justify-center">Progreso</div>
            </div>
            
            {visibleRows.map((row, index) => renderVisibleRow(row, index))}
            {visibleRows.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No hay proyectos que coincidan con los filtros.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Gantt Grid */}
        <div className="flex-1 overflow-hidden relative bg-[#f8fafc]">
          <GanttGrid 
            plan={globalPlan}
            visibleRows={visibleRows}
            plansMap={plansMap}
            expandedNodes={expandedNodes} 
            onUpdate={onUpdate}
            viewMode={viewMode}
            baseDate={baseDate}
            showBaseline={showBaseline}
            assignmentViewMode={assignmentViewMode}
            calendars={calendars}
            scrollRef={rightPaneRef}
            isAddingUnplanned={isAddingUnplanned}
            setIsAddingUnplanned={setIsAddingUnplanned}
            onTaskDoubleClick={handleTaskClick}
          />
        </div>
      </div>
      
      {isTaskBreakdownOpen && selectedTaskForBreakdown && (
        <TaskBreakdownModal
          task={selectedTaskForBreakdown}
          onClose={() => {
            setIsTaskBreakdownOpen(false);
            setSelectedTaskForBreakdown(null);
          }}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
