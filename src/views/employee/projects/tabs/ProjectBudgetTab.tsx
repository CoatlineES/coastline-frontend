import React, { useState, useEffect } from 'react';
import { Project, UserResponse } from '../../../../services/types';
import { projectPlanningService, ProjectPlan } from '../../../../services/project-planning.service';
import { FileText, Calculator, Plus } from 'lucide-react';
import { BudgetCertificationView } from './BudgetCertificationView';
import QuotationDetailView from '../../quotations/QuotationDetailView';
import { quotationsService } from '../../../../services/quotations.service';
import { Quotation } from '../../../../types/quotation';
import { businessLinesService, BusinessLine } from '../../../../services/business-lines.service';
import { usersService } from '../../../../services/users.service';
import { projectsService } from '../../../../services/projects.service';
import toast from 'react-hot-toast';

interface ProjectBudgetTabProps {
  project: Project;
  onUpdateProject?: () => void;
}

export function ProjectBudgetTab({ project, onUpdateProject }: ProjectBudgetTabProps) {
  const [activePlan, setActivePlan] = useState<ProjectPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'Edición' | 'Certificación'>('Edición');

  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [baseQuotationAmount, setBaseQuotationAmount] = useState<number>(0);

  useEffect(() => {
    loadDependencies();
    loadActivePlan();
  }, [project.id]);

  const loadDependencies = async () => {
    try {
      const [bLines, fetchedUsers] = await Promise.all([
        businessLinesService.getAll(),
        usersService.getUsers()
      ]);
      setBusinessLines(bLines);
      setUsers(fetchedUsers);

      if (project.dealId) {
        const quotes = await quotationsService.getAll({ dealId: project.dealId });
        const accepted = quotes.find((q: Quotation) => ['ACCEPTED', 'WON', 'SIGNED'].includes(q.status)) || quotes[0];
        if (accepted) {
          const fetchedOriginal = await quotationsService.getById(accepted.id);
          
          const getLineTotal = (line: any, allLines: any[]) => {
            if (line.isApu || line.isGroup) {
              const children = allLines.filter(cl => cl.parentId === line.id);
              const baseCost = children.reduce((sum, cl) => sum + ((cl.quantity || 1) * (cl.unitPrice || 0)), 0);
              const computedUnitPrice = line.isApu ? baseCost * (1 + (line.margin || 0) / 100) : baseCost;
              return (line.quantity || 1) * computedUnitPrice;
            }
            return (line.quantity || 1) * (line.unitPrice || 0);
          };

          const subtotal = fetchedOriginal.chapters.reduce((acc: number, ch: any) => {
            return acc + ch.lines.filter((l: any) => !l.parentId).reduce((a: number, l: any) => a + getLineTotal(l, ch.lines), 0);
          }, 0);
          
          setBaseQuotationAmount(subtotal);
        }
      }
    } catch (error) {
      console.error('Error loading dependencies for budget', error);
    }
  };

  const loadActivePlan = async () => {
    setLoading(true);
    try {
      const fetchedPlans = await projectPlanningService.getPlansByProjectId(project.id);
      if (fetchedPlans.length > 0) {
        const active = fetchedPlans.find(p => p.isActive) || fetchedPlans[0];
        const planTree = await projectPlanningService.getPlanTree(active.id);
        setActivePlan(planTree);
      } else {
        setActivePlan(null);
      }
    } catch (error) {
      console.error('Error loading plan tree for budget', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeBudget = async () => {
    setInitializing(true);
    try {
      await projectsService.initializeBudget(project.id);
      toast.success('Presupuesto inicializado correctamente');
      if (onUpdateProject) {
        onUpdateProject();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al inicializar presupuesto. Asegúrate de tener una cotización ganada.');
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[900px] mt-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-200/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveSubTab('Edición')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeSubTab === 'Edición' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Calculator size={16} />
              Edición de Presupuesto (PEM)
            </button>
            <button
              onClick={() => setActiveSubTab('Certificación')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeSubTab === 'Certificación' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText size={16} />
              Certificación
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative bg-slate-50 min-h-0">
        {!project.budgetQuotationId ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8">
            <Calculator size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Presupuesto no inicializado</h3>
            <p className="text-center max-w-md mb-6">
              El Presupuesto de Ejecución (PEM) es una copia independiente de la cotización ganada. 
              Al generarlo, podrás ajustar los APU reales sin afectar la cotización original del cliente.
            </p>
            <button
              onClick={handleInitializeBudget}
              disabled={initializing}
              className="flex items-center gap-2 bg-[#002D5A] text-white px-6 py-2 rounded-lg hover:bg-[#002D5A]/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {initializing ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus size={20} />
              )}
              Generar Presupuesto desde Cotización
            </button>
          </div>
        ) : (
          <>
            {activeSubTab === 'Edición' && (
              <QuotationDetailView 
                quotationId={project.budgetQuotationId} 
                onBack={() => {}} 
                businessLines={businessLines}
                users={users}
                isBudget={true}
                baseAmount={baseQuotationAmount || project.quotedAmount || 0}
              />
            )}
            {activeSubTab === 'Certificación' && (
              <BudgetCertificationView project={project} plan={activePlan} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
