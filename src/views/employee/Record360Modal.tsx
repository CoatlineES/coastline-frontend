import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  Users,
  Briefcase,
  FileText,
  Calendar,
  ChevronDown,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { accountsService } from '../../services/crm.service';

export interface Record360Focus {
  type: 'account' | 'contact' | 'deal' | 'activity' | 'quotation';
  id: string;
  accountId: string;
}

interface Record360ModalProps {
  focus: Record360Focus | null;
  onClose: () => void;
  onNavigate: (type: 'account' | 'contact' | 'deal' | 'quotation' | 'activity', id: string) => void;
}

export default function Record360Modal({ focus, onClose, onNavigate }: Record360ModalProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (focus) {
      loadData(focus.accountId);
      
      // Auto-open the relevant section based on focus type
      switch (focus.type) {
        case 'account': setOpenSection('account'); break;
        case 'contact': setOpenSection('contacts'); break;
        case 'deal': setOpenSection('deals'); break;
        case 'quotation': setOpenSection('quotations'); break;
        case 'activity': setOpenSection('activities'); break;
      }
    } else {
      setData(null);
    }
  }, [focus]);

  const loadData = async (accountId: string) => {
    try {
      setIsLoading(true);
      const result = await accountsService.get360(accountId);
      setData(result);
    } catch (error) {
      console.error('Error loading 360 data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!focus) return null;

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Helper to extract all quotations across the account and deals (evitando duplicados)
  const allQuotations = Array.from(
    new Map(
      [...(data?.quotations || []), ...(data?.deals?.flatMap((d: any) => d.quotations) || [])]
        .filter(Boolean)
        .map(q => [q.id, q])
    ).values()
  ) as any[];

  // Helper to extract all activities
  const allActivities = [
    ...(data?.activities || []),
    ...(data?.deals?.flatMap((d: any) => d.activities) || [])
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Lógica de Filtrado Inteligente
  let filteredContacts = data?.contacts || [];
  let filteredDeals = data?.deals || [];
  let filteredQuotations = allQuotations;
  let filteredActivities = allActivities;

  if (focus?.type === 'contact') {
    filteredDeals = data?.deals?.filter((d: any) => d.contactId === focus.id) || [];
    filteredActivities = allActivities.filter((a: any) => a.contactId === focus.id);
  } else if (focus?.type === 'deal') {
    filteredQuotations = allQuotations.filter((q: any) => q.dealId === focus.id);
    filteredActivities = allActivities.filter((a: any) => a.dealId === focus.id);
  } else if (focus?.type === 'quotation') {
    const targetQuotation = allQuotations.find((q: any) => q.id === focus.id);
    if (targetQuotation?.dealId) {
      filteredDeals = data?.deals?.filter((d: any) => d.id === targetQuotation.dealId) || [];
      filteredActivities = allActivities.filter((a: any) => a.dealId === targetQuotation.dealId);
    }
  } else if (focus?.type === 'activity') {
    const targetActivity = allActivities.find((a: any) => a.id === focus.id);
    if (targetActivity) {
      // Si la actividad tiene un padre, el ID raíz de la familia es el de su padre. Si no, es ella misma.
      const familyParentId = targetActivity.parentActivityId || targetActivity.id;
      
      // Mostramos el padre y todos los hijos que compartan ese parentActivityId
      filteredActivities = allActivities.filter((a: any) => 
        a.id === familyParentId || a.parentActivityId === familyParentId
      );

      // Filtramos los contactos asociados a esta familia de actividades (padre, objetivo y hermanos)
      const activityContactIds = new Set(filteredActivities.map((a: any) => a.contactId).filter(Boolean));
      filteredContacts = (data?.contacts || []).filter((c: any) => activityContactIds.has(c.id));

      // Si la actividad está ligada a un negocio, filtramos ese negocio y sus cotizaciones
      if (targetActivity.dealId) {
        filteredDeals = data?.deals?.filter((d: any) => d.id === targetActivity.dealId) || [];
        filteredQuotations = allQuotations.filter((q: any) => q.dealId === targetActivity.dealId);
      } else {
        // Si no está ligada a un negocio, no mostramos negocios ni cotizaciones para esta vista específica
        filteredDeals = [];
        filteredQuotations = [];
      }
    } else {
      filteredActivities = allActivities.filter((a: any) => a.id === focus.id);
      const activityContactIds = new Set(filteredActivities.map((a: any) => a.contactId).filter(Boolean));
      filteredContacts = (data?.contacts || []).filter((c: any) => activityContactIds.has(c.id));
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50 bg-gradient-to-r from-[#001c3a] to-[#002e5c] text-white">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Building2 size={28} className="text-emerald-400" />
                Visión 360º
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Trazabilidad completa {data?.name ? `de ${data.name}` : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#001c3a] rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Analizando ecosistema...</p>
              </div>
            ) : !data ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Building2 size={48} className="mb-4 opacity-20" />
                <p>No se encontró información</p>
              </div>
            ) : (
              <>
                {/* 1. Empresa */}
                <SectionStatic
                  title="Datos de la Empresa"
                  icon={<Building2 size={20} />}
                >
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{data.name}</h3>
                        {data.sector && <span className="inline-block mt-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">{data.sector}</span>}
                      </div>
                      <button
                        onClick={() => onNavigate('account', data.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#001c3a]/5 text-[#001c3a] font-semibold rounded-xl hover:bg-[#001c3a]/10 transition-colors"
                      >
                        Ver Empresa <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                      {data.cif && (
                        <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                          <FileText size={18} className="text-slate-400" />
                          <span className="text-sm font-medium">{data.cif}</span>
                        </div>
                      )}
                      {data.email && (
                        <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                          <Mail size={18} className="text-slate-400" />
                          <span className="text-sm font-medium truncate">{data.email}</span>
                        </div>
                      )}
                      {data.phone && (
                        <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                          <Phone size={18} className="text-slate-400" />
                          <span className="text-sm font-medium">{data.phone}</span>
                        </div>
                      )}
                      {data.city && (
                        <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                          <MapPin size={18} className="text-slate-400" />
                          <span className="text-sm font-medium">{data.city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </SectionStatic>

                {/* 2. Contactos */}
                <SectionStatic
                  title="Contactos Asociados"
                  icon={<Users size={20} />}
                  count={filteredContacts.length}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredContacts.map((contact: any) => (
                      <div key={contact.id} className={`p-4 rounded-2xl border transition-all ${focus.id === contact.id ? 'bg-blue-50/50 border-blue-200 shadow-md ring-2 ring-blue-500/20' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-slate-800">{contact.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">{contact.position || 'Sin cargo'}</p>
                          </div>
                          <button
                            onClick={() => onNavigate('contact', contact.id)}
                            className="p-2 text-slate-400 hover:text-[#001c3a] hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <ArrowRight size={18} />
                          </button>
                        </div>
                        <div className="space-y-1.5 mt-3">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Mail size={14} className="text-slate-400" /> {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Phone size={14} className="text-slate-400" /> {contact.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredContacts.length === 0 && (
                      <div className="col-span-full p-6 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed">
                        No hay contactos asociados
                      </div>
                    )}
                  </div>
                </SectionStatic>

                {/* 3. Negocios */}
                <SectionStatic
                  title="Negocios"
                  icon={<Briefcase size={20} />}
                  count={filteredDeals.length}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredDeals.map((deal: any) => (
                      <div key={deal.id} className={`p-5 rounded-2xl border transition-all ${focus.id === deal.id ? 'bg-emerald-50/50 border-emerald-200 shadow-md ring-2 ring-emerald-500/20' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-slate-800 text-lg">{deal.name}</h4>
                          <button
                            onClick={() => onNavigate('deal', deal.id)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <ArrowRight size={18} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wide">
                            {deal.stage}
                          </span>
                          <span className="font-bold text-[#001c3a]">
                            {deal.amount ? `${deal.amount.toLocaleString('es-ES')} €` : 'Sin importe'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredDeals.length === 0 && (
                      <div className="col-span-full p-6 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed">
                        No hay negocios registrados
                      </div>
                    )}
                  </div>
                </SectionStatic>

                {/* 4. Cotizaciones */}
                <SectionAccordion
                  title="Cotizaciones"
                  icon={<FileText size={20} />}
                  isOpen={openSection === 'quotations' || focus.type === 'quotation'}
                  onToggle={() => toggleSection('quotations')}
                  count={filteredQuotations.length}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredQuotations.map((quotation: any) => (
                      <div key={quotation.id} className={`p-5 rounded-2xl border transition-all ${focus.id === quotation.id ? 'bg-amber-50/50 border-amber-200 shadow-md ring-2 ring-amber-500/20' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg">{quotation.number}</h4>
                            {quotation.title && <p className="text-xs text-slate-500 font-medium mt-0.5">{quotation.title}</p>}
                          </div>
                          <button
                            onClick={() => onNavigate('quotation', quotation.id)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <ArrowRight size={18} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wide ${getStatusColor(quotation.status)}`}>
                            {quotation.status}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(quotation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredQuotations.length === 0 && (
                      <div className="col-span-full p-6 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed">
                        No hay cotizaciones emitidas
                      </div>
                    )}
                  </div>
                </SectionAccordion>

                {/* 5. Actividades */}
                <SectionAccordion
                  title="Historial de Actividades"
                  icon={<Calendar size={20} />}
                  isOpen={openSection === 'activities' || focus.type === 'activity' || focus.type === 'contact' || focus.type === 'deal' || focus.type === 'quotation'}
                  onToggle={() => toggleSection('activities')}
                  count={filteredActivities.length}
                >
                  <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {filteredActivities.map((activity: any, idx: number) => (
                      <div key={activity.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active ${focus.id === activity.id ? 'z-10' : ''}`}>
                        {/* Timeline dot */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
                          focus.id === activity.id 
                            ? 'bg-[#001c3a] border-white text-white' 
                            : activity.completedAt ? 'bg-emerald-500 border-white text-white' : 'bg-slate-100 border-white text-slate-400'
                        }`}>
                          {activity.completedAt ? <Clock size={16} /> : <Calendar size={16} />}
                        </div>
                        
                        {/* Card */}
                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border transition-all ${
                          focus.id === activity.id 
                            ? 'bg-blue-50/80 border-blue-200 shadow-md ring-2 ring-blue-500/20' 
                            : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                        }`}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-bold text-sm ${focus.id === activity.id ? 'text-[#001c3a]' : 'text-slate-800'}`}>{activity.subject}</h4>
                            <button
                              onClick={() => onNavigate('activity', activity.id)}
                              className="p-1 text-slate-400 hover:text-[#001c3a] hover:bg-slate-100 rounded-lg transition-colors ml-2"
                            >
                              <ArrowRight size={14} />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2 mt-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                              {activity.activityType}
                            </span>
                            {activity.result && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
                                {activity.result}
                              </span>
                            )}
                          </div>
                          {activity.notes && (
                            <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg mt-2">{activity.notes}</p>
                          )}
                          <div className="mt-3 text-[10px] text-slate-400 font-medium flex justify-between">
                            <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                            {activity.completedAt && <span className="text-emerald-500 font-bold">Completado</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredActivities.length === 0 && (
                      <div className="p-6 text-center text-slate-400 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 border-dashed relative z-10">
                        No hay actividades registradas
                      </div>
                    )}
                  </div>
                </SectionAccordion>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── COMPONENTE SECCIÓN ESTÁTICA ──────────────────────────────────
function SectionStatic({ title, icon, count, children }: any) {
  return (
    <div className="border bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      <div className="w-full flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
            {icon}
          </div>
          <h3 className="font-bold text-lg text-slate-800">
            {title}
          </h3>
          {count !== undefined && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
              {count}
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

// ─── COMPONENTE ACORDEÓN ─────────────────────────────────────────
function SectionAccordion({ title, icon, isOpen, onToggle, count, children }: any) {
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-slate-50/50 border-[#001c3a]/20 shadow-md' : 'bg-white border-slate-200 hover:border-[#001c3a]/30 shadow-sm'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl transition-colors ${isOpen ? 'bg-[#001c3a] text-white' : 'bg-slate-100 text-slate-600'}`}>
            {icon}
          </div>
          <h3 className={`font-bold text-lg ${isOpen ? 'text-[#001c3a]' : 'text-slate-800'}`}>
            {title}
          </h3>
          {count !== undefined && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isOpen ? 'bg-[#001c3a]/10 text-[#001c3a]' : 'bg-slate-100 text-slate-500'}`}>
              {count}
            </span>
          )}
        </div>
        <ChevronDown 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────
function getStatusColor(status: string) {
  switch (status) {
    case 'DRAFT': return 'bg-slate-100 text-slate-600';
    case 'SENT': return 'bg-blue-100 text-blue-700';
    case 'ACCEPTED': return 'bg-emerald-100 text-emerald-700';
    case 'REJECTED': return 'bg-red-100 text-red-700';
    case 'SIGNED': return 'bg-purple-100 text-purple-700';
    case 'PENDING_SIGNATURE': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-600';
  }
}
