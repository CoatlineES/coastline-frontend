import React, { useState, useEffect } from 'react';
import { X, Search, FileText } from 'lucide-react';
import { quotationsService } from '../../../../services/quotations.service';
import { Quotation } from '../../../../types/quotation';

interface QuotationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (quotationId: string) => void;
  accountId?: string;
  dealId?: string;
}

export function QuotationPickerModal({ isOpen, onClose, onSelect, accountId, dealId }: QuotationPickerModalProps) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadQuotations();
    }
  }, [isOpen, accountId, dealId]);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const data = await quotationsService.getAll({});
      setQuotations(data);
    } catch (error) {
      console.error('Error loading quotations', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter(q => 
    q.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Usar Cotización como Base</h2>
            <p className="text-sm text-slate-500">Selecciona la cotización desde la cual deseas generar el plan de obra.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por número o título..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Buscando cotizaciones...</div>
          ) : filteredQuotations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No se encontraron cotizaciones para este proyecto.</div>
          ) : (
            <div className="space-y-2">
              {filteredQuotations.map(q => (
                <div 
                  key={q.id}
                  onClick={() => onSelect(q.id)}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800 truncate">{q.title || 'Cotización sin título'}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        q.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                        q.status === 'SENT' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="font-medium text-slate-600">{q.number}</span>
                      <span>•</span>
                      <span>Total: {q.total?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                      <span>•</span>
                      <span>Versión {q.version}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
