import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Loader2, Check } from 'lucide-react';
import { inspectionReportsService } from '../../../../services/inspection-reports.service';
import { InspectionReport } from '../../../../types/inspection-report';
import toast from 'react-hot-toast';
import { ReportDatosTab } from './tabs/ReportDatosTab';
import { ReportIntroTab } from './tabs/ReportIntroTab';
import { ReportCoverTab } from './tabs/ReportCoverTab';
import { ReportZonasTab } from './tabs/ReportZonasTab';
import { ReportPreviewTab } from './tabs/ReportPreviewTab';

export function ReportEditorView() {
  const { id: projectId, reportId } = useParams<{ id: string; reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [activeTab, setActiveTab] = useState('DATOS');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const loadReport = async () => {
    try {
      const data = await inspectionReportsService.getById(reportId!);
      setReport(data);
    } catch (error) {
      toast.error('Error al cargar el informe');
    }
  };

  const handleSave = async () => {
    if (!report) return;
    try {
      setIsSaving(true);
      await inspectionReportsService.update(report.id, report);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      toast.error('Error al guardar el informe');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateReport = (updates: Partial<InspectionReport>) => {
    setReport(prev => prev ? { ...prev, ...updates } : null);
  };

  if (!report) {
    return <div className="p-8 flex justify-center text-slate-500">Cargando informe...</div>;
  }

  const tabs = [
    { id: 'DATOS', label: 'Datos' },
    { id: 'ZONAS', label: 'Zonas' },
    { id: 'INTRO', label: 'Introducción' },
    { id: 'PORTADA', label: 'Portada' },
    { id: 'PREVIEW', label: 'Vista previa' }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/app/empleado/proyectos/${projectId}`)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Proyecto</span>
          </button>
          <span className="text-slate-300">/</span>
          <h1 className="text-lg font-bold text-slate-800">
            {report.number} — {report.clientName || 'Sin Cliente'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors shadow-sm font-medium ${
              isSaved 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            } disabled:opacity-50`}
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isSaved ? (
              <Check size={18} className="text-green-600" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? 'Guardando...' : isSaved ? 'Guardado' : 'Guardar'}
          </button>
          <button 
            onClick={() => {
              if (activeTab !== 'PREVIEW') {
                setActiveTab('PREVIEW');
                setTimeout(() => {
                  document.getElementById('btn-download-pdf')?.click();
                }, 100);
              } else {
                document.getElementById('btn-download-pdf')?.click();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
          >
            <FileText size={18} />
            PDF
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b border-slate-200 px-6 shrink-0">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'DATOS' && (
            <ReportDatosTab report={report} onChange={handleUpdateReport} />
          )}
          {activeTab === 'ZONAS' && (
            <ReportZonasTab report={report} onChange={handleUpdateReport} />
          )}
          {activeTab === 'INTRO' && (
            <ReportIntroTab report={report} onChange={handleUpdateReport} />
          )}
          {activeTab === 'PORTADA' && (
            <ReportCoverTab report={report} onChange={handleUpdateReport} />
          )}
          {activeTab === 'PREVIEW' && (
            <ReportPreviewTab report={report} />
          )}
        </div>
      </div>
    </div>
  );
}
