import React, { useState } from 'react';
import { FileText, X, Download } from 'lucide-react';
import { Quotation } from '../../../../types/quotation';
import { Project } from '../../../../services/types';
import { ProjectCertification } from '../../../../types/certification';
import api from '../../../../services/api';

interface CertificationPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  baseQuotation: Quotation;
  budgetQuotation: Quotation;
  activeCertification: ProjectCertification;
  previousCertifications: ProjectCertification[];
  currentCertLines: Map<string, number>;
}

import { CertificationDocument } from '../../../../components/documents/CertificationDocument';

export function CertificationPdfModal({ 
  isOpen, 
  onClose, 
  project, 
  baseQuotation, 
  budgetQuotation,
  activeCertification,
  previousCertifications,
  currentCertLines
}: CertificationPdfModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportPDF = async () => {
    const element = document.getElementById('pdf-preview-content');
    if (!element) return;

    setIsExporting(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; background-color: white; margin: 0; padding: 0; }
            .break-before-page { break-before: page; }
            .break-inside-avoid { break-inside: avoid; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body class="bg-white">
          <div style="width: 794px; margin: 0 auto; position: relative; padding: 20px;">
            ${element.outerHTML}
          </div>
        </body>
        </html>
      `;

      const response = await api.post('/projects/generate-pdf', {
        html: htmlContent,
        filename: `Certificacion_${project.name}_${activeCertification.name}`,
        landscape: false
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificacion_${project.name}_${activeCertification.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Hubo un error al generar el PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-[#002D5A]" size={24} />
              Vista Previa: {activeCertification.name}
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-[#002D5A] text-white rounded-lg font-medium hover:bg-[#002D5A]/90 transition-colors shadow-sm disabled:opacity-70"
            >
              {isExporting ? 'Generando...' : 'Exportar PDF'}
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto bg-slate-100 p-8">
          <CertificationDocument 
            project={project}
            baseQuotation={baseQuotation}
            budgetQuotation={budgetQuotation}
            activeCertification={activeCertification}
            previousCertifications={previousCertifications}
            currentCertLines={currentCertLines}
          />
        </div>
      </div>
    </div>
  );
}
