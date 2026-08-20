import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ProjectPlan, ProjectTask, projectPlanningService } from '../../../../services/project-planning.service';
import { CheckCircle2, AlertTriangle, HardHat, Tractor, Package, Plus } from 'lucide-react';
import { HolidayCalendar } from '../../../../services/holiday-calendars.service';
import { WorkerAssignmentModal } from './WorkerAssignmentModal';
import { ResourceAssignmentModal } from './ResourceAssignmentModal';
import { Project } from '../../../../services/types';

export type VisibleRow = {
  type: 'TASK';
  task: ProjectTask;
  level: number;
} | {
  type: 'UNPLANNED_HEADER';
  projectId?: string;
  isAddingUnplanned?: boolean;
  onAddUnplanned?: (date: Date) => void;
} | {
  type: 'GAP';
  height: string;
};

export interface GanttGridProps {
  plan: ProjectPlan;
  visibleRows?: VisibleRow[];
  project?: Project;
  expandedNodes: Set<string>;
  onUpdate: () => void;
  viewMode: 'days' | 'hours';
  baseDate: Date;
  calendars?: HolidayCalendar[];
  selectedCalendarId?: string;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  showBaseline?: boolean;
  assignmentViewMode?: 'MANO_OBRA' | 'MAQUINARIA' | 'MATERIALES';
  plansMap?: Map<string, ProjectPlan>;
  onTaskDoubleClick?: (task: ProjectTask) => void;
}

