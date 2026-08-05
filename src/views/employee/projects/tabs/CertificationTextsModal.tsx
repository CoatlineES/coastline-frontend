import React, { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { ProjectCertification } from '../../../../types/certification';
import api from '../../../../services/api';
import { clausesService, LibraryClause } from '../../../../services/clauses.service';

interface CertificationTextsModalProps {
  isOpen: boolean;
  onClose: () => void;
  certification: ProjectCertification;
  project: any;
  onSave: (data: Partial<ProjectCertification>) => void;
}

export function CertificationTextsModal({ isOpen, onClose, certification, project, onSave }: CertificationTextsModalProps) {
  const [formData, setFormData] = useState({
    projectCode: '',
    projectCity: '',
    projectAddress: '',
    clientName: '',
    clientCif: '',
    clientAddress: '',
    introduction: '',
    observations: '',
    conclusions: '',
    paymentConditions: ''
  });

  const [saving, setSaving] = useState(false);
  const [clauses, setClauses] = useState<LibraryClause[]>([]);

  useEffect(() => {
    if (isOpen) {
      clausesService.getAll().then(data => setClauses(data)).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectCode: certification.projectCode || project.deal?.number || '',
        projectCity: certification.projectCity || '',
        projectAddress: certification.projectAddress || project.address || '',
        clientName: certification.clientName || project.account?.name || '',
        clientCif: certification.clientCif || project.account?.cif || '',
        clientAddress: certification.clientAddress || project.account?.address || '',
        introduction: certification.introduction || '',
        observations: certification.observations || '',
        conclusions: certification.conclusions || '',
        paymentConditions: certification.paymentConditions || ''
      });
    }
  }, [isOpen, certification, project]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInsertTemplate = (field: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;
    setFormData(prev => {
      const current = prev[field as keyof typeof prev] as string;
      return { ...prev, [field]: current ? `${current}\n\n${value}` : value };
    });
    e.target.value = ""; // reset select
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving texts:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Textos del informe de certificación</h2>
            <p className="text-sm text-slate-500 mt-1">Estos bloques se incluyen en el PDF como secciones del informe. Todo es editable y opcional — los apartados que dejes vacíos no se mostrarán.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
          
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Datos del Proyecto (Aparecen en el PDF)</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Código de obra</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.projectCode} onChange={e => handleChange('projectCode', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ciudad</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.projectCity} onChange={e => handleChange('projectCity', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Emplazamiento / dirección de la obra</label>
              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.projectAddress} onChange={e => handleChange('projectAddress', e.target.value)} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Datos del Cliente (Propiedad)</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Razón social / Nombre</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.clientName} onChange={e => handleChange('clientName', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">CIF / NIF</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.clientCif} onChange={e => handleChange('clientCif', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Dirección fiscal del cliente</label>
              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.clientAddress} onChange={e => handleChange('clientAddress', e.target.value)} />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 font-semibold">1. Introducción</label>
                <select 
                  className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-600 outline-none hover:border-slate-400"
                  onChange={(e) => handleInsertTemplate('introduction', e)}
                  defaultValue=""
                >
                  <option value="" disabled>+ Insertar plantilla...</option>
                  {clauses.map(c => <option key={c.id} value={c.content}>{c.title}</option>)}
                </select>
              </div>
              <textarea 
                className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none" 
                placeholder="Resumen ejecutivo del periodo certificado, contexto de la obra y motivo del documento..."
                value={formData.introduction}
                onChange={e => handleChange('introduction', e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 font-semibold">4. Observaciones</label>
                <select 
                  className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-600 outline-none hover:border-slate-400"
                  onChange={(e) => handleInsertTemplate('observations', e)}
                  defaultValue=""
                >
                  <option value="" disabled>+ Insertar plantilla...</option>
                  {clauses.map(c => <option key={c.id} value={c.content}>{c.title}</option>)}
                </select>
              </div>
              <textarea 
                className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none" 
                placeholder="Incidencias, retrasos, modificaciones, condicionantes climáticos, materiales pendientes..."
                value={formData.observations}
                onChange={e => handleChange('observations', e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 font-semibold">5. Conclusiones</label>
                <select 
                  className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-600 outline-none hover:border-slate-400"
                  onChange={(e) => handleInsertTemplate('conclusions', e)}
                  defaultValue=""
                >
                  <option value="" disabled>+ Insertar plantilla...</option>
                  {clauses.map(c => <option key={c.id} value={c.content}>{c.title}</option>)}
                </select>
              </div>
              <textarea 
                className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none" 
                placeholder="Estado de avance, próximos hitos, recomendaciones o, en su caso, declaración de obra terminada..."
                value={formData.conclusions}
                onChange={e => handleChange('conclusions', e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 font-semibold">6. Condiciones de pago</label>
                <select 
                  className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-600 outline-none hover:border-slate-400"
                  onChange={(e) => handleInsertTemplate('paymentConditions', e)}
                  defaultValue=""
                >
                  <option value="" disabled>+ Insertar plantilla...</option>
                  {clauses.map(c => <option key={c.id} value={c.content}>{c.title}</option>)}
                </select>
              </div>
              <textarea 
                className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none" 
                placeholder="Forma de pago, plazos, hitos, datos bancarios, retenciones, IVA..."
                value={formData.paymentConditions}
                onChange={e => handleChange('paymentConditions', e.target.value)}
              />
            </div>
          </div>

        </div>

        <div className="flex items-center justify-between p-6 border-t border-slate-100">
          <span className="text-xs text-slate-500">Los cambios se guardan al hacer clic en Guardar.</span>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#002D5A] rounded-lg hover:bg-[#002D5A]/90 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
