import React, { useState } from 'react';
import { InspectionReport } from '../../../../../types/inspection-report';
import ReportTextTemplatesModal from './ReportTextTemplatesModal';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface ReportIntroTabProps {
  report: InspectionReport;
  onChange: (updates: Partial<InspectionReport>) => void;
}

export function ReportIntroTab({ report, onChange }: ReportIntroTabProps) {
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Sección introductoria</h2>
          <p className="text-sm text-slate-500">Este texto aparecerá al inicio del informe, antes de las zonas de inspección. Puedes editarlo con formato.</p>
        </div>
        <button 
          onClick={() => setTemplatesModalOpen(true)}
          className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center gap-2"
        >
          Plantillas
        </button>
      </div>

      <div className="p-8 flex-1">
        <div className="bg-white rounded-lg border border-slate-300 overflow-hidden h-full min-h-[500px]">
          <ReactQuill 
            theme="snow" 
            value={report.introduction || ''} 
            onChange={val => onChange({ introduction: val })}
            className="h-[450px]"
            placeholder="Escribe la introducción metodológica aquí..."
          />
        </div>
      </div>

      <ReportTextTemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        currentContent={report.introduction}
        onSelectTemplate={(content) => onChange({ introduction: content })}
        title="Plantillas de Introducción"
        category="REPORT_INTRO"
      />
    </div>
  );
}
