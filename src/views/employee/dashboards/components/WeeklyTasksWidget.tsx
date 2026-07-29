import React, { useState, useEffect } from 'react';
import { myDayService } from '../../../../services/my-day.service';
import { CalendarDays, MapPin, Briefcase } from 'lucide-react';

interface WeeklyTasksWidgetProps {
  selectedWorkerId?: string;
  isContractor?: boolean;
}

export function WeeklyTasksWidget({ selectedWorkerId, isContractor }: WeeklyTasksWidgetProps) {
  const [weeklyTasks, setWeeklyTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const today = new Date();
  // Adjust so Monday is 0, Sunday is 6
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  useEffect(() => {
    if (isContractor && !selectedWorkerId) return;
    
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const tasks = await myDayService.getWeeklyTasks();
        setWeeklyTasks(tasks);
      } catch (error) {
        console.error("Error fetching weekly tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [selectedWorkerId, isContractor]);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Calculate the dates for the current week (Monday to Sunday)
  const getDatesForWeek = () => {
    const dates = [];
    const curr = new Date(today);
    // Go back to Monday
    curr.setDate(curr.getDate() - currentDayIndex);
    
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const weekDates = getDatesForWeek();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
          <CalendarDays className="text-[#002D5A]" size={22} />
          Tu Planificación Semanal
        </h3>
      </div>
      
      {/* Content - All Days Columns */}
      <div className="p-4 overflow-x-auto hide-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-12 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500 mr-3"></div>
            Cargando planificación semanal...
          </div>
        ) : (
          <div className="flex gap-4 pb-2" style={{ minWidth: 'min-content' }}>
            {daysOfWeek.map((day, index) => {
              const dateStr = weekDates[index].toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
              const isToday = index === currentDayIndex;
              const activeDate = weekDates[index];
              
              const tasksForThisDay = weeklyTasks.filter(task => {
                const start = new Date(task.startDate);
                const end = new Date(task.endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                
                const targetDate = new Date(activeDate);
                targetDate.setHours(12, 0, 0, 0);
                
                return targetDate >= start && targetDate <= end;
              });

              // Solo mostrar sábado (5) y domingo (6) si es el día actual o si tienen tareas asignadas
              if (index >= 5 && !isToday && tasksForThisDay.length === 0) {
                return null;
              }

              return (
                <div 
                  key={day} 
                  className={`flex flex-col w-[280px] shrink-0 rounded-xl border ${
                    isToday ? 'bg-blue-50/30 border-blue-200 shadow-sm' : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  {/* Column Header */}
                  <div className={`p-3 text-center border-b ${isToday ? 'border-blue-200 bg-white' : 'border-slate-200 bg-white/50'} rounded-t-xl relative`}>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{day}</div>
                    <div className={`text-sm ${isToday ? 'text-blue-600 font-bold' : 'text-slate-700 font-medium'}`}>{dateStr}</div>
                    {isToday && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>

                  {/* Column Content */}
                  <div className="p-3 flex flex-col gap-3 min-h-[120px]">
                    {tasksForThisDay.length > 0 ? (
                      tasksForThisDay.map((task) => (
                        <div key={task.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-white shadow-sm flex flex-col group cursor-default">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              task.isUnplanned 
                                ? 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-600/20' 
                                : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                            }`}>
                              {task.isUnplanned ? 'Extra' : 'Planificada'}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors leading-tight">{task.name}</h4>
                          <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
                          
                          <div className="mt-auto space-y-1.5 pt-3 border-t border-slate-100">
                            <div className="flex items-start gap-1.5 text-xs text-slate-600">
                              <Briefcase size={14} className="mt-0.5 text-slate-400 shrink-0" />
                              <span className="font-medium line-clamp-1">{task.plan?.project?.name || 'Proyecto desconocido'}</span>
                            </div>
                            
                            {(task.plan?.project?.address || task.plan?.project?.city) && (
                              <div className="flex items-start gap-1.5 text-xs text-slate-500">
                                <MapPin size={14} className="mt-0.5 text-slate-400 shrink-0" />
                                <span className="line-clamp-1">
                                  {[task.plan?.project?.address, task.plan?.project?.city].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-lg bg-white/50 text-slate-400">
                        <span className="text-xs">Sin tareas</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
