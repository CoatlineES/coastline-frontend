import React, { useState, useEffect } from 'react';
import { Project } from '../../../../services/types';
import { projectPlanningService, ProjectPlan, ProjectTask } from '../../../../services/project-planning.service';
import { holidayCalendarsService, HolidayCalendar } from '../../../../services/holiday-calendars.service';
import { projectsService } from '../../../../services/projects.service';
import { Settings, RefreshCw, FileText, Download, ChevronRight, ChevronDown, Plus, FileSpreadsheet, Trash2, Pencil, Calendar, MapPin } from 'lucide-react';
import { GanttTimeline } from './GanttTimeline';
import { QuotationPickerModal } from './QuotationPickerModal';
import { PlanDeObraPdfModal } from './PlanDeObraPdfModal';
import { PartesDiariosView } from './PartesDiariosView';
import { ResumenView } from './ResumenView';
import { CostesView } from './CostesView';
import { OperariosView } from './OperariosView';
import { ProduccionView } from './ProduccionView';
import { FotosView } from './FotosView';
import { CalendarSettingsModal } from './CalendarSettingsModal';

interface ProjectPlanningTabProps {
  project: Project;
  onUpdateProject?: () => void;
}

export function ProjectPlanningTab({ project, onUpdateProject }: ProjectPlanningTabProps) {
  console.log('ProjectPlanningTab rendered with customWorkingDays:', project.customWorkingDays, 'customNonWorkingDays:', project.customNonWorkingDays);
  const [plans, setPlans] = useState<ProjectPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string>('');
  const [activePlan, setActivePlan] = useState<ProjectPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'cliente' | 'interno'>('cliente');
  const [activeSubTab, setActiveSubTab] = useState('Gantt');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendars, setCalendars] = useState<HolidayCalendar[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>(project.holidayCalendarId || '');

  const subTabs = ['Gantt', 'Resumen', '$ Costes', 'Operarios', 'Producción', 'Fotos', 'Parte diario'];

  useEffect(() => {
    loadPlans();
    loadCalendars();
  }, [project.id]);

  const loadCalendars = async () => {
    try {
      const cals = await holidayCalendarsService.getAll();
      setCalendars(cals);
    } catch (e) {
      console.error('Error loading calendars', e);
    }
  };

  const handleSaveCalendarSettings = async (data: Partial<Project>) => {
    try {
      setLoading(true);
      await projectsService.update(project.id, data);
      setIsCalendarModalOpen(false);
      
      // Recalculate all plans for this project so task dates reflect the new calendar
      if (plans && plans.length > 0) {
        for (const p of plans) {
          await projectPlanningService.recalculatePlan(p.id);
        }
        // Reload active plan tree to reflect new dates
        if (activePlanId) {
          await loadPlanTree(activePlanId);
        }
      }

      if (onUpdateProject) {
        onUpdateProject();
      }
    } catch (err: any) {
      alert('Error al actualizar opciones de calendario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    setLoading(true);
    try {
      const fetchedPlans = await projectPlanningService.getPlansByProjectId(project.id);
      setPlans(fetchedPlans);
      if (fetchedPlans.length > 0) {
        const active = fetchedPlans.find(p => p.isActive) || fetchedPlans[0];
        setActivePlanId(active.id);
        loadPlanTree(active.id);
      } else {
        setActivePlanId('');
        setActivePlan(null);
      }
    } catch (error) {
      console.error('Error loading plans', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta planificación?')) return;
    setLoading(true);
    try {
      await projectPlanningService.deletePlan(planId);
      await loadPlans();
    } catch (error: any) {
      alert('Error al eliminar: ' + error.message);
      setLoading(false);
    }
  };

  const loadPlanTree = async (planId: string) => {
    try {
      const planTree = await projectPlanningService.getPlanTree(planId);
      setActivePlan(planTree);
    } catch (error) {
      console.error('Error loading plan tree', error);
    }
  };

  const handleCreatePlan = async () => {
    const defaultName = `v${plans.length + 1} - Nuevo Plan`;
    const version = prompt('Nombre de la nueva planificación:', defaultName);
    if (!version) return;
    
    setLoading(true);
    try {
      const newPlan = await projectPlanningService.createPlan(project.id, version);
      await loadPlans();
      setActivePlanId(newPlan.id);
      loadPlanTree(newPlan.id);
    } catch (e: any) {
      alert('Error al crear: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlanName = async (plan: ProjectPlan) => {
    const version = prompt('Nuevo nombre para esta planificación:', plan.version);
    if (!version || version === plan.version) return;
    
    setLoading(true);
    try {
      await projectPlanningService.updatePlan(plan.id, version);
      await loadPlans();
    } catch (e: any) {
      alert('Error al actualizar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBaseQuotation = async () => {
    if (!activePlanId || !activePlan) return;
    if (confirm('¿Generar cotización base a partir de este plan?')) {
      try {
        const quote = await projectPlanningService.generateQuotationFromPlan(
          activePlanId, 
          project.accountId || '', 
          project.dealId || ''
        );
        alert(`Cotización ${quote.number} generada con éxito.`);
      } catch (error: any) {
        alert('Error: ' + error.message);
      }
    }
  };

  const [isQuotationPickerOpen, setIsQuotationPickerOpen] = useState(false);

  const handleImportFromQuotation = async (qId: string) => {
    setIsQuotationPickerOpen(false);
    setLoading(true);
    try {
      const newPlan = await projectPlanningService.generateFromQuotation(project.id, qId);
      await loadPlans();
      setActivePlanId(newPlan.id);
      loadPlanTree(newPlan.id);
    } catch (error: any) {
      alert('Error al importar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-6 flex flex-col h-[800px] overflow-hidden">
      {/* HEADER CONTROLS */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
        
        {/* Fila 1: Selector de planes (Pills) y Acciones Generales */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-500 font-semibold mr-2 shrink-0">Planes de Trabajo:</span>
            {plans.map(p => (
              <div 
                key={p.id} 
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer border ${activePlanId === p.id ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`} 
                onClick={() => { setActivePlanId(p.id); loadPlanTree(p.id); }}
              >
                <span>{p.version}</span>
                {p.isActive && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full ml-1">Activo</span>}
                {activePlanId === p.id && (
                  <div className="flex items-center ml-1">
                    <button onClick={(e) => { e.stopPropagation(); handleEditPlanName(p); }} className="p-0.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="Editar Nombre">
                      <Pencil size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeletePlan(p.id); }} className="p-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar Plan">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button onClick={handleCreatePlan} className="bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-md px-3 py-1.5 text-sm font-medium flex items-center gap-1 transition-colors shrink-0">
              <Plus size={14} />
              Nuevo
            </button>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex bg-white rounded-md border border-slate-300 shadow-sm overflow-hidden">
              <button 
                onClick={() => { setReportType('cliente'); setIsPdfModalOpen(true); }}
                className="px-3 py-1.5 text-sm font-medium flex items-center gap-2 text-slate-700 hover:bg-slate-50 border-r border-slate-200 transition-colors"
                title="Generar reporte completo para el cliente"
              >
                <Download size={16} className="text-[#002D5A]" />
                PDF Cliente
              </button>
              <button 
                onClick={() => { setReportType('interno'); setIsPdfModalOpen(true); }}
                className="px-3 py-1.5 text-sm font-medium flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
                title="Generar reporte detallado para uso interno"
              >
                <Download size={16} className="text-slate-500" />
                PDF Interno
              </button>
            </div>
            <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-md border border-slate-300 bg-white">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Fila 2: Acciones del plan activo */}
        {activePlanId && (
          <div className="flex items-center gap-2 border-t border-slate-200 pt-4 mt-1">
            <button onClick={handleGenerateBaseQuotation} className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-md px-3 py-1.5 text-sm font-medium flex items-center gap-2 transition-colors">
              <FileSpreadsheet size={16} />
              Generar Cotización Base
            </button>
            <button onClick={() => setIsQuotationPickerOpen(true)} className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-md px-3 py-1.5 text-sm font-medium flex items-center gap-2 transition-colors">
              <RefreshCw size={16} />
              Generar Plan desde Cotización
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button 
                onClick={() => setIsCalendarModalOpen(true)}
                className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-md px-3 py-1.5 text-sm font-medium flex items-center gap-2 transition-colors"
                title="Configurar calendario y días laborables"
              >
                <Calendar size={16} className="text-slate-500" />
                Configurar Calendario
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SUBTABS */}
      <div className="flex border-b border-slate-200 px-4 bg-white">
        {subTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
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

      {/* GANTT CONTENT */}
      {activeSubTab === 'Gantt' && (
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">Cargando planificación...</div>
          ) : !activePlan ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Calendar size={48} className="mb-4 text-slate-300" />
              <p className="mb-4">No hay ninguna planificación creada para este proyecto.</p>
              <div className="flex gap-4">
                <button 
                  onClick={handleCreatePlan}
                  className="px-4 py-2 bg-[#002D5A] text-white rounded hover:bg-[#002D5A]/90 transition-colors"
                >
                  Crear Planificación Vacía
                </button>
                <button 
                  onClick={() => setIsQuotationPickerOpen(true)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Generar desde Cotización
                </button>
              </div>
            </div>
          ) : (
            <GanttTimeline 
              plan={activePlan} 
              project={project}
              onUpdate={() => loadPlanTree(activePlanId)} 
              calendars={calendars}
              selectedCalendarId={selectedCalendarId}
            />
          )}
        </div>
      )}

      {/* FOTOS CONTENT */}
      {activeSubTab === 'Fotos' && (
        <FotosView project={project} />
      )}


      {/* RESUMEN CONTENT */}
      {activeSubTab === 'Resumen' && (
        <ResumenView project={project} />
      )}

      {/* COSTES CONTENT */}
      {activeSubTab === '$ Costes' && (
        <CostesView plan={activePlan} />
      )}

      {/* OPERARIOS CONTENT */}
      {activeSubTab === 'Operarios' && (
        <OperariosView project={project} />
      )}

      {/* PRODUCCION CONTENT */}
      {activeSubTab === 'Producción' && (
        <ProduccionView project={project} />
      )}

      {/* PARTE DIARIO CONTENT */}
      {activeSubTab === 'Parte diario' && (
        <PartesDiariosView project={project} />
      )}

      {/* OTHER TABS PLACEHOLDER */}
      {activeSubTab !== 'Gantt' && activeSubTab !== 'Parte diario' && activeSubTab !== 'Partes diarios' && activeSubTab !== 'Estanqueidad' && activeSubTab !== 'Resumen' && activeSubTab !== 'Operarios' && activeSubTab !== 'Producción' && activeSubTab !== 'Fotos' && activeSubTab !== '$ Costes' && (
        <div className="flex-1 bg-slate-50 flex items-center justify-center text-slate-400">
          Módulo de {activeSubTab} en construcción...
        </div>
      )}

      {/* MODALS */}
      <PlanDeObraPdfModal 
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        project={project}
        plan={activePlan}
        reportType={reportType}
      />
      <QuotationPickerModal
        isOpen={isQuotationPickerOpen}
        onClose={() => setIsQuotationPickerOpen(false)}
        onSelect={handleImportFromQuotation}
        dealId={project.dealId || undefined}
        accountId={project.accountId}
      />
      
      {isCalendarModalOpen && (
        <CalendarSettingsModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          project={project}
          calendars={calendars}
          onSave={handleSaveCalendarSettings}
        />
      )}
    </div>
  );
}
