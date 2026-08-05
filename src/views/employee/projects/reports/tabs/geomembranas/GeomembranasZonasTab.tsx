import { GeomembraneZone, InspectionReport, InspectionReportPhoto } from '../../../../../../types/inspection-report';
import { Camera, ChevronDown, ChevronUp, Copy, Image as ImageIcon, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, Mic, MapPin } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReportTextTemplatesModal from '../ReportTextTemplatesModal';
import { uploadService } from '../../../../../../services/upload.service';
import { CameraCaptureModal } from '../CameraCaptureModal';
import { InteractiveZoneMap } from './InteractiveZoneMap';
import { ImageViewerModal } from '../../../../../../components/ui/ImageViewerModal';
import React, { useState, useRef, useEffect } from 'react';

interface GeomembranasZonasTabProps {
  report: InspectionReport;
  onChange: (updates: Partial<InspectionReport>) => void;
}

export function GeomembranasZonasTab({ report, onChange }: GeomembranasZonasTabProps) {
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({});
  const [activeSubTab, setActiveSubTab] = useState<Record<string, string>>({});
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [activeTemplateField, setActiveTemplateField] = useState<{zoneId: string, field: string, title: string, category: string} | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({});
  const [cameraModalOpen, setCameraModalOpen] = useState<{zoneId: string, type: string, findingId?: string} | null>(null);
  const [recordingFieldId, setRecordingFieldId] = useState<string | null>(null);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  const zones: GeomembraneZone[] = report.zonesData as GeomembraneZone[] || [];
  
  const recognitionRef = useRef<any>(null);
  const zonesRef = useRef(zones);
  useEffect(() => {
    zonesRef.current = zones;
  }, [zones]);

  const handleStartTranscription = (zoneId: string, field: string, currentText: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta el reconocimiento de voz. Usa Chrome o Safari/Edge recientes.");
      return;
    }

    const fieldKey = `${zoneId}-${field}`;
    if (recordingFieldId === fieldKey) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setRecordingFieldId(null);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onstart = () => {
      setRecordingFieldId(fieldKey);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const newText = (currentText ? currentText + ' ' : '') + finalTranscript + interim;
      const currentZones = zonesRef.current;
      const updatedZones = currentZones.map(z => z.id === zoneId ? { ...z, [field]: newText } : z);
      onChange({ zonesData: updatedZones });
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        alert("Error de micrófono: " + event.error);
      }
      setRecordingFieldId(null);
    };

    recognition.onend = () => {
      setRecordingFieldId(null);
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };

    try {
      recognition.start();
    } catch(e) {
      console.error(e);
    }
  };

  const toggleZone = (id: string) => {
    if (expandedZones[id]) {
      const zone = zones.find(z => z.id === id);
      if (zone) {
        const statuses = ['DATOS', 'GEOMEMBRANA', 'RIESGOS', 'EQUIPOS'].map(t => getTabStatus(zone, t));
        const isComplete = statuses.every(s => s === 'complete');
        if (!isComplete) {
          if (!confirm('⚠️ Atención: Tienes secciones incompletas en esta Zona. ¿Estás seguro de que deseas contraerla sin terminar?')) {
            return;
          }
        }
      }
      setExpandedZones(prev => ({ ...prev, [id]: false }));
    } else {
      setExpandedZones({ [id]: true });
    }
  };

  const setSubTab = (zoneId: string, tab: string) => {
    setActiveSubTab(prev => ({ ...prev, [zoneId]: tab }));
  };

  const addZone = () => {
    const newZone: GeomembraneZone = {
      id: uuidv4(),
      name: `Zona ${zones.length + 1}`,
      area: 0,
      description: '',
      installationType: '',
      inspectedArea: 0,
      fillLevel: 0,
      observations: '',
      photosData: [],
      materialType: '',
      thickness: '',
      brand: '',
      state: '',
      geomembraneObservations: '',
      risks: [],
      risksObservations: '',
      equipment: [],
      zonePhotos: [],
      zoneObservations: ''
    };
    onChange({ zonesData: [...zones, newZone] });
    setExpandedZones(prev => ({ ...prev, [newZone.id]: true }));
    setSubTab(newZone.id, 'DATOS');
  };

  const updateZone = (id: string, updates: Partial<GeomembraneZone>) => {
    const newZones = zonesRef.current.map(z => z.id === id ? { ...z, ...updates } : z);
    onChange({ zonesData: newZones });
  };

  const removeZone = (id: string) => {
    if (confirm('¿Eliminar esta zona?')) {
      onChange({ zonesData: zones.filter(z => z.id !== id) });
    }
  };

  const getSubtabProgress = (zone: GeomembraneZone, tab: string): [number, number] => {
    let total = 0;
    let filled = 0;
    const check = (condition: boolean) => {
      total++;
      if (condition) filled++;
    };

    if (tab === 'DATOS') {
      check(!!zone.installationType);
      check(!!zone.installationUse && zone.installationUse.trim().length > 0);
      check(zone.inspectedArea !== undefined && zone.inspectedArea !== '');
      check(zone.fillLevel !== undefined && zone.fillLevel !== '');
      check(!!zone.observations && zone.observations.trim().length > 0);
      check((zone.fotografias || []).some(f => f.type === 'ZONE_GENERAL'));
    } else if (tab === 'GEOMEMBRANA') {
      check(!!zone.materialType);
      check(!!zone.thickness || !!zone.thicknessUnknown);
      check(!!zone.finish);
      check(!!zone.brand || !!zone.brandUnknown);
      check(!!zone.color && zone.color.trim().length > 0);
      check(!!zone.installationYear || !!zone.yearUnknown);
      check(!!zone.geomembraneObservations && zone.geomembraneObservations.trim().length > 0);
      check((zone.fotografias || []).some(f => f.type === 'ZONE_GEOMEMBRANE'));
    } else if (tab === 'RIESGOS') {
      check(!!zone.risksText && zone.risksText.trim().length > 0);
      check((zone.fotografias || []).some(f => f.type === 'ZONE_RISKS'));
    } else if (tab === 'EQUIPOS') {
      check((zone.equipment || []).length > 0);
      check((zone.fotografias || []).some(f => f.type === 'ZONE_EQUIPMENT'));
    }

    return [filled, total];
  };

  const getTabStatus = (zone: GeomembraneZone, tab: string) => {
    if (tab === 'DATOS') {
      const hasBasic = !!zone.installationType && (zone.inspectedArea !== undefined && Number(zone.inspectedArea) > 0);
      const hasPhoto = (zone.fotografias || []).some(f => f.type === 'ZONE_GENERAL');
      return hasBasic && hasPhoto ? 'complete' : 'incomplete';
    }
    if (tab === 'GEOMEMBRANA') {
      const hasBasic = !!zone.materialType;
      const hasPhoto = (zone.fotografias || []).some(f => f.type === 'ZONE_GEOMEMBRANE');
      return hasBasic && hasPhoto ? 'complete' : 'incomplete';
    }
    if (tab === 'RIESGOS') {
      const hasBasic = !!zone.risksText && zone.risksText.trim().length > 0;
      const hasPhoto = (zone.fotografias || []).some(f => f.type === 'ZONE_RISKS');
      return hasBasic && hasPhoto ? 'complete' : 'incomplete';
    }
    if (tab === 'EQUIPOS') {
      const hasBasic = (zone.equipment || []).length > 0;
      const hasPhoto = (zone.fotografias || []).some(f => f.type === 'ZONE_EQUIPMENT');
      return hasBasic && hasPhoto ? 'complete' : 'incomplete';
    }
    return 'incomplete';
  };

  const getZoneTabsProgress = (zone: GeomembraneZone) => {
    const statuses = ['DATOS', 'GEOMEMBRANA', 'RIESGOS', 'EQUIPOS'].map(t => getTabStatus(zone, t));
    const completed = statuses.filter(s => s === 'complete').length;
    return Math.round((completed / statuses.length) * 100);
  };

  const getZoneTotalProgress = (zone: GeomembraneZone) => {
    let total = 0;
    let filled = 0;

    const check = (condition: boolean) => {
      total++;
      if (condition) filled++;
    };

    check(!!zone.name && zone.name.trim().length > 0);
    check(!!zone.area && zone.area > 0);
    check(!!zone.description && zone.description.trim().length > 0);
    check(getTabStatus(zone, 'DATOS') === 'complete');
    check(getTabStatus(zone, 'GEOMEMBRANA') === 'complete');
    check(getTabStatus(zone, 'RIESGOS') === 'complete');
    check(getTabStatus(zone, 'EQUIPOS') === 'complete');
    check(!!zone.baseImage);
    check(!!zone.mapFindings && zone.mapFindings.length > 0);
    check(!!zone.fotografias && zone.fotografias.some(f => f.type === 'ZONE_PHOTOS'));
    check(!!zone.zoneObservations && zone.zoneObservations.trim().length > 0);

    return Math.round((filled / total) * 100);
  };

  const handleMapUpload = async (e: React.ChangeEvent<HTMLInputElement>, zoneId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadService.uploadImage(file);
      updateZone(zoneId, { baseImage: url });
    } catch (err) {
      console.error(err);
      alert('Error al subir mapa base');
    }
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="text-slate-500">📍</span> Zonas de inspección
          </h2>
        </div>
        <button 
          onClick={addZone}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Plus size={16} /> Añadir zona
        </button>
      </div>

      <div className="p-8 space-y-4">
        {zones.length === 0 && (
          <div className="text-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            No hay zonas de inspección. Haz clic en "Añadir zona".
          </div>
        )}

        {zones.map((zone, index) => {
          const isExpanded = expandedZones[zone.id];
          const currentTab = activeSubTab[zone.id] || 'DATOS';

          // HELPER FOR PHOTOS
          const renderPhotoGallery = (zoneId: string, type: string, title: string) => {
            const fotos = zone.fotografias?.filter(f => f.type === type) || [];
            const isUploading = uploadingPhotos[`${zoneId}-${type}`];
            
            return (
              <div className="mt-8 border-t border-slate-200 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-semibold text-slate-500 uppercase">{title}</div>
                  <div className="flex gap-2 items-center">
                    {isUploading && <Loader2 size={16} className="animate-spin text-blue-500" />}
                    <button 
                      onClick={() => setCameraModalOpen({ zoneId: zone.id, type })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Camera size={14} /> Cámara
                    </button>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <ImageIcon size={14} /> Galería
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        className="hidden" 
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) return;
                          setUploadingPhotos(prev => ({ ...prev, [`${zone.id}-${type}`]: true }));
                          try {
                            const newPhotos = await Promise.all(
                              files.map(async file => {
                                const url = await uploadService.uploadImage(file);
                                return { id: uuidv4(), type: type as any, url, caption: '' };
                              })
                            );
                            
                            const latestZone = zonesRef.current.find(z => z.id === zone.id);
                            if (latestZone) {
                              updateZone(zone.id, { fotografias: [...(latestZone.fotografias || []), ...newPhotos] });
                            }
                          } catch (err) {
                            console.error('Error', err);
                          } finally {
                            setUploadingPhotos(prev => ({ ...prev, [`${zone.id}-${type}`]: false }));
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>

                {fotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {fotos.map(photo => (
                      <div key={photo.id} className="space-y-2">
                        <div className="aspect-square rounded-xl border border-slate-200 overflow-hidden relative group cursor-pointer shadow-sm hover:border-blue-400 transition-colors" onClick={() => setViewingPhotoUrl(photo.url)}>
                          <img src={photo.url} className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateZone(zone.id, { fotografias: zone.fotografias?.filter(f => f.id !== photo.id) });
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
                            const newFotos = zone.fotografias?.map(f => f.id === photo.id ? { ...f, caption: e.target.value } : f);
                            if (newFotos) updateZone(zone.id, { fotografias: newFotos });
                          }}
                          placeholder="Añadir comentario..."
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          };

          return (
            <div key={zone.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              {/* HEADER ZONA */}
              <div 
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                onClick={() => toggleZone(zone.id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                  <span className="font-bold text-slate-800">{zone.name || `Zona ${index + 1}`}</span>
                  <div className="w-32 bg-slate-200 rounded-full h-2.5 ml-4 border border-slate-300" title="Progreso total de la zona">
                    <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${getZoneTotalProgress(zone)}%` }}></div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium" title="Progreso total de la zona">{getZoneTotalProgress(zone)}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 font-medium">{(zone.fotografias || []).length} fotos</span>
                  <div className="flex gap-2">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-1" onClick={(e) => { e.stopPropagation(); }} title="Duplicar"><Copy size={16}/></button>
                    <button className="text-slate-400 hover:text-red-600 transition-colors p-1" onClick={(e) => { e.stopPropagation(); removeZone(zone.id); }} title="Eliminar"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>

              {/* CONTENT ZONA */}
              {isExpanded && (
                <div className="p-6 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Nombre de zona</label>
                      <input 
                        type="text" 
                        value={zone.name} 
                        onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Superficie (m²)</label>
                      <input 
                        type="number" 
                        value={zone.area || ''} 
                        onChange={(e) => updateZone(zone.id, { area: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Descripción</label>
                    <textarea 
                      value={zone.description}
                      onChange={(e) => updateZone(zone.id, { description: e.target.value })}
                      placeholder="Descripción de la zona..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm min-h-[80px]"
                    />
                  </div>

                  {/* SUBTABS */}
                  <div className="border-b border-slate-200 mb-6 flex justify-between items-end">
                    <div className="flex gap-6">
                      {['DATOS', 'GEOMEMBRANA', 'RIESGOS', 'EQUIPOS'].map(tab => {
                        const status = getTabStatus(zone, tab);
                        return (
                          <button 
                            key={tab}
                            className={`pb-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${currentTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            onClick={() => setSubTab(zone.id, tab)}
                          >
                            {tab === 'DATOS' ? 'Datos generales' : tab === 'GEOMEMBRANA' ? 'Geomembrana' : tab === 'RIESGOS' ? 'Riesgos y observaciones' : 'Equipos utilizados'}
                            {status === 'complete' ? (
                              <CheckCircle2 size={14} className="text-emerald-500" />
                            ) : (
                              <AlertCircle size={14} className="text-amber-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-400 font-medium uppercase">Progreso pestañas</span>
                      <div className="w-24 bg-slate-200 rounded-full h-2 border border-slate-300">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${getZoneTabsProgress(zone)}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-500 font-bold">{getZoneTabsProgress(zone)}%</span>
                    </div>
                  </div>

                  {/* SUBTAB CONTENT */}
                  <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 space-y-6">
                    
                    {(() => {
                      return (
                        <>
                    {currentTab === 'DATOS' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-slate-800">
                            Datos generales 
                            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full ml-2">
                              {getSubtabProgress(zone, 'DATOS')[0]}/{getSubtabProgress(zone, 'DATOS')[1]}
                            </span>
                          </h3>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipo de instalación</label>
                          <select 
                            value={zone.installationType || ''}
                            onChange={(e) => updateZone(zone.id, { installationType: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                          >
                            <option value="">Seleccionar...</option>
                            <option value="Balsa de riego">Balsa de riego</option>
                            <option value="Depósito">Depósito</option>
                            <option value="Canal">Canal</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>

                        {zone.installationType === 'Otro' && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Especificar (si Otro)</label>
                            <input 
                              type="text" 
                              value={zone.installationTypeOther || ''}
                              onChange={(e) => updateZone(zone.id, { installationTypeOther: e.target.value })}
                              placeholder="Describir tipo de instalación"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Uso</label>
                          <textarea 
                            value={zone.installationUse || ''}
                            onChange={(e) => updateZone(zone.id, { installationUse: e.target.value })}
                            placeholder="Uso / destino de la instalación..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm min-h-[60px] bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Superficie inspeccionada</label>
                            <div className="relative">
                              <input 
                                type="number" 
                                value={zone.inspectedArea || ''}
                                onChange={(e) => updateZone(zone.id, { inspectedArea: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white pr-10"
                              />
                              <span className="absolute right-3 top-2 text-slate-400 text-sm">m²</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nivel de llenado</label>
                            <div className="relative">
                              <input 
                                type="number" 
                                value={zone.fillLevel || ''}
                                onChange={(e) => updateZone(zone.id, { fillLevel: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white pr-10"
                              />
                              <span className="absolute right-3 top-2 text-slate-400 text-sm">%</span>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Observaciones</label>
                          <textarea 
                            value={zone.observations || ''}
                            onChange={(e) => updateZone(zone.id, { observations: e.target.value })}
                            placeholder="Notas adicionales..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm min-h-[80px] bg-white pr-10"
                          />
                          <button 
                            onClick={() => handleStartTranscription(zone.id, 'observations', zone.observations || '')}
                            className={`absolute right-2 bottom-2 p-1.5 rounded-lg transition-colors ${recordingFieldId === `${zone.id}-observations` ? 'text-red-600 bg-red-100 animate-pulse' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                            title="Dictar por voz"
                          >
                            <Mic size={16} />
                          </button>
                        </div>

                        {renderPhotoGallery(zone.id, 'ZONE_GENERAL', 'Fotos - Datos generales')}
                      </div>
                    )}

                    {currentTab === 'GEOMEMBRANA' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-slate-800">
                            Geomembrana 
                            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full ml-2">
                              {getSubtabProgress(zone, 'GEOMEMBRANA')[0]}/{getSubtabProgress(zone, 'GEOMEMBRANA')[1]}
                            </span>
                          </h3>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Material</label>
                          <select 
                            value={zone.materialType || ''}
                            onChange={(e) => updateZone(zone.id, { materialType: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                          >
                            <option value="">Seleccionar...</option>
                            <option value="PEAD (HDPE)">PEAD (HDPE)</option>
                            <option value="PEBD (LDPE)">PEBD (LDPE)</option>
                            <option value="PVC">PVC</option>
                            <option value="EPDM">EPDM</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Espesor</label>
                            <div className="relative">
                              <input 
                                type="number" 
                                value={zone.thickness || ''}
                                onChange={(e) => updateZone(zone.id, { thickness: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white pr-10"
                                disabled={zone.thicknessUnknown}
                              />
                              <span className="absolute right-3 top-2 text-slate-400 text-sm">mm</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Espesor desconocido</label>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                              <input type="checkbox" checked={zone.thicknessUnknown || false} onChange={e => updateZone(zone.id, { thicknessUnknown: e.target.checked, thickness: e.target.checked ? '' : zone.thickness })} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                              <span className="text-sm text-slate-700">Sí</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Acabado</label>
                          <select 
                            value={zone.finish || ''}
                            onChange={(e) => updateZone(zone.id, { finish: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                          >
                            <option value="">Seleccionar...</option>
                            <option value="Liso">Liso</option>
                            <option value="Rugoso">Rugoso</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Fabricante</label>
                            <input 
                              type="text" 
                              value={zone.brand || ''}
                              onChange={(e) => updateZone(zone.id, { brand: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                              disabled={zone.brandUnknown}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Fabricante desconocido</label>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                              <input type="checkbox" checked={zone.brandUnknown || false} onChange={e => updateZone(zone.id, { brandUnknown: e.target.checked, brand: e.target.checked ? '' : zone.brand })} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                              <span className="text-sm text-slate-700">Sí</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Color</label>
                          <input 
                            type="text" 
                            value={zone.color || ''}
                            onChange={(e) => updateZone(zone.id, { color: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Año de instalación</label>
                            <input 
                              type="number" 
                              value={zone.installationYear || ''}
                              onChange={(e) => updateZone(zone.id, { installationYear: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                              disabled={zone.yearUnknown}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Año desconocido</label>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                              <input type="checkbox" checked={zone.yearUnknown || false} onChange={e => updateZone(zone.id, { yearUnknown: e.target.checked, installationYear: e.target.checked ? '' : zone.installationYear })} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                              <span className="text-sm text-slate-700">Sí</span>
                            </label>
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Observaciones</label>
                          <textarea 
                            value={zone.geomembraneObservations || ''}
                            onChange={(e) => updateZone(zone.id, { geomembraneObservations: e.target.value })}
                            placeholder="Notas adicionales..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm min-h-[80px] bg-white pr-10"
                          />
                          <button 
                            onClick={() => handleStartTranscription(zone.id, 'geomembraneObservations', zone.geomembraneObservations || '')}
                            className={`absolute right-2 bottom-2 p-1.5 rounded-lg transition-colors ${recordingFieldId === `${zone.id}-geomembraneObservations` ? 'text-red-600 bg-red-100 animate-pulse' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                            title="Dictar por voz"
                          >
                            <Mic size={16} />
                          </button>
                        </div>

                        {renderPhotoGallery(zone.id, 'ZONE_GEOMEMBRANE', 'Fotos - Geomembrana')}
                      </div>
                    )}

                    {currentTab === 'RIESGOS' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-slate-800">
                            Riesgos y observaciones 
                            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full ml-2">
                              {getSubtabProgress(zone, 'RIESGOS')[0]}/{getSubtabProgress(zone, 'RIESGOS')[1]}
                            </span>
                          </h3>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Riesgos y observaciones</label>
                          <textarea 
                            value={zone.risksText || ''}
                            onChange={(e) => updateZone(zone.id, { risksText: e.target.value })}
                            placeholder="Trabajos en altura, sedimentos tóxicos, riesgos PRL, accesibilidad, meteo, otros..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm min-h-[80px] bg-white"
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Observaciones</label>
                          <textarea 
                            value={zone.risksObservations || ''}
                            onChange={(e) => updateZone(zone.id, { risksObservations: e.target.value })}
                            placeholder="Notas adicionales..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm min-h-[80px] bg-white pr-10"
                          />
                          <button 
                            onClick={() => handleStartTranscription(zone.id, 'risksObservations', zone.risksObservations || '')}
                            className={`absolute right-2 bottom-2 p-1.5 rounded-lg transition-colors ${recordingFieldId === `${zone.id}-risksObservations` ? 'text-red-600 bg-red-100 animate-pulse' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                            title="Dictar por voz"
                          >
                            <Mic size={16} />
                          </button>
                        </div>

                        {renderPhotoGallery(zone.id, 'ZONE_RISKS', 'Fotos - Riesgos y observaciones')}
                      </div>
                    )}

                    {currentTab === 'EQUIPOS' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-slate-800">
                            Equipos utilizados 
                            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full ml-2">
                              {getSubtabProgress(zone, 'EQUIPOS')[0]}/{getSubtabProgress(zone, 'EQUIPOS')[1]}
                            </span>
                          </h3>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Equipos</label>
                          <div className="flex gap-3">
                            {['COAT-DDP', 'COAT-DGA'].map(equip => {
                              const checked = (zone.equipment || []).includes(equip);
                              return (
                                <button
                                  key={equip}
                                  onClick={() => {
                                    let currentEquipment = [...(zone.equipment || [])];
                                    if (!checked) currentEquipment.push(equip);
                                    else currentEquipment = currentEquipment.filter(r => r !== equip);
                                    updateZone(zone.id, { equipment: currentEquipment });
                                  }}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${checked ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                  {equip}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Observaciones</label>
                          <textarea 
                            value={zone.equipmentObservations || ''}
                            onChange={(e) => updateZone(zone.id, { equipmentObservations: e.target.value })}
                            placeholder="Notas adicionales..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm min-h-[80px] bg-white pr-10"
                          />
                          <button 
                            onClick={() => handleStartTranscription(zone.id, 'equipmentObservations', zone.equipmentObservations || '')}
                            className={`absolute right-2 bottom-2 p-1.5 rounded-lg transition-colors ${recordingFieldId === `${zone.id}-equipmentObservations` ? 'text-red-600 bg-red-100 animate-pulse' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                            title="Dictar por voz"
                          >
                            <Mic size={16} />
                          </button>
                        </div>

                        {renderPhotoGallery(zone.id, 'ZONE_EQUIPMENT', 'Fotos - Equipos utilizados')}
                      </div>
                    )}
                    
                    </>
                    );
                    })()}
                  </div>

                  {/* ELEMENTOS GLOBALES DE ZONA (Debajo de las pestañas) */}
                  <div className="mt-8 border-t border-slate-200 pt-8 space-y-10">
                    
                    {/* Mapa de hallazgos */}
                    <InteractiveZoneMap 
                      zone={zone}
                      updateZone={updateZone}
                      setCameraModalOpen={setCameraModalOpen}
                      handleMapUpload={handleMapUpload}
                    />

                    {/* Fotos de zona */}
                    <div>
                      {renderPhotoGallery(zone.id, 'ZONE_PHOTOS', 'Fotos de zona')}
                    </div>

                    {/* Observaciones de zona */}
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-3">Observaciones de zona</label>
                      <div className="relative">
                        <textarea 
                          value={zone.zoneObservations || ''}
                          onChange={(e) => updateZone(zone.id, { zoneObservations: e.target.value })}
                          placeholder="Observaciones generales de esta zona..."
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm min-h-[120px] bg-white pr-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                        />
                        <button 
                          onClick={() => handleStartTranscription(zone.id, 'zoneObservations', zone.zoneObservations || '')}
                          className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors ${recordingFieldId === `${zone.id}-zoneObservations` ? 'text-red-600 bg-red-100 animate-pulse' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                          title="Dictar por voz"
                        >
                          <Mic size={18} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <ReportTextTemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => {
          setTemplatesModalOpen(false);
          setActiveTemplateField(null);
        }}
        currentContent={activeTemplateField ? (zones.find(z => z.id === activeTemplateField.zoneId) as any)?.[activeTemplateField.field] : ''}
        onSelectTemplate={(content) => {
          if (activeTemplateField) {
            updateZone(activeTemplateField.zoneId, { [activeTemplateField.field]: content });
          }
        }}
        title={activeTemplateField?.title || 'Plantillas'}
        category={activeTemplateField?.category || 'REPORT'}
      />
      <CameraCaptureModal 
        isOpen={!!cameraModalOpen}
        onClose={() => setCameraModalOpen(null)}
        onCapture={async (file) => {
          if (!cameraModalOpen) return;
          const { zoneId, type } = cameraModalOpen;
          setUploadingPhotos(prev => ({ ...prev, [`${zoneId}-${type}`]: true }));
          setCameraModalOpen(null);
          try {
            const url = await uploadService.uploadImage(file);
            if (type === 'MAP_BASE') {
              updateZone(zoneId, { baseImage: url });
            } else if (type === 'FINDING' && cameraModalOpen.findingId) {
              const newPhoto: InspectionReportPhoto = { id: uuidv4(), type: 'FINDING', url, caption: '' };
              const z = zones.find(x => x.id === zoneId);
              if (z) {
                const updatedFindings = (z.mapFindings || []).map(f => 
                  f.id === cameraModalOpen.findingId 
                    ? { ...f, photos: [...(f.photos || []), newPhoto] } 
                    : f
                );
                updateZone(zoneId, { mapFindings: updatedFindings });
              }
            } else {
              const newPhoto: InspectionReportPhoto = { id: uuidv4(), type: type as any, url, caption: '' };
              const z = zones.find(x => x.id === zoneId);
              if (z) updateZone(zoneId, { fotografias: [...(z.fotografias || []), newPhoto] });
            }
          } catch (err) {
            console.error('Error', err);
          } finally {
            setUploadingPhotos(prev => ({ ...prev, [`${zoneId}-${type}`]: false }));
          }
        }}
      />
      <ImageViewerModal 
        isOpen={!!viewingPhotoUrl}
        onClose={() => setViewingPhotoUrl(null)}
        imageUrl={viewingPhotoUrl}
      />
    </div>
  );
}
