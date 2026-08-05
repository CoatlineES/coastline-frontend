import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, MapPin, Trash2, X, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { GeomembraneZone, MapFinding, InspectionReportPhoto } from '../../../../../../types/inspection-report';
import { uploadService } from '../../../../../../services/upload.service';
import { ImageViewerModal } from '../../../../../../components/ui/ImageViewerModal';

interface InteractiveZoneMapProps {
  zone: GeomembraneZone;
  updateZone: (zoneId: string, updates: Partial<GeomembraneZone>) => void;
  setCameraModalOpen: (config: { zoneId: string; type: string; findingId?: string }) => void;
  handleMapUpload: (e: React.ChangeEvent<HTMLInputElement>, zoneId: string) => Promise<void>;
}

const CATEGORY_COLORS = {
  'Fuga crítica': 'bg-red-500',
  'Depresión crítica': 'bg-purple-500',
  'Observación técnica': 'bg-orange-500'
};

const CATEGORY_TEXT_COLORS = {
  'Fuga crítica': 'text-red-500',
  'Depresión crítica': 'text-purple-500',
  'Observación técnica': 'text-orange-500'
};

export function InteractiveZoneMap({ zone, updateZone, setCameraModalOpen, handleMapUpload }: InteractiveZoneMapProps) {
  const zoneRef = useRef(zone);
  useEffect(() => {
    zoneRef.current = zone;
  }, [zone]);

  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const findings = zone.mapFindings || [];

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool || !mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newFinding: MapFinding = {
      id: uuidv4(),
      x,
      y,
      category: activeTool as any,
      description: '',
      photos: [],
      number: findings.length + 1
    };

    updateZone(zone.id, { mapFindings: [...findings, newFinding] });
    setSelectedFindingId(newFinding.id);
    setActiveTool(null);
  };

  const updateFinding = (findingId: string, updates: Partial<MapFinding>) => {
    const updatedFindings = findings.map(f => f.id === findingId ? { ...f, ...updates } : f);
    updateZone(zone.id, { mapFindings: updatedFindings });
  };

  const removeFinding = (findingId: string) => {
    updateZone(zone.id, { mapFindings: findings.filter(f => f.id !== findingId) });
    if (selectedFindingId === findingId) setSelectedFindingId(null);
  };

  const selectedFinding = findings.find(f => f.id === selectedFindingId);

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <MapPin size={18} className="text-slate-500" /> Mapa de hallazgos
        </h3>
        <div className="flex gap-4">
          <button 
            onClick={() => setCameraModalOpen({ zoneId: zone.id, type: 'MAP_BASE' })}
            className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <Camera size={14} /> {zone.baseImage ? 'Cambiar base' : 'Cámara base'}
          </button>
          <label className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors">
            <ImageIcon size={14} /> {zone.baseImage ? 'Cambiar imagen' : 'Subir imagen base'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMapUpload(e, zone.id)} />
          </label>
        </div>
      </div>

      {zone.baseImage ? (
        <div className="flex gap-6 relative">
          {/* Main Map Area */}
          <div className="flex-1 space-y-4 min-w-0">
            {/* Toolbar */}
            <div className="flex gap-3">
              {(Object.keys(CATEGORY_COLORS) as Array<keyof typeof CATEGORY_COLORS>).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTool(activeTool === cat ? null : cat)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                    activeTool === cat ? 'border-slate-800 bg-slate-50 text-slate-900 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Plus size={14} />
                  <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]}`} />
                  {cat}
                </button>
              ))}
            </div>

            {/* Map Container */}
            <div 
              ref={mapRef}
              className={`relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 ${activeTool ? 'cursor-crosshair' : 'cursor-default'}`}
              onClick={handleMapClick}
            >
              <img src={zone.baseImage} alt="Mapa base" className="w-full h-auto object-contain max-h-[600px] select-none" />
              
              {/* Markers */}
              {findings.map(finding => (
                <button
                  key={finding.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFindingId(finding.id);
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md transition-transform ${
                    CATEGORY_COLORS[finding.category as keyof typeof CATEGORY_COLORS]
                  } ${selectedFindingId === finding.id ? 'ring-4 ring-white ring-opacity-50 scale-125' : 'hover:scale-110'}`}
                  style={{ left: `${finding.x}%`, top: `${finding.y}%` }}
                >
                  {finding.number}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-4">
              {(Object.keys(CATEGORY_COLORS) as Array<keyof typeof CATEGORY_COLORS>).map(cat => (
                <div key={cat} className="flex items-center gap-2 text-sm text-slate-600">
                  <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]}`} />
                  {cat}
                </div>
              ))}
            </div>

            {/* Findings Table */}
            {findings.length > 0 && (
              <div className="mt-8">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">Tipo</th>
                      <th className="pb-3 font-medium">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {findings.map(finding => (
                      <tr key={finding.id} className="hover:bg-slate-50/50 cursor-pointer transition-colors" onClick={() => setSelectedFindingId(finding.id)}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[finding.category as keyof typeof CATEGORY_COLORS]}`} />
                            H{finding.number}
                          </div>
                        </td>
                        <td className="py-3 text-slate-700">{finding.category}</td>
                        <td className="py-3 text-slate-500 truncate max-w-[300px]">
                          {finding.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Side Modal (Finding Editor) */}
          {selectedFinding && (
            <div className="w-[400px] flex-shrink-0 bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col h-fit sticky top-4">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[selectedFinding.category as keyof typeof CATEGORY_COLORS]}`} />
                  Hallazgo H{selectedFinding.number}
                </div>
                <button 
                  onClick={() => setSelectedFindingId(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Categoría</label>
                  <select 
                    value={selectedFinding.category}
                    onChange={(e) => updateFinding(selectedFinding.id, { category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Fuga crítica">Fuga crítica</option>
                    <option value="Depresión crítica">Depresión crítica</option>
                    <option value="Observación técnica">Observación técnica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipo (opcional)</label>
                  <select 
                    value={selectedFinding.type || 'Sin especificar'}
                    onChange={(e) => updateFinding(selectedFinding.id, { type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Sin especificar">Sin especificar</option>
                    <option value="Desgarro">Desgarro</option>
                    <option value="Porosidad">Porosidad</option>
                    <option value="Desgaste">Desgaste</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Descripción</label>
                  <textarea 
                    value={selectedFinding.description || ''}
                    onChange={(e) => updateFinding(selectedFinding.id, { description: e.target.value })}
                    placeholder="Descripción del hallazgo..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[100px] resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-semibold text-slate-500">Fotografías del hallazgo</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCameraModalOpen({ zoneId: zone.id, type: 'FINDING', findingId: selectedFinding.id })}
                        className="text-xs font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                      >
                        <Camera size={14} /> Cámara
                      </button>
                      <label className="text-xs font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors">
                        <ImageIcon size={14} /> Galería
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple
                          className="hidden" 
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (!files.length) return;
                            try {
                              const newPhotos = await Promise.all(
                                files.map(async file => {
                                  const url = await uploadService.uploadImage(file);
                                  return { id: uuidv4(), type: 'FINDING' as const, url, caption: '' };
                                })
                              );
                              
                              const latestZone = zoneRef.current;
                              const latestFinding = latestZone.mapFindings?.find(f => f.id === selectedFinding.id);
                              if (latestFinding) {
                                const updatedFindings = (latestZone.mapFindings || []).map(f => 
                                  f.id === selectedFinding.id 
                                    ? { ...f, photos: [...(f.photos || []), ...newPhotos] }
                                    : f
                                );
                                updateZone(latestZone.id, { mapFindings: updatedFindings });
                              }
                            } catch (error) {
                              console.error(error);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Fotos miniaturas */}
                  {selectedFinding.photos?.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {selectedFinding.photos.map(photo => (
                        <div key={photo.id} className="space-y-1.5">
                          <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer border border-slate-200" onClick={() => setViewingPhotoUrl(photo.url)}>
                            <img src={photo.url} className="w-full h-full object-cover" />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateFinding(selectedFinding.id, { photos: selectedFinding.photos?.filter(p => p.id !== photo.id) })
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md z-10"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <input 
                            type="text" 
                            value={photo.caption || ''}
                            onChange={(e) => {
                              const newPhotos = selectedFinding.photos?.map(p => p.id === photo.id ? { ...p, caption: e.target.value } : p);
                              if (newPhotos) updateFinding(selectedFinding.id, { photos: newPhotos });
                            }}
                            placeholder="Comentario..."
                            className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => removeFinding(selectedFinding.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                  <button 
                    onClick={() => setSelectedFindingId(null)}
                    className="px-6 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-slate-400">
          <p className="text-sm">Sube una imagen base (foto aérea, satélite, plano o vista general) para habilitar el mapa interactivo.</p>
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
