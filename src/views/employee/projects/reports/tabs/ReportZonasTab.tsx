import React, { useState, useEffect, useRef } from 'react';
import { InspectionReport, InspectionReportZone } from '../../../../../types/inspection-report';
import { Plus, Trash2, ChevronDown, ChevronRight, UploadCloud, ImageIcon, Mic, Edit2, Loader2 } from 'lucide-react';
import { projectPlanningService, ProjectTask } from '../../../../../services/project-planning.service';
import { uploadService } from '../../../../../services/upload.service';
import { CameraCaptureModal } from './CameraCaptureModal';
import ReportTextTemplatesModal from './ReportTextTemplatesModal';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface ReportZonasTabProps {
  report: InspectionReport;
  onChange: (updates: Partial<InspectionReport>) => void;
}

const DEFAULT_ZONE: InspectionReportZone = {
  id: '',
  name: '',
  area: 0,
  tipologia: { superficie: 'Transitable', impermeabilizacion: 'Tela asfáltica', estado: 4 },
  caracterizacion: { uso: 'Terraza', proteccion: ['Baldosa'], estructura: 'Hormigón' },
  remates: { altura: 'Correcto', alturaObs: '', estado: 'Funcional', estadoObs: '' },
  drenajes: { numero: 1, desconocido: false, estado: 'Buen estado', estadoObs: '' },
  patologiasVisuales: [],
  patologiasVisualesObs: '',
  patologiasEquipo: {
    criticas: { num: 0, area: 0 },
    moderadas: { num: 0, area: 0 },
    observacion: { num: 0, area: 0 },
    observaciones: ''
  },
  riesgosPrl: [],
  riesgosPrlObs: '',
  observacionesGenerales: '',
  recomendaciones: '',
  fotografias: []
};

// Select Options
const SUPERFICIE_OPTIONS = ['Transitable', 'No transitable', 'Ajardinada', 'Otro'];
const IMPERMEABILIZACION_OPTIONS = ['Tela asfáltica', 'PVC', 'Poliuretano', 'EPDM', 'Otro'];
const USO_OPTIONS = ['Terraza / Zona peatonal', 'Cubierta técnica', 'Jardín', 'Otro'];
const ESTRUCTURA_OPTIONS = ['Hormigón', 'Madera', 'Metálica', 'Mixta', 'Otro'];
const PROTECCION_OPTIONS = ['Autoprotegida', 'Geotextil', 'Plancha XPS', 'Vegetación', 'Sin protección', 'Baldosa / Solado', 'Grava', 'Otro'];
const REMATE_ALTURA_OPTIONS = ['Correcto (≥ 20 cm)', 'Incorrecto (< 20 cm)'];
const REMATE_ESTADO_OPTIONS = ['Funcional', 'Deficiente', 'Inexistente'];
const DRENAJE_ESTADO_OPTIONS = ['Buen estado', 'Obstruido', 'Deficiente'];
const PATOLOGIAS_VISUALES_OPTIONS = ['Grietas / fisuras', 'Ampollas', 'Encharcamientos', 'Desprendimientos', 'Desgaste', 'Vegetación', 'Manchas humedad', 'Sin patologías'];
const RIESGOS_PRL_OPTIONS = ['Riesgo de caída en altura', 'Superficie frágil', 'Riesgo eléctrico', 'Posible amianto', 'Dificultad de acceso', 'Sin riesgos destacables'];

