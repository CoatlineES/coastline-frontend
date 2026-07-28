import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, FileText, Briefcase, CheckCircle, Copy } from 'lucide-react';
import { Deal } from '../../../services/types';
import { quotationsService } from '../../../services/quotations.service';
import { quotationTemplatesService, QuotationTemplate } from '../../../services/quotation-templates.service';
import toast from 'react-hot-toast';

interface CreateQuotationModalProps {
  deal: Deal | null;
  deals: Deal[];
  onClose: () => void;
  onSuccess: (quotationId: string) => void;
}

export default function CreateQuotationModal({ deal, deals, onClose, onSuccess }: CreateQuotationModalProps) {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(deal);
  const [searchTerm, setSearchTerm] = useState('');
  const [creationMethod, setCreationMethod] = useState<'blank' | 'template'>('blank');
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const filteredDeals = deals.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.account?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    quotationTemplatesService.getAll().then(setTemplates).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal) return;
    if (creationMethod === 'template' && !selectedTemplateId) {
      toast.error('Debes seleccionar una plantilla');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        dealId: selectedDeal.id,
        accountId: selectedDeal.accountId,
        userId: selectedDeal.userId || undefined,
        businessLineId: selectedDeal.businessLineId || undefined,
        title: `${selectedDeal.name} - Cotización`,
        validUntil: selectedDeal.closeDate || undefined,
      };

      let newQuotation;
      if (creationMethod === 'template') {
        newQuotation = await quotationsService.createFromTemplate(selectedTemplateId, payload);
      } else {
        newQuotation = await quotationsService.create(payload);
      }
      onSuccess(newQuotation.id);
    } catch (err: any) {
      toast.error('Error al crear la cotización: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Nueva Cotización</h2>
              <p className="text-sm text-slate-500">Crear desde un negocio existente</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-auto custom-scrollbar">
          {/* Step 1: Select Deal */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-white text-xs">1</span>
              Selecciona el Negocio asociado
            </label>
            
            {selectedDeal ? (
              <div className="p-4 border-2 border-primary rounded-xl bg-primary/5 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800">{selectedDeal.name}</h4>
                  <p className="text-sm text-slate-500">{selectedDeal.account?.name}</p>
                </div>
                {!deal && (
                  <button type="button" onClick={() => setSelectedDeal(null)} className="text-sm text-primary hover:underline font-medium">
                    Cambiar
                  </button>
                )}
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[250px]">
                <div className="p-3 border-b border-slate-100 bg-slate-50 relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar negocio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-1">
                  {filteredDeals.map(d => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDeal(d)}
                      className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-3 border border-transparent hover:border-slate-200"
                    >
                      <Briefcase size={16} className="text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{d.name}</div>
                        <div className="text-xs text-slate-500">{d.account?.name}</div>
                      </div>
                    </div>
                  ))}
                  {filteredDeals.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-500">No se encontraron negocios</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Select Method */}
          {selectedDeal && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-white text-xs">2</span>
                Método de Creación
              </label>
              
              <div className="grid gap-3 grid-cols-2">
                <div
                  onClick={() => setCreationMethod('blank')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-center items-center text-center gap-2 ${
                    creationMethod === 'blank' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 bg-white'
                  }`}
                >
                  <FileText size={24} className={creationMethod === 'blank' ? 'text-primary' : 'text-slate-400'} />
                  <div>
                    <div className="font-bold text-slate-800">En Blanco</div>
                    <div className="text-xs text-slate-500 mt-1">Comenzar desde cero sin partidas</div>
                  </div>
                  {creationMethod === 'blank' && <CheckCircle size={16} className="text-primary absolute top-4 right-4" />}
                </div>

                <div
                  onClick={() => setCreationMethod('template')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-center items-center text-center gap-2 ${
                    creationMethod === 'template' ? 'border-secondary bg-secondary/5' : 'border-slate-200 hover:border-secondary/50 bg-white'
                  }`}
                >
                  <Copy size={24} className={creationMethod === 'template' ? 'text-secondary' : 'text-slate-400'} />
                  <div>
                    <div className="font-bold text-slate-800">Desde Plantilla</div>
                    <div className="text-xs text-slate-500 mt-1">Clonar una cotización guardada</div>
                  </div>
                  {creationMethod === 'template' && <CheckCircle size={16} className="text-secondary absolute top-4 right-4" />}
                </div>
              </div>

              {/* Step 3: Template Picker */}
              <AnimatePresence>
                {creationMethod === 'template' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8"
                  >
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-white text-xs">3</span>
                      Selecciona la Plantilla
                    </label>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                      {templates.length > 0 ? (
                        <div className="p-2 space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                          {templates.map(t => (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTemplateId(t.id)}
                              className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 border transition-colors ${
                                selectedTemplateId === t.id 
                                  ? 'border-secondary bg-secondary/10' 
                                  : 'border-transparent hover:bg-white hover:border-slate-200'
                              }`}
                            >
                              <FileText size={16} className={selectedTemplateId === t.id ? 'text-secondary' : 'text-slate-400'} />
                              <div className="flex-1">
                                <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                                {t.businessLine && <div className="text-xs text-slate-500 mt-0.5">{t.businessLine.name}</div>}
                              </div>
                              {selectedTemplateId === t.id && <CheckCircle size={16} className="text-secondary" />}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-sm text-slate-500">
                          <Copy size={32} className="mx-auto mb-3 opacity-20" />
                          No tienes plantillas guardadas.<br/>
                          <span className="text-xs mt-1 block">Puedes guardar plantillas desde cualquier cotización existente.</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Footer Actions */}
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedDeal || loading || (creationMethod === 'template' && !selectedTemplateId)}
              className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
              ) : (
                <>Crear Cotización</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
