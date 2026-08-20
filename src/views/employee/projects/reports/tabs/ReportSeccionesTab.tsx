import React, { useState, useRef, useEffect } from 'react';
import { InspectionReport, ReportSectionData, InspectionReportPhoto } from '../../../../../types/inspection-report';
import { Plus, Trash2, ChevronDown, ChevronRight, UploadCloud, ImageIcon, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { uploadService } from '../../../../../services/upload.service';
import { CameraCaptureModal } from './CameraCaptureModal';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface ReportSeccionesTabProps {
  report: InspectionReport;
  onChange: (updates: Partial<InspectionReport>) => void;
}

const DEFAULT_SECTION: ReportSectionData = {
  id: '',
  name: 'Nueva Sección',
  content: '',
  layout: '3',
  images: []
};

export function ReportSeccionesTab({ report, onChange }: ReportSeccionesTabProps) {
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({});
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [activeCameraTarget, setActiveCameraTarget] = useState<string | null>(null); // section ID

  // Get sections from extraData
  const sections: ReportSectionData[] = report.extraData?.sections || [];

  const handleUpdateSection = (sectionId: string, updates: Partial<ReportSectionData>) => {
    const updatedSections = sections.map(s => s.id === sectionId ? { ...s, ...updates } : s);
    onChange({ extraData: { ...report.extraData, sections: updatedSections } });
  };

  const handleAddSection = () => {
    const newSection: ReportSectionData = {
      ...DEFAULT_SECTION,
      id: crypto.randomUUID(),
      name: `Sección ${sections.length + 1}`
    };
    onChange({ extraData: { ...report.extraData, sections: [...sections, newSection] } });
    setExpandedSectionId(newSection.id);
  };

  const handleRemoveSection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('¿Seguro que deseas eliminar esta sección?')) return;
    const updatedSections = sections.filter(s => s.id !== id);
    onChange({ extraData: { ...report.extraData, sections: updatedSections } });
    if (expandedSectionId === id) setExpandedSectionId(null);
  };

  const handleMoveSection = (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;
    
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    onChange({ extraData: { ...report.extraData, sections: newSections } });
  };

  const processFileUpload = async (file: File, sectionId: string) => {
    setUploadingPhotos(prev => ({ ...prev, [sectionId]: true }));
    try {
      const url = await uploadService.uploadImage(file);
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        const newPhoto: InspectionReportPhoto = {
          id: crypto.randomUUID(),
          type: 'ZONE_PHOTOS',
          url,
          caption: ''
        };
        handleUpdateSection(sectionId, { images: [...section.images, newPhoto] });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la fotografía');
    } finally {
      setUploadingPhotos(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFileUpload(file, sectionId);
    e.target.value = '';
  };

  const handlePhotoCaptured = async (file: File) => {
    if (activeCameraTarget) {
      await processFileUpload(file, activeCameraTarget);
    }
  };

  const removePhoto = (sectionId: string, photoId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    handleUpdateSection(sectionId, {
      images: section.images.filter(p => p.id !== photoId)
    });
  };

  const updatePhotoCaption = (sectionId: string, photoId: string, caption: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    handleUpdateSection(sectionId, {
      images: section.images.map(p => p.id === photoId ? { ...p, caption } : p)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Secciones del informe</h2>
          <p className="text-sm text-slate-500">Añade secciones de texto libre y galerías de fotos.</p>
        </div>
        <button
          onClick={handleAddSection}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Plus size={16} /> Añadir Sección
        </button>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => {
          const isExpanded = expandedSectionId === section.id;

          return (
            <div key={section.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-blue-50/50 border-b border-blue-100' : ''}`}
                onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown size={20} className="text-blue-600" /> : <ChevronRight size={20} className="text-slate-400" />}
                  <span className="font-semibold text-slate-800">
                    {section.name || `Sección ${index + 1}`}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">
                    {section.images.length} fotos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => handleMoveSection(e, index, 'up')} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent">
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={(e) => handleMoveSection(e, index, 'down')} disabled={index === sections.length - 1} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent">
                    <ArrowDown size={16} />
                  </button>
                  <button onClick={(e) => handleRemoveSection(e, section.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md ml-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-6 space-y-8 bg-white border-t border-slate-100">
                  
                  {/* Titulo */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Título de la sección</label>
                    <input 
                      type="text" 
                      value={section.name} 
                      onChange={e => handleUpdateSection(section.id, { name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ej. Ejecución de impermeabilización..."
                    />
                  </div>

                  {/* Contenido (Rich Text) */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contenido</label>
                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                      <ReactQuill 
                        theme="snow" 
                        value={section.content || ''} 
                        onChange={val => handleUpdateSection(section.id, { content: val })}
                        className="bg-white h-64 pb-12"
                      />
                    </div>
                  </div>

                  {/* Fotos */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">Galería de fotos</h4>
                        <p className="text-xs text-slate-500">Selecciona cuántas fotos por fila mostrar en el PDF.</p>
                      </div>
                      
                      <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                        <button
                          onClick={() => handleUpdateSection(section.id, { layout: '1' })}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${section.layout === '1' ? 'bg-white shadow-sm text-blue-700 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          1 foto/fila
                        </button>
                        <button
                          onClick={() => handleUpdateSection(section.id, { layout: '2' })}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${section.layout === '2' ? 'bg-white shadow-sm text-blue-700 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          2 fotos/fila
                        </button>
                        <button
                          onClick={() => handleUpdateSection(section.id, { layout: '3' })}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${section.layout === '3' ? 'bg-white shadow-sm text-blue-700 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          3 fotos/fila
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <button 
                        onClick={() => { setActiveCameraTarget(section.id); setCameraModalOpen(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <CameraCaptureModal 
                          isOpen={cameraModalOpen && activeCameraTarget === section.id}
                          onClose={() => { setCameraModalOpen(false); setActiveCameraTarget(null); }}
                          onCapture={handlePhotoCaptured}
                        />
                        <ImageIcon size={14} /> Cámara
                      </button>
                      
                      <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                        {uploadingPhotos[section.id] ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} 
                        {uploadingPhotos[section.id] ? 'Subiendo...' : 'Galería'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, section.id)} />
                      </label>
                    </div>

                    {section.images.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {section.images.map((photo) => (
                          <div key={photo.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 group">
                            <div className="h-32 bg-slate-200 relative">
                              <img src={photo.url} alt="Section" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => removePhoto(section.id, photo.id)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="p-2 border-t border-slate-200 bg-white">
                              <input 
                                type="text"
                                placeholder="Pie de foto (opcional)"
                                value={photo.caption || ''}
                                onChange={e => updatePhotoCaption(section.id, photo.id, e.target.value)}
                                className="w-full text-xs px-2 py-1.5 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white transition-colors outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 bg-slate-50/50">
                        <ImageIcon size={32} className="text-slate-300 mb-3" />
                        <p className="text-sm font-medium">No hay fotos en esta sección</p>
                        <p className="text-xs mt-1">Usa los botones de arriba para añadir imágenes</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sections.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50">
            <p className="text-slate-500 font-medium mb-4">No has añadido ninguna sección todavía.</p>
            <button
              onClick={handleAddSection}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <Plus size={16} /> Crear primera sección
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