export function ReportZonasTab({ report, onChange }: ReportZonasTabProps) {
  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null);
  const [capitulos, setCapitulos] = useState<ProjectTask[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({});
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [activeCameraTarget, setActiveCameraTarget] = useState<{zoneId: string, type: 'GENERAL' | 'MAP' | 'DETAIL'} | null>(null);
  const [recordingPhotoId, setRecordingPhotoId] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  const zones = report.zonesData || [];

  // Mantener una referencia actualizada a las zonas para evitar cierres léxicos (stale closures) en eventos asíncronos
  const zonesRef = useRef(zones);
  useEffect(() => {
    zonesRef.current = zones;
  }, [zones]);

  const handleStartTranscription = (zoneId: string, photoId: string, currentCaption: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta el reconocimiento de voz. Usa Chrome o Safari/Edge recientes.");
      return;
    }

    // Si ya estamos grabando, al pulsar de nuevo lo paramos (toggle)
    if (recordingPhotoId === photoId) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setRecordingPhotoId(null);
      return;
    }

    // Parar cualquier grabación previa antes de iniciar una nueva
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'es-ES';
    recognition.continuous = true; // Parar solo cuando el usuario haga clic de nuevo
    recognition.interimResults = true; // Mostrar resultados mientras habla

    let finalTranscript = '';

    recognition.onstart = () => {
      setRecordingPhotoId(photoId);
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
      
      const newText = (currentCaption ? currentCaption + ' ' : '') + finalTranscript + interim;
      
      const currentZones = zonesRef.current;
      const zone = currentZones.find(z => z.id === zoneId);
      if (zone) {
         const updatedPhotos = zone.fotografias.map(f => f.id === photoId ? { ...f, caption: newText } : f);
         const updatedZones = currentZones.map(z => z.id === zoneId ? { ...z, fotografias: updatedPhotos } : z);
         onChange({ zonesData: updatedZones });
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'no-speech') {
        alert("Error de micrófono: " + event.error);
      }
      setRecordingPhotoId(null);
    };

    recognition.onend = () => {
      // Opcional: Si queremos que se mantenga encendido indefinidamente incluso si se corta por silencio,
      // podríamos reiniciar la instancia aquí siempre que recordingPhotoId === photoId. 
      // Pero 'continuous = true' suele bastar. Limpiamos la UI si el navegador decide cerrarlo:
      setRecordingPhotoId(null);
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

  const processFileUpload = async (file: File, zoneId: string, type: 'GENERAL' | 'MAP' | 'DETAIL') => {
    const uploadKey = `${zoneId}-${type}`;
    setUploadingPhotos(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const url = await uploadService.uploadImage(file);
      const zone = zones.find(z => z.id === zoneId);
      if (zone) {
        const newPhoto: InspectionReportPhoto = {
          id: crypto.randomUUID(),
          type,
          url,
          caption: ''
        };
        handleUpdateZone(zoneId, { fotografias: [...zone.fotografias, newPhoto] });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la fotografía a Cloudinary');
    } finally {
      setUploadingPhotos(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, zoneId: string, type: 'GENERAL' | 'MAP' | 'DETAIL') => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFileUpload(file, zoneId, type);
    e.target.value = '';
  };

  const handlePhotoCaptured = async (file: File) => {
    if (activeCameraTarget) {
      await processFileUpload(file, activeCameraTarget.zoneId, activeCameraTarget.type);
    }
  };

  useEffect(() => {
    if (report.projectId) {
      projectPlanningService.getPlansByProjectId(report.projectId)
        .then(plans => {
          console.log('Fetched plans:', plans);
          if (plans && Array.isArray(plans)) {
            const activePlan = plans.find(p => p.isActive) || plans[0];
            if (activePlan) {
              console.log('Fetching plan tree for:', activePlan.id);
              return projectPlanningService.getPlanTree(activePlan.id);
            }
          } else if (plans && (plans as any).data && Array.isArray((plans as any).data)) {
            // Check if wrapped in { success, data }
            const realPlans = (plans as any).data;
            const activePlan = realPlans.find((p: any) => p.isActive) || realPlans[0];
            if (activePlan) {
              console.log('Fetching plan tree from wrapped data:', activePlan.id);
              return projectPlanningService.getPlanTree(activePlan.id);
            }
          }
          return null;
        })
        .then(planTree => {
          console.log('Fetched plan tree:', planTree);
          let realTasks = [];
          if (planTree && planTree.tasks) {
            realTasks = planTree.tasks;
          } else if (planTree && (planTree as any).data && (planTree as any).data.tasks) {
            realTasks = (planTree as any).data.tasks;
          }
          if (realTasks && realTasks.length > 0) {
            // Sugerir tareas de nivel superior o tipo CAPITULO/ZONE
            const caps = realTasks.filter((t: any) => t.type === 'CAPITULO' || t.type === 'ZONE' || !t.parentId);
            
            // Calculate max area from children if quantity is missing
            const enrichedCaps = caps.map((c: any) => {
              if (!c.quantity && c.children && c.children.length > 0) {
                c.quantity = c.children.reduce((max: number, child: any) => Math.max(max, child.quantity || 0), 0);
              }
              return c;
            });
            console.log('Setting capitulos:', enrichedCaps);
            setCapitulos(enrichedCaps);
          } else {
            console.log('No capitulos found or realTasks empty:', realTasks);
          }
        })
        .catch(err => console.error('Error fetching plan tasks', err));
    }
  }, [report.projectId]);

  const handleAddZone = () => {
    const newZone: InspectionReportZone = {
      ...DEFAULT_ZONE,
      id: crypto.randomUUID(),
      name: ''
    };
    onChange({ zonesData: [...zones, newZone] });
    setExpandedZoneId(newZone.id);
  };

  const handleUpdateZone = (id: string, updates: Partial<InspectionReportZone>) => {
    const updatedZones = zones.map(z => z.id === id ? { ...z, ...updates } : z);
    onChange({ zonesData: updatedZones });
  };

  const handleDeleteZone = (id: string) => {
    if (!window.confirm('¿Eliminar esta zona?')) return;
    onChange({ zonesData: zones.filter(z => z.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Zonas de Inspección</h2>
          <p className="text-sm text-slate-500">Añade y configura cada zona inspeccionada, sus patologías y fotografías.</p>
        </div>
        <button 
          onClick={handleAddZone}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus size={16} />
          Añadir Zona
        </button>
      </div>

      <div className="space-y-4">
        {zones.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-slate-400" size={24} />
            </div>
            <h3 className="text-slate-800 font-medium mb-1">No hay zonas</h3>
            <p className="text-slate-500 text-sm">Empieza añadiendo la primera zona de inspección.</p>
          </div>
        ) : (
          zones.map((zone, index) => (
            <div key={zone.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all">
              {/* HEADER ZONA */}
              <div 
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedZoneId(expandedZoneId === zone.id ? null : zone.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{zone.name || 'Sin nombre'}</h3>
                    <p className="text-xs text-slate-500">{zone.area} m² · {zone.fotografias.length} fotos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone.id); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  {expandedZoneId === zone.id ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                </div>
              </div>

              {/* CONTENIDO EXPANDIDO */}
              {expandedZoneId === zone.id && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-8">
                  
                  {/* DATOS BÁSICOS */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Nombre de la zona</label>
                      <input
                        type="text"
                        list={`capitulos-list-${zone.id}`}
                        value={zone.name}
                        placeholder={`Zona ${index + 1}`}
                        onChange={e => {
                          const val = e.target.value;
                          const selected = capitulos.find(c => c.name === val);
                          if (selected && selected.quantity) {
                            handleUpdateZone(zone.id, { name: val, area: selected.quantity });
                          } else {
                            handleUpdateZone(zone.id, { name: val });
                          }
                        }}
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                      <datalist id={`capitulos-list-${zone.id}`}>
                        {capitulos.map(c => (
                          <option key={c.id} value={c.name} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Área (m²)</label>
                      <input
                        type="number"
                        value={zone.area}
                        onChange={e => handleUpdateZone(zone.id, { area: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* TIPOLOGÍA Y SISTEMA IMPERMEABILIZANTE */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 uppercase tracking-wider">Tipología y sistema impermeabilizante</h4>
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipología de superficie</label>
                        <select
                          value={zone.tipologia?.superficie || ''}
                          onChange={e => handleUpdateZone(zone.id, { tipologia: { ...zone.tipologia, superficie: e.target.value } })}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="">Selecciona tipología...</option>
                          {SUPERFICIE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipo de impermeabilización</label>
                        <select
                          value={zone.tipologia?.impermeabilizacion || ''}
                          onChange={e => handleUpdateZone(zone.id, { tipologia: { ...zone.tipologia, impermeabilizacion: e.target.value } })}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="">Selecciona tipo...</option>
                          {IMPERMEABILIZACION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Estado de la membrana</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(val => (
                          <button
                            key={val}
                            onClick={() => handleUpdateZone(zone.id, { tipologia: { ...zone.tipologia, estado: val } })}
                            className={`w-10 h-10 rounded-lg border font-medium flex items-center justify-center transition-colors ${zone.tipologia?.estado === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{zone.tipologia?.estado === 5 ? 'Bueno' : zone.tipologia?.estado === 1 ? 'Malo' : 'Regular'}</p>
                    </div>
                  </div>

                  {/* CARACTERIZACIÓN */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 uppercase tracking-wider">Caracterización</h4>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Uso de la superficie</label>
                        <select
                          value={zone.caracterizacion?.uso || ''}
                          onChange={e => handleUpdateZone(zone.id, { caracterizacion: { ...zone.caracterizacion, uso: e.target.value } })}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="">Selecciona uso...</option>
                          {USO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2 grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Protección de la membrana</label>
                          <div className="flex flex-wrap gap-2">
                            {PROTECCION_OPTIONS.map(opt => {
                              const isSelected = zone.caracterizacion?.proteccion?.includes(opt);
                              return (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    const current = zone.caracterizacion?.proteccion || [];
                                    const next = isSelected ? current.filter(x => x !== opt) : [...current, opt];
                                    handleUpdateZone(zone.id, { caracterizacion: { ...zone.caracterizacion, proteccion: next } });
                                  }}
                                  className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${isSelected ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Estructura</label>
                          <select
                            value={zone.caracterizacion?.estructura || ''}
                            onChange={e => handleUpdateZone(zone.id, { caracterizacion: { ...zone.caracterizacion, estructura: e.target.value } })}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                          >
                            <option value="">Selecciona estructura...</option>
                            {ESTRUCTURA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* REMATE PERIMETRAL */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 uppercase tracking-wider">Remate Perimetral</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Altura del remate perimetral</label>
                        <select
                          value={zone.remates?.altura || ''}
                          onChange={e => handleUpdateZone(zone.id, { remates: { ...zone.remates, altura: e.target.value } })}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm mb-2"
                        >
                          <option value="">Selecciona altura...</option>
                          {REMATE_ALTURA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <textarea
                          placeholder="Observaciones..."
                          value={zone.remates?.alturaObs || ''}
                          onChange={e => handleUpdateZone(zone.id, { remates: { ...zone.remates, alturaObs: e.target.value } })}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm min-h-[80px]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Estado del remate perimetral</label>
                        <select
                          value={zone.remates?.estado || ''}
                          onChange={e => handleUpdateZone(zone.id, { remates: { ...zone.remates, estado: e.target.value } })}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm mb-2"
                        >
                          <option value="">Selecciona estado...</option>
                          {REMATE_ESTADO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <textarea
                          placeholder="Observaciones..."
                          value={zone.remates?.estadoObs || ''}
                          onChange={e => handleUpdateZone(zone.id, { remates: { ...zone.remates, estadoObs: e.target.value } })}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DRENAJES */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 uppercase tracking-wider">Drenajes</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Número de desagües</label>
                          <input
                            type="number"
                            value={zone.drenajes?.numero || 0}
                            onChange={e => handleUpdateZone(zone.id, { drenajes: { ...zone.drenajes, numero: Number(e.target.value) } })}
                            disabled={zone.drenajes?.desconocido}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm disabled:bg-slate-50"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-7">
                          <input
                            type="checkbox"
                            id={`drenajes-desc-${zone.id}`}
                            checked={zone.drenajes?.desconocido || false}
                            onChange={e => handleUpdateZone(zone.id, { drenajes: { ...zone.drenajes, desconocido: e.target.checked } })}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`drenajes-desc-${zone.id}`} className="text-sm text-slate-700">Desconocido</label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Estado de los desagües</label>
                        <select
                          value={zone.drenajes?.estado || ''}
                          onChange={e => handleUpdateZone(zone.id, { drenajes: { ...zone.drenajes, estado: e.target.value } })}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="">Selecciona estado...</option>
                          {DRENAJE_ESTADO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <textarea
                          placeholder="Observaciones sobre drenajes..."
                          value={zone.drenajes?.estadoObs || ''}
                          onChange={e => handleUpdateZone(zone.id, { drenajes: { ...zone.drenajes, estadoObs: e.target.value } })}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PATOLOGÍAS VISUALES */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 uppercase tracking-wider">Patologías Visuales</h4>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {PATOLOGIAS_VISUALES_OPTIONS.map(opt => {
                        const isSelected = zone.patologiasVisuales?.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              const current = zone.patologiasVisuales || [];
                              const next = isSelected ? current.filter(x => x !== opt) : [...current, opt];
                              handleUpdateZone(zone.id, { patologiasVisuales: next });
                            }}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isSelected ? 'bg-white text-blue-700 border-blue-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <textarea
                      placeholder="Observaciones sobre patologías visuales..."
                      value={zone.patologiasVisualesObs || ''}
                      onChange={e => handleUpdateZone(zone.id, { patologiasVisualesObs: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm min-h-[100px]"
                    />
                  </div>

                  {/* FUGAS DETECTADAS (PATOLOGÍAS EQUIPO) */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Patologías detectadas con equipo (Fugas)</h4>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="font-medium text-red-900 text-sm">Fugas Críticas</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase text-red-600 mb-1">Cantidad</label>
                            <input type="number" value={zone.patologiasEquipo.criticas.num} onChange={e => handleUpdateZone(zone.id, { patologiasEquipo: { ...zone.patologiasEquipo, criticas: { ...zone.patologiasEquipo.criticas, num: Number(e.target.value) } } })} className="w-full px-3 py-1.5 rounded border-red-200 text-sm bg-white" />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-red-600 mb-1">Área (m²)</label>
                            <input type="number" value={zone.patologiasEquipo.criticas.area} onChange={e => handleUpdateZone(zone.id, { patologiasEquipo: { ...zone.patologiasEquipo, criticas: { ...zone.patologiasEquipo.criticas, area: Number(e.target.value) } } })} className="w-full px-3 py-1.5 rounded border-red-200 text-sm bg-white" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="font-medium text-yellow-900 text-sm">Fugas Moderadas</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase text-yellow-600 mb-1">Cantidad</label>
                            <input type="number" value={zone.patologiasEquipo.moderadas.num} onChange={e => handleUpdateZone(zone.id, { patologiasEquipo: { ...zone.patologiasEquipo, moderadas: { ...zone.patologiasEquipo.moderadas, num: Number(e.target.value) } } })} className="w-full px-3 py-1.5 rounded border-yellow-200 text-sm bg-white" />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-yellow-600 mb-1">Área (m²)</label>
                            <input type="number" value={zone.patologiasEquipo.moderadas.area} onChange={e => handleUpdateZone(zone.id, { patologiasEquipo: { ...zone.patologiasEquipo, moderadas: { ...zone.patologiasEquipo.moderadas, area: Number(e.target.value) } } })} className="w-full px-3 py-1.5 rounded border-yellow-200 text-sm bg-white" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="font-medium text-blue-900 text-sm">En Observación</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase text-blue-600 mb-1">Cantidad</label>
                            <input type="number" value={zone.patologiasEquipo.observacion.num} onChange={e => handleUpdateZone(zone.id, { patologiasEquipo: { ...zone.patologiasEquipo, observacion: { ...zone.patologiasEquipo.observacion, num: Number(e.target.value) } } })} className="w-full px-3 py-1.5 rounded border-blue-200 text-sm bg-white" />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-blue-600 mb-1">Área (m²)</label>
                            <input type="number" value={zone.patologiasEquipo.observacion.area} onChange={e => handleUpdateZone(zone.id, { patologiasEquipo: { ...zone.patologiasEquipo, observacion: { ...zone.patologiasEquipo.observacion, area: Number(e.target.value) } } })} className="w-full px-3 py-1.5 rounded border-blue-200 text-sm bg-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIESGOS SEGÚN PRL */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 uppercase tracking-wider">Riesgos Según PRL</h4>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {RIESGOS_PRL_OPTIONS.map(opt => {
                        const isSelected = zone.riesgosPrl?.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              const current = zone.riesgosPrl || [];
                              const next = isSelected ? current.filter(x => x !== opt) : [...current, opt];
                              handleUpdateZone(zone.id, { riesgosPrl: next });
                            }}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isSelected ? 'bg-white text-blue-700 border-blue-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <textarea
                      placeholder="Observaciones PRL..."
                      value={zone.riesgosPrlObs || ''}
                      onChange={e => handleUpdateZone(zone.id, { riesgosPrlObs: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm min-h-[80px]"
                    />
                  </div>

                  {/* OBSERVACIONES GENERALES */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 uppercase tracking-wider">Observaciones Generales</h4>
                    <div className="bg-white rounded-lg border border-slate-300 overflow-hidden">
                      <ReactQuill 
                        theme="snow" 
                        value={zone.observacionesGenerales || ''} 
                        onChange={val => handleUpdateZone(zone.id, { observacionesGenerales: val })}
                        className="h-48 mb-10"
                      />
                    </div>
                  </div>

                  {/* FOTOGRAFÍAS */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 uppercase tracking-wider">Fotografías</h4>
                    <p className="text-xs text-slate-500 mb-6 italic">Arrastra las fotos para reordenarlas, moverlas entre bloques o entre zonas. Usa el icono ↻ para rotar 90°.</p>
                    
                    {[
                      { type: 'GENERAL', title: 'Imagen general del área' },
                      { type: 'MAP', title: 'Imagen cenital / mapa de fugas' },
                      { type: 'DETAIL', title: 'Fotos de detalle' }
                    ].map(section => (
                      <div key={section.type} className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <ImageIcon size={16} className="text-blue-500" />
                            {section.title}
                          </h5>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => {
                                setActiveCameraTarget({ zoneId: zone.id, type: section.type as any });
                                setCameraModalOpen(true);
                              }}
                              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                            >
                              <ImageIcon size={14} /> Cámara
                            </button>
                            <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer">
                              <UploadCloud size={14} /> Galería
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, zone.id, section.type as any)} />
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          {/* Botón de añadir */}
                          <label className={`border-2 border-dashed border-slate-300 rounded-xl h-48 flex flex-col items-center justify-center transition-colors cursor-pointer bg-slate-50/50 ${uploadingPhotos[`${zone.id}-${section.type}`] ? 'border-blue-300 bg-blue-50/50' : 'hover:bg-slate-50 hover:border-slate-400'}`}>
                            {uploadingPhotos[`${zone.id}-${section.type}`] ? (
                              <>
                                <Loader2 size={24} className="mb-2 text-blue-500 animate-spin" />
                                <span className="text-xs font-medium text-blue-600">Subiendo...</span>
                              </>
                            ) : (
                              <>
                                <Plus size={24} className="mb-2 text-slate-400" />
                                <span className="text-xs font-medium text-slate-500">Añadir foto</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, zone.id, section.type as any)} 
                              disabled={uploadingPhotos[`${zone.id}-${section.type}`]} 
                            />
                          </label>

                          {/* Fotos de esta categoría */}
                          {zone.fotografias.filter(f => f.type === section.type).map(photo => (
                            <div key={photo.id} className="relative group rounded-xl overflow-hidden h-48 border border-slate-200 bg-white shadow-sm flex flex-col">
                              <div className="flex-1 overflow-hidden relative bg-slate-100">
                                <img src={photo.url} className="w-full h-full object-cover" />
                                <button 
                                  onClick={() => {
                                    if (!window.confirm('¿Eliminar esta foto?')) return;
                                    handleUpdateZone(zone.id, { fotografias: zone.fotografias.filter(f => f.id !== photo.id) });
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div className="h-16 p-2 bg-white flex items-center gap-2 border-t border-slate-100">
                                <textarea 
                                  placeholder="Descripción de la foto..."
                                  value={photo.caption || ''}
                                  onChange={e => {
                                    const updatedPhotos = zone.fotografias.map(f => f.id === photo.id ? { ...f, caption: e.target.value } : f);
                                    handleUpdateZone(zone.id, { fotografias: updatedPhotos });
                                  }}
                                  className="text-[11px] text-slate-600 flex-1 h-full resize-none bg-transparent outline-none p-1"
                                />
                                <div className="flex flex-col gap-1">
                                  <button 
                                    onClick={() => handleStartTranscription(zone.id, photo.id, photo.caption || '')}
                                    className={`p-1 rounded transition-colors ${recordingPhotoId === photo.id ? 'text-red-600 bg-red-100 animate-pulse' : 'text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50'}`}
                                    title={recordingPhotoId === photo.id ? 'Escuchando...' : 'Dictar por voz'}
                                  >
                                    <Mic size={14} />
                                  </button>
                                  <button className="p-1 text-slate-400 hover:text-blue-600 rounded bg-slate-50 hover:bg-blue-50">
                                    <Edit2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* RECOMENDACIONES DE LA ZONA */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 uppercase tracking-wider">Recomendaciones</h4>
                    <textarea
                      placeholder="Recomendaciones de intervención para esta zona..."
                      value={zone.recomendaciones || ''}
                      onChange={e => handleUpdateZone(zone.id, { recomendaciones: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm min-h-[120px]"
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* RECOMENDACIONES GLOBALES */}
      <div className="mt-12 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Recomendaciones Globales</h3>
            <p className="text-sm text-slate-500 mt-1">Estas recomendaciones aparecerán al final del informe, resumiendo las acciones principales para todas las zonas inspeccionadas.</p>
          </div>
          <button 
            onClick={() => setTemplatesModalOpen(true)}
            className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center gap-2"
          >
            Plantillas
          </button>
        </div>
        <div className="bg-white rounded-lg border border-slate-300 overflow-hidden">
          <ReactQuill 
            theme="snow" 
            value={report.globalRecomms || ''} 
            onChange={val => onChange({ globalRecomms: val })}
            className="h-64 mb-10"
          />
        </div>
      </div>

      <CameraCaptureModal 
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handlePhotoCaptured}
      />

      <ReportTextTemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        currentContent={report.globalRecomms}
        onSelectTemplate={(content) => onChange({ globalRecomms: content })}
        title="Plantillas de Recomendaciones"
        category="REPORT_RECOMMS"
      />
    </div>
  );
}
