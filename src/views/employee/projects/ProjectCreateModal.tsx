import React, { useState, useEffect } from 'react';
import { X, Building2, User, Briefcase } from 'lucide-react';
import { Project, UserResponse } from '../../../services/types';
import { projectsService } from '../../../services/projects.service';
import { accountsService, Account } from '../../../services/crm.service';
import { usersService } from '../../../services/users.service';
import { businessLinesService, BusinessLine } from '../../../services/business-lines.service';
import { quotationsService } from '../../../services/quotations.service';
import { Quotation } from '../../../types/quotation';
import { projectPlanningService } from '../../../services/project-planning.service';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export default function ProjectCreateModal({ isOpen, onClose, onSuccess }: ProjectCreateModalProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    status: 'ACTIVE',
    operationalPhase: 'PENDING_PLANNING',
    accountId: '',
    responsibleId: '',
  });
  const [isDemo, setIsDemo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setError(null);
      accountsService.getAll().then(setAccounts).catch(console.error);
      usersService.getUsers().then(res => setUsers(res.data)).catch(console.error);
      businessLinesService.getAll().then(setBusinessLines).catch(console.error);
      quotationsService.getAll({ status: 'ACCEPTED' })
        .then(res => setQuotations(Array.isArray(res) ? res : res.data || []))
        .catch(console.error);
    }
  }, [isOpen]);

  const handleQuotationChange = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
    setError(null);
    const selectedQuotation = quotations.find(q => q.id === quotationId);
    if (selectedQuotation) {
      setFormData({
        ...formData,
        name: `PRJ-${selectedQuotation.deal?.name || selectedQuotation.title || 'Proyecto'}`,
        dealId: selectedQuotation.dealId,
        accountId: selectedQuotation.accountId,
        responsibleId: selectedQuotation.user?.id || selectedQuotation.deal?.userId || '',
        businessLineId: selectedQuotation.businessLine?.id || selectedQuotation.deal?.businessLineId || '',
      });
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name?.trim()) {
      setError('Debes ingresar un nombre para el proyecto.');
      return;
    }

    if (!isDemo) {
      if (!formData.dealId) {
        setError('Debes seleccionar una cotización base.');
        return;
      }
      if (!formData.accountId) {
        setError('A la cotización original le falta el Cliente (Empresa). Por favor, selecciónalo aquí abajo.');
        return;
      }
      if (!formData.businessLineId) {
        setError('A la cotización original le falta la Línea de Negocio. Por favor, selecciónala aquí abajo.');
        return;
      }
    }

    try {
      setSaving(true);
      
      if (isDemo) {
        const newDemo = await projectsService.createDemo(formData.name);
        onSuccess(newDemo);
        onClose();
        setFormData({ name: '', status: 'ACTIVE', operationalPhase: 'PENDING_PLANNING', accountId: '', responsibleId: '', businessLineId: '', dealId: '' });
        setSelectedQuotationId('');
        return;
      }

      const submitData = { ...formData };
      
      // Limpiar campos vacíos opcionales para evitar errores de UUID en Prisma
      if (!submitData.responsibleId) {
        delete submitData.responsibleId;
      }

      const newProject = await projectsService.create(submitData);
      
      // Inicializar presupuesto automáticamente para que nazca con cotización base
      await projectsService.initializeBudget(newProject.id);
      // Traer el proyecto actualizado
      const updatedProject = await projectsService.getById(newProject.id);

      // Generar la planificación automáticamente desde el presupuesto
      if ((updatedProject as any).budgetQuotationId) {
        try {
          await projectPlanningService.generateFromQuotation(updatedProject.id, (updatedProject as any).budgetQuotationId);
        } catch (planError) {
          console.error('Error generating planning from budget:', planError);
          // Don't fail the whole project creation just because planning failed
        }
      }

      onSuccess(updatedProject);
      onClose();
      setFormData({ name: '', status: 'ACTIVE', operationalPhase: 'PENDING_PLANNING', accountId: '', responsibleId: '', businessLineId: '', dealId: '' });
      setSelectedQuotationId('');
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Error al crear el proyecto. Revisa la consola para más detalles.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Nuevo Proyecto</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-100 mb-4">
            <input 
              type="checkbox" 
              id="isDemo" 
              checked={isDemo}
              onChange={(e) => setIsDemo(e.target.checked)}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="isDemo" className="font-medium cursor-pointer flex-1">
              Es un Proyecto Demo / Plantilla
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Proyecto *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder={isDemo ? "Ej. Plantilla Instalación Standard" : "Ej. Construcción Nave Industrial"}
            />
          </div>

          {!isDemo && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Building2 size={16} className="text-slate-400" /> Empresa (Cliente)
            </label>
            <select
              value={formData.accountId || ''}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Sin asignar</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Briefcase size={16} className="text-slate-400" /> Cotización Base (Requerido) *
            </label>
            <select
              required
              value={selectedQuotationId}
              onChange={(e) => handleQuotationChange(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Selecciona una cotización aceptada...</option>
              {quotations.map(quotation => (
                <option key={quotation.id} value={quotation.id}>
                  {quotation.number} - {quotation.title || quotation.deal?.name} ({quotation.account?.name || 'Sin cliente'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <User size={16} className="text-slate-400" /> Responsable
            </label>
            <select
              value={formData.responsibleId || ''}
              onChange={(e) => setFormData({ ...formData, responsibleId: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Sin asignar</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Briefcase size={16} className="text-slate-400" /> Línea de Negocio
            </label>
            <select
              value={formData.businessLineId || ''}
              onChange={(e) => setFormData({ ...formData, businessLineId: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Sin asignar</option>
              {businessLines.map(bl => (
                <option key={bl.id} value={bl.id}>{bl.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select
                value={formData.status || 'ACTIVE'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ACTIVE">Activo</option>
                <option value="PAUSED">Pausado</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fase Operativa</label>
              <select
                value={formData.operationalPhase || 'PENDING_PLANNING'}
                onChange={(e) => setFormData({ ...formData, operationalPhase: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="PENDING_PLANNING">Pdte. de Planificación</option>
                <option value="CONSTRUCTION_PLANNING">En Planificación</option>
                <option value="INSPECTION_DONE">Inspeccionado</option>
                <option value="COMPLETION">Finalización</option>
                <option value="CERT_INVOICING">Certif. y Facturación</option>
              </select>
            </div>
          </div>
          </>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#002D5A] text-white rounded-lg hover:bg-[#001F3F] transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
