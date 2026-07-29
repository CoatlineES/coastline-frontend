import React, { useState, useEffect } from 'react';
import { Project } from '../../../../services/types';
import { projectsService } from '../../../../services/projects.service';
import { 
  Handshake, 
  FileText, 
  CheckCircle, 
  Briefcase, 
  Calendar, 
  ClipboardCheck, 
  Award, 
  Clock 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProjectTimelineTabProps {
  project: Project;
}

export function ProjectTimelineTab({ project }: ProjectTimelineTabProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const data = await projectsService.getProjectTimeline(project.id);
        setEvents(data);
      } catch (err: any) {
        setError('Error al cargar la línea de tiempo');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimeline();
  }, [project.id]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'DEAL': return <Handshake className="text-blue-500" size={20} />;
      case 'QUOTATION': return <FileText className="text-indigo-500" size={20} />;
      case 'QUOTATION_SIGNED': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'PROJECT': return <Briefcase className="text-orange-500" size={20} />;
      case 'PLAN': return <Calendar className="text-purple-500" size={20} />;
      case 'INSPECTION_REPORT': return <ClipboardCheck className="text-teal-500" size={20} />;
      case 'WATERPROOFING_CERTIFICATE': return <Award className="text-amber-500" size={20} />;
      default: return <Clock className="text-slate-500" size={20} />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'DEAL': return 'bg-blue-100 ring-blue-50 text-blue-600';
      case 'QUOTATION': return 'bg-indigo-100 ring-indigo-50 text-indigo-600';
      case 'QUOTATION_SIGNED': return 'bg-emerald-100 ring-emerald-50 text-emerald-600';
      case 'PROJECT': return 'bg-orange-100 ring-orange-50 text-orange-600';
      case 'PLAN': return 'bg-purple-100 ring-purple-50 text-purple-600';
      case 'INSPECTION_REPORT': return 'bg-teal-100 ring-teal-50 text-teal-600';
      case 'WATERPROOFING_CERTIFICATE': return 'bg-amber-100 ring-amber-50 text-amber-600';
      default: return 'bg-slate-100 ring-slate-50 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200 mt-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500 mr-3"></div>
        Cargando historial del proyecto...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl mt-6 border border-red-100">
        {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 mt-6">
        No se encontraron eventos para este proyecto.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Clock className="text-[#002D5A]" size={20} /> Timeline del Proyecto
        </h3>
        <p className="text-sm text-slate-500 mt-1">Historial cronológico de las operaciones</p>
      </div>
      
      <div className="p-8">
        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
          {events.map((event, index) => {
            const dateObj = new Date(event.date);
            
            return (
              <div key={event.id} className="relative pl-8 group">
                {/* Timeline dot */}
                <div className={`absolute -left-[17px] top-1 h-8 w-8 rounded-full ring-4 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                
                {/* Event Content */}
                <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="text-base font-bold text-slate-800">{event.title}</h4>
                    <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full whitespace-nowrap">
                      {format(dateObj, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
