import React, { useState, useEffect } from 'react';
import { Project } from '../../../../services/types';
import { DailyLog, dailyLogsService } from '../../../../services/daily-logs.service';
import { Camera, Calendar, AlertCircle } from 'lucide-react';

interface FotosViewProps {
  project: Project;
}

export function FotosView({ project }: FotosViewProps) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [project.id]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await dailyLogsService.getByProject(project.id);
      setLogs(data);
    } catch (error) {
      console.error('Error loading daily logs for photos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-slate-400">Cargando galería de fotos...</div>;
  }

  // Flatten all photos from all daily logs
  const allPhotos: { url: string; logDate: string; logId: string }[] = [];
  logs.forEach(log => {
    if (log.photos && log.photos.length > 0) {
      log.photos.forEach(photoUrl => {
        allPhotos.push({
          url: photoUrl,
          logDate: log.date,
          logId: log.id
        });
      });
    }
  });

  if (allPhotos.length === 0) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-md shadow-sm">
          <Camera className="mx-auto text-slate-400 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 mb-2">No hay fotografías</h3>
          <p className="text-slate-500 text-sm">
            Las fotografías subidas en los Partes Diarios aparecerán aquí organizadas como un historial visual del proyecto.
          </p>
        </div>
      </div>
    );
  }

  // Agrupar fotos por fecha
  const groupedPhotos = allPhotos.reduce((groups, photo) => {
    const dateStr = new Date(photo.logDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(photo);
    return groups;
  }, {} as Record<string, typeof allPhotos>);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-8">
      
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-[#002D5A]">Galería del Proyecto</h2>
        <p className="text-slate-500 mt-1">Historial fotográfico extraído automáticamente de los Partes Diarios.</p>
      </div>

      {/* GALLERY */}
      <div className="space-y-8">
        {Object.entries(groupedPhotos).map(([dateLabel, photosGroup]) => (
          <div key={dateLabel} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 capitalize">
              <Calendar size={20} className="text-[#002D5A]" />
              {dateLabel}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photosGroup.map((photo, index) => (
                <div key={index} className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <a href={photo.url} target="_blank" rel="noreferrer" className="block w-full h-full">
                    <img 
                      src={photo.url} 
                      alt={`Evidencia ${dateLabel}`} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white font-medium text-sm bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm transition-opacity">
                        Ver Original
                      </span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
