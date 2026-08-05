import React, { useState } from 'react';
import { InspectionReport } from '../../../../../../types/inspection-report';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ReportTextTemplatesModal from '../ReportTextTemplatesModal';

interface GeomembranasIntroTabProps {
  report: InspectionReport;
  onChange: (updates: Partial<InspectionReport>) => void;
}

export function GeomembranasIntroTab({ report, onChange }: GeomembranasIntroTabProps) {
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  
  const defaultText = `Se ha realizado una inspección técnica sobre la geomembrana de impermeabilización de la instalación, mediante el sistema de detección electrónica de fugas COAT-DDP / COAT-DGA, basado en tecnología de baja tensión y método de dipolo, conforme a las normativas internacionales aplicables (ASTM D7007, D7877, D8265 y equivalentes para geomembranas).

El objetivo de la inspección ha sido localizar con precisión posibles discontinuidades, perforaciones, defectos de soldadura y otras anomalías del sistema impermeabilizante, sin necesidad de desmontajes ni pruebas destructivas.

Durante el trabajo se han clasificado los hallazgos en tres categorías:

  • FUGAS CRÍTICAS: discontinuidades activas en la geomembrana (perforaciones, rasgados, punzonamientos o roturas directas) que requieren intervención directa. Son puntos por los que el agua puede filtrarse activamente.
  • DEPRESIONES CRÍTICAS: hundimientos o deformaciones mecánicas de la subrasante que, sin constituir una fuga confirmada, comprometen la estabilidad geométrica del sistema y deben ser objeto de seguimiento o refuerzo.
  • OBSERVACIONES TÉCNICAS: anomalías o singularidades detectadas (soldaduras dudosas, esmerilado excesivo, ausencia de parches de refuerzo u otras irregularidades de ejecución) que, sin constituir una fuga confirmada, deben ser objeto de seguimiento o inspección directa.`;

  // Initialize if empty
  React.useEffect(() => {
    if (!report.introduction) {
      onChange({ introduction: defaultText });
    }
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Introducción</h2>
          <p className="text-sm text-slate-500">Texto introductorio que aparecerá al inicio del informe, tras la portada.</p>
        </div>
        <button 
          onClick={() => setTemplatesModalOpen(true)}
          className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center gap-2"
        >
          Plantillas
        </button>
      </div>
      
      <div className="p-8">
        <div className="bg-white rounded-lg border border-slate-300 overflow-hidden h-full min-h-[500px]">
          <ReactQuill 
            theme="snow" 
            value={report.introduction || ''} 
            onChange={val => onChange({ introduction: val })}
            className="h-[450px]"
            placeholder="Escribe la introducción aquí..."
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
