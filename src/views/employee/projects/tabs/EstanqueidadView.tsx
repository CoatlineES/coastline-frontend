import React, { useState, useEffect } from 'react';
import { Project } from '../../../../services/types';
import { waterproofingService, WaterproofingCertificate } from '../../../../services/waterproofing.service';
import { Plus, Search, CheckCircle, Clock, XCircle, FileCheck, Calendar, User, Trash2, Download } from 'lucide-react';
import { EstanqueidadModal } from './EstanqueidadModal';
import { EstanqueidadPdfTemplate } from './EstanqueidadPdfTemplate';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';

interface EstanqueidadViewProps {
  project: Project;
}

export function EstanqueidadView({ project }: EstanqueidadViewProps) {
  const [certificates, setCertificates] = useState<WaterproofingCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<WaterproofingCertificate | null>(null);
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);
  const pdfRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCertificates();
  }, [project.id]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await waterproofingService.getByProject(project.id);
      setCertificates(data);
    } catch (error) {
      console.error('Error loading waterproofing certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedCert(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cert: WaterproofingCertificate) => {
    setSelectedCert(cert);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que deseas eliminar este certificado? Esta acción no se puede deshacer.')) {
      try {
        await waterproofingService.delete(id);
        setCertificates(certificates.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting certificate:', error);
        alert('Hubo un error al eliminar el certificado.');
      }
    }
  };

  const handleDownload = async (e: React.MouseEvent, cert: WaterproofingCertificate) => {
    e.stopPropagation();
    setDownloadingCertId(cert.id);
    
    // Timeout para permitir que React renderice el template oculto
    setTimeout(() => {
      if (!pdfRef.current) {
        setDownloadingCertId(null);
        toast.error('Error al preparar el documento');
        return;
      }
      
      const element = pdfRef.current;
      toast.loading('Generando PDF...', { id: 'pdf-toast' });
      
      const opt = {
        margin:       0,
        filename:     `certificado-estanqueidad-${cert.id.substring(0,8)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save()
        .then(() => {
          toast.success('PDF descargado con éxito', { id: 'pdf-toast' });
          setDownloadingCertId(null);
        })
        .catch(() => {
          toast.error('Error al generar el PDF', { id: 'pdf-toast' });
          setDownloadingCertId(null);
        });
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200"><CheckCircle size={14} /> Aprobado</span>;
      case 'REJECTED':
        return <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-red-50 text-red-600 border border-red-200"><XCircle size={14} /> Rechazado</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200"><Clock size={14} /> Pendiente</span>;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden h-full">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-bold text-[#002D5A]">Certificados de Estanqueidad</h2>
          <p className="text-sm text-slate-500">Gestión de pruebas de inundación e inspecciones de impermeabilización</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar certificados..." 
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A] w-64"
            />
          </div>
          <button 
            onClick={handleCreateNew}
            className="bg-[#002D5A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#003b7a] transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Nuevo Certificado
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400">Cargando certificados...</div>
        ) : certificates.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-10 shadow-sm">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#002D5A]">
              <FileCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No hay certificados de estanqueidad</h3>
            <p className="text-slate-500 mb-6 text-sm">Comienza registrando la primera prueba de estanqueidad o inundación para certificar la correcta impermeabilización.</p>
            <button 
              onClick={handleCreateNew}
              className="bg-[#002D5A] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#003b7a] transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Generar Certificado
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <div 
                key={cert.id} 
                onClick={() => handleEdit(cert)}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-[#002D5A] hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
              >
                {/* Decorative line */}
                <div className={`absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity ${
                  cert.status === 'APPROVED' ? 'bg-emerald-500' : 
                  cert.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'
                }`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#002D5A]/5 p-2.5 rounded-lg text-[#002D5A]">
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Certificado #{cert.id.substring(0, 8)}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Calendar size={12} />
                        {new Date(cert.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(cert.status)}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleDownload(e, cert)}
                        className="text-slate-400 hover:text-[#002D5A] hover:bg-[#002D5A]/5 p-1.5 rounded-md transition-colors"
                        title="Descargar PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, cert.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                        title="Eliminar certificado"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-slate-500 text-xs mb-1">Zonas Evaluadas</div>
                    <div className="font-semibold text-slate-800">{cert.zones.length} zonas</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-slate-500 text-xs mb-1">Evidencia</div>
                    <div className="font-semibold text-slate-800">
                      {cert.generalPhotos.length + cert.zones.reduce((acc, z) => acc + z.photos.length, 0)} fotos
                    </div>
                  </div>
                </div>

                {cert.notes && (
                  <div className="text-sm text-slate-600 border-t border-slate-100 pt-3 line-clamp-2">
                    {cert.notes}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User size={12} />
                    {cert.technician?.name || 'Técnico'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <EstanqueidadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cert={selectedCert}
          project={project}
          onSave={() => {
            setIsModalOpen(false);
            loadCertificates();
          }}
        />
      )}
      {/* Hidden container for PDF template */}
      <div className="absolute -top-[9999px] -left-[9999px]">
        {downloadingCertId && (
          <EstanqueidadPdfTemplate 
            ref={pdfRef} 
            cert={certificates.find(c => c.id === downloadingCertId)!} 
            project={project} 
          />
        )}
      </div>
    </div>
  );
}
