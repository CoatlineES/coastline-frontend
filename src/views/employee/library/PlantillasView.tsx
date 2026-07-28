import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { quotationTemplatesService, QuotationTemplate } from '../../../services/quotation-templates.service';
import QuotationTemplateEditorModal from './QuotationTemplateEditorModal';

export default function PlantillasView() {
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await quotationTemplatesService.getAll();
      setTemplates(data);
    } catch (e) {
      toast.error('Error cargando plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newTemplate = await quotationTemplatesService.create({ name: 'Nueva Plantilla' });
      setSelectedTemplateId(newTemplate.id);
      setIsEditorOpen(true);
      loadTemplates();
    } catch (e) {
      toast.error('Error creando plantilla');
    }
  };

  const handleEdit = (id: string) => {
    setSelectedTemplateId(id);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;
    try {
      await quotationTemplatesService.delete(id);
      toast.success('Plantilla eliminada');
      loadTemplates();
    } catch (e) {
      toast.error('Error al eliminar');
    }
  };

  const filtered = templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Plantillas de Cotizaciones</h2>
          <p className="text-sm text-slate-500">Administra las estructuras predefinidas para nuevas cotizaciones</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar plantilla..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-primary outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark"
          >
            <Plus size={16} /> Nueva Plantilla
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            <FolderOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p>No se encontraron plantillas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(t => (
              <div key={t.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 text-lg">{t.name}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(t.id)} className="p-1.5 text-slate-400 hover:text-primary bg-slate-50 rounded-lg"><Edit2 size={14}/></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{t.description || 'Sin descripción'}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <span className="bg-slate-100 px-2 py-1 rounded-md">{(t as any)._count?.chapters || 0} capítulos</span>
                  {t.businessLine && <span>{t.businessLine.name}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditorOpen && selectedTemplateId && (
        <QuotationTemplateEditorModal 
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            loadTemplates();
          }}
          templateId={selectedTemplateId}
        />
      )}
    </div>
  );
}
