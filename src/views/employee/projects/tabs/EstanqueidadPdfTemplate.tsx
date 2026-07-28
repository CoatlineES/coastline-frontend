import React, { forwardRef } from 'react';
import { Project } from '../../../../services/types';
import { WaterproofingCertificate } from '../../../../services/waterproofing.service';
import { ShieldCheck, Calendar, User, CheckCircle, XCircle, Clock } from 'lucide-react';

interface EstanqueidadPdfTemplateProps {
  cert: WaterproofingCertificate;
  project: Project;
}

export const EstanqueidadPdfTemplate = forwardRef<HTMLDivElement, EstanqueidadPdfTemplateProps>(({ cert, project }, ref) => {
  return (
    <div ref={ref} className="bg-white p-10 font-sans text-slate-800" style={{ width: '800px', minHeight: '1120px' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[#002D5A] pb-6 mb-8">
        <div>
          <div className="text-3xl font-bold text-[#002D5A] tracking-tight mb-1">COATLINE</div>
          <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">Sistemas de Impermeabilización</div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-slate-800">Certificado de Estanqueidad</h1>
          <div className="text-sm text-slate-500 mt-1">ID: #{cert.id.substring(0, 8).toUpperCase()}</div>
        </div>
      </div>

      {/* Project & Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Datos del Proyecto</h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-semibold text-slate-700">Proyecto:</span> {project.name}</div>
            <div><span className="font-semibold text-slate-700">Cliente:</span> {project.account?.name || 'N/A'}</div>
            {project.location && <div><span className="font-semibold text-slate-700">Ubicación:</span> {project.location}</div>}
          </div>
        </div>
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Datos de Inspección</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <span className="font-semibold text-slate-700">Fecha:</span> {new Date(cert.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400" />
              <span className="font-semibold text-slate-700">Técnico:</span> {cert.technician?.name || 'No asignado'}
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-slate-400" />
              <span className="font-semibold text-slate-700">Estado global:</span> 
              <span className={`font-bold ${
                cert.status === 'APPROVED' ? 'text-emerald-600' : 
                cert.status === 'REJECTED' ? 'text-red-600' : 'text-amber-600'
              }`}>
                {cert.status === 'APPROVED' ? 'Aprobado' : cert.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Zones */}
      <h3 className="text-lg font-bold text-[#002D5A] border-b border-slate-200 pb-2 mb-4">Inspección por Zonas</h3>
      <div className="space-y-6 mb-8">
        {cert.zones.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No se especificaron zonas para esta inspección.</p>
        ) : (
          cert.zones.map((zone, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-800 text-base">
                  {zone.customName || zone.task?.name || `Zona ${idx + 1}`}
                </h4>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  zone.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                  zone.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {zone.status === 'APPROVED' ? <CheckCircle size={12} /> : 
                   zone.status === 'REJECTED' ? <XCircle size={12} /> : <Clock size={12} />}
                  {zone.status === 'APPROVED' ? 'Aprobado' : zone.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                </div>
              </div>
              
              {zone.notes && (
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded mb-3">
                  <span className="font-semibold text-slate-700 block mb-1">Observaciones:</span>
                  {zone.notes}
                </div>
              )}

              {zone.photos && zone.photos.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Evidencia Fotográfica</span>
                  <div className="grid grid-cols-4 gap-2">
                    {zone.photos.map((photo, pIdx) => (
                      <div key={pIdx} className="aspect-video bg-slate-100 rounded overflow-hidden border border-slate-200">
                        {/* We use crossOrigin="anonymous" to avoid canvas tainting issues with html2pdf */}
                        <img src={photo} alt={`Foto ${pIdx + 1}`} className="w-full h-full object-cover" crossOrigin="anonymous" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* General Notes */}
      {cert.notes && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#002D5A] border-b border-slate-200 pb-2 mb-3">Observaciones Generales</h3>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
            {cert.notes}
          </div>
        </div>
      )}

      {/* General Photos */}
      {cert.generalPhotos && cert.generalPhotos.length > 0 && (
        <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
          <h3 className="text-lg font-bold text-[#002D5A] border-b border-slate-200 pb-2 mb-3">Fotografías Generales</h3>
          <div className="grid grid-cols-4 gap-3">
            {cert.generalPhotos.map((photo, idx) => (
              <div key={idx} className="aspect-video bg-slate-100 rounded overflow-hidden border border-slate-200">
                <img src={photo} alt={`Foto general ${idx + 1}`} className="w-full h-full object-cover" crossOrigin="anonymous" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer / Signatures */}
      <div className="mt-16 pt-8 border-t border-slate-200" style={{ pageBreakInside: 'avoid' }}>
        <div className="grid grid-cols-2 gap-12">
          <div className="text-center">
            <div className="h-20 border-b border-slate-400 mb-2"></div>
            <div className="font-bold text-slate-800 text-sm">{cert.technician?.name || 'Firma del Técnico'}</div>
            <div className="text-xs text-slate-500">Coatline S.L.</div>
          </div>
          <div className="text-center">
            <div className="h-20 border-b border-slate-400 mb-2"></div>
            <div className="font-bold text-slate-800 text-sm">Firma del Cliente / Propiedad</div>
            <div className="text-xs text-slate-500">{project.account?.name || 'Cliente'}</div>
          </div>
        </div>
        <div className="text-center text-xs text-slate-400 mt-12">
          Este documento certifica las pruebas de estanqueidad realizadas en la fecha indicada.
          <br />COATLINE S.L. - Soluciones avanzadas en impermeabilización
        </div>
      </div>
    </div>
  );
});

EstanqueidadPdfTemplate.displayName = 'EstanqueidadPdfTemplate';
