import React, { useState, useEffect } from 'react';
import { Project } from '../../../../services/types';
import { projectsService } from '../../../../services/projects.service';
import { Upload, Image as ImageIcon, Camera, Trash2, Maximize2, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  project: Project;
}

export function ProjectPhotosTab({ project }: Props) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getProjectPhotos(project.id);
      setPhotos(data);
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar las fotos del proyecto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [project.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'tu-cloud-name';
      const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'tu-upload-preset';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', `coatline/projects/${project.id}/PHOTOS`);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      const downloadURL = data.secure_url;

      await projectsService.addProjectPhoto(project.id, {
        url: downloadURL,
        name: file.name,
        size: file.size,
        mimetype: file.type || data.format
      });

      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la foto');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch(source) {
      case 'PARTES_DIARIOS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'INFORME': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'EXTRAS': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatSource = (source: string) => {
    switch(source) {
      case 'PARTES_DIARIOS': return 'Parte Diario';
      case 'INFORME': return 'Informe / Certificado';
      case 'EXTRAS': return 'Imagen Extra';
      default: return source;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200 mt-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500 mr-3"></div>
        Cargando fotos del proyecto...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Camera className="text-[#002D5A]" size={20} /> Galería de Fotos
          </h3>
          <p className="text-sm text-slate-500 mt-1">Fotos de informes, partes diarios e imágenes extras</p>
        </div>
        
        <label className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer
          ${uploading ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-[#002D5A] text-white border-transparent hover:bg-opacity-90'}
        `}>
          {uploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Upload size={16} />
          )}
          <span>{uploading ? 'Subiendo...' : 'Añadir Foto Extra'}</span>
          <input 
            type="file" 
            accept="image/*"
            className="hidden" 
            disabled={uploading}
            onChange={handleFileUpload}
          />
        </label>
      </div>
      
      <div className="p-8">
        {error && (
          <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {photos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            <ImageIcon size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-600">No hay fotos en este proyecto</p>
            <p className="text-sm mt-1">Las fotos de los informes y partes diarios aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map(photo => (
              <div key={photo.id} className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img 
                    src={photo.url} 
                    alt={photo.description || 'Foto del proyecto'} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a 
                      href={photo.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 bg-white text-slate-800 rounded-full hover:bg-slate-100 hover:scale-110 transition-all"
                      title="Ver en pantalla completa"
                    >
                      <Maximize2 size={18} />
                    </a>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border shadow-sm uppercase ${getSourceBadgeColor(photo.source)}`}>
                      {formatSource(photo.source)}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 mb-2 flex-1" title={photo.description}>
                    {photo.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center text-xs text-slate-500 gap-1.5 mt-auto">
                    <Calendar size={12} />
                    {format(new Date(photo.date), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
