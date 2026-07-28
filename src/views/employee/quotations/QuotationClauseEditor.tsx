import React, { useState } from 'react';
import { Quotation, QuotationClause } from '../../../types/quotation';
import { quotationsService } from '../../../services/quotations.service';
import { Plus, Edit2, Trash2, Check, X, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import ClausePickerModal from './ClausePickerModal';
import { LibraryClause } from '../../../services/clauses.service';

interface QuotationClauseEditorProps {
  quotation: Quotation;
  onUpdate: () => void;
}

export default function QuotationClauseEditor({ quotation, onUpdate }: QuotationClauseEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const startEdit = (clause: QuotationClause) => {
    setEditingId(clause.id);
    setFormData({ title: clause.title, content: clause.content });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  const saveEdit = async (id: string) => {
    try {
      await quotationsService.updateClause(quotation.id, id, formData);
      toast.success('Cláusula actualizada');
      setEditingId(null);
      onUpdate();
    } catch (err) {
      toast.error('Error al actualizar la cláusula');
    }
  };

  const deleteClause = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta cláusula?')) return;
    try {
      await quotationsService.deleteClause(quotation.id, id);
      toast.success('Cláusula eliminada');
      onUpdate();
    } catch (err) {
      toast.error('Error al eliminar la cláusula');
    }
  };

  const addClause = async () => {
    try {
      await quotationsService.addClause(quotation.id, {
        title: 'Nueva Cláusula',
        content: 'Escribe aquí el contenido de la cláusula...',
        order: quotation.clauses.length
      });
      toast.success('Cláusula añadida');
      onUpdate();
    } catch (err) {
      toast.error('Error al añadir la cláusula');
    }
  };

  const handleImport = async (selectedClauses: LibraryClause[]) => {
    try {
      let currentOrder = quotation.clauses.length;
      for (const clause of selectedClauses) {
        await quotationsService.addClause(quotation.id, {
          title: clause.title,
          content: clause.content,
          order: currentOrder++
        });
      }
      toast.success(`${selectedClauses.length} cláusulas importadas correctamente`);
      setIsPickerOpen(false);
      onUpdate();
    } catch (err) {
      toast.error('Error al importar las cláusulas');
    }
  };

  return (
    <div className="space-y-4">
      {quotation.clauses.map((clause, index) => (
        <div key={clause.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-colors">
          {editingId === clause.id ? (
            <div className="flex flex-col gap-3">
              <input
                autoFocus
                className="font-bold text-slate-800 text-base px-3 py-1.5 border border-primary rounded outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título de la cláusula"
              />
              <textarea
                className="w-full min-h-[100px] text-sm text-slate-600 px-3 py-2 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Contenido de la cláusula"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                >
                  <X size={14} /> Cancelar
                </button>
                <button
                  onClick={() => saveEdit(clause.id)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-dark rounded flex items-center gap-1 transition-colors"
                >
                  <Check size={14} /> Guardar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-sm">{index + 1}.</span>
                  {clause.title}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(clause)}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                    title="Editar cláusula"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteClause(clause.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar cláusula"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{clause.content}</p>
            </div>
          )}
        </div>
      ))}

      {quotation.clauses.length === 0 && (
        <div className="text-center py-6 text-slate-500 text-sm">
          No hay cláusulas definidas para esta cotización.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <button
          onClick={addClause}
          className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-primary hover:bg-primary/5 hover:text-primary transition-all flex justify-center items-center gap-2"
        >
          <Plus size={18} /> Añadir Manualmente
        </button>
        <button
          onClick={() => setIsPickerOpen(true)}
          className="w-full py-3 bg-[#001c3a]/5 border border-[#001c3a]/20 rounded-xl text-[#001c3a] font-medium hover:bg-[#001c3a]/10 transition-all flex justify-center items-center gap-2"
        >
          <BookOpen size={18} /> Importar desde Biblioteca
        </button>
      </div>

      <ClausePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleImport}
      />
    </div>
  );
}
