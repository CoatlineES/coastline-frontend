import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Building2, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { quotationTemplatesService, QuotationTemplate } from '../../../services/quotation-templates.service';
import TemplateChapterEditor from './TemplateChapterEditor';
import ApuPickerModal from '../quotations/ApuPickerModal';
import { ResourceType, resourcesService } from '../../../services/resources.service';
import { AnimatePresence } from 'framer-motion';

interface QuotationTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
}

export default function QuotationTemplateEditorModal({ isOpen, onClose, templateId }: QuotationTemplateEditorModalProps) {
  const [template, setTemplate] = useState<QuotationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && templateId) {
      loadTemplate();
    }
  }, [isOpen, templateId]);

  const loadTemplate = async () => {
    if (!template) setLoading(true);
    try {
      const data = await quotationTemplatesService.getById(templateId);
      setTemplate(data);
      setName(data.name);
      setDescription(data.description || '');
    } catch (e) {
      toast.error('Error cargando la plantilla');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMeta = async () => {
    try {
      await quotationTemplatesService.update(templateId, { name, description });
      toast.success('Datos actualizados');
      loadTemplate();
    } catch (e) {
      toast.error('Error al actualizar');
    }
  };

  const handleAddChapter = async () => {
    try {
      await quotationTemplatesService.addChapter(templateId, { title: 'Nuevo Capítulo' });
      toast.success('Capítulo añadido');
      loadTemplate();
    } catch (e) {
      toast.error('Error al añadir capítulo');
    }
  };

  const handleImportCapitulo = async (capitulo: any) => {
    try {
      const capResource = await resourcesService.getById(capitulo.id);
      
      const newChapter = await quotationTemplatesService.addChapter(templateId, { 
        title: capitulo.name ? capitulo.name.split('\n')[0] : 'Capítulo Importado', 
        order: template?.chapters.length || 0 
      });
      
      if (capResource.components && capResource.components.length > 0) {
        for (const [index, comp] of capResource.components.entries()) {
          let unitPrice = comp.unitCost;
          if (comp.childResource?.salesPrice) {
            unitPrice = comp.childResource.salesPrice;
          } else if (comp.childResource?.unitCost) {
            unitPrice = comp.childResource.unitCost; 
          }
          
          await quotationTemplatesService.addLine(newChapter.id, {
            concept: comp.concept,
            unit: comp.unit || 'ud',
            quantity: comp.quantity,
            unitPrice: unitPrice,
            order: index,
            resourceId: comp.childResourceId,
            isGroup: false,
            isApu: false
          });
        }
      }
      
      setIsImportModalOpen(false);
      loadTemplate();
      toast.success('Capítulo importado con éxito');
    } catch (error) {
      console.error(error);
      toast.error('Error al importar capítulo');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-slate-50 rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {loading ? 'Cargando...' : `Editor de Plantilla`}
              </h2>
              <p className="text-sm text-slate-500">Configura la estructura predefinida</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 p-6 overflow-auto">
          {loading ? (
             <div className="flex justify-center p-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
          ) : template ? (
            <div className="max-w-5xl mx-auto space-y-6">
              
              {/* Meta details */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Datos Generales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de la Plantilla</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-primary outline-none"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-primary outline-none resize-none"
                      rows={2}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleUpdateMeta} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-all active:scale-95 shadow-md hover:shadow-lg">
                    <Save size={16} /> Guardar Cambios
                  </button>
                </div>
              </div>

              {/* Chapters List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-lg">Capítulos y Partidas</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsImportModalOpen(true)}
                      className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
                    >
                      <Package size={16} /> Importar Capítulo
                    </button>
                    <button 
                      onClick={handleAddChapter}
                      className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700"
                    >
                      <Plus size={16} /> Añadir Capítulo
                    </button>
                  </div>
                </div>
                
                {template.chapters?.length === 0 ? (
                  <div className="text-center p-12 bg-white border border-slate-200 rounded-xl">
                    <p className="text-slate-500 mb-4">Esta plantilla no tiene capítulos aún.</p>
                    <button 
                      onClick={handleAddChapter}
                      className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark"
                    >
                      <Plus size={16} /> Añadir Capítulo
                    </button>
                  </div>
                ) : (
                  template.chapters?.map((chapter, index) => (
                    <TemplateChapterEditor 
                      key={chapter.id}
                      templateId={template.id}
                      chapter={chapter}
                      index={index}
                      onUpdate={loadTemplate}
                    />
                  ))
                )}
              </div>

            </div>
          ) : null}
        </div>
      </div>
      
      <AnimatePresence>
        {isImportModalOpen && (
          <ApuPickerModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onSelect={handleImportCapitulo}
            resourceType={ResourceType.CAPITULO}
            title="Importar Capítulo de Biblioteca"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
