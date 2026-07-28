import React, { useState } from 'react';
import { InspectionReport } from '../../../../../types/inspection-report';
import { Download, Loader2 } from 'lucide-react';
import api from '../../../../../services/api';

const COVER_STYLES = [
  { id: 'GENERIC', name: 'Portada Genérica', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop' },
  { id: 'WATERPROOFING', name: 'Portada Impermeabilización', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop' },
  { id: 'URBAN', name: 'Portada Informe Técnico Urbanización', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop' },
  { id: 'INSPECTION_ELD', name: 'Portada Inspección ELD', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop' },
  { id: 'MAINTENANCE', name: 'Portada Programa Mantenimiento', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=600&auto=format&fit=crop' },
  { id: 'REPAIR', name: 'Portada Reparación', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600&auto=format&fit=crop' }
];

interface ReportPreviewTabProps {
  report: InspectionReport;
}

export function ReportPreviewTab({ report }: ReportPreviewTabProps) {
  const [isExporting, setIsExporting] = useState(false);
  const activeCoverStyle = report.coverStyle || 'GENERIC';
  
  const getActiveCoverImage = () => {
    if (activeCoverStyle === 'CUSTOM' && report.customCoverUrl) return report.customCoverUrl;
    return COVER_STYLES.find(c => c.id === activeCoverStyle)?.image || COVER_STYLES[0].image;
  };

  const coverImage = getActiveCoverImage();

  // Calculos globales
  const totalZonas = report.zonesData?.length || 0;
  const m2Inspeccionados = report.zonesData?.reduce((acc, z) => acc + (Number(z.area) || 0), 0) || 0;
  const m2Reparar = report.zonesData?.reduce((acc, z) => {
    return acc + (Number(z.patologiasEquipo?.criticas?.area) || 0) + (Number(z.patologiasEquipo?.moderadas?.area) || 0);
  }, 0) || 0;
  
  const avgEstadoNum = totalZonas > 0 
    ? report.zonesData!.reduce((acc, z) => acc + (Number(z.tipologia?.estado) || 0), 0) / totalZonas
    : 0;
  const avgEstado = avgEstadoNum.toFixed(1);

  const fugasCriticas = report.zonesData?.reduce((acc, z) => acc + (Number(z.patologiasEquipo?.criticas?.num) || 0), 0) || 0;
  const fugasCriticasArea = report.zonesData?.reduce((acc, z) => acc + (Number(z.patologiasEquipo?.criticas?.area) || 0), 0) || 0;

  const fugasModeradas = report.zonesData?.reduce((acc, z) => acc + (Number(z.patologiasEquipo?.moderadas?.num) || 0), 0) || 0;
  const fugasModeradasArea = report.zonesData?.reduce((acc, z) => acc + (Number(z.patologiasEquipo?.moderadas?.area) || 0), 0) || 0;

  const fugasObservacion = report.zonesData?.reduce((acc, z) => acc + (Number(z.patologiasEquipo?.observacion?.num) || 0), 0) || 0;

  const getEstadoLabel = (est: number) => {
    if (est >= 4) return 'Bueno';
    if (est >= 3) return 'Regular';
    return 'Malo';
  };

  const isHtmlEmpty = (html?: string) => {
    if (!html) return true;
    const stripped = html.replace(/<[^>]+>/g, '').trim();
    // Consider empty if no text and no images
    return stripped.length === 0 && !html.includes('<img');
  };

  const PageHeader = () => (
    <div className="w-full text-center mb-12">
      <div className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mb-4">
        COATLINE · INFORME DE INSPECCIÓN
      </div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">
        {report.number} – {report.location || report.clientName || 'PROYECTO'}
      </h1>
      <div className="text-xs text-slate-500 flex justify-center gap-6">
        <span>{report.date ? new Date(report.date).toLocaleDateString('es-ES') : ''}</span>
        <span>Cliente: {report.clientName || 'Sin asignar'}</span>
      </div>
      <div className="w-full h-px bg-slate-200 mt-6"></div>
    </div>
  );

  const handleExportPDF = async () => {
    const element = document.getElementById('report-pdf-content');
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
            /* Estilos para el texto de Quill */
            .quill-content { word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; }
            .quill-content * { max-width: 100%; word-wrap: break-word; }
            .quill-content p { margin-bottom: 1em; white-space: pre-wrap; }
            .quill-content ul { list-style-type: disc; padding-left: 2em; margin-bottom: 1em; }
            .quill-content ol { list-style-type: decimal; padding-left: 2em; margin-bottom: 1em; }
            .quill-content strong { font-weight: bold; }
            .quill-content em { font-style: italic; }
            .quill-content h1, .quill-content h2, .quill-content h3 { font-weight: bold; margin-bottom: 0.5em; margin-top: 1em; line-height: 1.3; }
            .quill-content h1 { font-size: 1.5em; }
            .quill-content h2 { font-size: 1.25em; }
          </style>
        </head>
        <body class="bg-white">
          <div style="width: 794px; margin: 0 auto; position: relative;">
            ${element.outerHTML}
          </div>
        </body>
        </html>
      `;

      const response = await api.post('/projects/generate-pdf', {
        html: htmlContent,
        filename: `Informe_Tecnico_${report.number}`,
        format: 'A4',
        landscape: false
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Informe_Tecnico_${report.number}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error genering PDF', error);
      alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* HEADER CONTROLS */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Vista Previa del Documento</h2>
          <p className="text-sm text-slate-500">Revisa cómo quedará el PDF antes de exportarlo.</p>
        </div>
        <button
          id="btn-download-pdf"
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {isExporting ? 'Generando PDF...' : 'Descargar PDF'}
        </button>
      </div>

      {/* PREVIEW AREA */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100">
        <div id="report-pdf-content" className="w-[794px] bg-white shadow-xl origin-top" style={{ minHeight: '1123px' }}>
          
          {/* PAGE 1: COVER */}
          <div className="relative w-full h-[1123px] overflow-hidden bg-slate-900">
            <img src={coverImage} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
            
            <div className="absolute top-12 right-12 text-white/90 text-3xl font-light tracking-widest border-b border-white/50 pb-2">
              coatline
            </div>
            
            <div className="absolute left-12 bottom-20 text-white text-6xl font-bold tracking-widest -rotate-90 origin-bottom-left whitespace-nowrap">
              {report.coverTitle ? (
                report.coverTitle.split(' ').map((word, i) => (
                  <React.Fragment key={i}>
                    <span className={i === 0 ? "font-bold" : "font-light text-white/80"}>{word}</span>
                    {i < report.coverTitle!.split(' ').length - 1 && <br/>}
                  </React.Fragment>
                ))
              ) : (
                <>
                  PROPUESTA<br/>
                  <span className="font-light text-white/80">TÉCNICA</span>
                </>
              )}
            </div>

            <div className="absolute right-12 top-48 w-80 bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
              <div className="text-[10px] text-blue-800 font-bold tracking-widest mb-8 break-words">
                {report.coverSubtitle || 'INFORME TÉCNICO DE ESTANQUEIDAD'}
              </div>
              
              <div className="mb-6">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">PROYECTO</div>
                <div className="text-sm font-bold text-slate-800">{report.number}</div>
              </div>

              <div className="mb-6">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">UBICACIÓN</div>
                <div className="text-sm text-slate-600 break-words">{report.location || 'Sin especificar'}</div>
              </div>

              <div className="mb-6">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">FECHA</div>
                <div className="text-sm text-slate-600">{report.date ? new Date(report.date).toLocaleDateString('es-ES') : ''}</div>
              </div>

              <div className="mb-6">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">CLIENTE</div>
                <div className="text-sm text-slate-600 font-medium">{report.clientName || 'Sin asignar'}</div>
              </div>

              <div className="mt-12 border-t border-slate-200 pt-6">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">EMITIDO POR</div>
                <div className="flex items-end gap-1">
                  <div className="text-blue-800 font-medium text-lg border-b border-blue-800 leading-none">coatline</div>
                </div>
                <div className="text-[9px] text-slate-500 mt-2">Departamento Técnico</div>
              </div>
            </div>
          </div>

          {/* PAGE 2: INTRODUCTION */}
          {!isHtmlEmpty(report.introduction) && (
            <div className="break-before-page p-12">
              <PageHeader />
              <h2 className="text-xl font-bold text-slate-800 mb-6">Introducción</h2>
              <div 
                className="text-slate-700 text-[13px] leading-relaxed quill-content break-words"
                dangerouslySetInnerHTML={{ __html: report.introduction }}
              />
            </div>
          )}

          {/* PAGE 3: RESUMEN GLOBAL */}
          <div className="break-before-page p-12">
            <PageHeader />
            <h2 className="text-xl font-bold text-slate-800 mb-8">Resumen</h2>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
                <div className="text-2xl font-bold text-slate-800 mb-1">{totalZonas}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Zonas</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
                <div className="text-2xl font-bold text-slate-800 mb-1">{m2Inspeccionados > 0 ? m2Inspeccionados : '—'}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">m² inspeccionados</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
                <div className="text-2xl font-bold text-slate-800 mb-1">{m2Reparar.toString().replace('.', ',')}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">m² a reparar</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${avgEstadoNum >= 4 ? 'bg-emerald-500' : avgEstadoNum >= 3 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                  <div className="text-2xl font-bold text-slate-800">{avgEstado}</div>
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Estado medio</div>
              </div>
            </div>

            {/* Clasificación de fugas */}
            <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100 mb-12">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Clasificación de fugas</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-red-50/50 rounded-xl p-6 text-center border border-red-100">
                  <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-4"></div>
                  <div className="text-2xl font-bold text-red-600 mb-1">{fugasCriticas}</div>
                  <div className="text-[10px] text-red-500 font-medium uppercase tracking-wider mb-2">Críticas</div>
                  <div className="text-xs text-red-400">{fugasCriticasArea} m²</div>
                </div>
                <div className="bg-amber-50/50 rounded-xl p-6 text-center border border-amber-100">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-4"></div>
                  <div className="text-2xl font-bold text-amber-600 mb-1">{fugasModeradas}</div>
                  <div className="text-[10px] text-amber-500 font-medium uppercase tracking-wider mb-2">Moderadas</div>
                  <div className="text-xs text-amber-400">{fugasModeradasArea} m²</div>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-6 text-center border border-blue-100">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-4"></div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{fugasObservacion}</div>
                  <div className="text-[10px] text-blue-500 font-medium uppercase tracking-wider mb-2">Observación</div>
                </div>
              </div>
            </div>

            {/* Zonas Breve Resumen */}
            {(report.zonesData || []).map((zone, index) => (
              <div key={zone.id} className="mb-12">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{zone.name || 'Sin nombre'}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${Number(zone.tipologia?.estado) >= 4 ? 'bg-emerald-500' : Number(zone.tipologia?.estado) >= 3 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-semibold text-slate-700">
                      {zone.tipologia?.estado}/5 — {getEstadoLabel(Number(zone.tipologia?.estado))}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-3 mb-8">
                  <div className="flex justify-between text-[13px] border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Tipología de cubierta</span>
                    <span className="text-slate-800 font-medium">{zone.tipologia?.superficie || '-'}</span>
                  </div>
                  <div className="flex justify-between text-[13px] border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Altura remate perimetral</span>
                    <span className="text-slate-800 font-medium">{zone.remates?.altura || '-'}</span>
                  </div>
                  <div className="flex justify-between text-[13px] border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Impermeabilización</span>
                    <span className="text-slate-800 font-medium">{zone.tipologia?.impermeabilizacion || '-'}</span>
                  </div>
                  <div className="flex justify-between text-[13px] border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Estado remate perimetral</span>
                    <span className="text-slate-800 font-medium">{zone.remates?.estado || '-'}</span>
                  </div>
                  <div className="flex justify-between text-[13px] border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Uso de la superficie</span>
                    <span className="text-slate-800 font-medium">{zone.caracterizacion?.uso || '-'}</span>
                  </div>
                  <div className="flex justify-between text-[13px] border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Nº desagües</span>
                    <span className="text-slate-800 font-medium">{zone.drenajes?.numero || 0}</span>
                  </div>
                  <div className="flex justify-between text-[13px] border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Protección</span>
                    <span className="text-slate-800 font-medium">{(zone.caracterizacion?.proteccion || []).join(', ') || '-'}</span>
                  </div>
                  <div className="flex justify-between text-[13px] border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Estado desagües</span>
                    <span className="text-slate-800 font-medium">{zone.drenajes?.estado || '-'}</span>
                  </div>
                  <div className="flex justify-between text-[13px] border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Estructura</span>
                    <span className="text-slate-800 font-medium">{zone.caracterizacion?.estructura || '-'}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Patologías Visuales</h4>
                  <div className="text-[13px] text-slate-700">
                    {(zone.patologiasVisuales || []).length > 0 ? zone.patologiasVisuales.join(', ') : 'Sin patologías'}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Patologías detectadas con equipo</h4>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <span className="text-slate-700">Fugas críticas</span>
                      </div>
                      <div className="font-bold text-slate-800">
                        {zone.patologiasEquipo?.criticas?.num || 0} uds <span className="font-normal text-slate-500 ml-1">({zone.patologiasEquipo?.criticas?.area || 0} m²)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <span className="text-slate-700">Fugas moderadas</span>
                      </div>
                      <div className="font-bold text-slate-800">
                        {zone.patologiasEquipo?.moderadas?.num || 0} uds <span className="font-normal text-slate-500 ml-1">({zone.patologiasEquipo?.moderadas?.area || 0} m²)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Riesgos PRL</h4>
                  <div className="text-[13px] text-slate-700">
                    {(zone.riesgosPrl || []).length > 0 ? zone.riesgosPrl.join(', ') : 'Sin riesgos destacables'}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* PAGE: OBSERVATIONS & DOCUMENTATION */}
          <div className="break-before-page p-12">
            <PageHeader />
            
            {/* Assume these observations are global or aggregate, for the PDF reference it seems global or zone-specific? 
                Let's print the general observations of the first zone, or global? 
                Actually, the PDF says "Observaciones. Durante la inspeccion..." 
                We will print all zone observations sequentially. */}
            
            {(report.zonesData || []).map((zone, zIdx) => {
              const hasObs = !isHtmlEmpty(zone.observacionesGenerales);
              const hasPhotos = zone.fotografias && zone.fotografias.length > 0;
              
              if (!hasObs && !hasPhotos) return null;

              return (
                <div key={zone.id} className="mb-12">
                  
                  {hasObs && (
                    <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Observaciones - {zone.name}</h3>
                      <div className="text-[13px] text-slate-700 leading-relaxed quill-content break-words" dangerouslySetInnerHTML={{ __html: zone.observacionesGenerales! }} />
                    </div>
                  )}

                  {hasPhotos && (
                    <div className="mb-12">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Documentación Fotográfica - {zone.name}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {zone.fotografias.map((photo, pIdx) => (
                        <div key={pIdx} className="break-inside-avoid mb-4">
                          <div className="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mb-2">
                            <img src={photo.url} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-[10px] text-slate-500 italic">
                            {photo.caption || 'Sin descripción'}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            {photo.type === 'GENERAL' ? 'Vista general' : photo.type === 'MAP' ? 'Cenital / Mapa' : 'Detalle'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
            })}
            {/* GLOBAL RECOMMENDATIONS IN A BLUE BOX */}
            {!isHtmlEmpty(report.globalRecomms) && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-12">
                <h3 className="text-sm font-bold text-blue-800 mb-4">Recomendaciones Globales</h3>
                <div 
                  className="text-[13px] text-blue-900 leading-relaxed quill-content break-words"
                  dangerouslySetInnerHTML={{ __html: report.globalRecomms! }}
                />
              </div>
            )}
            
            {/* ZONE SPECIFIC RECOMMENDATIONS */}
            {(report.zonesData || []).some(z => !isHtmlEmpty(z.recomendaciones)) && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-12">
                <h3 className="text-sm font-bold text-blue-800 mb-4">Recomendaciones por Zona</h3>
                {(report.zonesData || []).map(zone => !isHtmlEmpty(zone.recomendaciones) ? (
                  <div key={zone.id} className="mb-4 last:mb-0">
                    <h4 className="text-xs font-bold text-blue-800 mb-1">{zone.name}</h4>
                    <div className="text-[13px] text-blue-900 leading-relaxed quill-content break-words" dangerouslySetInnerHTML={{ __html: zone.recomendaciones! }} />
                  </div>
                ) : null)}
              </div>
            )}
          </div>

          {/* PAGE: ANEXO FOTOGRAFICO AMPLIADO */}
          {(report.zonesData || []).some(z => z.fotografias && z.fotografias.length > 0) && (
            <div className="break-before-page p-12">
              <PageHeader />
              <h2 className="text-xl font-bold text-slate-800 mb-8">Anexo fotográfico ampliado</h2>
              
              {(report.zonesData || []).map(zone => (
                zone.fotografias?.map((photo, pIdx) => (
                  <div key={`${zone.id}-${pIdx}`} className="mb-12 break-inside-avoid">
                    <div className="w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 mb-4" style={{ maxHeight: '600px' }}>
                      <img src={photo.url} className="w-full h-full object-contain" />
                    </div>
                    <div className="text-sm font-medium text-slate-800">
                      {photo.caption || 'Sin descripción'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {zone.name}
                    </div>
                  </div>
                ))
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
