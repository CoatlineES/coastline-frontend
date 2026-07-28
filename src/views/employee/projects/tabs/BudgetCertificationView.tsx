import React, { useState, useEffect } from 'react';
import { Project } from '../../../../services/types';
import { quotationsService } from '../../../../services/quotations.service';
import { Quotation, QuotationLine } from '../../../../types/quotation';
import { FileText, Save, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { CertificationPdfModal } from './CertificationPdfModal';

const InlineQtyEditor = ({ line, chapterId, budgetId, onUpdate }: { line: QuotationLine, chapterId: string, budgetId: string, onUpdate: () => void }) => {
  const [val, setVal] = useState(line.quantity || 0);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = async () => {
    if (val !== (line.quantity || 0)) {
      try {
        await quotationsService.updateLine(budgetId, chapterId, line.id!, { quantity: val });
        toast.success('Cantidad actualizada');
        onUpdate();
      } catch (e) {
        toast.error('Error al actualizar');
        setVal(line.quantity || 0);
      }
    }
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div 
        className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors" 
        onClick={() => setIsEditing(true)}
        title="Haz clic para editar la cantidad ejecutada"
      >
        {line.quantity || 0}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <input 
        type="number" 
        value={val} 
        autoFocus
        onChange={(e) => setVal(parseFloat(e.target.value) || 0)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        onBlur={handleSave}
        className="w-20 text-right border border-blue-400 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
};

interface BudgetCertificationViewProps {
  project: Project;
  plan?: any; // Kept for prop compatibility if needed, but unused
}

export function BudgetCertificationView({ project }: BudgetCertificationViewProps) {
  const [baseQuotation, setBaseQuotation] = useState<Quotation | null>(null);
  const [budgetQuotation, setBudgetQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    loadQuotations();
  }, [project.id]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      // 1. Fetch base quotation (ACCEPTED or first)
      if (project.dealId) {
        const quotes = await quotationsService.getAll({ dealId: project.dealId });
        const accepted = quotes.find((q: Quotation) => ['ACCEPTED', 'WON', 'SIGNED'].includes(q.status)) || quotes[0];
        setBaseQuotation(accepted || null);
      }
      
      // 2. Fetch budget quotation
      if (project.budgetQuotationId) {
        const budget = await quotationsService.getById(project.budgetQuotationId);
        setBudgetQuotation(budget);
      }
    } catch (error) {
      console.error('Error loading quotations for certification', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-slate-400">Cargando datos de certificación...</div>;
  }

  if (!baseQuotation) {
    return (
      <div className="flex items-center justify-center h-full flex-col text-slate-500 bg-slate-50 p-8 rounded-xl text-center">
        <FileText size={48} className="text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">No hay Cotización Base</h3>
        <p className="mt-2 text-sm max-w-md">
          Este proyecto no tiene una cotización asociada o aceptada, por lo que no es posible generar el documento comparativo de certificación.
        </p>
      </div>
    );
  }

  if (!budgetQuotation) {
    return (
      <div className="flex items-center justify-center h-full flex-col text-slate-500 bg-slate-50 p-8 rounded-xl text-center">
        <FileText size={48} className="text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">No hay Presupuesto</h3>
        <p className="mt-2 text-sm max-w-md">
          Debes inicializar el presupuesto desde la pestaña de Edición antes de poder ver la certificación.
        </p>
      </div>
    );
  }

  // Mapa de líneas del presupuesto indexadas por originalLineId
  const budgetLineMap = new Map<string, QuotationLine>();
  budgetQuotation.chapters?.forEach(ch => {
    ch.lines?.forEach(line => {
      // Usar originalLineId si está mapeado en el backend, o fallback por ID si por casualidad coincidiera
      const key = (line as any).originalLineId || line.id;
      budgetLineMap.set(key, line);
      
      // Mapear también los hijos
      line.children?.forEach(child => {
        const childKey = (child as any).originalLineId || child.id;
        budgetLineMap.set(childKey, child);
      });
    });
  });

  const getLineTotal = (line: any, allLines: any[]) => {
    if (line.isApu || line.isGroup) {
      const children = allLines.filter((cl: any) => cl.parentId === line.id);
      const baseCost = children.reduce((sum: number, cl: any) => sum + ((cl.quantity || 1) * (cl.unitPrice || 0)), 0);
      const computedUnitPrice = line.isApu ? baseCost * (1 + (line.margin || 0) / 100) : baseCost;
      return (line.quantity || 1) * computedUnitPrice;
    }
    return (line.quantity || 1) * (line.unitPrice || 0);
  };

  // Totales
  let totalQuoted = 0;
  let totalBudget = 0;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* HEADER */}
      <div className="bg-white p-6 border-b border-slate-200 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-[#002D5A]">Certificación vs Cotización</h2>
            <p className="text-sm text-slate-500 mt-1">
              Comparativa entre lo previsto y el Presupuesto de Ejecución.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors shadow-sm"
              onClick={() => setIsPdfModalOpen(true)}
            >
              <Eye size={16} />
              Vista Previa
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-[#002D5A] text-white rounded-lg text-sm font-medium hover:bg-[#002D5A]/90 transition-colors shadow-sm"
              onClick={() => setIsPdfModalOpen(true)}
            >
              <FileText size={16} />
              Exportar a PDF
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#002D5A] text-white">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg" rowSpan={2}>Capítulo / Concepto</th>
                <th className="px-4 py-3 font-semibold text-center" rowSpan={2}>Unidad</th>
                <th className="px-4 py-2 font-semibold text-center border-b border-white/20" colSpan={3}>Previsto (Cotización Base)</th>
                <th className="px-4 py-2 font-semibold text-center border-b border-white/20 border-l border-white/20" colSpan={3}>Real (Presupuesto)</th>
                <th className="px-4 py-3 font-semibold text-right rounded-tr-lg border-l border-white/20" rowSpan={2}>Desviación (€)</th>
              </tr>
              <tr>
                <th className="px-3 py-2 font-medium text-right text-blue-100 bg-blue-900/30">Cant.</th>
                <th className="px-3 py-2 font-medium text-right text-blue-100 bg-blue-900/30">Precio U.</th>
                <th className="px-3 py-2 font-medium text-right text-blue-100 bg-blue-900/30">Total</th>
                
                <th className="px-3 py-2 font-medium text-right text-emerald-100 bg-emerald-900/30 border-l border-white/20">Cant.</th>
                <th className="px-3 py-2 font-medium text-right text-emerald-100 bg-emerald-900/30">Precio U.</th>
                <th className="px-3 py-2 font-medium text-right text-emerald-100 bg-emerald-900/30">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {baseQuotation.chapters?.map((chapter: any) => {
                let chapterQuotedTotal = 0;
                let chapterBudgetTotal = 0;

                const linesOutput = chapter.lines?.map((line: any) => {
                  // Si es APU, mostramos el padre, no los componentes, para que concuerde.
                  if (line.parentId) return null; 
                  
                  const qQty = line.quantity || 1;
                  const qTotal = getLineTotal(line, chapter.lines);
                  const qPrice = qTotal / qQty;

                  // Find matching budget line
                  const bLine = budgetLineMap.get(line.id);
                  const bQty = bLine?.quantity ?? 0;
                  const bTotal = bLine ? getLineTotal(bLine, budgetQuotation.chapters.flatMap((c: any) => c.lines)) : 0;
                  const bPrice = bLine && bQty > 0 ? bTotal / bQty : (bLine?.unitPrice ?? 0);
                  
                  const variance = bTotal - qTotal;

                  chapterQuotedTotal += qTotal;
                  chapterBudgetTotal += bTotal;

                  return (
                    <tr key={line.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 pl-8 text-slate-700">
                        {line.concept}
                        {!bLine && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Eliminado en PPT</span>}
                      </td>
                      <td className="px-4 py-2 text-center text-slate-500">{line.unit || 'Ud'}</td>
                      
                      {/* Cotizado */}
                      <td className="px-3 py-2 text-right text-slate-600 bg-slate-50/50">{qQty}</td>
                      <td className="px-3 py-2 text-right text-slate-600 bg-slate-50/50">{qPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right font-medium text-slate-700 bg-slate-50/50">{qTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      
                      {/* Presupuestado */}
                      <td className="px-3 py-1 text-right text-slate-600 border-l border-slate-200">
                        {bLine ? (
                          <InlineQtyEditor line={bLine} chapterId={bLine.chapterId!} budgetId={budgetQuotation!.id} onUpdate={loadQuotations} />
                        ) : '-'}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">{bLine ? bPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                      <td className="px-3 py-2 text-right font-medium text-slate-700">{bLine ? bTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                      
                      {/* Varianza */}
                      <td className={`px-4 py-2 text-right font-bold border-l border-slate-200 ${variance > 0 ? 'text-emerald-500' : variance < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        {variance > 0 ? '+' : ''}{variance === 0 && !bLine ? '-' : variance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                });

                totalQuoted += chapterQuotedTotal;
                totalBudget += chapterBudgetTotal;
                const chapterVariance = chapterBudgetTotal - chapterQuotedTotal;

                return (
                  <React.Fragment key={chapter.id}>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-200">
                      <td colSpan={2} className="px-4 py-3 text-[#002D5A] uppercase">{chapter.title}</td>
                      <td colSpan={2} className="bg-slate-200/50"></td>
                      <td className="px-3 py-3 text-right text-[#002D5A] bg-slate-200/50">{chapterQuotedTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      <td colSpan={2} className="border-l border-slate-300"></td>
                      <td className="px-3 py-3 text-right text-[#002D5A]">{chapterBudgetTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      <td className={`px-4 py-3 text-right border-l border-slate-300 ${chapterVariance > 0 ? 'text-emerald-600' : chapterVariance < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                        {chapterVariance > 0 ? '+' : ''}{chapterVariance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    {linesOutput}
                  </React.Fragment>
                );
              })}

              {/* Added Lines (Presentes en Budget pero no en Base) */}
              {budgetQuotation.chapters?.map((bChapter: any) => {
                const addedLines = bChapter.lines?.filter((bLine: any) => !bLine.parentId && !(bLine as any).originalLineId) || [];
                if (addedLines.length === 0) return null;

                return addedLines.map((bLine: any) => {
                  const bQty = bLine.quantity || 1;
                  const bTotal = getLineTotal(bLine, bChapter.lines);
                  const bPrice = bQty > 0 ? bTotal / bQty : (bLine.unitPrice || 0);
                  
                  totalBudget += bTotal;

                  return (
                    <tr key={bLine.id} className="hover:bg-slate-50 bg-orange-50/30">
                      <td className="px-4 py-2 pl-8 text-slate-700">
                        {bLine.concept}
                        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Nuevo en PPT</span>
                      </td>
                      <td className="px-4 py-2 text-center text-slate-500">{bLine.unit || 'Ud'}</td>
                      
                      <td className="px-3 py-2 text-right text-slate-400 bg-slate-50/50">-</td>
                      <td className="px-3 py-2 text-right text-slate-400 bg-slate-50/50">-</td>
                      <td className="px-3 py-2 text-right font-medium text-slate-400 bg-slate-50/50">-</td>
                      
                      <td className="px-3 py-1 text-right text-slate-600 border-l border-slate-200">
                        <InlineQtyEditor line={bLine} chapterId={bLine.chapterId!} budgetId={budgetQuotation!.id} onUpdate={loadQuotations} />
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">{bPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right font-medium text-slate-700">{bTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      
                      <td className="px-4 py-2 text-right font-bold border-l border-slate-200 text-emerald-500">
                        +{bTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
            <tfoot className="bg-slate-800 text-white border-t-4 border-slate-400">
              <tr>
                <td colSpan={2} className="px-4 py-4 font-bold text-lg">TOTAL PROYECTO</td>
                <td colSpan={2}></td>
                <td className="px-3 py-4 text-right font-bold text-lg">{totalQuoted.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                <td colSpan={2}></td>
                <td className="px-3 py-4 text-right font-bold text-lg text-emerald-400">{totalBudget.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                <td className={`px-4 py-4 text-right font-bold text-lg ${totalBudget - totalQuoted > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalBudget - totalQuoted > 0 ? '+' : ''}{(totalBudget - totalQuoted).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Resumen de Presupuesto / Certificaciones */}
        <div className="mt-8 mx-auto w-full max-w-4xl">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Resumen por Capítulos (Presupuesto)</h3>
            <div className="space-y-3 mb-6">
              {budgetQuotation.chapters.map((ch: any) => {
                const chTotal = ch.lines.filter((l: any) => !l.parentId).reduce((a: number, l: any) => a + getLineTotal(l, ch.lines), 0);
                const isExtra = ch.title.toLowerCase().includes('extra') || ch.title.toLowerCase().includes('no contemplada');
                return (
                  <div key={ch.id} className="flex justify-between items-center text-sm">
                    <div className={`font-medium flex items-center gap-2 ${isExtra ? 'text-[#002D5A]' : 'text-slate-700'}`}>
                      {isExtra && <span className="text-[#002D5A]">✨</span>}
                      {ch.title} {isExtra && <span className="text-xs text-slate-400 font-normal">(EXTRA)</span>}
                    </div>
                    <div className="text-slate-600">{chTotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                  </div>
                );
              })}
            </div>
            
            {(() => {
              const originalAmount = totalQuoted;
              const subtotal = totalBudget;
              const extras = subtotal - originalAmount;
              const deviation = originalAmount > 0 ? (extras / originalAmount) * 100 : 0;
              
              const taxRate = budgetQuotation.taxRate || 21;
              const tax = subtotal * (taxRate / 100);
              const total = subtotal + tax;
              
              return (
                <div className="border-t border-slate-100 pt-6">
                  <div className="max-w-md ml-auto space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Presupuesto contratado original</span>
                      <span className="font-medium text-slate-800">{originalAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                      <span className="text-slate-600 flex items-center gap-1">✨ Partidas extras</span>
                      <span className={`font-medium ${extras >= 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {extras > 0 ? '+' : ''}{extras.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-base pt-1">
                      <span className="font-bold text-slate-800">Subtotal vigente (sin IVA)</span>
                      <span className="font-bold text-slate-800">{subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pb-2">
                      <span className="text-slate-400">Desviación sobre presupuesto inicial</span>
                      <span className="text-slate-400">+{deviation.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                      <span className="text-slate-500">Impuestos (IVA {taxRate}%)</span>
                      <span className="font-medium text-slate-700">{tax.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-800 text-lg">Total presupuesto vigente (con IVA)</span>
                      <span className="font-black text-slate-900 text-xl">{total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <CertificationPdfModal 
        isOpen={isPdfModalOpen} 
        onClose={() => setIsPdfModalOpen(false)} 
        project={project} 
        baseQuotation={baseQuotation} 
        budgetQuotation={budgetQuotation} 
      />
    </div>
  );
}
