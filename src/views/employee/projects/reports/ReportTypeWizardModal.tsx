import React, { useState } from 'react';
import { FileText, HardHat, Waves, X, Loader2 } from 'lucide-react';
import { inspectionReportsService } from '../../../../services/inspection-reports.service';
import toast from 'react-hot-toast';

interface ReportTypeWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  clientName: string;
  onSuccess: (reportId: string) => void;
}

export function ReportTypeWizardModal({ isOpen, onClose, projectId, clientName, onSuccess }: ReportTypeWizardModalProps) {
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const reportTypes = [
    {
      id: 'CUBIERTAS',
      title: 'Informe de Inspección Cubiertas',
      description: 'Inspección técnica por zonas: membrana, patologías, equipo, semáforo de estado',
      icon: <FileText className="text-slate-500 mb-3" size={28} />
    },
    {
      id: 'OBRA',
      title: 'Informe de Ejecución de Obra',
      description: 'Seguimiento de avance, hitos y evidencias de reparación',
      icon: <HardHat className="text-slate-500 mb-3" size={28} />
    },
    {
      id: 'GEOMEMBRANAS',
      title: 'Informe de Inspección Geomembranas',
      description: 'Inspección técnica de balsas, depósitos y canales con mapa de hallazgos',
      icon: <Waves className="text-slate-500 mb-3" size={28} />
    }
  ];

  const handleCreateReport = async (type: string) => {
    setIsCreating(true);
    try {
      const report = await inspectionReportsService.create({
        projectId,
        clientName,
        status: 'DRAFT',
        type
      });
      toast.success('Informe creado correctamente');
      onSuccess(report.id);
    } catch (error) {
      toast.error('Error al crear el informe');
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 relative">
          <h2 className="text-xl font-bold text-[#002D5A]">
            Paso 1 — Tipo de informe
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            disabled={isCreating}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((rt) => (
              <div 
                key={rt.id}
                onClick={() => !isCreating && handleCreateReport(rt.id)}
                className={`border-2 border-slate-200 rounded-xl p-6 cursor-pointer transition-all duration-200 group
                  ${isCreating ? 'opacity-50 pointer-events-none' : 'hover:border-[#002D5A] hover:shadow-md hover:bg-blue-50/30'}
                `}
              >
                {rt.icon}
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#002D5A] transition-colors">
                  {rt.title}
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {rt.description}
                </p>
              </div>
            ))}
          </div>
          
          {isCreating && (
            <div className="mt-8 flex flex-col items-center justify-center text-slate-500 animate-in fade-in">
              <Loader2 className="animate-spin mb-2" size={24} />
              <p className="text-sm font-medium">Creando informe...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
