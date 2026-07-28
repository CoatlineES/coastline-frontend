import React, { useRef, useState } from 'react';
import { InspectionReport } from '../../../../../types/inspection-report';
import { uploadService } from '../../../../../services/upload.service';
import { ImagePlus, Trash2, Loader2 } from 'lucide-react';

interface ReportCoverTabProps {
  report: InspectionReport;
  onChange: (updates: Partial<InspectionReport>) => void;
}

const COVER_STYLES = [
  { id: 'GENERIC', name: 'Portada Genérica', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop' },
  { id: 'WATERPROOFING', name: 'Portada Impermeabilización', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop' },
  { id: 'URBAN', name: 'Portada Informe Técnico Urbanización', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop' },
  { id: 'INSPECTION_ELD', name: 'Portada Inspección ELD', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop' },
  { id: 'MAINTENANCE', name: 'Portada Programa Mantenimiento', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=600&auto=format&fit=crop' },
  { id: 'REPAIR', name: 'Portada Reparación', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600&auto=format&fit=crop' }
];

export function ReportCoverTab({ report, onChange }: ReportCoverTabProps) {
  const activeCoverStyle = report.coverStyle || 'GENERIC';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadCustomCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const url = await uploadService.uploadImage(file);
      onChange({ coverStyle: 'CUSTOM', customCoverUrl: url });
    } catch (error) {
      console.error('Error uploading cover', error);
      alert('Error al subir la imagen.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getActiveCoverImage = () => {
    if (activeCoverStyle === 'CUSTOM' && report.customCoverUrl) return report.customCoverUrl;
    return COVER_STYLES.find(c => c.id === activeCoverStyle)?.image || COVER_STYLES[0].image;
  };

  return (
    <div className="flex gap-8">
      <div className="flex-1 overflow-y-auto pr-4">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Textos de la portada</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Título principal</label>
              <input
                type="text"
                value={report.coverTitle ?? 'PROPUESTA TÉCNICA'}
                onChange={e => onChange({ coverTitle: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Ej. PROPUESTA TÉCNICA"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Subtítulo / Tipo de informe</label>
              <input
                type="text"
                value={report.coverSubtitle ?? 'INFORME TÉCNICO DE ESTANQUEIDAD'}
                onChange={e => onChange({ coverSubtitle: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Ej. INFORME TÉCNICO DE ESTANQUEIDAD"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Ubicación / Dirección</label>
              <input
                type="text"
                value={report.location || ''}
                onChange={e => onChange({ location: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Ej. Calle Principal 123, Madrid"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Configuración visual</h2>
          <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mt-2">SELECCIONAR PORTADA DE LA BIBLIOTECA</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Custom Upload Card */}
          <div className={`relative cursor-pointer rounded-xl overflow-hidden border-4 transition-all duration-200 bg-white group ${
              activeCoverStyle === 'CUSTOM'
                ? 'border-[#002D5A] shadow-md scale-[1.02]' 
                : 'border-transparent shadow hover:shadow-md'
            }`}
          >
            {report.customCoverUrl ? (
              <div className="h-full flex flex-col">
                <div className="h-48 relative overflow-hidden bg-slate-200" onClick={() => onChange({ coverStyle: 'CUSTOM' })}>
                  <img src={report.customCoverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  
                  <div className="absolute inset-0 p-4 flex items-center">
                    <div className="text-white/80 text-xl font-bold tracking-widest -rotate-90 origin-left translate-y-12 whitespace-nowrap overflow-hidden text-ellipsis w-48">
                      {report.coverTitle || 'PROPUESTA TÉCNICA'}
                    </div>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); onChange({ customCoverUrl: undefined, coverStyle: 'GENERIC' }); }}
                    className="absolute top-2 right-2 z-20 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="Borrar imagen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className={`p-3 text-center text-xs font-medium ${activeCoverStyle === 'CUSTOM' ? 'bg-[#002D5A] text-white' : 'text-slate-600 bg-slate-50'}`}>
                  Portada Personalizada
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full min-h-[224px] flex flex-col items-center justify-center gap-2 p-6 hover:bg-slate-50 transition-colors border-2 border-dashed border-slate-300 rounded-xl m-1 box-border"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleUploadCustomCover} 
                  accept="image/*" 
                  className="hidden" 
                />
                {isUploading ? (
                  <>
                    <Loader2 size={32} className="text-slate-400 animate-spin mb-2" />
                    <span className="text-sm font-medium text-slate-500">Subiendo...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus size={32} className="text-slate-400 mb-2 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm font-medium text-slate-600 text-center">Subir portada propia</span>
                    <span className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-semibold mt-1">Recomendado: Vertical A4</span>
                  </>
                )}
              </div>
            )}
          </div>

          {COVER_STYLES.map(cover => (
            <div 
              key={cover.id}
              onClick={() => onChange({ coverStyle: cover.id })}
              className={`cursor-pointer rounded-xl overflow-hidden border-4 transition-all duration-200 bg-white group ${
                activeCoverStyle === cover.id 
                  ? 'border-[#002D5A] shadow-md scale-[1.02]' 
                  : 'border-transparent shadow hover:shadow-md'
              }`}
            >
              <div className="h-48 relative overflow-hidden bg-slate-200">
                <img 
                  src={cover.image} 
                  alt={cover.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute inset-0 p-4 flex items-center">
                  <div className="text-white/80 text-xl font-bold tracking-widest -rotate-90 origin-left translate-y-12 whitespace-nowrap overflow-hidden text-ellipsis w-48">
                    {report.coverTitle || 'PROPUESTA TÉCNICA'}
                  </div>
                </div>
              </div>
              <div className={`p-3 text-center text-xs font-medium ${activeCoverStyle === cover.id ? 'bg-[#002D5A] text-white' : 'text-slate-600 bg-slate-50'}`}>
                {cover.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-[400px] shrink-0">
        <h3 className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-4">Vista previa portada:</h3>
        <div className="bg-slate-200 rounded-xl overflow-hidden shadow-lg h-[565px] relative">
          {/* Mock Preview Cover */}
          <img 
            src={getActiveCoverImage()} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
          
          <div className="absolute top-8 right-8 text-white/90 text-2xl font-light tracking-widest">
            coatline
          </div>
          
          <div className="absolute left-8 bottom-12 text-white text-5xl font-bold tracking-widest -rotate-90 origin-bottom-left whitespace-nowrap">
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

          <div className="absolute right-8 top-24 w-64 bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
            <div className="text-[10px] text-blue-800 font-semibold tracking-widest mb-6 break-words">
              {report.coverSubtitle || 'INFORME TÉCNICO DE ESTANQUEIDAD'}
            </div>
            
            <div className="mb-4">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">PROYECTO</div>
              <div className="text-xs font-bold text-slate-800">{report.number}</div>
            </div>

            <div className="mb-4">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">UBICACIÓN</div>
              <div className="text-xs text-slate-600 break-words">{report.location || 'Sin especificar'}</div>
            </div>

            <div className="mb-4">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">FECHA</div>
              <div className="text-xs text-slate-600">{report.date ? new Date(report.date).toLocaleDateString('es-ES') : ''}</div>
            </div>

            <div className="mb-4">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">CLIENTE</div>
              <div className="text-xs text-slate-600">{report.clientName || 'Sin asignar'}</div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-4">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">EMITIDO POR</div>
              <div className="text-blue-800 font-bold mb-1">coatline</div>
              <div className="text-[9px] text-slate-500">Departamento Técnico</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
