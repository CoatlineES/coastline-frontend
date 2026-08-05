import React, { useState, useEffect } from 'react';
import { InspectionReport } from '../../../../../../types/inspection-report';
import { UserResponse } from '../../../../../../services/types';
import { projectsService } from '../../../../../../services/projects.service';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ReportTextTemplatesModal from '../ReportTextTemplatesModal';
import { uploadService } from '../../../../../../services/upload.service';
import { InspectionReportPhoto } from '../../../../../../types/inspection-report';
import { CameraCaptureModal } from '../CameraCaptureModal';

interface GeomembranasDatosTabProps {
  report: InspectionReport;
  onChange: (updates: Partial<InspectionReport>) => void;
}

export function GeomembranasDatosTab({ report, onChange }: GeomembranasDatosTabProps) {
  const [tecnicos, setTecnicos] = useState<UserResponse[]>([]);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const extraData = report.extraData || {};
  const fotosGenerales: InspectionReportPhoto[] = extraData.fotosGenerales || [];

  useEffect(() => {
    if (report?.projectId) {
      projectsService.getById(report.projectId).then(project => {
        if (project && project.workers) {
          const validWorkers = project.workers.filter(w => w.user);
          const sortedWorkers = [...validWorkers].sort((a: any, b: any) => {
            const aIsTecnico = a.role === 'TECNICO' || a.user?.role?.name === 'TECNICO' || a.user?.role === 'TECNICO';
            const bIsTecnico = b.role === 'TECNICO' || b.user?.role?.name === 'TECNICO' || b.user?.role === 'TECNICO';
            if (aIsTecnico && !bIsTecnico) return -1;
            if (!aIsTecnico && bIsTecnico) return 1;
            return a.user?.name?.localeCompare(b.user?.name) || 0;
          });
          const sortedUsers = sortedWorkers.map(w => ({ 
            ...w.user, 
            _isAssignedTecnico: w.role === 'TECNICO' || (w.user as any)?.role?.name === 'TECNICO' || (w.user as any)?.role === 'TECNICO' 
          }));
          setTecnicos(sortedUsers as any[]);
        }
      }).catch(err => console.error('Error fetching project team', err));
    }
  }, [report?.projectId]);

  const updateExtraData = (updates: any) => {
    onChange({ extraData: { ...extraData, ...updates } });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Datos generales de inspección</h2>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {/* Fechas */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Fecha de inicio *</label>
            <input
              type="date"
              value={report.date ? new Date(report.date).toISOString().split('T')[0] : ''}
              onChange={e => onChange({ date: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Fecha de fin</label>
            <input
              type="date"
              value={extraData.fechaFin || ''}
              onChange={e => updateExtraData({ fechaFin: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Horas */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Hora inicio</label>
            <input
              type="time"
              value={extraData.horaInicio || ''}
              onChange={e => updateExtraData({ horaInicio: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Hora fin</label>
            <input
              type="time"
              value={extraData.horaFin || ''}
              onChange={e => updateExtraData({ horaFin: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Tipo de inspección */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Tipo de inspección</label>
          <select
            value={extraData.tipoInspeccion || ''}
            onChange={e => updateExtraData({ tipoInspeccion: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="">Seleccionar...</option>
            <option value="Inspección inicial exhaustiva">Inspección inicial exhaustiva</option>
            <option value="Inspección anual">Inspección anual</option>
            <option value="Reinspección">Reinspección</option>
            <option value="Inspección post reparación">Inspección post reparación</option>
          </select>
        </div>

        {/* Técnico responsable */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Técnico responsable</label>
          <select
            value={report.technician || ''}
            onChange={e => onChange({ technician: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="">Selecciona un técnico...</option>
            {tecnicos.map(t => {
              const isTecnico = (t as any)._isAssignedTecnico;
              return (
                <option key={t.id} value={t.name}>
                  {t.name} {isTecnico ? '(Técnico)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Datos del proyecto automático */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">DATOS DEL PROYECTO (AUTOMÁTICO)</label>
            <p className="text-sm text-slate-700">Cliente: <span className="font-semibold">{report.clientName || 'Sin Cliente'}</span></p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 opacity-0">PROYECTO</label>
            <p className="text-sm text-slate-700">Proyecto: <span className="font-semibold">{report.number}</span></p>
          </div>
        </div>

        {/* Instalación / emplazamiento */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Instalación / emplazamiento</label>
          <input
            type="text"
            placeholder="Ej: Balsa principal, Depósito Norte..."
            value={extraData.instalacion || ''}
            onChange={e => updateExtraData({ instalacion: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Observaciones generales */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Observaciones generales</label>
            <button 
              onClick={() => setTemplatesModalOpen(true)}
              className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
            >
              Plantillas
            </button>
          </div>
          <div className="bg-white rounded-lg border border-slate-300 overflow-hidden min-h-[300px]">
            <ReactQuill 
              theme="snow" 
              value={report.globalRecomms || ''} 
              onChange={val => onChange({ globalRecomms: val })}
              className="h-[250px]"
              placeholder="Escribe las observaciones generales aquí..."
            />
          </div>
        </div>

        {/* Fotografías generales */}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <label className="block text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">Fotografías generales</label>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {fotosGenerales.map(photo => (
              <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
                <img src={photo.url} alt="Foto general" className="w-full h-full object-cover" />
                <button 
                  onClick={() => {
                    const nuevasFotos = fotosGenerales.filter(p => p.id !== photo.id);
                    updateExtraData({ fotosGenerales: nuevasFotos });
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-md text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            
            <label 
              onClick={(e) => {
                e.preventDefault();
                setCameraModalOpen(true);
              }}
              className="border-2 border-dashed border-slate-300 rounded-lg aspect-square flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <Camera size={24} className="mb-2" />
              <span className="text-xs font-medium">Tomar foto</span>
            </label>
            <label className="border-2 border-dashed border-slate-300 rounded-lg aspect-square flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
              <ImageIcon size={24} className="mb-2" />
              <span className="text-xs font-medium">Galería</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploading(true);
                  try {
                    const url = await uploadService.uploadImage(file);
                    const newPhoto: InspectionReportPhoto = {
                      id: crypto.randomUUID(),
                      type: 'GENERAL',
                      url,
                      caption: ''
                    };
                    updateExtraData({ fotosGenerales: [...fotosGenerales, newPhoto] });
                  } catch (err) {
                    console.error('Error uploading photo', err);
                  } finally {
                    setIsUploading(false);
                  }
                  e.target.value = '';
                }} 
              />
            </label>
            {isUploading && (
              <div className="border-2 border-slate-200 rounded-lg aspect-square flex flex-col items-center justify-center bg-slate-50">
                <span className="text-xs text-slate-500 animate-pulse">Subiendo...</span>
              </div>
            )}
          </div>
        </div>

      </div>

      <ReportTextTemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        currentContent={report.globalRecomms}
        onSelectTemplate={(content) => onChange({ globalRecomms: content })}
        title="Plantillas de Observaciones"
        category="REPORT_OBSERVATIONS"
      />

      <CameraCaptureModal 
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={async (file) => {
          setIsUploading(true);
          setCameraModalOpen(false);
          try {
            const url = await uploadService.uploadImage(file);
            const newPhoto: InspectionReportPhoto = {
              id: crypto.randomUUID(),
              type: 'GENERAL',
              url,
              caption: ''
            };
            updateExtraData({ fotosGenerales: [...fotosGenerales, newPhoto] });
          } catch (err) {
            console.error('Error uploading captured photo', err);
          } finally {
            setIsUploading(false);
          }
        }}
      />
    </div>
  );
}
