import React from 'react';
import { Project, ProjectCertification } from '../../types';

interface CertificationDocumentProps {
  project: any;
  baseQuotation: any;
  budgetQuotation: any;
  activeCertification: any;
  previousCertifications: any[];
  currentCertLines: Map<string, number>;
}

export function CertificationDocument({
  project,
  baseQuotation,
  budgetQuotation,
  activeCertification,
  previousCertifications,
  currentCertLines
}: CertificationDocumentProps) {

  const getLineTotal = (line: any, allLines: any[]) => {
    if (line.isApu || line.isGroup) {
      const children = allLines.filter((cl: any) => cl.parentId === line.id);
      const baseCost = children.reduce((sum: number, cl: any) => sum + ((cl.quantity || 1) * (cl.unitPrice || 0)), 0);
      const computedUnitPrice = line.isApu ? baseCost * (1 + (line.margin || 0) / 100) : baseCost;
      return (line.quantity || 1) * computedUnitPrice;
    }
    return (line.quantity || 1) * (line.unitPrice || 0);
  };

  const getPreviousCertifiedQty = (lineId: string) => {
    let total = 0;
    previousCertifications.forEach(cert => {
      const lineCert = cert.lines.find((l: any) => l.quotationLineId === lineId || l.originalLineId === lineId);
      if (lineCert) {
        total += lineCert.quantity;
      }
    });
    return total;
  };

  // Determinar líneas base vs extra
  const baseLineIds = new Set<string>();
  baseQuotation?.chapters?.forEach((ch: any) => {
    ch.lines?.forEach((l: any) => {
      baseLineIds.add(l.originalLineId || l.id);
    });
  });

  const baseChapters: any[] = [];
  const extraLines: { line: any, allLines: any[] }[] = [];
  
  budgetQuotation?.chapters?.forEach((ch: any) => {
    const chapterBaseLines: any[] = [];
    ch.lines?.forEach((line: any) => {
      if (line.parentId) return;
      const isBase = baseLineIds.has(line.originalLineId || line.id);
      if (isBase) {
        chapterBaseLines.push(line);
      } else {
        extraLines.push({ line, allLines: ch.lines });
      }
    });
    if (chapterBaseLines.length > 0) {
      baseChapters.push({ ...ch, filteredLines: chapterBaseLines, originalLines: ch.lines });
    }
  });

  let totalBasePresupuesto = 0;
  let totalBaseCertificado = 0;
  let totalAnteriorBase = 0;
  let totalExtraCertificado = 0;
  let totalAnteriorExtra = 0;

  // Pre-calcular los totales para evitar problemas con la renderización de React
  baseChapters.forEach(ch => {
    ch.filteredLines.forEach((l: any) => {
      const bQty = l.quantity || 1;
      const bTotal = getLineTotal(l, ch.originalLines);
      const bPrice = bTotal / bQty;
      
      const prevQty = getPreviousCertifiedQty(l.id);
      const prevTotal = prevQty * bPrice;
      
      const currQty = currentCertLines.get(l.id) || 0;
      const currTotal = currQty * bPrice;
      
      totalBasePresupuesto += bTotal;
      totalAnteriorBase += prevTotal;
      totalBaseCertificado += currTotal;
    });
  });

  extraLines.forEach(extra => {
    const l = extra.line;
    const bQty = l.quantity || 1;
    const bTotal = getLineTotal(l, extra.allLines);
    const bPrice = bTotal / bQty;
    
    const prevQty = getPreviousCertifiedQty(l.id);
    const prevTotal = prevQty * bPrice;
    
    const currQty = currentCertLines.get(l.id) || 0;
    const currTotal = currQty * bPrice;
    
    totalAnteriorExtra += prevTotal;
    totalExtraCertificado += currTotal;
  });

  const renderTableHeaders = () => (
    <thead className="text-[9px] text-slate-100 bg-[#002D5A]">
      <tr>
        <th rowSpan={2} className="py-2 text-left font-bold uppercase w-[25%] pl-3 border-r border-[#004080]">Capítulo / Concepto</th>
        <th rowSpan={2} className="py-2 text-center font-bold uppercase border-r border-[#004080]">Ud</th>
        <th colSpan={3} className="py-1 text-center font-bold uppercase border-r border-[#004080]">Presupuesto</th>
        {previousCertifications.length > 0 && (
          <th colSpan={2} className="py-1 text-center font-bold uppercase border-r border-[#004080]">A Origen (Anterior)</th>
        )}
        <th colSpan={2} className="py-1 text-center font-bold uppercase bg-blue-600 border-r border-blue-500">A Certificar (Actual)</th>
        <th colSpan={3} className="py-1 text-center font-bold uppercase">Total Acumulado</th>
      </tr>
      <tr className="border-t border-[#004080]">
        {/* Presupuesto */}
        <th className="py-1 text-center font-bold border-r border-[#004080]">Cant.</th>
        <th className="py-1 text-right font-bold border-r border-[#004080] pr-1">Precio U.</th>
        <th className="py-1 text-right font-bold border-r border-[#004080] pr-2">Total</th>
        {/* A Origen */}
        {previousCertifications.length > 0 && (
          <>
            <th className="py-1 text-center font-bold border-r border-[#004080]">Cant.</th>
            <th className="py-1 text-right font-bold border-r border-[#004080] pr-2">Total</th>
          </>
        )}
        {/* A Certificar (Actual) */}
        <th className="py-1 text-center font-bold bg-blue-600 border-r border-blue-500">Cant.</th>
        <th className="py-1 text-right font-bold bg-blue-600 border-r border-blue-500 pr-2">Total</th>
        {/* Acumulado */}
        <th className="py-1 text-center font-bold border-r border-[#004080]">Cant.</th>
        <th className="py-1 text-right font-bold border-r border-[#004080] pr-2">Total</th>
        <th className="py-1 text-center font-bold">%</th>
      </tr>
    </thead>
  );

  const renderLineRow = (line: any, allLines: any[], isExtra = false) => {
    const bQty = line.quantity || 1;
    const bTotal = getLineTotal(line, allLines);
    const bPrice = bTotal / bQty;

    const prevQty = getPreviousCertifiedQty(line.id);
    const prevTotal = prevQty * bPrice;

    const currQty = currentCertLines.get(line.id) || 0;
    const currTotal = currQty * bPrice;

    const accQty = prevQty + currQty;
    const accTotal = accQty * bPrice;
    const percent = bQty > 0 ? (accQty / bQty) * 100 : 0;

    return (
      <tr key={line.id} className="border-b border-slate-100 text-[9px] break-inside-avoid align-top">
        <td className="py-2 pl-3 pr-2 text-slate-700">
          <div className="font-semibold">{line.concept.toUpperCase()}</div>
          {line.description && <div className="text-slate-500 mt-1 leading-tight text-[8px]">{line.description}</div>}
        </td>
        <td className="py-2 text-center text-slate-600">{line.unit || 'Ud'}</td>
        
        {/* Presupuesto */}
        <td className="py-2 text-center text-slate-600 bg-slate-50/50">{isExtra ? '—' : bQty.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
        <td className="py-2 text-right text-slate-600 bg-slate-50/50 pr-1">{bPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
        <td className="py-2 text-right font-semibold text-slate-700 bg-slate-50/50 pr-2">{isExtra ? '—' : bTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
        
        {/* A Origen (Anterior) */}
        {previousCertifications.length > 0 && (
          <>
            <td className="py-2 text-center text-slate-500">{prevQty > 0 ? prevQty.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '—'}</td>
            <td className="py-2 text-right text-slate-500 pr-2">{prevQty > 0 ? prevTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '—'}</td>
          </>
        )}
        
        {/* A Certificar (Actual) */}
        <td className="py-2 text-center font-bold text-blue-700 bg-blue-50/50">{currQty > 0 ? currQty.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '0'}</td>
        <td className="py-2 text-right font-bold text-blue-700 bg-blue-50/50 pr-2">{currQty > 0 ? currTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '—'}</td>
        
        {/* Acumulado */}
        <td className="py-2 text-center font-bold text-emerald-700">{accQty > 0 ? accQty.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '—'}</td>
        <td className="py-2 text-right font-bold text-emerald-700 pr-2">{accTotal > 0 ? accTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '—'}</td>
        <td className="py-2 text-center font-bold text-emerald-700">{isExtra ? 'Extra' : `${percent.toFixed(0)}%`}</td>
      </tr>
    );
  };

  return (
    <div className="bg-white shadow-xl w-[794px] min-h-[1123px] h-auto shrink-0 relative mx-auto font-sans text-slate-800">
      <div id="pdf-preview-content" className="p-[40px]">
        {/* HEADER PDF */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="mb-2">
              <img src={`${window.location.origin}/images/logo.png`} alt="Coatline Logo" className="h-10 object-contain" />
            </div>
          </div>
          <div className="border border-slate-800 px-4 py-2 text-[10px] font-bold tracking-widest uppercase">
            INFORME DE OBRA
          </div>
        </div>

        {/* TÍTULO Y METADATOS */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-4">{activeCertification.name}</h1>
          <div className="inline-block bg-pink-100 text-pink-900 text-[10px] font-bold px-3 py-1 mb-8 uppercase tracking-wider">
            CERTIFICACIÓN PARCIAL DE OBRA
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-[10px] mb-8 border-b border-slate-200 pb-8">
            <div>
              <div className="text-slate-400 font-medium tracking-wider mb-1">FECHA DE EMISIÓN</div>
              <div className="font-bold">{activeCertification.date ? new Date(activeCertification.date).toLocaleDateString('es-ES') : ''}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium tracking-wider mb-1">TIPO</div>
              <div className="font-bold">Parcial</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium tracking-wider mb-1">CÓDIGO DE PROYECTO</div>
              <div className="font-bold">{activeCertification.projectCode || project?.deal?.number || '—'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium tracking-wider mb-1">EMPLAZAMIENTO</div>
              <div className="font-bold">
                {[activeCertification.projectAddress || project?.address, activeCertification.projectCity].filter(Boolean).join(', ') || project?.name || '—'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded p-4 text-[10px]">
              <div className="text-slate-400 font-medium tracking-wider mb-3">EMPRESA EJECUTORA</div>
              <div className="font-bold text-sm mb-1">Coatline SL</div>
              <div className="text-slate-600">CIF: B56572936</div>
              <div className="text-slate-600">Calle Resina 35, Nave 7, 28001, Madrid</div>
            </div>
            <div className="border border-slate-200 rounded p-4 text-[10px]">
              <div className="text-slate-400 font-medium tracking-wider mb-3">PROPIEDAD / CLIENTE</div>
              <div className="font-bold text-sm mb-1">{activeCertification.clientName || project?.account?.name || '—'}</div>
              <div className="text-slate-600">CIF: {activeCertification.clientCif || project?.account?.cif || '—'}</div>
              <div className="text-slate-600">{activeCertification.clientAddress || project?.account?.address || ''}</div>
            </div>
          </div>
        </div>

        {/* 1. INTRODUCCIÓN */}
        {activeCertification.introduction && (
          <div className="mb-10">
            <h2 className="text-sm font-bold tracking-widest mb-4 border-b border-slate-800 pb-2">1. INTRODUCCIÓN</h2>
            <div className="text-[10px] text-slate-700 whitespace-pre-wrap leading-relaxed">
              {activeCertification.introduction}
            </div>
          </div>
        )}

        {/* 3. MEDICIONES CERTIFICADAS */}
        <div className="break-before-page pt-4">
          <h2 className="text-sm font-bold tracking-widest mb-4 border-b border-slate-800 pb-2">3. MEDICIONES CERTIFICADAS</h2>
          
          {baseChapters.map((chapter) => (
            <div key={chapter.id} className="mb-8">
              <h3 className="text-[11px] font-bold text-slate-800 mb-2">{chapter.title?.toUpperCase()}</h3>
              <table className="w-full text-left border-collapse">
                {renderTableHeaders()}
                <tbody>
                  {chapter.filteredLines.map((line: any) => renderLineRow(line, chapter.originalLines, false))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="flex justify-between items-center text-[12px] font-bold bg-slate-50 p-3 mb-10">
            <div className="uppercase">SUBTOTAL PRESUPUESTO INICIAL</div>
            <div className="flex gap-12">
              <span>{totalBasePresupuesto.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
              <span>{totalBasePresupuesto > 0 ? ((totalBaseCertificado / totalBasePresupuesto) * 100).toFixed(0) : 0}%</span>
              <span>{totalBaseCertificado.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
            </div>
          </div>
        </div>

        {/* EXTRAS */}
        {extraLines.length > 0 && (
          <div className="mb-10">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
              <h2 className="text-sm font-bold tracking-widest text-slate-800">ACTIVIDADES NO CONTEMPLADAS EN PRESUPUESTO INICIAL</h2>
              <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">EXTRA / FUERA DE CONTRATO</span>
            </div>
            
            <table className="w-full text-left border-collapse">
              {renderTableHeaders()}
              <tbody>
                {extraLines.map((extra: any) => renderLineRow(extra.line, extra.allLines, true))}
              </tbody>
            </table>
            
            <div className="flex justify-between items-center text-[12px] font-bold mt-4 border-b-2 border-slate-800 pb-2">
              <div>SUBTOTAL ACTIVIDADES NO CONTEMPLADAS</div>
              <div className="flex gap-12">
                <span className="text-slate-500">—</span>
                <span>Extra</span>
                <span>{totalExtraCertificado.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>
          </div>
        )}

        {/* RESUMEN DE TOTALES */}
        <div className="mb-10 break-inside-avoid border border-slate-200 rounded p-6 bg-slate-50">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">RESUMEN DE CERTIFICACIÓN (SIN IVA)</h3>
          <div className="space-y-4">
            
            <div className="flex justify-between text-[11px]">
              <span className="w-1/3 uppercase text-slate-700">PRESUPUESTO BASE (CONTRATO)</span>
              <span className="w-2/3 text-right font-semibold">{totalBasePresupuesto.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
            </div>
            
            <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              <span className="w-1/3 uppercase">CERTIFICADO A ORIGEN (ANTERIOR)</span>
              <span className="w-2/3 text-right">{(totalAnteriorBase + totalAnteriorExtra).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
            </div>

            <div className="flex justify-between text-[11px] text-blue-700 pt-2 border-t border-slate-200">
              <span className="w-1/3 uppercase font-bold">A CERTIFICAR (ACTUAL)</span>
              <span className="w-2/3 text-right font-bold">{(totalBaseCertificado + totalExtraCertificado).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
            </div>

            <div className="flex justify-between text-[12px] font-bold pt-4 border-t-2 border-slate-800 text-emerald-800">
              <span className="w-1/3">TOTAL ACUMULADO A FECHA</span>
              <span className="w-2/3 text-right">
                {(totalAnteriorBase + totalAnteriorExtra + totalBaseCertificado + totalExtraCertificado).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                <span className="text-[10px] font-normal ml-2 opacity-80 text-slate-600">
                  ({totalBasePresupuesto > 0 ? (((totalAnteriorBase + totalAnteriorExtra + totalBaseCertificado + totalExtraCertificado) / totalBasePresupuesto) * 100).toFixed(1) : 0}% del contrato base)
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* TOTALES FINALES */}
        <div className="break-inside-avoid">
          {(() => {
            const taxRate = budgetQuotation?.taxRate || 21;
            const baseImponible = totalBaseCertificado + totalExtraCertificado;
            const taxAmount = baseImponible * (taxRate / 100);
            const grandTotal = baseImponible + taxAmount;
            
            return (
              <div className="text-[11px] mb-8 bg-slate-50 border border-slate-200 rounded">
                <div className="flex justify-between px-4 py-2 border-b border-slate-200">
                  <span>Base Imponible (Certificación Actual)</span>
                  <span className="font-bold">{baseImponible.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between px-4 py-2 border-b border-slate-200">
                  <span>IVA ({taxRate}%)</span>
                  <span className="font-bold">{taxAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between px-4 py-3 bg-slate-900 text-white font-bold text-[14px]">
                  <span>TOTAL A FACTURAR (IVA incluido)</span>
                  <span>{grandTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* 4. OBSERVACIONES */}
        {activeCertification.observations && (
          <div className="mb-8 break-inside-avoid">
            <h2 className="text-sm font-bold tracking-widest mb-4 border-b border-slate-800 pb-2">4. OBSERVACIONES</h2>
            <div className="text-[10px] text-slate-700 whitespace-pre-wrap leading-relaxed">
              {activeCertification.observations}
            </div>
          </div>
        )}

        {/* 5. CONCLUSIONES */}
        {activeCertification.conclusions && (
          <div className="mb-8 break-inside-avoid">
            <h2 className="text-sm font-bold tracking-widest mb-4 border-b border-slate-800 pb-2">5. CONCLUSIONES</h2>
            <div className="text-[10px] text-slate-700 whitespace-pre-wrap leading-relaxed">
              {activeCertification.conclusions}
            </div>
          </div>
        )}

        {/* 6. CONDICIONES DE PAGO */}
        {activeCertification.paymentConditions && (
          <div className="mb-10 break-inside-avoid">
            <h2 className="text-sm font-bold tracking-widest mb-4 border-b border-slate-800 pb-2">6. CONDICIONES DE PAGO</h2>
            <div className="text-[10px] text-slate-700 whitespace-pre-wrap leading-relaxed">
              {activeCertification.paymentConditions}
            </div>
          </div>
        )}

        {/* FIRMAS */}
        <div className="break-inside-avoid pt-8 border-t-2 border-slate-800">
          <h3 className="text-sm font-bold tracking-widest mb-8">FIRMAS</h3>
          <div className="flex justify-between items-end gap-12 text-[10px]">
            {/* Coatline Signature */}
            <div className="text-[#002D5A] w-72 flex flex-col items-center text-center">
              <img src={`${window.location.origin}/images/firma-coatline.png`} alt="Firma Coatline" className="h-24 object-contain mb-2" />
              <div className="w-full border-b border-dashed border-[#002D5A]/40 mb-3"></div>
              <div className="text-[11px] font-bold mb-0.5">Coatline SL · CIF B56572936</div>
              <div className="text-[10px] text-[#002D5A]/70">Calle Resina 35, Nave 7 · 28001 Madrid · Tel. 689 680 350</div>
              <div className="text-[10px] text-[#002D5A]/70">
                Certificación {activeCertification.name} · {project?.account?.name} · {new Date().toLocaleDateString('es-ES')}
              </div>
            </div>

            {/* Client Signature */}
            <div className="w-1/2 flex flex-col justify-end">
              <div className="font-bold text-slate-500 tracking-widest mb-4">CONFORMIDAD DE LA PROPIEDAD</div>
              {activeCertification.status === 'SIGNED' || activeCertification.clientSignature ? (
                <div className="flex flex-col">
                  <img 
                    src={activeCertification.clientSignature || ''} 
                    alt="Firma del Cliente" 
                    className="h-24 object-contain self-start mb-2 mix-blend-multiply" 
                  />
                  <div className="border-t border-dashed border-[#002D5A]/40 pt-2 text-slate-500 w-full">
                    <div className="font-bold text-slate-800 text-[11px] mb-0.5">{activeCertification.clientSignatoryName}</div>
                    <div className="text-[9px]">DNI: {activeCertification.clientSignatoryDni}</div>
                    <div className="text-[9px]">Fecha: {activeCertification.signedAt ? new Date(activeCertification.signedAt).toLocaleDateString('es-ES') : ''}</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-24 mb-2 flex items-center justify-center"></div>
                  <div className="border-t border-dashed border-[#002D5A]/40 pt-2 text-[10px] text-slate-500 w-full">
                    <div className="text-[11px] uppercase font-bold tracking-wider mb-1">Aceptación del Cliente</div>
                    <div>Firma y Sello</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Audit Trail (if signed) */}
        {(activeCertification.status === 'SIGNED' || activeCertification.clientSignature) && activeCertification.signatureHash && (
          <div className="page-break-before-always mt-12 pt-8 border-t-[3px] border-[#e63257]">
            <div className="border border-slate-200 bg-slate-50 p-8 rounded-lg text-[10px]">
              <h3 className="text-[#002D5A] font-bold uppercase tracking-wider text-xs mb-6 text-center border-b border-slate-200 pb-4">
                Certificado de Auditoría de Firma Electrónica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#002D5A]/80 mb-8">
                <div>
                  <div className="mb-2"><strong className="text-[#002D5A]">Firmante:</strong> {activeCertification.clientSignatoryName}</div>
                  <div className="mb-2"><strong className="text-[#002D5A]">DNI/NIF:</strong> {activeCertification.clientSignatoryDni}</div>
                  <div className="mb-2"><strong className="text-[#002D5A]">Fecha (UTC):</strong> {activeCertification.signedAt ? new Date(activeCertification.signedAt).toUTCString() : ''}</div>
                </div>
                <div>
                  <div className="mb-2"><strong className="text-[#002D5A]">Dirección IP:</strong> {activeCertification.clientIp || 'No registrada'}</div>
                  <div className="mb-2"><strong className="text-[#002D5A]">Dispositivo:</strong> {activeCertification.clientUserAgent || 'No registrado'}</div>
                </div>
                <div className="md:col-span-2 mt-2">
                  <strong className="text-[#002D5A]">Hash del Documento (SHA-256):</strong> 
                  <span className="block font-mono text-[10px] break-all bg-white p-2 border border-slate-200 rounded mt-2">{activeCertification.signatureHash}</span>
                </div>
              </div>
              <div className="text-center text-[9px] text-[#002D5A]/60 italic mt-6 border-t border-slate-200 pt-4">
                Este documento electrónico ha sido firmado digitalmente y su integridad está garantizada mediante un hash criptográfico SHA-256. 
                Cualquier modificación posterior invalidará la firma.
              </div>
            </div>
          </div>
        )}

        {/* FOOTER PÁGINA */}
        <div className="fixed bottom-10 left-10 right-10 text-center text-[8px] text-slate-400 border-t border-slate-200 pt-4 hidden print:block">
          Coatline SL · CIF B56572936 Calle Resina 35, Nave 7 · 28001 Madrid · Tel. 689 680 350
        </div>
      </div>
    </div>
  );
}
