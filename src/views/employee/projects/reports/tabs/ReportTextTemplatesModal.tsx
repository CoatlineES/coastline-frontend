import React, { useState, useEffect } from 'react';
import { X, Check, Save, FileText, Trash2, Edit2, Plus } from 'lucide-react';
import { clausesService, LibraryClause } from '../../../../../services/clauses.service';
import { toast } from 'react-hot-toast';

interface RecommendationTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (content: string) => void;
  currentContent?: string;
  title?: string;
  category: string;
}

export default function RecommendationTemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
  currentContent,
  title = "Plantillas",
  category
}: RecommendationTemplatesModalProps) {
  const [templates, setTemplates] = useState<LibraryClause[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'list' | 'save'>('list');
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setMode('list');
      setNewTitle('');
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const allClauses = await clausesService.getAll();
      const recomms = allClauses.filter(c => c.category === category);
      setTemplates(recomms);
    } catch (error) {
      console.error('Error loading templates', error);
      toast.error('Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTitle.trim()) {
      toast.error('El título es obligatorio');
      return;
    }
    if (!currentContent || !currentContent.trim() || currentContent === '<p><br></p>') {
      toast.error('No hay contenido para guardar');
      return;
    }

    try {
      setSaving(true);
      await clausesService.create({
        title: newTitle,
        content: currentContent,
        category: category,
        isDefault: false,
        sortOrder: templates.length
      });
      toast.success('Plantilla guardada');
      await loadTemplates();
      setMode('list');
      setNewTitle('');
    } catch (error) {
      console.error('Error saving template', error);
      toast.error('Error al guardar plantilla');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta plantilla?')) return;
    try {
      await clausesService.delete(id);
      toast.success('Plantilla eliminada');
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting template', error);
      toast.error('Error al eliminar');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            {title}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 flex gap-2">
          <button 
            onClick={() => setMode('list')}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${mode === 'list' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileText size={16} />
            Mis Plantillas
          </button>
          <button 
            onClick={() => setMode('save')}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${mode === 'save' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Save size={16} />
            Guardar Actual como Plantilla
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'list' ? (
            loading ? (
              <div className="text-center py-8 text-slate-500">Cargando plantillas...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No tienes plantillas guardadas.</p>
                <p className="text-sm mt-2">Usa la opción "Guardar Actual" para crear una.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map(template => (
                  <div key={template.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-800">{template.title}</h4>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDelete(template.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar plantilla"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            onSelectTemplate(template.content);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Check size={16} /> Usar
                        </button>
                      </div>
                    </div>
                    <div 
                      className="text-sm text-slate-600 line-clamp-3 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: template.content }}
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-6">
              <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm">
                Se guardará el texto que tienes actualmente en el editor como una nueva plantilla.
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título de la Plantilla</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Plantilla estándar..."
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Vista Previa del Contenido</label>
                <div 
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50 min-h-[100px] max-h-[300px] overflow-y-auto prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentContent || '<p class="text-slate-400 italic">El editor está vacío</p>' }}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={handleSaveTemplate}
                  disabled={saving || !newTitle.trim() || !currentContent}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? 'Guardando...' : 'Guardar Plantilla'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
