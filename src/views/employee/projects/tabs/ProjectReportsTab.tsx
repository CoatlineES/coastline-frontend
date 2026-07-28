import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../../../services/types';
import { FileText, Plus, Trash2, ShieldCheck, Clock, CheckCircle2, Shield } from 'lucide-react';
import { inspectionReportsService } from '../../../../services/inspection-reports.service';
import { InspectionReport } from '../../../../types/inspection-report';
import toast from 'react-hot-toast';
import { EstanqueidadView } from './EstanqueidadView';

interface ProjectReportsTabProps {
  project: Project;
}

export function ProjectReportsTab({ project }: ProjectReportsTabProps) {
  const navigate = useNavigate();
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [project.id]);

  const loadReports = async () => {
    try {
      const data = await inspectionReportsService.getByProject(project.id);
      setReports(data);
    } catch (error) {
      toast.error('Error al cargar informes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      const report = await inspectionReportsService.create({
        projectId: project.id,
        clientName: project.account?.name || '',
        status: 'DRAFT',
      });
      navigate(`/app/empleado/proyectos/${project.id}/informes/${report.id}`);
    } catch (error) {
      toast.error('Error al crear el informe');
    }
  };

  const handleDeleteReport = async (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que quieres eliminar este informe? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await inspectionReportsService.delete(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      toast.success('Informe eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar el informe');
    }
  };
  return (
    <div className="max-w-6xl mx-auto space-y-10 mt-8 animate-in fade-in duration-300">
      
      {/* SECCIÓN INFORMES */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <FileText size={20} className="text-slate-500" />
            Informes ({reports.length})
          </h2>
          <button 
            onClick={handleCreateReport}
            className="flex items-center gap-2 px-4 py-2 bg-[#2D4564] text-white text-sm font-medium rounded-lg hover:bg-[#2D4564]/90 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nuevo Informe
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Cargando informes...</div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hay informes creados todavía.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((report) => (
                <div key={report.id} onClick={() => navigate(`/app/empleado/proyectos/${project.id}/informes/${report.id}`)} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div>
                    <div className="font-semibold text-slate-800 text-[15px] mb-1">
                      Informe de Inspección — {report.number} — {report.clientName}
                    </div>
                    <div className="text-sm text-slate-500">
                      Inspección · v{report.version} · {new Date(report.date).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                      {report.status === 'DRAFT' ? 'Borrador' : 'Final'}
                    </span>
                    <button 
                      onClick={(e) => handleDeleteReport(e, report.id)}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN CERTIFICADOS DE ESTANQUEIDAD */}
      <EstanqueidadView project={project as any} />

    </div>
  );
}
