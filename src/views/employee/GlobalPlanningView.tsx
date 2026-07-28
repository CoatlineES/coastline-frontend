import React, { useEffect, useState } from 'react';
import { ProjectPlan, projectPlanningService } from '../../services/project-planning.service';
import { holidayCalendarsService, HolidayCalendar } from '../../services/holiday-calendars.service';
import { businessLinesService, BusinessLine } from '../../services/business-lines.service';
import { GanttTimeline } from './projects/tabs/GanttTimeline';
import { GlobalGanttTimeline } from './projects/tabs/GlobalGanttTimeline';
import { Calendar, Briefcase, Clock, CheckCircle, DollarSign, TrendingUp, AlertTriangle, ChevronDown, Filter, LayoutList, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PartesDiariosView } from './projects/tabs/PartesDiariosView';
import { EstanqueidadView } from './projects/tabs/EstanqueidadView';
import { ResumenView } from './projects/tabs/ResumenView';
import { CostesView } from './projects/tabs/CostesView';
import { OperariosView } from './projects/tabs/OperariosView';
import { ProduccionView } from './projects/tabs/ProduccionView';
import { FotosView } from './projects/tabs/FotosView';


export default function GlobalPlanningView() {
  const [plans, setPlans] = useState<ProjectPlan[]>([]);
  const [calendars, setCalendars] = useState<HolidayCalendar[]>([]);
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [activeTabs, setActiveTabs] = useState<{[planId: string]: string}>({});
  const [showAnalytics, setShowAnalytics] = useState(true);
  const subTabs = ['Gantt', 'Estanqueidad', 'Resumen', '$ Costes', 'Operarios', 'Producción', 'Fotos', 'Parte diario'];

  const [filterOrigin, setFilterOrigin] = useState<string>('');
  const [filterBusinessLine, setFilterBusinessLine] = useState<string>('');
  const [globalViewMode, setGlobalViewMode] = useState<'LIST' | 'GLOBAL_CALENDAR'>('LIST');

  const getActiveSubTab = (planId: string) => activeTabs[planId] || 'Gantt';


  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (showLoadingScreen = true) => {
    try {
      if (showLoadingScreen) setLoading(true);
      const [allPlans, allCals, allBusinessLines] = await Promise.all([
        projectPlanningService.getAllActivePlanTrees(),
        holidayCalendarsService.getAll(),
        businessLinesService.getAll()
      ]);
      setPlans(allPlans);
      console.log('LOADED PLANS:', allPlans.length, allPlans.map((p: any) => p.project?.name));
      setCalendars(allCals);
      setBusinessLines(allBusinessLines);
    } catch (error) {
      console.error('Error loading global plans', error);
    } finally {
      if (showLoadingScreen) setLoading(false);
    }
  };

  const handleUpdate = () => {
    loadData(false);
  };

  const filteredPlans = plans.filter(plan => {
    const origin = plan.project?.projectOrigin?.toUpperCase();
    if (filterOrigin === 'DEMO' && origin !== 'DEMO') return false;
    if (filterOrigin === 'FULL' && origin === 'DEMO') return false;
    if (filterBusinessLine && plan.project?.businessLineId !== filterBusinessLine) return false;
    return true;
  });

  // Analytics Calculations
  const totalProjects = filteredPlans.length;
  const totalTasks = filteredPlans.reduce((acc, plan) => {
    const countTasks = (tasks: any[]): number => {
      let count = 0;
      tasks.forEach(t => {
        if (t.type === 'TASK') count++;
        if (t.children) count += countTasks(t.children);
      });
      return count;
    };
    return acc + (plan.tasks ? countTasks(plan.tasks) : 0);
  }, 0);

  const completedTasks = filteredPlans.reduce((acc, plan) => {
    const countCompleted = (tasks: any[]): number => {
      let count = 0;
      tasks.forEach(t => {
        if (t.type === 'TASK' && t.progress >= 100) count++;
        if (t.children) count += countCompleted(t.children);
      });
      return count;
    };
    return acc + (plan.tasks ? countCompleted(plan.tasks) : 0);
  }, 0);

  const totalWorkersScheduled = filteredPlans.reduce((acc, plan) => {
    let workers = 0;
    const countWorkers = (tasks: any[]) => {
      tasks.forEach(t => {
        if (t.components) {
          t.components.forEach((c: any) => {
            if (c.plannedWorkers) workers += c.plannedWorkers.length;
          });
        }
        if (t.children) countWorkers(t.children);
      });
    };
    if (plan.tasks) countWorkers(plan.tasks);
    return acc + workers;
  }, 0);

  // Financial and Delay Calculations
  const operariosActivosHoy = Math.floor(totalWorkersScheduled * 0.3); // Mock

  // Pagination Logic
  const totalPages = Math.ceil(totalProjects / itemsPerPage);
  const paginatedPlans = filteredPlans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-slate-50 p-6">
        <div className="flex items-center justify-center h-full">
          <p className="mt-4 text-slate-500 font-medium">Cargando planificación global...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Header Toggle */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Calendar className="text-primary" size={28} />
            Planificación Global
          </h1>
          <p className="text-sm text-slate-500 mt-1">Vista global de planificación y asignación en todos los proyectos activos</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setGlobalViewMode('LIST')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${globalViewMode === 'LIST' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <LayoutList size={16} /> Por Proyectos
            </button>
            <button 
              onClick={() => setGlobalViewMode('GLOBAL_CALENDAR')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${globalViewMode === 'GLOBAL_CALENDAR' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <CalendarDays size={16} /> Calendario Global
            </button>
          </div>

          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm"
          >
            {showAnalytics ? 'Ocultar Panel de Control' : 'Mostrar Panel de Control'}
            <ChevronDown className={`transition-transform ${showAnalytics ? 'rotate-180' : ''}`} size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm mr-2">
          <Filter size={18} /> Filtros:
        </div>
        
        <select
          value={filterOrigin}
          onChange={(e) => setFilterOrigin(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todos</option>
          <option value="DEMO">Demos</option>
          <option value="FULL">Proyectos Completos</option>
        </select>

        <select
          value={filterBusinessLine}
          onChange={(e) => setFilterBusinessLine(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todas las Líneas de Negocio</option>
          {businessLines.map(bl => (
            <option key={bl.id} value={bl.id}>{bl.name}</option>
          ))}
        </select>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="bg-white border-b border-slate-200 p-6 flex-shrink-0 shadow-inner">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600">
                  <Briefcase size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Proyectos Activos</p>
                  <p className="text-2xl font-bold text-slate-800">{totalProjects}</p>
                </div>
              </div>
              
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100/50 flex items-center justify-center text-indigo-600">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Total Tareas</p>
                  <p className="text-2xl font-bold text-slate-800">{totalTasks}</p>
                </div>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-600">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Completadas</p>
                  <p className="text-2xl font-bold text-slate-800">{completedTasks}</p>
                </div>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100/50 flex items-center justify-center text-amber-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Asignaciones</p>
                  <p className="text-2xl font-bold text-slate-800">{totalWorkersScheduled}</p>
                </div>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100/50 flex items-center justify-center text-teal-600">
                  <Briefcase size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Operarios Hoy</p>
                  <p className="text-2xl font-bold text-slate-800">{operariosActivosHoy}</p>
                </div>
              </div>
            </div>



          </div>
        </div>
      )}

      {globalViewMode === 'GLOBAL_CALENDAR' ? (
        <div className="p-6">
          <div className="rounded-2xl shadow-sm border border-slate-200 overflow-hidden bg-white flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
            <GlobalGanttTimeline 
              plans={filteredPlans}
              calendars={calendars}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {paginatedPlans.map(plan => {
            const activeSubTab = getActiveSubTab(plan.id);
            return (
              <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col" style={{ minHeight: '600px' }}>
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/app/empleado/proyectos/${plan.projectId}?tab=Planificaci%C3%B3n`)}>
                      {plan.project?.name || 'Proyecto Desconocido'}
                    </h3>
                    <p className="text-sm text-slate-500">Plan V{plan.version} • {plan.project?.address || 'Sin dirección'}</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/app/empleado/proyectos/${plan.projectId}?tab=Planificaci%C3%B3n`)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Ir al Proyecto
                  </button>
                </div>

                {/* TABS */}
                <div className="flex border-b border-slate-200 px-4 bg-white shrink-0">
                  {subTabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTabs(prev => ({ ...prev, [plan.id]: tab }))}
                      className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                        activeSubTab === tab 
                          ? 'border-[#002D5A] text-[#002D5A]' 
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-hidden relative" style={{ isolation: 'isolate' }}>
                  {activeSubTab === 'Gantt' && (
                    <GanttTimeline 
                      plan={plan} 
                      onUpdate={handleUpdate} 
                      calendars={calendars}
                      selectedCalendarId={plan.project?.holidayCalendarId || undefined}
                    />
                  )}
                  {activeSubTab === 'Fotos' && plan.project && (
                    <FotosView project={plan.project as any} />
                  )}
                  {activeSubTab === 'Estanqueidad' && plan.project && (
                    <EstanqueidadView project={plan.project as any} />
                  )}
                  {activeSubTab === 'Resumen' && plan.project && (
                    <ResumenView project={plan.project as any} />
                  )}
                  {activeSubTab === '$ Costes' && (
                    <CostesView plan={plan} />
                  )}
                  {activeSubTab === 'Operarios' && plan.project && (
                    <OperariosView project={plan.project as any} />
                  )}
                  {activeSubTab === 'Producción' && plan.project && (
                    <ProduccionView project={plan.project as any} />
                  )}
                  {activeSubTab === 'Parte diario' && plan.project && (
                    <PartesDiariosView project={plan.project as any} />
                  )}
                </div>
              </div>
            );
          })}

          {plans.length === 0 && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-slate-700">No hay planes activos</h3>
              <p className="text-slate-500 mt-2">Crea un plan en un proyecto para verlo aquí.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pb-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
