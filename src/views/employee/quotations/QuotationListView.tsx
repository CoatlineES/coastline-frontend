import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, Filter, MoreHorizontal, FileDown, CheckCircle, Clock, XCircle, Trash2, Copy, FileSignature } from 'lucide-react';
import { Quotation, QuotationSummary, QuotationStatus } from '../../../types/quotation';
import { quotationsService } from '../../../services/quotations.service';
import { BusinessLine } from '../../../services/business-lines.service';
import { UserResponse } from '../../../services/types';
import toast from 'react-hot-toast';

interface QuotationListViewProps {
  businessLines: BusinessLine[];
  users: UserResponse[];
  onViewDetail: (id: string) => void;
  onCreateNew: () => void;
  onDoubleClickQuotation?: (id: string, accountId: string) => void;
}

export const getStatusBadge = (status: QuotationStatus) => {
  const map: Record<QuotationStatus, { label: string, color: string, icon: React.ReactNode }> = {
    [QuotationStatus.DRAFT]: { label: 'Borrador', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <FileText size={12} /> },
    [QuotationStatus.SENT]: { label: 'Enviada', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Clock size={12} /> },
    [QuotationStatus.PENDING_SIGNATURE]: { label: 'Pendiente Firma', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <FileSignature size={12} /> },
    [QuotationStatus.SIGNED]: { label: 'Firmado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle size={12} /> },
    [QuotationStatus.ACCEPTED]: { label: 'Aceptada', color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={12} /> },
    [QuotationStatus.REJECTED]: { label: 'Rechazada', color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={12} /> },
    [QuotationStatus.EXPIRED]: { label: 'Caducada', color: 'bg-slate-200 text-slate-500 border-slate-300', icon: <Clock size={12} /> },
  };
  const config = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default function QuotationListView({ businessLines, users, onViewDetail, onCreateNew, onDoubleClickQuotation }: QuotationListViewProps) {
  const [quotations, setQuotations] = useState<QuotationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | ''>('');
  const [blFilter, setBlFilter] = useState('');

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const filters: Record<string, string> = {};
      if (statusFilter) filters.status = statusFilter;
      if (blFilter) filters.businessLineId = blFilter;
      if (searchTerm) filters.search = searchTerm;
      const data = await quotationsService.getAll(filters);
      setQuotations(data as QuotationSummary[]);
    } catch (err) {
      toast.error('Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter, blFilter]); // Fetch on filter change

  // Handle search with simple debounce manually or just button
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuotations();
  };

  const calculateTotal = (q: any) => {
    if (!q.chapters) return 0;
    const subtotal = q.chapters.reduce((acc: number, ch: any) => {
      return acc + ch.lines.reduce((a: number, l: any) => a + (l.quantity * l.unitPrice), 0);
    }, 0);
    const taxable = subtotal - (q.discount || 0);
    return taxable * (1 + (q.taxRate / 100));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header & Filters */}
      <div className="p-6 bg-white border-b border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-primary" />
              Cotizaciones
            </h2>
            <p className="text-sm text-slate-500 mt-1">Gestiona propuestas y presupuestos comerciales</p>
          </div>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            Nueva Cotización
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por número o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as QuotationStatus | '')}
              className="py-2 pl-3 pr-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
            >
              <option value="">Todos los estados</option>
              {Object.values(QuotationStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={blFilter}
              onChange={(e) => setBlFilter(e.target.value)}
              className="py-2 pl-3 pr-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
            >
              <option value="">Todas las líneas</option>
              {businessLines.map(bl => (
                <option key={bl.id} value={bl.id}>{bl.name}</option>
              ))}
            </select>
            <button type="submit" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm">
              Buscar
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : quotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FileText size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-700">No hay cotizaciones</p>
            <p className="text-sm">Prueba ajustando los filtros o crea una nueva.</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
            <AnimatePresence>
              {quotations.map(q => {
                const total = calculateTotal(q);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={q.id}
                    onClick={() => onViewDetail(q.id)}
                    onDoubleClick={(e) => {
                      if (onDoubleClickQuotation && q.account?.id) {
                        e.stopPropagation();
                        onDoubleClickQuotation(q.id, q.account.id);
                      }
                    }}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-800 text-lg tracking-tight group-hover:text-primary transition-colors">
                            {q.number}
                          </span>
                          <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">v{q.version}</span>
                        </div>
                        {getStatusBadge(q.status)}
                      </div>

                      <h3 className="font-bold text-slate-800 mb-1 truncate" title={q.account?.name}>{q.account?.name || 'Sin empresa'}</h3>
                      <p className="text-sm text-slate-500 truncate mb-4" title={q.deal?.name}>{q.deal?.name || 'Sin negocio'}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {q.businessLine && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                            {q.businessLine.name}
                          </span>
                        )}
                        {q.user && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {q.user.name}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-between items-center">
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <Clock size={14} />
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-0.5">Total (IVA incl.)</div>
                        <div className="font-bold text-slate-800 text-lg">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
