import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clausesService, LibraryClause } from '../../../services/clauses.service';
import toast from 'react-hot-toast';

export default function ClausesLibraryView() {
  const [clauses, setClauses] = useState<LibraryClause[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingClause, setEditingClause] = useState<Partial<LibraryClause> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClauses = async () => {
    try {
      setIsLoading(true);
      const data = await clausesService.getAll();
      setClauses(data);
    } catch (error) {
      toast.error('Error al cargar la biblioteca de cláusulas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClauses();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClause?.title || !editingClause?.content) {
      toast.error('El título y el contenido son obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingClause.id) {
        await clausesService.update(editingClause.id, editingClause);
        toast.success('Cláusula actualizada correctamente');
      } else {
        await clausesService.create(editingClause as any);
        toast.success('Cláusula creada correctamente');
      }
      setShowModal(false);
      setEditingClause(null);
      fetchClauses();
    } catch (error) {
      toast.error('Error al guardar la cláusula');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cláusula de la biblioteca?')) return;
    
    try {
      await clausesService.delete(id);
      toast.success('Cláusula eliminada');
      fetchClauses();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleToggleDefault = async (clause: LibraryClause) => {
    try {
      await clausesService.update(clause.id, { isDefault: !clause.isDefault });
      fetchClauses();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const filteredClauses = clauses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-white">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar cláusulas..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={() => {
            setEditingClause({ title: '', content: '', category: 'General', isDefault: false, sortOrder: clauses.length });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#001c3a] text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} /> Nueva Cláusula
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            Cargando cláusulas...
          </div>
        ) : filteredClauses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <FileText size={48} className="mb-4 opacity-20" />
            <p>No se encontraron cláusulas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredClauses.map((clause) => (
                <motion.div
                  key={clause.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-all relative group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 pr-8">
                      <div className="flex items-center gap-2 mb-1">
                        {clause.category && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {clause.category}
                          </span>
                        )}
                        {clause.isDefault && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-100">
                            <CheckCircle size={10} /> Por Defecto
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-800">{clause.title}</h3>
                    </div>
                    <div className="flex gap-1 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingClause(clause); setShowModal(true); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(clause.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 flex-1 whitespace-pre-wrap line-clamp-4">
                    {clause.content}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Orden: {clause.sortOrder}</span>
                    <button 
                      onClick={() => handleToggleDefault(clause)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${clause.isDefault ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    >
                      {clause.isDefault ? 'Quitar defecto' : 'Marcar por defecto'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showModal && editingClause && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="text-[#001c3a]" size={20} />
                  {editingClause.id ? 'Editar Cláusula' : 'Nueva Cláusula'}
                </h3>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form id="clause-form" onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Título</label>
                      <input 
                        type="text" 
                        required
                        value={editingClause.title} 
                        onChange={e => setEditingClause({...editingClause, title: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
                      <input 
                        type="text" 
                        value={editingClause.category || ''} 
                        onChange={e => setEditingClause({...editingClause, category: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]" 
                        placeholder="Ej. Garantía, Pago..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Orden (Sort)</label>
                      <input 
                        type="number" 
                        value={editingClause.sortOrder} 
                        onChange={e => setEditingClause({...editingClause, sortOrder: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]" 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input 
                          type="checkbox" 
                          checked={editingClause.isDefault}
                          onChange={e => setEditingClause({...editingClause, isDefault: e.target.checked})}
                          className="w-4 h-4 text-[#001c3a] border-slate-300 rounded focus:ring-[#001c3a]"
                        />
                        <span className="text-sm font-semibold text-slate-700">Incluir por defecto en nuevas cotizaciones</span>
                      </label>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Contenido de la Cláusula</label>
                      <textarea 
                        required
                        value={editingClause.content} 
                        onChange={e => setEditingClause({...editingClause, content: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] min-h-[250px] resize-y custom-scrollbar leading-relaxed" 
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 mt-auto">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-all active:scale-95">
                  Cancelar
                </button>
                <button type="submit" form="clause-form" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#001c3a] hover:bg-slate-800 transition-all active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50">
                  {isSubmitting ? 'Guardando...' : 'Guardar Cláusula'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
