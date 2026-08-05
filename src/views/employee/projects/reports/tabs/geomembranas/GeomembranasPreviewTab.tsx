import React, { useState } from 'react';
import { InspectionReport, GeomembraneZone } from '../../../../../../types/inspection-report';
import { Download, Loader2 } from 'lucide-react';
import api from '../../../../../../services/api';

const COVER_STYLES = [
  { id: 'GENERIC', name: 'Portada Genérica', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop' },
  { id: 'WATERPROOFING', name: 'Portada Impermeabilización', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop' },
  { id: 'URBAN', name: 'Portada Informe Técnico Urbanización', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop' },
  { id: 'INSPECTION_ELD', name: 'Portada Inspección ELD', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop' },
  { id: 'MAINTENANCE', name: 'Portada Programa Mantenimiento', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=600&auto=format&fit=crop' },
  { id: 'REPAIR', name: 'Portada Reparación', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600&auto=format&fit=crop' }
];

interface GeomembranasPreviewTabProps {
  report: InspectionReport;
}

export function GeomembranasPreviewTab({ report }: GeomembranasPreviewTabProps) {
  const [isExporting, setIsExporting] = useState(false);
  const activeCoverStyle = report.coverStyle || 'GENERIC';
  
  const getActiveCoverImage = () => {
    if (activeCoverStyle === 'CUSTOM' && report.customCoverUrl) return report.customCoverUrl;
    return COVER_STYLES.find(c => c.id === activeCoverStyle)?.image || COVER_STYLES[0].image;
  };

  const coverImage = getActiveCoverImage();
  const zones: GeomembraneZone[] = report.zonesData || [];

  // Cálculos globales
  const totalZonas = zones.length;
  const m2Inspeccionados = zones.reduce((acc, z) => acc + (Number(z.inspectedArea) || 0), 0);
  
  // Total de hallazgos
  const totalCriticas = zones.reduce((acc, z) => {
    return acc + (z.mapFindings?.filter(f => f.category === 'Fuga crítica').length || 0);
  }, 0);
  
  const totalDepresiones = zones.reduce((acc, z) => {
    return acc + (z.mapFindings?.filter(f => f.category === 'Depresión crítica').length || 0);
  }, 0);

  const totalObservaciones = zones.reduce((acc, z) => {
    return acc + (z.mapFindings?.filter(f => f.category === 'Observación técnica').length || 0);
  }, 0);

  const isHtmlEmpty = (html?: string) => {
    if (!html) return true;
    const stripped = html.replace(/<[^>]+>/g, '').trim();
    return stripped.length === 0 && !html.includes('<img');
  };

  const PageHeader = () => (
    <div className="w-full text-center mb-12">
      <div className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mb-4">
        COATLINE · INFORME DE INSPECCIÓN GEOMEMBRANAS
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
            /* For the map markers */
            .marker { position: absolute; transform: translate(-50%, -100%); }
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
        filename: `Informe_Geomembranas_${report.number}`,
        format: 'A4',
        landscape: false
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Informe_Geomembranas_${report.number}.pdf`);
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

  const getMarkerColor = (category: string) => {
    switch (category) {
      case 'Fuga crítica': return 'bg-red-500';
      case 'Depresión crítica': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ZONE_GENERAL': return 'Datos generales';
      case 'ZONE_GEOMEMBRANE': return 'Geomembrana';
      case 'ZONE_RISKS': return 'Riesgos y observaciones';
      case 'ZONE_EQUIPMENT': return 'Equipos utilizados';
      case 'FINDING': return 'Hallazgos en mapa';
      default: return 'Otras fotos';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Vista Previa del Documento</h2>
          <p className="text-sm text-slate-500">Revisa cómo quedará el PDF de Geomembranas antes de exportarlo.</p>
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

      <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100">
        <div className="shadow-xl origin-top">
          <div id="report-pdf-content" className="w-[794px] bg-white" style={{ minHeight: '1123px' }}>
            
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
                {report.coverSubtitle || 'INFORME TÉCNICO DE GEOMEMBRANAS'}
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
            <h2 className="text-xl font-bold text-slate-800 mb-8">Resumen General</h2>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
                <div className="text-2xl font-bold text-slate-800 mb-1">{totalZonas}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Zonas Registradas</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
                <div className="text-2xl font-bold text-slate-800 mb-1">{m2Inspeccionados > 0 ? m2Inspeccionados : '—'}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">m² inspeccionados</div>
              </div>
              <div className="bg-red-50 rounded-xl p-6 text-center border border-red-100">
                <div className="text-2xl font-bold text-red-600 mb-1">{totalCriticas}</div>
                <div className="text-[10px] text-red-500 uppercase tracking-wider">Fugas Críticas</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-6 text-center border border-orange-100">
                <div className="text-2xl font-bold text-orange-600 mb-1">{totalDepresiones}</div>
                <div className="text-[10px] text-orange-500 uppercase tracking-wider">Depresiones Críticas</div>
              </div>
            </div>
          </div>

          {/* PAGES: ZONES */}
          {zones.map((zone, idx) => {
            const allFindings = zone.mapFindings || [];
            const zonePhotos = zone.fotografias || [];
            const findingPhotos = allFindings.flatMap(f => (f.photos || []).map(p => ({ ...p, findingName: `${f.category || 'Hallazgo'} #${f.number || '?'}` })));
            const allPhotos = [...zonePhotos, ...findingPhotos];
            
            const groupedPhotos = allPhotos.reduce((acc, photo) => {
              const key = photo.type;
              if (!acc[key]) acc[key] = [];
              acc[key].push(photo);
              return acc;
            }, {} as Record<string, typeof allPhotos>);

            return (
              <div key={zone.id}>
                {/* ZONE DATA PAGE */}
                <div className="break-before-page p-12">
                  <PageHeader />
                  <div className="mb-8 border-b-2 border-slate-800 pb-4">
                    <div className="text-[10px] text-blue-600 font-bold tracking-widest uppercase mb-1">Zona {idx + 1}</div>
                    <h2 className="text-2xl font-bold text-slate-800">{zone.name || 'Zona sin nombre'}</h2>
                  </div>

                  {/* Datos Generales y Geomembrana */}
                  <div className="mb-8">
                    {zone.description && (
                      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
                        <strong className="block mb-2 text-slate-800">Descripción de la Zona:</strong>
                        <p className="whitespace-pre-wrap">{zone.description}</p>
                      </div>
                    )}
                    <h3 className="text-sm font-bold text-slate-800 uppercase bg-slate-100 p-2 border-l-4 border-blue-600 mb-4">Datos Generales</h3>
                    <table className="w-full text-sm text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-semibold text-slate-600 w-1/3">Tipo de instalación</td>
                          <td className="py-2 text-slate-800">{zone.installationType}{zone.installationType === 'Otro' ? ` - ${zone.installationTypeOther}` : ''}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-semibold text-slate-600">Superficie inspeccionada</td>
                          <td className="py-2 text-slate-800">{zone.inspectedArea ? `${zone.inspectedArea} m²` : '—'}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-semibold text-slate-600">Nivel de llenado</td>
                          <td className="py-2 text-slate-800">{zone.fillLevel ? `${zone.fillLevel} %` : '—'}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-semibold text-slate-600">Uso</td>
                          <td className="py-2 text-slate-800">{zone.installationUse || '—'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-800 uppercase bg-slate-100 p-2 border-l-4 border-blue-600 mb-4">Especificaciones de Geomembrana</h3>
                    <table className="w-full text-sm text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-semibold text-slate-600 w-1/3">Material</td>
                          <td className="py-2 text-slate-800">{zone.materialType || '—'}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-semibold text-slate-600">Espesor</td>
                          <td className="py-2 text-slate-800">{zone.thicknessUnknown ? 'Desconocido' : (zone.thickness ? `${zone.thickness} mm` : '—')}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-semibold text-slate-600">Acabado</td>
                          <td className="py-2 text-slate-800">{zone.finish || '—'}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-semibold text-slate-600">Fabricante</td>
                          <td className="py-2 text-slate-800">{zone.brandUnknown ? 'Desconocido' : (zone.brand || '—')}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-semibold text-slate-600">Color</td>
                          <td className="py-2 text-slate-800">{zone.color || '—'}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-semibold text-slate-600">Año de instalación</td>
                          <td className="py-2 text-slate-800">{zone.yearUnknown ? 'Desconocido' : (zone.installationYear || '—')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Observaciones adicionales (Si hay) */}
                  {(zone.observations || zone.geomembraneObservations || zone.risksText) && (
                    <div className="mb-8">
                      <h3 className="text-sm font-bold text-slate-800 uppercase bg-slate-100 p-2 border-l-4 border-blue-600 mb-4">Observaciones Adicionales</h3>
                      <div className="space-y-4 text-sm text-slate-700">
                        {zone.observations && (
                          <div>
                            <span className="font-semibold block mb-1">Generales:</span>
                            <p className="whitespace-pre-wrap">{zone.observations}</p>
                          </div>
                        )}
                        {zone.geomembraneObservations && (
                          <div>
                            <span className="font-semibold block mb-1">Geomembrana:</span>
                            <p className="whitespace-pre-wrap">{zone.geomembraneObservations}</p>
                          </div>
                        )}
                        {zone.risksText && (
                          <div>
                            <span className="font-semibold block mb-1">Riesgos PRL:</span>
                            <p className="whitespace-pre-wrap">{zone.risksText}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* INTERACTIVE MAP PAGE (if exists) */}
                {zone.baseImage && (
                  <div className="break-before-page p-12">
                    <PageHeader />
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Mapa de Inspección: {zone.name}</h3>
                    
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={zone.baseImage} alt="Mapa base" className="w-full h-auto object-contain max-h-[600px] select-none" />
                      {/* Render findings markers */}
                      {allFindings.map(finding => (
                        <div
                          key={finding.id}
                          className="absolute text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 border-white z-50"
                          style={{ 
                            left: finding.x + '%', 
                            top: finding.y + '%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: finding.category === 'Fuga crítica' ? '#ef4444' : finding.category === 'Depresión crítica' ? '#a855f7' : '#f97316'
                          }}
                        >
                          {finding.number}
                        </div>
                      ))}
                    </div>

                    {/* Table of Findings */}
                    {allFindings.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-md font-bold text-slate-800 mb-4">Detalle de Hallazgos en Mapa</h4>
                        <table className="w-full text-sm text-left border-collapse border border-slate-200">
                          <thead className="bg-slate-100 text-slate-700">
                            <tr>
                              <th className="py-2 px-3 border border-slate-200 w-12 text-center">#</th>
                              <th className="py-2 px-3 border border-slate-200 w-1/4">Categoría</th>
                              <th className="py-2 px-3 border border-slate-200 w-1/4">Tipo</th>
                              <th className="py-2 px-3 border border-slate-200">Descripción / Detalles</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allFindings.sort((a, b) => (a.number || 0) - (b.number || 0)).map(f => (
                              <tr key={f.id} className="border-b border-slate-200 bg-white">
                                <td className="py-2 px-3 text-center font-bold border-r border-slate-200">{f.number}</td>
                                <td className="py-2 px-3 font-semibold border-r border-slate-200">
                                  <span className={`px-2 py-1 rounded text-white text-[10px] uppercase ${getMarkerColor(f.category)}`}>
                                    {f.category}
                                  </span>
                                </td>
                                <td className="py-2 px-3 border-r border-slate-200">{f.type || '—'}</td>
                                <td className="py-2 px-3 text-slate-600 whitespace-pre-wrap">{f.description || 'Sin descripción detallada.'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {zone.zoneObservations && (
                      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 mt-6">
                        <strong className="block mb-2 text-slate-800">Observaciones Generales de la Zona:</strong>
                        <p className="whitespace-pre-wrap">{zone.zoneObservations}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* PHOTOS ANNEX (Grouped) */}
                {Object.keys(groupedPhotos).length > 0 && (
                  <div className="break-before-page p-12">
                    <PageHeader />
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Anexo Fotográfico: {zone.name}</h3>

                    {Object.entries(groupedPhotos).map(([type, photos]) => (
                      <div key={type} className="mb-8 break-inside-avoid">
                        <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide border-b border-blue-200 mb-4 pb-1">
                          {getTypeLabel(type)}
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                          {photos.map(photo => (
                            <div key={photo.id} className="break-inside-avoid">
                              <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mb-2">
                                <img src={photo.url} className="w-full h-full object-cover" />
                              </div>
                              {photo.caption ? (
                                <p className="text-xs text-slate-700 italic border-l-2 border-slate-300 pl-2 py-1">
                                  {photo.caption}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-400 italic">Sin descripción</p>
                              )}
                              {(photo as any).findingName && (
                                <p className="text-[10px] text-blue-600 mt-1 font-semibold">
                                  Ref: {(photo as any).findingName}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          </div>
        </div>
      </div>
    </div>
  );
}
