import React, { useState } from 'react';
import { FileText, X, Download } from 'lucide-react';
import { Quotation } from '../../../../types/quotation';
import { Project } from '../../../../services/types';
import api from '../../../../services/api';

interface CertificationPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  baseQuotation: Quotation;
  budgetQuotation: Quotation;
}

export function CertificationPdfModal({ isOpen, onClose, project, baseQuotation, budgetQuotation }: CertificationPdfModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportPDF = async () => {
    const element = document.getElementById('pdf-preview-content');
    if (!element) return;

    setIsExporting(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; background-color: white; margin: 0; padding: 0; }
            .break-before-page { break-before: page; }
            .break-inside-avoid { break-inside: avoid; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body class="bg-white">
          <div style="width: 1123px; margin: 0 auto; position: relative; padding: 20px;">
            ${element.outerHTML}
          </div>
        </body>
        </html>
      `;

      const response = await api.post('/projects/generate-pdf', {
        html: htmlContent,
        filename: `Certificacion_${project.name}`,
        landscape: true
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificacion_${project.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Hubo un error al generar el PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const getLineTotal = (line: any, allLines: any[]) => {
    if (line.isApu || line.isGroup) {
      const children = allLines.filter((cl: any) => cl.parentId === line.id);
      const baseCost = children.reduce((sum: number, cl: any) => sum + ((cl.quantity || 1) * (cl.unitPrice || 0)), 0);
      const computedUnitPrice = line.isApu ? baseCost * (1 + (line.margin || 0) / 100) : baseCost;
      return (line.quantity || 1) * computedUnitPrice;
    }
    return (line.quantity || 1) * (line.unitPrice || 0);
  };

  let totalQuoted = 0;
  let totalBudget = 0;

  const budgetLineMap = new Map();
  budgetQuotation.chapters?.forEach((ch: any) => {
    ch.lines?.forEach((l: any) => {
      budgetLineMap.set(l.originalLineId || l.id, l);
    });
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-[#002D5A]" size={24} />
              Vista Previa: Certificación
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto bg-slate-100 p-8">
          <div className="bg-white shadow-xl w-[1123px] min-h-[794px] h-auto shrink-0 relative mx-auto">
            <div id="pdf-preview-content" className="p-10">
              
              <div className="mb-6 border-b-2 border-[#002D5A] pb-4 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-black text-[#002D5A] tracking-tight uppercase">Documento de Certificación</h1>
                  <p className="text-slate-500 mt-2 text-lg">{project.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Fecha de emisión</p>
                  <p className="font-semibold text-slate-800">{new Date().toLocaleDateString('es-ES')}</p>
                </div>
              </div>

              <table className="w-full text-xs text-left mb-6">
                <thead className="bg-[#002D5A] text-white">
                  <tr>
                    <th className="px-2 py-1.5 font-semibold" rowSpan={2}>Concepto</th>
                    <th className="px-1 py-1.5 font-semibold text-center" rowSpan={2}>Ud</th>
                    <th className="px-1 py-1 font-semibold text-center border-b border-white/20" colSpan={3}>Base</th>
                    <th className="px-1 py-1 font-semibold text-center border-b border-white/20 border-l border-white/20" colSpan={3}>Real</th>
                    <th className="px-2 py-1.5 font-semibold text-right border-l border-white/20" rowSpan={2}>Desv.</th>
                  </tr>
                  <tr>
                    <th className="px-1 py-1 font-medium text-right text-blue-100 bg-blue-900/30">Cant</th>
                    <th className="px-1 py-1 font-medium text-right text-blue-100 bg-blue-900/30">Precio</th>
                    <th className="px-1 py-1 font-medium text-right text-blue-100 bg-blue-900/30">Total</th>
                    <th className="px-1 py-1 font-medium text-right text-emerald-100 bg-emerald-900/30 border-l border-white/20">Cant</th>
                    <th className="px-1 py-1 font-medium text-right text-emerald-100 bg-emerald-900/30">Precio</th>
                    <th className="px-1 py-1 font-medium text-right text-emerald-100 bg-emerald-900/30">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {baseQuotation.chapters?.map((chapter: any) => {
                    let chapterQuotedTotal = 0;
                    let chapterBudgetTotal = 0;

                    const linesOutput = chapter.lines?.map((line: any) => {
                      if (line.parentId) return null; 
                      
                      const qQty = line.quantity || 1;
                      const qTotal = getLineTotal(line, chapter.lines);
                      const qPrice = qTotal / qQty;

                      const bLine = budgetLineMap.get(line.id);
                      const bQty = bLine?.quantity ?? 0;
                      const bTotal = bLine ? getLineTotal(bLine, budgetQuotation.chapters.flatMap((c: any) => c.lines)) : 0;
                      const bPrice = bLine && bQty > 0 ? bTotal / bQty : (bLine?.unitPrice ?? 0);
                      
                      const variance = bTotal - qTotal;
                      chapterQuotedTotal += qTotal;
                      chapterBudgetTotal += bTotal;

                      return (
                        <tr key={line.id}>
                          <td className="px-2 py-1 pl-4 text-slate-700 truncate max-w-[150px]">{line.concept}</td>
                          <td className="px-1 py-1 text-center text-slate-500">{line.unit || 'Ud'}</td>
                          
                          <td className="px-1 py-1 text-right text-slate-600 bg-slate-50/50">{qQty}</td>
                          <td className="px-1 py-1 text-right text-slate-600 bg-slate-50/50">{qPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                          <td className="px-1 py-1 text-right font-medium text-slate-700 bg-slate-50/50">{qTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                          
                          <td className="px-1 py-1 text-right text-slate-600 border-l border-slate-200">{bQty}</td>
                          <td className="px-1 py-1 text-right text-slate-600">{bLine ? bPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                          <td className="px-1 py-1 text-right font-medium text-slate-700">{bLine ? bTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                          
                          <td className="px-2 py-1 text-right font-bold border-l border-slate-200">
                            {variance > 0 ? '+' : ''}{variance === 0 && !bLine ? '-' : variance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    });

                    totalQuoted += chapterQuotedTotal;
                    totalBudget += chapterBudgetTotal;

                    return (
                      <React.Fragment key={chapter.id}>
                        <tr className="bg-slate-100 font-bold border-t border-slate-300">
                          <td colSpan={2} className="px-2 py-1.5 text-[#002D5A] uppercase">{chapter.title}</td>
                          <td colSpan={2} className="bg-slate-200/50"></td>
                          <td className="px-1 py-1.5 text-right text-[#002D5A] bg-slate-200/50">{chapterQuotedTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                          <td colSpan={2} className="border-l border-slate-300"></td>
                          <td className="px-1 py-1.5 text-right text-[#002D5A]">{chapterBudgetTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                          <td className="px-2 py-1.5 text-right border-l border-slate-300"></td>
                        </tr>
                        {linesOutput}
                      </React.Fragment>
                    );
                  })}
                  
                  {budgetQuotation.chapters?.map((bChapter: any) => {
                    const addedLines = bChapter.lines?.filter((bLine: any) => !bLine.parentId && !(bLine as any).originalLineId) || [];
                    if (addedLines.length === 0) return null;

                    return addedLines.map((bLine: any) => {
                      const bQty = bLine.quantity || 1;
                      const bTotal = getLineTotal(bLine, bChapter.lines);
                      const bPrice = bQty > 0 ? bTotal / bQty : (bLine.unitPrice || 0);
                      totalBudget += bTotal;

                      return (
                        <tr key={bLine.id} className="bg-orange-50/30">
                          <td className="px-2 py-1 pl-4 text-slate-700 truncate max-w-[150px]">{bLine.concept} (Nuevo)</td>
                          <td className="px-1 py-1 text-center text-slate-500">{bLine.unit || 'Ud'}</td>
                          <td className="px-1 py-1 text-right text-slate-400 bg-slate-50/50">-</td>
                          <td className="px-1 py-1 text-right text-slate-400 bg-slate-50/50">-</td>
                          <td className="px-1 py-1 text-right text-slate-400 bg-slate-50/50">-</td>
                          <td className="px-1 py-1 text-right text-slate-600 border-l border-slate-200">{bQty}</td>
                          <td className="px-1 py-1 text-right text-slate-600">{bPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                          <td className="px-1 py-1 text-right font-medium text-slate-700">{bTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                          <td className="px-2 py-1 text-right font-bold border-l border-slate-200 text-red-500">
                            +{bTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
                <tfoot className="bg-[#002D5A] text-white border-t-[3px] border-slate-300">
                  <tr>
                    <td colSpan={2} className="px-2 py-2.5 font-bold uppercase tracking-wider">TOTAL PROYECTO</td>
                    <td colSpan={2}></td>
                    <td className="px-1 py-2.5 text-right font-bold">{totalQuoted.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                    <td colSpan={2}></td>
                    <td className="px-1 py-2.5 text-right font-bold text-emerald-300">{totalBudget.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                    <td className={`px-2 py-2.5 text-right font-bold ${totalBudget - totalQuoted > 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                      {totalBudget - totalQuoted > 0 ? '+' : ''}{(totalBudget - totalQuoted).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* SUMMARY */}
              <div className="mt-6 mx-auto w-full break-inside-avoid text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                  <h3 className="font-bold text-slate-500 mb-3 uppercase tracking-wider">Resumen por Capítulos</h3>
                  <div className="space-y-2 mb-4">
                    {budgetQuotation.chapters.map((ch: any) => {
                      const chTotal = ch.lines.filter((l: any) => !l.parentId).reduce((a: number, l: any) => a + getLineTotal(l, ch.lines), 0);
                      const isExtra = ch.title.toLowerCase().includes('extra') || ch.title.toLowerCase().includes('no contemplada');
                      return (
                        <div key={ch.id} className="flex justify-between items-center">
                          <div className={`font-medium flex items-center gap-1 ${isExtra ? 'text-[#002D5A]' : 'text-slate-700'}`}>
                            {isExtra && <span>✨</span>}
                            {ch.title} {isExtra && <span className="text-[10px] text-slate-400 font-normal">(EXTRA)</span>}
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
                      <div className="border-t border-slate-200 pt-4">
                        <div className="ml-auto w-2/3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Presupuesto contratado original</span>
                            <span className="font-medium text-slate-800">{originalAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-slate-600 flex items-center gap-1">✨ Partidas extras</span>
                            <span className={`font-medium ${extras >= 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                              {extras > 0 ? '+' : ''}{extras.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center font-bold text-sm pt-1">
                            <span className="text-slate-700">Subtotal vigente (sin IVA)</span>
                            <span className="text-slate-900">{subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-slate-500">
                            <span>Desviación (%)</span>
                            <span className={`font-bold ${deviation > 0 ? 'text-red-500' : deviation < 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                              {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-100">
                            <span>IVA ({taxRate}%)</span>
                            <span>{tax.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                          </div>
                          
                          <div className="flex justify-between items-center font-black text-[#002D5A] text-lg pt-1">
                            <span>TOTAL</span>
                            <span>{total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">
            Cerrar
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2 bg-[#002D5A] text-white rounded-lg font-medium hover:bg-[#002D5A]/90 transition-colors shadow-sm disabled:opacity-70"
          >
            {isExporting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Generando PDF...</>
            ) : (
              <><Download size={18} /> Exportar PDF</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
