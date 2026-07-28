import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, FileText } from 'lucide-react';
import { clausesService, LibraryClause } from '../../../services/clauses.service';

interface ClausePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (clauses: LibraryClause[]) => void;
}

export default function ClausePickerModal({ isOpen, onClose, onSelect }: ClausePickerModalProps) {
  const [clauses, setClauses] = useState<LibraryClause[]>([]);
  const [filteredClauses, setFilteredClauses] = useState<LibraryClause[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadClauses();
      setSearch('');
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  const loadClauses = async () => {
    try {
      setIsLoading(true);
      const data = await clausesService.getAll();
      setClauses(data);
      setFilteredClauses(data);
    } catch (error) {
      console.error('Error loading clauses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredClauses(
      clauses.filter(c => c.title.toLowerCase().includes(q) || (c.category && c.category.toLowerCase().includes(q)))
    );
  }, [search, clauses]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleConfirm = () => {
    const selected = clauses.filter(c => selectedIds.has(c.id));
    onSelect(selected);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-[#001c3a]" size={20} />
              Importar desde Biblioteca
            </h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por título o categoría..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-3">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#001c3a] rounded-full animate-spin"></div>
                <span className="font-medium animate-pulse">Cargando biblioteca...</span>
              </div>
            ) : filteredClauses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <FileText size={48} className="mb-4 opacity-20" />
                <p>No se encontraron cláusulas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredClauses.map((clause) => (
                  <div
                    key={clause.id}
                    onClick={() => toggleSelection(clause.id)}
                    className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedIds.has(clause.id)
                        ? 'bg-[#001c3a]/5 border-[#001c3a] shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        {clause.category && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {clause.category}
                          </span>
                        )}
                        <h4 className={`font-bold text-sm ${selectedIds.has(clause.id) ? 'text-[#001c3a]' : 'text-slate-800'}`}>
                          {clause.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{clause.content}</p>
                    </div>
                    
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                      selectedIds.has(clause.id)
                        ? 'bg-[#001c3a] border-[#001c3a] text-white'
                        : 'bg-white border-slate-300'
                    }`}>
                      {selectedIds.has(clause.id) && <Check size={14} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-600">
              {selectedIds.size} cláusula{selectedIds.size !== 1 && 's'} seleccionada{selectedIds.size !== 1 && 's'}
            </span>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedIds.size === 0}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#001c3a] hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Importar Seleccionadas
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
