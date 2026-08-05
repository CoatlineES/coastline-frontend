import React, { useState } from 'react';
import { InspectionReport, GeomembraneZone } from '../../../../../../types/inspection-report';
import { ImageViewerModal } from '../../../../../../components/ui/ImageViewerModal';
import { Trash2 } from 'lucide-react';

interface GeomembranasFotosTabProps {
  report: InspectionReport;
  onChange: (updates: Partial<InspectionReport>) => void;
}

export function GeomembranasFotosTab({ report, onChange }: GeomembranasFotosTabProps) {
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  const zones = report?.zonesData || [];

  if (zones.length === 0) {
    return (
      <div className="text-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
        No hay fotos disponibles porque no hay zonas creadas.
      </div>
    );
  }

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

  const updateZone = (zoneId: string, updates: Partial<GeomembraneZone>) => {
    const newZones = zones.map(z => z.id === zoneId ? { ...z, ...updates } : z);
    onChange({ zonesData: newZones });
  };

  return (
    <div className="space-y-8">
      {zones.map(zone => {
        const zonePhotos = zone.fotografias || [];
        const findingPhotos = (zone.mapFindings || []).flatMap(f => (f.photos || []).map(p => ({ ...p, findingName: `${f.category || 'Hallazgo'} #${f.number || '?'}` })));
        
        const allPhotos = [...zonePhotos, ...findingPhotos];

        if (allPhotos.length === 0) return null;

        const grouped = allPhotos.reduce((acc, photo) => {
          const key = photo.type;
          if (!acc[key]) acc[key] = [];
          acc[key].push(photo);
          return acc;
        }, {} as Record<string, typeof allPhotos>);

        return (
          <div key={zone.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">
              Zona: {zone.name || 'Zona sin nombre'}
            </h2>

            {Object.entries(grouped).map(([type, photos]) => (
              <div key={type} className="space-y-4 mt-4">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  {getTypeLabel(type)}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map(photo => (
                    <div key={photo.id} className="space-y-2">
                      <div 
                        className="aspect-square rounded-xl border border-slate-200 overflow-hidden relative group cursor-pointer shadow-sm hover:border-blue-400 transition-colors"
                        onClick={() => setViewingPhotoUrl(photo.url)}
                      >
                        <img src={photo.url} className="w-full h-full object-cover" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (photo.type === 'FINDING') {
                              const newFindings = zone.mapFindings?.map(f => {
                                if (f.photos?.some(p => p.id === photo.id)) {
                                  return { ...f, photos: f.photos.filter(p => p.id !== photo.id) };
                                }
                                return f;
                              });
                              updateZone(zone.id, { mapFindings: newFindings });
                            } else {
                              updateZone(zone.id, { fotografias: zone.fotografias?.filter(f => f.id !== photo.id) });
                            }
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input 
                        type="text"
                        value={photo.caption || ''}
                        onChange={(e) => {
                          if (photo.type === 'FINDING') {
                            const newFindings = zone.mapFindings?.map(f => {
                              if (f.photos?.some(p => p.id === photo.id)) {
                                return { ...f, photos: f.photos.map(p => p.id === photo.id ? { ...p, caption: e.target.value } : p) };
                              }
                              return f;
                            });
                            updateZone(zone.id, { mapFindings: newFindings });
                          } else {
                            const newFotos = zone.fotografias?.map(f => f.id === photo.id ? { ...f, caption: e.target.value } : f);
                            updateZone(zone.id, { fotografias: newFotos });
                          }
                        }}
                        placeholder="Añadir comentario..."
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      />
                      {(photo as any).findingName && (
                        <p className="text-[10px] text-slate-400 px-1 truncate">Hallazgo: {(photo as any).findingName}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {zones.every(z => !z.fotografias?.length && !z.mapFindings?.some(f => f.photos?.length)) && (
        <div className="text-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          Aún no hay fotos en este informe. Añádelas desde la pestaña de Zonas.
        </div>
      )}

      <ImageViewerModal 
        isOpen={!!viewingPhotoUrl}
        onClose={() => setViewingPhotoUrl(null)}
        imageUrl={viewingPhotoUrl}
      />
    </div>
  );
}
