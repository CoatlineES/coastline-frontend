import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuotationStatus } from '../../../types/quotation';
import { Check, Edit3, Send, Clock, FileCheck, XCircle, X, ChevronDown } from 'lucide-react';

interface QuotationStatusBadgeProps {
  status: QuotationStatus;
  interactive?: boolean;
  onChange?: (newStatus: QuotationStatus) => void;
  className?: string;
}

export const QUOTATION_STATUS_CONFIG = {
  [QuotationStatus.DRAFT]: {
    label: 'Borrador',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: <Edit3 size={12} className="shrink-0" />
  },
  [QuotationStatus.SENT]: {
    label: 'Enviada',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Send size={12} className="shrink-0" />
  },
  [QuotationStatus.PENDING_SIGNATURE]: {
    label: 'Pendiente Firma',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <Clock size={12} className="shrink-0" />
  },
  [QuotationStatus.SIGNED]: {
    label: 'Firmada',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    icon: <FileCheck size={12} className="shrink-0" />
  },
  [QuotationStatus.ACCEPTED]: {
    label: 'Aceptada',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <Check size={12} className="shrink-0" />
  },
  [QuotationStatus.REJECTED]: {
    label: 'Rechazada',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <XCircle size={12} className="shrink-0" />
  },
  [QuotationStatus.EXPIRED]: {
    label: 'Caducada',
    color: 'bg-slate-200 text-slate-500 border-slate-300',
    icon: <X size={12} className="shrink-0" />
  }
};

const QuotationStatusBadge: React.FC<QuotationStatusBadgeProps> = ({ status, interactive = false, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = QUOTATION_STATUS_CONFIG[status] || QUOTATION_STATUS_CONFIG[QuotationStatus.DRAFT];

  if (!interactive) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color} ${className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between min-w-[130px] gap-2 px-3 py-1.5 rounded-full text-xs font-bold border hover:shadow-sm transition-all ${config.color} ${className}`}
      >
        <span className="flex items-center gap-1.5">
          {config.icon}
          {config.label}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden"
            >
              <div className="py-1">
                {Object.entries(QUOTATION_STATUS_CONFIG).map(([key, conf]) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (onChange) onChange(key as QuotationStatus);
                      setIsOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-xs font-medium hover:bg-slate-50 ${status === key ? 'bg-slate-50' : ''}`}
                  >
                    <span className={`flex items-center gap-2 px-2 py-1 rounded-full border ${conf.color}`}>
                      {conf.icon}
                      {conf.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuotationStatusBadge;
