import React, { useState } from 'react';
import { InspectionReport, ReportSectionData } from '../../../../../types/inspection-report';
import { Download, Loader2 } from 'lucide-react';
import api from '../../../../../services/api';

interface EjecucionObraPreviewTabProps {
  report: InspectionReport;
}

export function EjecucionObraPreviewTab({ report }: EjecucionObraPreviewTabProps) {
  const [isExporting, setIsExporting] = useState(false);
  const sections: ReportSectionData[] = report.extraData?.sections || [];

  const handleExportPDF = async () => {
    const element = document.getElementById('report-pdf-content');
    if (!element) return;

    setIsExporting(true);

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${report.number}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { margin: 0; size: A4 portrait; }
            body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; background: white; }
            .break-before-page { page-break-before: always; }
            .ql-editor { padding: 0 !important; }
            .ql-editor p { margin-bottom: 0.5rem; }
            .ql-editor ul { list-style-type: disc; padding-left: 1.5rem; }
            .ql-editor ol { list-style-type: decimal; padding-left: 1.5rem; }
          </style>
        </head>
        <body class="bg-white m-0 p-0">
          ${element.innerHTML}
        </body>
        </html>
      `;

      const response = await api.post('/projects/generate-pdf', {
        html: htmlContent,
        filename: `Ejecucion_Obra_${report.number}`,
        format: 'A4',
        landscape: false
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ejecucion_Obra_${report.number}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  const PageHeader = () => (
    <div className="flex justify-between items-start border-b-2 border-[#002D5A] pb-4 mb-8">
      <div>
        <img src="/logo-pdf.png" alt="Coatline" className="h-10 mb-4" onError={(e) => (e.currentTarget.style.display = 'none')} />
      </div>
      <div className="text-right text-xs text-slate-500">
        <p className="font-bold text-[#002D5A] uppercase text-sm mb-1">{report.number}</p>
        <p>Fecha: {new Date(report.date).toLocaleDateString()}</p>
        <p>Cliente: {report.clientName || '-'}</p>
        <p>Proyecto: {report.project?.name || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Vista Previa del Documento</h2>
          <p className="text-sm text-slate-500">Revisa cómo quedará el PDF antes de exportarlo.</p>
        </div>
        <button
          id="btn-download-pdf"
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {isExporting ? 'Generando PDF...' : 'Descargar PDF'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100">
        <div className="shadow-xl origin-top">
          <div id="report-pdf-content" className="w-[794px] bg-white" style={{ minHeight: '1123px' }}>
            
            {/* PAGE 1: COVER */}
            <div className="relative w-full h-[1123px] overflow-hidden bg-slate-900">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#002D5A] via-[#004B93] to-blue-600 opacity-90 z-10" />
              <img src="https://images.unsplash.com/photo-1541888086225-f6740b9de186?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover opacity-30 z-0 mix-blend-overlay" alt="Cover" />
              
              <div className="relative z-20 h-full flex flex-col p-16 text-white">
                <div className="mb-24">
                  <img src="/logo-white.png" alt="Coatline" className="h-16" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
                
                <div className="flex-1">
                  <div className="inline-block px-4 py-1.5 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full text-sm font-semibold tracking-wider text-blue-100 mb-6">
                    INFORME TÉCNICO
                  </div>
                  <h1 className="text-5xl font-bold leading-tight mb-6">Ejecución de Obra</h1>
                  <div className="w-24 h-1.5 bg-blue-500 rounded-full mb-12"></div>
                  
                  <div className="space-y-6 text-lg text-blue-50">
                    <div><span className="text-blue-300 font-medium block text-sm uppercase tracking-wider mb-1">Proyecto</span><span className="font-semibold">{report.project?.name || '-'}</span></div>
                    <div><span className="text-blue-300 font-medium block text-sm uppercase tracking-wider mb-1">Cliente</span><span className="font-semibold">{report.clientName || '-'}</span></div>
                    <div><span className="text-blue-300 font-medium block text-sm uppercase tracking-wider mb-1">Referencia</span><span className="font-semibold">{report.number}</span></div>
                    <div><span className="text-blue-300 font-medium block text-sm uppercase tracking-wider mb-1">Fecha</span><span className="font-semibold">{new Date(report.date).toLocaleDateString()}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTIONS */}
            {sections.length > 0 && (
              <div className="break-before-page p-12">
                <PageHeader />
                
                <div className="space-y-12">
                  {sections.map((section, idx) => (
                    <div key={section.id} className="mb-8">
                      <h3 className="text-xl font-bold text-[#002D5A] mb-4 pb-2 border-b border-slate-200">
                        {idx + 1}. {section.name}
                      </h3>
                      
                      {section.content && (
                        <div 
                          className="prose prose-sm max-w-none text-slate-700 mb-6 ql-editor"
                          dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                      )}

                      {section.images.length > 0 && (
                        <div className={`grid gap-4 mt-6 ${
                          section.layout === '1' ? 'grid-cols-1' :
                          section.layout === '2' ? 'grid-cols-2' : 'grid-cols-3'
                        }`}>
                          {section.images.map(img => (
                            <div key={img.id} className="break-inside-avoid">
                              <img src={img.url} alt="Evidencia" className="w-full rounded-lg border border-slate-200 object-cover" style={{ aspectRatio: '4/3' }} />
                              {img.caption && (
                                <p className="text-[10px] text-center text-slate-500 mt-2 font-medium">{img.caption}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