export function GanttGrid({ plan, project, expandedNodes, onUpdate, viewMode, baseDate, showBaseline, assignmentViewMode = 'MANO_OBRA', calendars, selectedCalendarId, scrollRef, onScroll, plansMap, visibleRows, onTaskDoubleClick }: GanttGridProps) {
  const [selectedTaskComponent, setSelectedTaskComponent] = useState<{taskId: string, component: any} | null>(null);

  // Update selected component when plan changes so modal gets fresh data
  useEffect(() => {
    if (selectedTaskComponent) {
      let foundTask: any = null;
      const searchTask = (tasks: any[]) => {
        for (const t of tasks) {
          if (t.id === selectedTaskComponent.taskId) {
            foundTask = t;
            return;
          }
          if (t.children) searchTask(t.children);
        }
      };
      if (plan.tasks) searchTask(plan.tasks);

      const comp = foundTask?.components?.find((c: any) => c.id === selectedTaskComponent.component.id);
      if (comp) {
        setSelectedTaskComponent({ taskId: foundTask.id, component: comp });
      } else {
        setSelectedTaskComponent(null);
      }
    }
  }, [plan]);

  // Scroll to the selected baseDate when it changes
  useEffect(() => {
    if (scrollRef && scrollRef.current) {
      // Small timeout ensures the DOM has updated the columns if month changed
      setTimeout(() => {
        if (!scrollRef.current) return;
        if (viewMode === 'days') {
          const offsetDays = baseDate.getDate() - 1;
          const cellWidth = 48; // cellWidth in 'days' mode
          scrollRef.current.scrollTo({ left: offsetDays * cellWidth, behavior: 'smooth' });
        } else {
          const offsetHours = baseDate.getHours();
          const cellWidth = 32; // cellWidth in 'hours' mode
          scrollRef.current.scrollTo({ left: offsetHours * cellWidth, behavior: 'smooth' });
        }
      }, 50);
    }
  }, [baseDate, viewMode, scrollRef]);

  const holidayDates = useMemo(() => {
    if (!selectedCalendarId || !calendars) return new Set<string>();
    const cal = calendars.find(c => c.id === selectedCalendarId);
    if (!cal) return new Set<string>();
    return new Set(cal.holidays.map(h => h.date.split('T')[0]));
  }, [selectedCalendarId, calendars]);

  const isHolidayOrWeekend = (d: Date) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().split('T')[0];
    
    if (project?.customNonWorkingDays?.includes(localISOTime)) return true;
    if (project?.customWorkingDays?.includes(localISOTime)) return false;
    
    const day = d.getDay();
    if (day === 0) return true; // Sunday
    if (day === 6 && !project?.workSaturdays) return true; // Saturday
    return holidayDates.has(localISOTime);
  };

  // Helper to calculate working minutes
  const calculateWorkingMinutes = (start: Date, end: Date): number => {
    let minutes = 0;
    const current = new Date(start);
    while (current < end) {
      if (isHolidayOrWeekend(current)) {
        current.setDate(current.getDate() + 1);
        current.setHours(8, 0, 0, 0);
        continue;
      }

      if (current.getHours() >= 8 && current.getHours() < 17) {
        const nextHour = new Date(current);
        nextHour.setHours(current.getHours() + 1, 0, 0, 0);
        const step = Math.min(end.getTime(), nextHour.getTime()) - current.getTime();
        minutes += step / 60000;
        current.setTime(nextHour.getTime());
      } else {
        if (current.getHours() < 8) {
          current.setHours(8, 0, 0, 0);
        } else {
          current.setDate(current.getDate() + 1);
          current.setHours(8, 0, 0, 0);
        }
      }
    }
    return Math.round(minutes);
  };

  // Helper to split a task into daily segments (avoiding night spans visually)
  const splitTaskIntoSegments = (start: Date, end: Date, mode: 'days' | 'hours') => {
    const segments = [];
    let current = new Date(start);
    
    // Safety check against infinite loops
    let safety = 0;
    while (current < end && safety < 1000) {
      safety++;
      
      const dayOfWeek = current.getDay();

      if (mode === 'hours') {
        // En modo 'hours', ajustamos a las 8 AM si comienza a medianoche o antes de las 8
        if (current.getHours() < 8) {
          current.setHours(8, 0, 0, 0);
        }

        // También saltamos si caemos en un día no laborable
        if (isHolidayOrWeekend(current)) {
          current.setDate(current.getDate() + 1);
          current.setHours(8, 0, 0, 0);
          continue;
        }

        const endOfDay = new Date(current);
        endOfDay.setHours(17, 0, 0, 0);
        
        if (end <= endOfDay) {
          segments.push({ start: new Date(current), end: new Date(end) });
          break;
        } else {
          segments.push({ start: new Date(current), end: new Date(endOfDay) });
          current = new Date(current);
          current.setDate(current.getDate() + 1);
          current.setHours(8, 0, 0, 0);
        }
      } else {
        if (isHolidayOrWeekend(current)) {
          current.setDate(current.getDate() + 1);
          current.setHours(8, 0, 0, 0);
          continue;
        }

        // Buscar el siguiente día no laborable o fin de semana
        const nextBreak = new Date(current);
        while (!isHolidayOrWeekend(nextBreak)) {
          nextBreak.setDate(nextBreak.getDate() + 1);
        }
        
        // Acercamos el final de este segmento continuo al final del día anterior
        const endOfSegment = new Date(nextBreak);
        endOfSegment.setDate(endOfSegment.getDate() - 1);
        endOfSegment.setHours(23, 59, 59, 999);
        
        if (end <= endOfSegment) {
          segments.push({ start: new Date(current), end: new Date(end) });
          break;
        } else {
          segments.push({ start: new Date(current), end: new Date(endOfSegment) });
          current = new Date(nextBreak);
          current.setHours(8, 0, 0, 0);
        }
      }
    }
    return segments;
  };

  // Configuración de la cuadrícula
  const cellWidth = viewMode === 'days' ? 48 : 32; // Ancho de cada día u hora en píxeles
  const gridBg = viewMode === 'days' 
    ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='64'%3E%3Cpath d='M48 0L0 0 0 64' fill='none' stroke='%23f1f5f9' stroke-width='1'/%3E%3C/svg%3E\")"
    : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='64'%3E%3Cpath d='M32 0L0 0 0 64' fill='none' stroke='%23f1f5f9' stroke-width='1'/%3E%3C/svg%3E\")";
  
  const headers = useMemo(() => {
    const startDate = new Date(baseDate);
    if (viewMode === 'days') {
      startDate.setDate(1); // Primer día del mes seleccionado
    }
    startDate.setHours(0, 0, 0, 0); // Medianoche
    
    const dates = [];
    const current = new Date(startDate);
    
    // Find the maximum end date among all tasks
    let maxEndDate = new Date(startDate);
    const checkMaxDate = (task: ProjectTask) => {
      if (task.endDate) {
        const d = new Date(task.endDate);
        if (d > maxEndDate) maxEndDate = d;
      }
      if (task.children) {
        task.children.forEach(checkMaxDate);
      }
    };
    plan.tasks?.forEach(checkMaxDate);

    let calculatedUnitCount = 0;
    if (viewMode === 'days') {
      maxEndDate.setDate(maxEndDate.getDate() + 60); // 60 days margin
      calculatedUnitCount = Math.ceil((maxEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      maxEndDate.setHours(maxEndDate.getHours() + (7 * 24)); // 7 days margin
      calculatedUnitCount = Math.ceil((maxEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    }
    
    const minUnitCount = viewMode === 'days' ? 365 : (14 * 24); // Mínimo 1 año en días, o 14 días en horas
    const unitCount = Math.max(minUnitCount, calculatedUnitCount);
    
    for (let i = 0; i < unitCount; i++) {
      dates.push(new Date(current));
      if (viewMode === 'days') {
        current.setDate(current.getDate() + 1);
      } else {
        current.setHours(current.getHours() + 1);
      }
    }

    // Agrupar
    const groups: { name: string; colspan: number }[] = [];
    if (viewMode === 'days') {
      let groupStartDate = dates[0];
      let currentCount = 0;
      dates.forEach(d => {
        if (d.getMonth() === groupStartDate.getMonth()) {
          currentCount++;
        } else {
          groups.push({ name: groupStartDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }), colspan: currentCount });
          groupStartDate = d;
          currentCount = 1;
        }
      });
      groups.push({ name: groupStartDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }), colspan: currentCount });
    } else {
      let groupStartDate = dates[0];
      let currentCount = 0;
      dates.forEach(d => {
        if (d.getDate() === groupStartDate.getDate() && d.getMonth() === groupStartDate.getMonth()) {
          currentCount++;
        } else {
          groups.push({ name: groupStartDate.toLocaleString('es-ES', { day: 'numeric', month: 'short' }), colspan: currentCount });
          groupStartDate = d;
          currentCount = 1;
        }
      });
      groups.push({ name: groupStartDate.toLocaleString('es-ES', { day: 'numeric', month: 'short' }), colspan: currentCount });
    }

    return { dates, groups };
  }, [viewMode, baseDate, plan]);

  // Aplanar las tareas que están visibles para pintar las filas correspondientes
  const computedRows = useMemo(() => {
    const list: VisibleRow[] = [];
    
    const flatten = (task: ProjectTask, level: number = 0) => {
      list.push({ type: 'TASK', task, level });
      if (expandedNodes.has(task.id) && task.children) {
        task.children.forEach(c => flatten(c, level + 1));
      }
    };
    
    plan.tasks?.forEach(c => flatten(c, 0));
    return list;
  }, [plan, expandedNodes]);

  const finalRows = visibleRows || computedRows;

  const visibleTasks = useMemo(() => {
    return finalRows.filter((r): r is Extract<VisibleRow, {type: 'TASK'}> => r.type === 'TASK').map(r => r.task);
  }, [finalRows]);

  const dragRef = useRef<{
    taskId: string;
    startX: number;
    initialLeft: number;
    initialWidth: number;
    currentLeft: number;
    currentWidth: number;
    mode: 'move' | 'resize' | null;
  } | null>(null);

  const [dragTick, setDragTick] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current?.mode) return;
      const deltaX = e.clientX - dragRef.current.startX;
      
      if (dragRef.current.mode === 'move') {
        const rawLeft = dragRef.current.initialLeft + deltaX;
        if (dragRef.current.currentLeft !== rawLeft) {
          dragRef.current.currentLeft = rawLeft;
          setDragTick(t => t + 1);
        }
      } else if (dragRef.current.mode === 'resize') {
        const rawWidth = Math.max(cellWidth / 2, dragRef.current.initialWidth + deltaX);
        if (dragRef.current.currentWidth !== rawWidth) {
          dragRef.current.currentWidth = rawWidth;
          setDragTick(t => t + 1);
        }
      }
    };

    const handleMouseUp = async () => {
      if (!dragRef.current?.mode) return;
      
      const { mode, currentLeft, currentWidth, taskId } = dragRef.current;
      dragRef.current.mode = mode === 'move' ? 'saving-move' as any : 'saving-resize' as any;
      setDragTick(t => t + 1);
      
      try {
        if (mode === 'move') {
          const task = visibleTasks.find(t => t.id === taskId);
          const diffUnits = Math.round(currentLeft / cellWidth);
          const newStartDate = new Date(headers.dates[0]);
          
          if (viewMode === 'days') {
            newStartDate.setDate(newStartDate.getDate() + diffUnits);
            // Preserve original task time
            if (task && task.startDate) {
              const originalStart = new Date(task.startDate);
              newStartDate.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
            }
          } else {
            newStartDate.setHours(newStartDate.getHours() + diffUnits);
          }
          
          // Validar hora laboral y días
          if (newStartDate.getHours() < 8) newStartDate.setHours(8, 0, 0, 0);
          if (newStartDate.getHours() >= 17) {
            newStartDate.setDate(newStartDate.getDate() + 1);
            newStartDate.setHours(8, 0, 0, 0);
          }
          
          // Validar fin de semana, festivo o día bloqueado
          while (isHolidayOrWeekend(newStartDate)) {
            newStartDate.setDate(newStartDate.getDate() + 1);
            // Preserve the time instead of resetting to 8am if it was specifically set
            if (viewMode !== 'days' || !task?.startDate) {
               newStartDate.setHours(8, 0, 0, 0);
            }
          }
          
          if (task && (task.type === 'ZONE' || task.type === 'SUBZONE')) {
            await projectPlanningService.shiftZoneDates(taskId, newStartDate);
          } else {
            await projectPlanningService.updateTask(taskId, { startDate: newStartDate.toISOString() });
          }
          await onUpdate();
        } else if (mode === 'resize') {
          const task = visibleTasks.find(t => t.id === taskId);
          if (!task || !task.startDate || !task.endDate) return;
          
          const start = new Date(task.startDate);
          const segments = splitTaskIntoSegments(start, new Date(task.endDate), viewMode);
          if (segments.length === 0) return;
          const lastSegment = segments[segments.length - 1];

          const diffUnits = Math.round(currentWidth / cellWidth);
          const newEndDate = new Date(lastSegment.start);
          if (viewMode === 'days') {
            newEndDate.setDate(newEndDate.getDate() + diffUnits);
          } else {
            newEndDate.setHours(newEndDate.getHours() + diffUnits);
          }
          
          const workingMins = calculateWorkingMinutes(start, newEndDate);
          
          if (viewMode === 'days') {
            const days = Math.max(0.5, Math.round((workingMins / 540) * 2) / 2);
            await projectPlanningService.updateTask(taskId, { durationDays: days, durationMinutes: null });
          } else {
            // Round to nearest 15 minutes instead of full hours
            const minutes = Math.max(15, Math.round(workingMins / 15) * 15);
            await projectPlanningService.updateTask(taskId, { durationMinutes: minutes, durationDays: null });
          }
          await onUpdate();
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (dragRef.current?.taskId === taskId) {
          dragRef.current.mode = null;
          setDragTick(t => t + 1);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cellWidth, headers, onUpdate, visibleTasks, viewMode]);

  const handleMouseDown = (e: React.MouseEvent, taskId: string, initialLeft: number, initialWidth: number) => {
    e.preventDefault();
    dragRef.current = {
      taskId,
      startX: e.clientX,
      initialLeft,
      initialWidth,
      currentLeft: initialLeft,
      currentWidth: initialWidth,
      mode: 'move'
    };
    setDragTick(t => t + 1);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, taskId: string, initialLeft: number, initialWidth: number) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar que dispare handleMouseDown
    dragRef.current = {
      taskId,
      startX: e.clientX,
      initialLeft,
      initialWidth,
      currentLeft: initialLeft,
      currentWidth: initialWidth,
      mode: 'resize'
    };
    setDragTick(t => t + 1);
  };

  return (
    <div 
      className="w-full h-full overflow-auto custom-scrollbar"
      ref={scrollRef}
      onScroll={onScroll}
    >
      <div className="min-w-max relative">
        {/* Cabecera (Grupos) */}
        <div className="flex border-b border-slate-300 bg-slate-100 h-7 shrink-0 sticky top-0 z-40">
          {headers.groups.map((g, i) => (
            <div key={i} 
                 className="p-1 text-center text-[10px] font-bold text-slate-500 uppercase border-r border-slate-300 shrink-0 truncate"
                 style={{ width: g.colspan * cellWidth, minWidth: g.colspan * cellWidth, maxWidth: g.colspan * cellWidth }}
            >
              {g.name}
            </div>
          ))}
        </div>
        
        {/* Cabecera (Unidades) */}
        <div className="flex border-b-2 border-slate-300 bg-slate-50 sticky top-7 z-30 h-7 shrink-0">
          {headers.dates.map((d, i) => {
            const isNonWorking = isHolidayOrWeekend(d);
            const label = viewMode === 'days' ? d.getDate() : d.getHours();
            const holidayTooltip = isHolidayOrWeekend(d) ? 'Festivo/Día Libre' : undefined;
            return (
              <div key={i} 
                   title={holidayTooltip}
                   className={`text-center text-[10px] font-medium border-r border-slate-200 flex items-center justify-center shrink-0 ${isNonWorking && viewMode === 'days' ? 'bg-slate-200/80 text-slate-400' : 'text-slate-600'}`}
                   style={{ width: cellWidth, minWidth: cellWidth, maxWidth: cellWidth }}
              >
                {label}{viewMode === 'hours' && <span className="text-[8px] text-slate-400 ml-0.5">h</span>}
              </div>
            );
          })}
        </div>

        {/* Filas del Gantt */}
        <div className="relative flex-1" style={{ backgroundImage: gridBg }}>
          {/* Columnas de días no laborables / bloqueados */}
          {headers.dates.map((d, i) => {
            const isNonWorking = isHolidayOrWeekend(d);
            if (isNonWorking && viewMode === 'days') {
              return (
                <div 
                  key={`bg-${i}`} 
                  className="absolute top-0 bottom-0 bg-slate-200/50 pointer-events-none z-0"
                  style={{ left: i * cellWidth, width: cellWidth }}
                />
              );
            }
            return null;
          })}

          {finalRows.map((row, index) => {
            if (row.type === 'GAP') {
              return <div key={`gap-${index}`} className={row.height} />;
            }
            if (row.type === 'UNPLANNED_HEADER') {
              return (
                <div key={`unplanned-header-${index}`} className="h-16 border-b border-transparent relative flex items-center bg-indigo-50/50">
                  {headers.dates.map((d, i) => {
                    if (viewMode === 'hours') return null;
                    return (
                      <div
                        key={`unplanned-click-${i}`}
                        className="absolute top-0 bottom-0 hover:bg-indigo-100/50 cursor-pointer border-r border-indigo-100/30 transition-colors group/cell z-10"
                        style={{ left: i * cellWidth, width: cellWidth }}
                        onDoubleClick={() => {
                          if (row.onAddUnplanned) {
                            row.onAddUnplanned(d);
                          }
                        }}
                      >
                         <div className="hidden group-hover/cell:flex items-center justify-center w-full h-full text-indigo-400">
                           <Plus size={16} />
                         </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            const task = row.task;
            // Calcular posición y ancho de la barra (Mock logic for now)
            // Asumimos que startDate y durationDays están bien formados si existen
            let left = -1;
            let width = 0;

            if (task.startDate && task.endDate) {
              const start = new Date(task.startDate);
              const end = new Date(task.endDate);
              const segments = splitTaskIntoSegments(start, end, viewMode);
              
              const baselineSegments = (showBaseline && task.baselineStartDate && task.baselineEndDate) 
                ? splitTaskIntoSegments(new Date(task.baselineStartDate), new Date(task.baselineEndDate), viewMode) 
                : [];
              
              const isMoving = dragRef.current?.taskId === task.id && (dragRef.current?.mode === 'move' || dragRef.current?.mode === 'saving-move');
              const isResizing = dragRef.current?.taskId === task.id && (dragRef.current?.mode === 'resize' || dragRef.current?.mode === 'saving-resize');

              const getSegmentGeometry = (seg: {start: Date, end: Date}) => {
                let diffUnits = 0;
                let durationUnits = 0;

                if (viewMode === 'days') {
                  const normStart = new Date(seg.start);
                  normStart.setHours(0, 0, 0, 0);
                  const fullDaysOffset = Math.round((normStart.getTime() - headers.dates[0].getTime()) / 86400000);
                  
                  let fractionalOffset = 0;
                  if (seg.start.getHours() >= 8 && seg.start.getHours() < 17) {
                    const minsSince8AM = (seg.start.getHours() - 8) * 60 + seg.start.getMinutes();
                    fractionalOffset = minsSince8AM / 540;
                  } else if (seg.start.getHours() >= 17) {
                    fractionalOffset = 1;
                  }
                  
                  diffUnits = fullDaysOffset + fractionalOffset;
                  
                  const wMinsDuration = calculateWorkingMinutes(seg.start, seg.end);
                  durationUnits = wMinsDuration === 0 ? 0.1 : wMinsDuration / 540;
                } else {
                  const diffTimeStart = seg.start.getTime() - headers.dates[0].getTime();
                  const diffTimeEnd = seg.end.getTime() - seg.start.getTime();
                  diffUnits = diffTimeStart / (1000 * 60 * 60);
                  durationUnits = diffTimeEnd / (1000 * 60 * 60);
                }
                
                return {
                  left: diffUnits >= 0 ? diffUnits * cellWidth : -1,
                  width: diffUnits >= 0 ? durationUnits * cellWidth : 0
                };
              };

              return (
                <div key={task.id} className="h-16 border-b border-transparent relative flex items-center group hover:bg-slate-50/50">
                  {/* Baseline Segments */}
                  {baselineSegments.map((seg, segIndex) => {
                    const geom = getSegmentGeometry(seg);
                    if (geom.left < 0 || geom.width <= 0) return null;
                    return (
                      <div 
                        key={`base-${segIndex}`}
                        className="absolute h-7 rounded z-0 opacity-40 mix-blend-multiply bg-slate-300 border-b-2 border-slate-400 pointer-events-none"
                        style={{ 
                          left: `${geom.left}px`, 
                          width: `${Math.max(4, geom.width)}px`,
                          top: '1.25rem'
                        }}
                      />
                    );
                  })}
                  
                  {/* Main Segments */}
                  {segments.map((seg, segIndex) => {
                    const geom = getSegmentGeometry(seg);
                    const left = geom.left;
                    const width = geom.width;
                    
                    const isFirst = segIndex === 0;
                    const isLast = segIndex === segments.length - 1;

                    // Si movemos la tarea, todos los segmentos se desplazan en la misma proporción
                    const deltaLeft = isMoving ? (dragRef.current!.currentLeft - dragRef.current!.initialLeft) : 0;
                    const currentLeft = left + deltaLeft;

                    // Si redimensionamos, SOLO el último segmento cambia su ancho
                    const deltaWidth = isResizing ? (dragRef.current!.currentWidth - dragRef.current!.initialWidth) : 0;
                    const currentWidth = (isLast && isResizing) ? (width + deltaWidth) : width;

                    if (currentLeft < 0 || currentWidth <= 0) return null;

                    return (
                      <React.Fragment key={segIndex}>
                        <div 
                          onMouseDown={(e) => isFirst ? handleMouseDown(e, task.id, left, width) : undefined}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (onTaskDoubleClick) onTaskDoubleClick(task);
                          }}
                          className={`absolute h-7 rounded shadow-sm z-10 flex items-center overflow-hidden ${isMoving || (isResizing && isLast) ? 'opacity-80 ring-2 ring-blue-500 scale-[1.02]' : 'transition-all hover:brightness-110'}`}
                          style={{ 
                            left: `${currentLeft}px`, 
                            width: `${Math.max(4, currentWidth)}px`,
                            backgroundColor: task.isUnplanned ? '#f97316' : task.type === 'PROJECT' ? '#e11d48' : (task.type === 'PHASE' || task.type === 'ZONE') ? '#002D5A' : task.type === 'SUBZONE' ? '#0ea5e9' : '#38bdf8',
                            cursor: isMoving ? 'grabbing' : (isFirst ? 'grab' : 'default')
                          }}
                        >
                          {isFirst && task.progress > 0 && (
                            <div 
                              className="absolute top-0 left-0 h-full rounded-md bg-white/30"
                              style={{ width: `${task.progress}%` }}
                            />
                          )}
                          
                          

                          {isLast && (
                            <div
                              className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/30 z-30 rounded-r-md"
                              onMouseDown={(e) => handleResizeMouseDown(e, task.id, left, width)}
                            />
                          )}
                        </div>
                          
                        {/* Component pop-up tags - Moved OUTSIDE overflow-hidden div */}
                        {isFirst && task.components && task.components.length > 0 && (
                          <div 
                            className="absolute flex gap-1 pointer-events-auto whitespace-nowrap z-20"
                            style={{
                              left: `${currentLeft}px`,
                              top: '2.25rem' // h-7 (1.75rem) + some gap
                            }}
                          >
                            {task.components
                              .filter(c => {
                                if (assignmentViewMode === 'MANO_OBRA') {
                                  return c.resourceType === 'MANO_OBRA' || c.resourceType === 'MANO_DE_OBRA';
                                } else if (assignmentViewMode === 'MAQUINARIA') {
                                  return c.resourceType === 'MAQUINARIA' || c.resourceType === 'EQUIPO';
                                } else {
                                  return c.resourceType === 'MATERIALES' || c.resourceType === 'MATERIAL' || c.resourceType === 'RECURSO';
                                }
                              })
                              .map(c => {
                                const assignedCount = c.plannedWorkers?.length || 0;
                                const isFulfilled = c.quantity > 0 && assignedCount >= c.quantity;
                                
                                // Comparison logic (mostly for mano de obra, but can be kept)
                                const executedWorkers = c.dailyLogTaskWorkers || [];
                                const executedCount = executedWorkers.length;
                                
                                let executionStatus = 'none'; // 'none', 'match', 'mismatch', 'partial'
                                let executedQuantity = 0;

                                if (assignmentViewMode === 'MANO_OBRA') {
                                    const plannedIds = new Set(c.plannedWorkers?.map((pw: any) => pw.userId) || []);
                                    const executedWorkers = c.dailyLogTaskWorkers || [];
                                    const anyPlannedExecuted = executedWorkers.some((ew: any) => plannedIds.has(ew.dailyLogWorker?.userId));
                                    executionStatus = anyPlannedExecuted ? 'match' : 'mismatch';
                                  } else if (assignmentViewMode) {
                                    const actualPlan = plansMap ? (plansMap.get(task.planId) || plan) : plan;
                                    const requests = [...(task.inventoryRequests || [])];
                                    if (actualPlan?.project?.inventoryRequests) {
                                      for (const req of actualPlan.project.inventoryRequests) {
                                      if (!req.projectTaskId || req.projectTaskId === task.id) {
                                        let isDateMatch = true;
                                        if (!req.projectTaskId && task.startDate) {
                                          const reqDate = new Date(req.dateReviewed || req.dateRequested);
                                          const tStart = new Date(task.startDate);
                                          tStart.setDate(tStart.getDate() - 2); 
                                          const tEnd = task.endDate ? new Date(task.endDate) : new Date(task.startDate);
                                          tEnd.setDate(tEnd.getDate() + 2); 
                                          
                                          if (reqDate < tStart || reqDate > tEnd) {
                                            isDateMatch = false;
                                          }
                                        }

                                        if (isDateMatch && !requests.some(r => r.id === req.id)) {
                                          requests.push(req);
                                        }
                                      }
                                    }
                                  }
                                  for (const req of requests) {
                                    if (req.status === 'APPROVED' || req.status === 'approved') {
                                      const items = req.items || [];
                                      for (const reqItem of items) {
                                        if (reqItem.item?.resourceId === c.resourceId) {
                                          executedQuantity += reqItem.qtyApproved || reqItem.quantity;
                                        }
                                      }
                                    }
                                  }

                                  if (executedQuantity === 0) {
                                    executionStatus = 'none';
                                  } else if (executedQuantity >= c.quantity) {
                                    executionStatus = 'match';
                                  } else {
                                    executionStatus = 'partial';
                                  }
                                }

                                let containerClasses = `flex items-center gap-1 border shadow-sm rounded px-1.5 py-0.5 text-[9px] cursor-pointer transition-colors `;
                                
                                if (assignmentViewMode === 'MANO_OBRA') {
                                  if (executionStatus === 'mismatch') {
                                    containerClasses += `bg-orange-50 border-orange-400 text-orange-700`;
                                  } else if (executionStatus === 'match') {
                                    containerClasses += `bg-emerald-100 border-emerald-500 text-emerald-800`;
                                  } else {
                                    containerClasses += isFulfilled ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                                      assignedCount > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300';
                                  }
                                } else if (assignmentViewMode === 'MAQUINARIA') {
                                  if (executionStatus === 'match') {
                                    containerClasses += `bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100`;
                                  } else if (executionStatus === 'partial') {
                                    containerClasses += `bg-orange-50 border-orange-400 text-orange-800 hover:bg-orange-100`;
                                  } else {
                                    containerClasses += `bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100`;
                                  }
                                } else {
                                  if (executionStatus === 'match') {
                                    containerClasses += `bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100`;
                                  } else if (executionStatus === 'partial') {
                                    containerClasses += `bg-orange-50 border-orange-400 text-orange-800 hover:bg-orange-100`;
                                  } else {
                                    containerClasses += `bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100`;
                                  }
                                }

                                return (
                                  <div 
                                    key={c.id} 
                                    onClick={(e) => { e.stopPropagation(); setSelectedTaskComponent({ taskId: task.id, component: c }); }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                    }}
                                    onDrop={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const data = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
                                      if (!data) return;
                                      const payload = JSON.parse(data);
                                      if (payload.type === 'worker') {
                                        try {
                                          await projectPlanningService.assignWorkerToComponent(task.id, c.id, {
                                            userId: payload.userId,
                                            contractorWorkerId: payload.contractorWorkerId
                                          });
                                          onUpdate();
                                        } catch (err: any) {
                                          if (err.response?.status === 409 && err.response?.data?.clash) {
                                            if (window.confirm(`El operario ya está asignado a otras tareas en estas fechas:\n\n${err.response.data.clashes.join('\\n')}\n\n¿Desea asignarlo de todos modos?`)) {
                                              await projectPlanningService.assignWorkerToComponent(task.id, c.id, {
                                                userId: payload.userId,
                                                contractorWorkerId: payload.contractorWorkerId,
                                                force: true
                                              });
                                              onUpdate();
                                            }
                                          } else {
                                            console.error(err);
                                            alert('Error al asignar operario');
                                          }
                                        }
                                      }
                                    }}
                                    className={containerClasses}
                                    title={`Ver asignaciones de ${c.concept}`}
                                  >
                                    {assignmentViewMode === 'MANO_OBRA' && <HardHat size={10} />}
                                    {assignmentViewMode === 'MAQUINARIA' && <Tractor size={10} />}
                                    {assignmentViewMode === 'MATERIALES' && <Package size={10} />}
                                    
                                    {executionStatus === 'match' && <CheckCircle2 size={12} className="text-emerald-600" />}
                                    {(executionStatus === 'mismatch' || executionStatus === 'partial') && <AlertTriangle size={12} className="text-orange-600" />}
                                    
                                    <span className={executionStatus !== 'none' ? 'font-bold' : 'font-semibold'}>
                                      {c.concept}
                                    </span>
                                    
                                    {assignmentViewMode === 'MANO_OBRA' && (
                                      <span className="opacity-80 flex items-center">
                                        {(() => {
                                          let names = '';
                                          if (executedCount > 0) {
                                            names = executedWorkers.map((ew: any) => ew.dailyLogWorker?.user?.name || ew.dailyLogWorker?.externalName || 'Ext').join(', ');
                                          } else if (c.plannedWorkers && c.plannedWorkers.length > 0) {
                                            names = c.plannedWorkers.map((pw: any) => pw.user?.name || 'Usr').join(', ');
                                          }
                                          if (names) {
                                            return <span className="ml-1 italic truncate max-w-[120px]" title={names}>- {names}</span>;
                                          }
                                          return <span>({assignedCount}{c.quantity > 0 ? `/${c.quantity}` : ''})</span>;
                                        })()}
                                      </span>
                                    )}
                                    {assignmentViewMode !== 'MANO_OBRA' && (
                                      <span className="opacity-80 ml-0.5">
                                        ({executedQuantity > 0 ? `${executedQuantity}/` : ''}{c.quantity})
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }
            return <div key={task.id} className="h-16 border-b border-transparent relative flex items-center group hover:bg-slate-50/50" />;
          })}
        </div>
      </div>

      {selectedTaskComponent?.component?.resourceType === 'MANO_OBRA' ? (
        <WorkerAssignmentModal 
          isOpen={!!selectedTaskComponent}
          onClose={() => setSelectedTaskComponent(null)}
          taskId={selectedTaskComponent?.taskId || ''}
          component={selectedTaskComponent?.component || null}
          task={visibleTasks.find(t => t.id === selectedTaskComponent?.taskId) || null}
          plan={plansMap ? (plansMap.get(visibleTasks.find(t => t.id === selectedTaskComponent?.taskId)?.planId || '') || plan) : plan}
          onUpdate={() => {
            onUpdate();
          }}
        />
      ) : (
        <ResourceAssignmentModal 
          isOpen={!!selectedTaskComponent}
          onClose={() => setSelectedTaskComponent(null)}
          taskId={selectedTaskComponent?.taskId || ''}
          component={selectedTaskComponent?.component || null}
          task={visibleTasks.find(t => t.id === selectedTaskComponent?.taskId) || null}
          plan={plansMap ? (plansMap.get(visibleTasks.find(t => t.id === selectedTaskComponent?.taskId)?.planId || '') || plan) : plan}
          onUpdate={() => {
            onUpdate();
          }}
        />
      )}
    </div>
  );
}
