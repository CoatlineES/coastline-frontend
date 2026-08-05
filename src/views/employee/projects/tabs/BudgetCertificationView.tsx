import React, { useState, useEffect } from 'react';
import { Project } from '../../../../services/types';
import { quotationsService } from '../../../../services/quotations.service';
import { certificationsService } from '../../../../services/certifications.service';
import { Quotation, QuotationLine } from '../../../../types/quotation';
import { ProjectCertification, ProjectCertificationLine } from '../../../../types/certification';
import { FileText, Save, Eye, Plus, ChevronLeft, Pencil, X, Trash2, Link, CheckCircle, Clock, BookOpen, Lock, List, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { CertificationPdfModal } from './CertificationPdfModal';
import { CertificationTextsModal } from './CertificationTextsModal';
import { CertificationDocument } from '../../../../components/documents/CertificationDocument';
import api from '../../../../services/api';

const InlineQtyEditor = ({ 
  value, 
  onSave,
  disabled
}: { 
  value: number, 
  onSave: (val: number) => void,
  disabled?: boolean
}) => {
  const [val, setVal] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = () => {
    if (val !== value) {
      onSave(val);
    }
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div 
        className={`flex items-center justify-end gap-1 ${disabled ? 'px-2 py-1 text-slate-500' : 'cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors text-right'}`}
        onClick={() => !disabled && setIsEditing(true)}
        title={disabled ? "Bloqueado (Firmado)" : "Haz clic para editar la cantidad a certificar"}
      >
        {disabled && <Lock size={10} className="text-slate-400 hide-in-pdf" />}
        {value}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <input 
        type="number" 
        value={val} 
        autoFocus
        onChange={(e) => setVal(parseFloat(e.target.value) || 0)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        onBlur={handleSave}
        className="w-20 text-right border border-blue-400 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
};

interface BudgetCertificationViewProps {
  project: Project;
  plan?: any;
}

export function BudgetCertificationView({ project }: BudgetCertificationViewProps) {
  const [baseQuotation, setBaseQuotation] = useState<Quotation | null>(null);
  const [budgetQuotation, setBudgetQuotation] = useState<Quotation | null>(null);
  const [certifications, setCertifications] = useState<ProjectCertification[]>([]);
  const [activeCertification, setActiveCertification] = useState<ProjectCertification | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isTextsModalOpen, setIsTextsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportingTable, setIsExportingTable] = useState(false);
  const [isExportingDoc, setIsExportingDoc] = useState(false);
  const [showAllPrevious, setShowAllPrevious] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', date: '' });

  // Estado local para editar las líneas de la certificación actual
  const [currentCertLines, setCurrentCertLines] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadData();
  }, [project.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // 1. Cotización base
      if (project.dealId) {
        const quotes = await quotationsService.getAll({ dealId: project.dealId });
        const accepted = quotes.find((q: Quotation) => ['ACCEPTED', 'WON', 'SIGNED'].includes(q.status)) || quotes[0];
        setBaseQuotation(accepted || null);
      }
      
      // 2. Presupuesto
      if (project.budgetQuotationId) {
        const budget = await quotationsService.getById(project.budgetQuotationId);
        setBudgetQuotation(budget);
      }

      // 3. Certificaciones
      const certs = await certificationsService.getAllByProject(project.id);
      setCertifications(certs);
    } catch (error) {
      console.error('Error loading data for certification', error);
      toast.error('Error al cargar certificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCertification = async () => {
    if (!budgetQuotation) return;
    
    const name = `Certificación Nº ${certifications.length + 1}`;
    
    // Pre-poblar con las cantidades del presupuesto
    const initialLines: { quotationLineId: string, quantity: number }[] = [];
    budgetQuotation.chapters?.forEach((ch: any) => {
      ch.lines?.forEach((line: any) => {
        if (!line.parentId && !line.isGroup && !line.isApu) {
          initialLines.push({
            quotationLineId: line.id,
            quantity: line.quantity || 1
          });
        }
      });
    });

    try {
      const newCert = await certificationsService.create({
        name,
        date: new Date().toISOString(),
        projectId: project.id,
        lines: initialLines
      });
      setCertifications([...certifications, newCert]);
      openCertification(newCert);
    } catch (error) {
      toast.error('Error al crear certificación');
    }
  };

  const openCertification = (cert: ProjectCertification) => {
    const map = new Map<string, number>();
    cert.lines.forEach(l => {
      map.set(l.quotationLineId, l.quantity);
    });
    setCurrentCertLines(map);
    setActiveCertification(cert);
  };

  const handleUpdateLine = (lineId: string, quantity: number) => {
    const newMap = new Map(currentCertLines);
    newMap.set(lineId, quantity);
    setCurrentCertLines(newMap);
  };

  const handleDeleteCertification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de querer eliminar esta certificación?')) return;
    
    try {
      await certificationsService.delete(id);
      setCertifications(certs => certs.filter(c => c.id !== id));
      toast.success('Certificación eliminada');
    } catch (error) {
      toast.error('Error al eliminar certificación');
    }
  };

  const handleSaveCertification = async (updatedFields?: Partial<ProjectCertification>) => {
    if (!activeCertification) return;
    setSaving(true);
    try {
      const linesData = Array.from(currentCertLines.entries()).map(([quotationLineId, quantity]) => ({
        quotationLineId,
        quantity
      }));
      
      const payload = updatedFields ? { ...updatedFields, lines: linesData } : { lines: linesData };
      
      const updated = await certificationsService.update(activeCertification.id, payload);
      
      setCertifications(certs => certs.map(c => c.id === updated.id ? updated : c));
      setActiveCertification(updated);
      toast.success('Certificación guardada');
    } catch (error) {
      toast.error('Error al guardar certificación');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSignatureLink = async () => {
    if (!activeCertification) return;
    try {
      const { signatureToken } = await certificationsService.generateSignatureLink(activeCertification.id);
      const link = `${window.location.origin}/certificacion/${signatureToken}`;
      await navigator.clipboard.writeText(link);
      
      // Update local state
      setActiveCertification(prev => prev ? { ...prev, status: 'PENDING_SIGNATURE', signatureToken } : null);
      setCertifications(certs => certs.map(c => c.id === activeCertification.id ? { ...c, status: 'PENDING_SIGNATURE', signatureToken } : c));
      
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      toast.error('Error al generar enlace');
    }
  };

  const downloadTablePDF = async () => {
    if (!activeCertification || !budgetQuotation) return;
    
    const element = document.getElementById('certification-table-container');
    if (!element) return;

    setIsExportingTable(true);
    toast.loading('Generando PDF de la tabla...', { id: 'pdf-toast' });
    try {
      // Necesitamos limpiar un poco el HTML para que se vea bien en el PDF
      // Como el editor inline usa un input, podemos reemplazarlo por texto plano en una copia temporal si es necesario, 
      // pero tailwind browser module suele arreglarlo si lo forzamos.
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; background-color: white; margin: 0; padding: 20px; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            /* Estilos específicos para la tabla en PDF */
            .table-pdf-container { width: 100%; font-size: 10px; }
            .table-pdf-container table { width: 100%; border-collapse: collapse; }
            .table-pdf-container th, .table-pdf-container td { padding: 4px 6px; border: 1px solid #e2e8f0; }
            .table-pdf-container th { font-weight: 600; }
            /* Ocultar elementos interactivos y elementos especificados */
            input { display: none !important; }
            .hide-in-pdf { display: none !important; }
            /* Forzar que el editor en linea se vea como texto en la impresion */
          </style>
        </head>
        <body class="bg-white">
          <div class="table-pdf-container">
            <h2 class="text-xl font-bold mb-4" style="color: #002D5A;">${project.name} - ${activeCertification.name}</h2>
            ${element.outerHTML}
          </div>
        </body>
        </html>
      `;

      const response = await api.post('/projects/generate-pdf', {
        html: htmlContent,
        filename: `Tabla_${project.name}_${activeCertification.name}`,
        landscape: true // Importante: en horizontal porque la tabla tiene muchas columnas
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tabla_${project.name}_${activeCertification.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF descargado con éxito', { id: 'pdf-toast' });
    } catch (error) {
      console.error('Error exporting table PDF:', error);
      toast.error('Hubo un error al generar el PDF de la tabla.', { id: 'pdf-toast' });
    } finally {
      setIsExportingTable(false);
    }
  };

  const downloadDocPDF = async () => {
    if (!activeCertification || !budgetQuotation) return;
    
    // El CertificationDocument se renderiza en un div oculto con id 'pdf-preview-content'
    const element = document.getElementById('pdf-preview-content');
    if (!element) return;

    setIsExportingDoc(true);
    toast.loading('Generando PDF del documento...', { id: 'pdf-toast' });
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
      toast.success('PDF descargado con éxito', { id: 'pdf-toast' });
    } catch (error) {
      console.error('Error exporting doc PDF:', error);
      toast.error('Hubo un error al generar el PDF del documento.', { id: 'pdf-toast' });
    } finally {
      setIsExportingDoc(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-slate-400">Cargando datos de certificación...</div>;
  }

  if (!budgetQuotation) {
    return (
      <div className="flex items-center justify-center h-full flex-col text-slate-500 bg-slate-50 p-8 rounded-xl text-center">
        <FileText size={48} className="text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">No hay Presupuesto</h3>
        <p className="mt-2 text-sm max-w-md">
          Debes inicializar el presupuesto desde la pestaña de Edición antes de poder gestionar certificaciones.
        </p>
      </div>
    );
  }

  // Funciones de cálculo
  const getLineTotal = (line: any, allLines: any[]) => {
    if (line.isApu || line.isGroup) {
      const children = allLines.filter((cl: any) => cl.parentId === line.id);
      const baseCost = children.reduce((sum: number, cl: any) => sum + ((cl.quantity || 1) * (cl.unitPrice || 0)), 0);
      const computedUnitPrice = line.isApu ? baseCost * (1 + (line.margin || 0) / 100) : baseCost;
      return (line.quantity || 1) * computedUnitPrice;
    }
    return (line.quantity || 1) * (line.unitPrice || 0);
  };

  // --- MODO LISTADO DE CERTIFICACIONES ---
  if (!activeCertification) {
    return (
      <div className="p-6 h-full flex flex-col bg-slate-50">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#002D5A]">Certificaciones de Avance</h2>
            <p className="text-sm text-slate-500 mt-1">Gestiona los reportes de avance para facturación.</p>
          </div>
          <button 
            onClick={handleCreateCertification}
            className="flex items-center gap-2 px-4 py-2 bg-[#002D5A] text-white rounded-lg text-sm font-medium hover:bg-[#002D5A]/90 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nueva Certificación
          </button>
        </div>

        {certifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
            <div className="text-center">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-700">No hay certificaciones</h3>
              <p className="text-slate-500 mt-1">Crea la primera certificación para reportar avances.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {certifications.map(cert => {
              let certTotal = 0;
              let accumTotal = 0;
              
              if (budgetQuotation) {
                const allBudgetLines = budgetQuotation.chapters?.flatMap((c: any) => c.lines) || [];
                const sortedCerts = [...certifications].sort((a, b) => new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime());
                const certIndex = sortedCerts.findIndex(c => c.id === cert.id);
                const prevCerts = certIndex >= 0 ? sortedCerts.slice(0, certIndex + 1) : []; // includes this cert for accumTotal
                
                cert.lines.forEach(l => {
                  const bLine = allBudgetLines.find(bl => bl.id === l.quotationLineId);
                  if (bLine) {
                    const bQty = bLine.quantity || 1;
                    const bTotal = getLineTotal(bLine, allBudgetLines);
                    const bPrice = bQty > 0 ? bTotal / bQty : (bLine.unitPrice || 0);
                    
                    certTotal += l.quantity * bPrice;
                  }
                });

                prevCerts.forEach(prevCert => {
                  prevCert.lines.forEach(l => {
                    const bLine = allBudgetLines.find(bl => bl.id === l.quotationLineId);
                    if (bLine) {
                      const bQty = bLine.quantity || 1;
                      const bTotal = getLineTotal(bLine, allBudgetLines);
                      const bPrice = bQty > 0 ? bTotal / bQty : (bLine.unitPrice || 0);
                      
                      accumTotal += l.quantity * bPrice;
                    }
                  });
                });
              }

              return (
                <div 
                  key={cert.id} 
                  onClick={() => openCertification(cert)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-slate-800">{cert.name}</h3>
                    <p className="text-sm text-slate-500">{new Date(cert.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-slate-500 font-medium">Esta Certificación</p>
                      <p className="font-bold text-blue-700">{certTotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium">Acumulado</p>
                      <p className="font-bold text-emerald-600">{accumTotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                    <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                      <div className="text-[#002D5A] font-medium hidden md:block">Ver detalles &rarr;</div>
                      <button 
                        onClick={(e) => handleDeleteCertification(cert.id, e)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar certificación"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- MODO EDICIÓN DE CERTIFICACIÓN ---



  // Calcular "A Origen" (cantidades certificadas en certificaciones ANTERIORES)
  const sortedCerts = [...certifications].sort((a, b) => new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime());
  const activeIndex = sortedCerts.findIndex(c => c.id === activeCertification?.id);
  const previousCertifications = activeIndex >= 0 ? sortedCerts.slice(0, activeIndex) : [];
  
  const getPreviousCertifiedQty = (lineId: string) => {
    return previousCertifications.reduce((sum, cert) => {
      const line = cert.lines.find(l => l.quotationLineId === lineId);
      return sum + (line ? line.quantity : 0);
    }, 0);
  };
  
  const getSpecificPreviousQty = (cert: ProjectCertification, lineId: string) => {
    const line = cert.lines.find(l => l.quotationLineId === lineId);
    return line ? line.quantity : 0;
  };

  let totalBudget = 0;
  let totalPrevious = 0;
  let totalCurrent = 0;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* HEADER */}
      <div className="bg-white p-6 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => setActiveCertification(null)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#002D5A]">{activeCertification.name}</h2>
              <button 
                onClick={() => {
                  setEditForm({ 
                    name: activeCertification.name, 
                    date: new Date(activeCertification.date).toISOString().substring(0, 10)
                  });
                  setIsEditModalOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Editar certificación"
              >
                <Pencil size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-sm text-slate-500">
                Fecha: {new Date(activeCertification.date).toLocaleDateString()}
              </p>
              {activeCertification.status === 'SIGNED' ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle size={12} /> Firmado
                </span>
              ) : activeCertification.status === 'PENDING_SIGNATURE' ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Clock size={12} /> Pdte. Firma
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  Borrador
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          {previousCertifications.length > 0 && (
            <button 
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors shadow-sm ${showAllPrevious ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              onClick={() => setShowAllPrevious(!showAllPrevious)}
              title="Alternar vista detallada de certificaciones anteriores"
            >
              <List size={16} />
              Desglose Anterior
            </button>
          )}
          {activeCertification.status !== 'SIGNED' ? (
            <>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm"
                onClick={handleGenerateSignatureLink}
              >
                <Link size={16} />
                Solicitar Firma
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors shadow-sm"
                onClick={() => setIsTextsModalOpen(true)}
              >
                <BookOpen size={16} />
                Textos del Informe
              </button>
            </>
          ) : (
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 border border-slate-200 rounded-lg text-sm font-medium cursor-not-allowed shadow-sm"
              disabled
              title="No se pueden editar textos de una certificación firmada"
            >
              <Lock size={16} />
              Textos bloqueados
            </button>
          )}
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors shadow-sm"
            onClick={() => setIsPdfModalOpen(true)}
          >
            <Eye size={16} />
            Vista Previa
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50"
            onClick={downloadTablePDF}
            disabled={isExportingTable}
          >
            <Download size={16} />
            {isExportingTable ? 'Descargando...' : 'Descargar Tabla'}
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50"
            onClick={downloadDocPDF}
            disabled={isExportingDoc}
          >
            <Download size={16} />
            {isExportingDoc ? 'Generando...' : 'Descargar Documento'}
          </button>
          {activeCertification.status !== 'SIGNED' && (
            <button 
              onClick={() => handleSaveCertification()}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#002D5A] text-white rounded-lg text-sm font-medium hover:bg-[#002D5A]/90 transition-colors shadow-sm"
            >
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto p-6" id="certification-table-container">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className={`w-full text-sm text-left ${showAllPrevious && previousCertifications.length > 0 ? 'min-w-[1400px]' : 'min-w-full'}`}>
            <thead className="bg-[#002D5A] text-white">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg" rowSpan={2}>Capítulo / Concepto</th>
                <th className="px-4 py-3 font-semibold text-center" rowSpan={2}>Ud</th>
                <th className="px-4 py-2 font-semibold text-center border-b border-white/20" colSpan={3}>Presupuesto</th>
                
                {previousCertifications.length > 0 && (
                  showAllPrevious ? (
                    previousCertifications.map(c => (
                      <th key={c.id} className="px-4 py-2 font-semibold text-center border-b border-white/20 border-l border-white/20 bg-slate-700" colSpan={2}>{c.name}</th>
                    ))
                  ) : (
                    <th className="px-4 py-2 font-semibold text-center border-b border-white/20 border-l border-white/20" colSpan={2}>A Origen (Anterior)</th>
                  )
                )}
                
                {previousCertifications.length > 0 && showAllPrevious && (
                   <th className="px-4 py-2 font-semibold text-center border-b border-white/20 border-l border-white/20 bg-slate-800" colSpan={2}>Total Anterior</th>
                )}

                <th className="px-4 py-2 font-semibold text-center border-b border-white/20 border-l border-white/20 bg-blue-800" colSpan={2}>{activeCertification.name} (Actual)</th>
                <th className="px-4 py-2 font-semibold text-center border-b border-white/20 border-l border-white/20" colSpan={3}>Total Acumulado</th>
              </tr>
              <tr>
                {/* Presupuesto */}
                <th className="px-3 py-2 font-medium text-right text-blue-100 bg-blue-900/30">Cant.</th>
                <th className="px-3 py-2 font-medium text-right text-blue-100 bg-blue-900/30">Precio U.</th>
                <th className="px-3 py-2 font-medium text-right text-blue-100 bg-blue-900/30">Total</th>
                
                {/* A Origen */}
                {previousCertifications.length > 0 && (
                  showAllPrevious ? (
                    <>
                      {previousCertifications.map(c => (
                        <React.Fragment key={c.id}>
                          <th className="px-3 py-2 font-medium text-right text-slate-300 bg-slate-700 border-l border-white/20">Cant.</th>
                          <th className="px-3 py-2 font-medium text-right text-slate-300 bg-slate-700">Total</th>
                        </React.Fragment>
                      ))}
                      <th className="px-3 py-2 font-medium text-right text-slate-300 bg-slate-800 border-l border-white/20">Cant.</th>
                      <th className="px-3 py-2 font-medium text-right text-slate-300 bg-slate-800">Total</th>
                    </>
                  ) : (
                    <>
                      <th className="px-3 py-2 font-medium text-right text-slate-300 bg-slate-800 border-l border-white/20">Cant.</th>
                      <th className="px-3 py-2 font-medium text-right text-slate-300 bg-slate-800">Total</th>
                    </>
                  )
                )}

                {/* Actual */}
                <th className="px-3 py-2 font-bold text-right text-white bg-blue-800 border-l border-white/20">Cant.</th>
                <th className="px-3 py-2 font-medium text-right text-blue-100 bg-blue-800">Total</th>
                
                {/* Acumulado */}
                <th className="px-3 py-2 font-medium text-right text-emerald-100 bg-emerald-900/30 border-l border-white/20">Cant.</th>
                <th className="px-3 py-2 font-medium text-right text-emerald-100 bg-emerald-900/30">Total</th>
                <th className="px-3 py-2 font-medium text-right text-emerald-100 bg-emerald-900/30">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgetQuotation.chapters?.map((chapter: any) => {
                let chapterBudgetTotal = 0;
                let chapterPrevTotal = 0;
                let chapterCurrTotal = 0;

                const linesOutput = chapter.lines?.map((line: any) => {
                  if (line.parentId) return null; 
                  
                  // Presupuesto
                  const bQty = line.quantity || 1;
                  const bTotal = getLineTotal(line, chapter.lines);
                  const bPrice = bTotal / bQty;
                  
                  // A Origen
                  const prevQty = getPreviousCertifiedQty(line.id);
                  const prevTotal = prevQty * bPrice;

                  // Actual
                  const currQty = currentCertLines.get(line.id) || 0;
                  const currTotal = currQty * bPrice;

                  // Acumulado
                  const accumQty = prevQty + currQty;
                  const accumTotal = prevTotal + currTotal;
                  const accumPercent = bQty > 0 ? (accumQty / bQty) * 100 : 0;

                  chapterBudgetTotal += bTotal;
                  chapterPrevTotal += prevTotal;
                  chapterCurrTotal += currTotal;

                  const prevBreakdown = showAllPrevious ? previousCertifications.map(c => {
                    const qty = getSpecificPreviousQty(c, line.id);
                    return { qty, total: qty * bPrice, id: c.id };
                  }) : [];

                  return (
                    <tr key={line.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 pl-8 text-slate-700">{line.concept}</td>
                      <td className="px-4 py-2 text-center text-slate-500">{line.unit || 'Ud'}</td>
                      
                      {/* Presupuesto */}
                      <td className="px-3 py-2 text-right text-slate-600 bg-slate-50/50">{bQty}</td>
                      <td className="px-3 py-2 text-right text-slate-600 bg-slate-50/50">{bPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right font-medium text-slate-700 bg-slate-50/50">{bTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      
                      {/* A Origen */}
                      {previousCertifications.length > 0 && (
                        showAllPrevious ? (
                          <>
                            {prevBreakdown.map(b => (
                              <React.Fragment key={b.id}>
                                <td className="px-3 py-2 text-right text-slate-500 bg-slate-50/50 border-l border-slate-200">{b.qty > 0 ? b.qty : '-'}</td>
                                <td className="px-3 py-2 text-right text-slate-500 bg-slate-50/50">{b.total > 0 ? b.total.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                              </React.Fragment>
                            ))}
                            <td className="px-3 py-2 text-right font-medium text-slate-600 border-l border-slate-300">{prevQty > 0 ? prevQty : '-'}</td>
                            <td className="px-3 py-2 text-right font-medium text-slate-600">{prevTotal > 0 ? prevTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2 text-right text-slate-500 border-l border-slate-200">{prevQty > 0 ? prevQty : '-'}</td>
                            <td className="px-3 py-2 text-right text-slate-500">{prevTotal > 0 ? prevTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                          </>
                        )
                      )}

                      {/* Actual */}
                      <td className="px-3 py-1 text-right font-bold text-blue-700 bg-blue-50/30 border-l border-blue-100">
                        <InlineQtyEditor 
                          value={currQty} 
                          onSave={(val) => handleUpdateLine(line.id, val)}
                          disabled={activeCertification.status === 'SIGNED'}
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-blue-800 bg-blue-50/30">
                        {currTotal > 0 ? currTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}
                      </td>

                      {/* Acumulado */}
                      <td className="px-3 py-2 text-right font-bold text-emerald-700 border-l border-slate-200">{accumQty > 0 ? accumQty : '-'}</td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-700">{accumTotal > 0 ? accumTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                      <td className={`px-3 py-2 text-right font-bold ${accumPercent > 100 ? 'text-orange-500' : accumPercent === 100 ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {accumPercent > 0 ? `${accumPercent.toFixed(0)}%` : '-'}
                      </td>
                    </tr>
                  );
                });

                totalBudget += chapterBudgetTotal;
                totalPrevious += chapterPrevTotal;
                totalCurrent += chapterCurrTotal;

                const prevChapterBreakdown = showAllPrevious ? previousCertifications.map(c => {
                  const cTotal = chapter.lines?.reduce((s: number, l: any) => {
                    if (l.parentId) return s;
                    const qty = getSpecificPreviousQty(c, l.id);
                    const bTotal = getLineTotal(l, chapter.lines);
                    const bPrice = bTotal / (l.quantity || 1);
                    return s + (qty * bPrice);
                  }, 0) || 0;
                  return { id: c.id, total: cTotal };
                }) : [];

                return (
                  <React.Fragment key={chapter.id}>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-200">
                      <td colSpan={2} className="px-4 py-3 text-[#002D5A] uppercase">{chapter.title}</td>
                      <td colSpan={2} className="bg-slate-200/50"></td>
                      <td className="px-3 py-3 text-right text-[#002D5A] bg-slate-200/50">{chapterBudgetTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      
                      {previousCertifications.length > 0 && (
                        showAllPrevious ? (
                          <>
                            {prevChapterBreakdown.map(b => (
                              <React.Fragment key={b.id}>
                                <td className="border-l border-slate-300"></td>
                                <td className="px-3 py-3 text-right text-slate-600">{b.total > 0 ? b.total.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                              </React.Fragment>
                            ))}
                            <td className="border-l border-slate-400 bg-slate-200"></td>
                            <td className="px-3 py-3 text-right font-bold text-slate-700 bg-slate-200">{chapterPrevTotal > 0 ? chapterPrevTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                          </>
                        ) : (
                          <>
                            <td className="border-l border-slate-300"></td>
                            <td className="px-3 py-3 text-right text-slate-600">{chapterPrevTotal > 0 ? chapterPrevTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                          </>
                        )
                      )}
                      
                      <td className="border-l border-blue-200 bg-blue-50/50"></td>
                      <td className="px-3 py-3 text-right text-blue-800 bg-blue-50/50">{chapterCurrTotal > 0 ? chapterCurrTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                      
                      <td className="border-l border-slate-300"></td>
                      <td className="px-3 py-3 text-right text-emerald-700">{(chapterPrevTotal + chapterCurrTotal) > 0 ? (chapterPrevTotal + chapterCurrTotal).toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '-'}</td>
                      <td></td>
                    </tr>
                    {linesOutput}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-800 text-white border-t-4 border-slate-400">
              <tr>
                <td colSpan={2} className="px-4 py-4 font-bold text-lg">TOTALES</td>
                <td colSpan={2}></td>
                <td className="px-3 py-4 text-right font-bold text-lg">{totalBudget.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                
                {previousCertifications.length > 0 && (
                  showAllPrevious ? (
                    <>
                      {previousCertifications.map(c => {
                        const cTotal = budgetQuotation.chapters?.reduce((cs: number, ch: any) => {
                          return cs + (ch.lines?.reduce((s: number, l: any) => {
                            if (l.parentId) return s;
                            const qty = getSpecificPreviousQty(c, l.id);
                            const bTotal = getLineTotal(l, ch.lines);
                            const bPrice = bTotal / (l.quantity || 1);
                            return s + (qty * bPrice);
                          }, 0) || 0);
                        }, 0) || 0;
                        return (
                          <React.Fragment key={c.id}>
                            <td className="border-l border-white/10"></td>
                            <td className="px-3 py-4 text-right font-bold text-slate-300">{cTotal > 0 ? cTotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : '-'}</td>
                          </React.Fragment>
                        );
                      })}
                      <td className="border-l border-white/20 bg-slate-900"></td>
                      <td className="px-3 py-4 text-right font-bold text-white bg-slate-900">{totalPrevious.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                    </>
                  ) : (
                    <>
                      <td className="border-l border-white/10"></td>
                      <td className="px-3 py-4 text-right font-bold text-slate-300">{totalPrevious.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                    </>
                  )
                )}
                
                <td></td>
                <td className="px-3 py-4 text-right font-bold text-xl text-blue-300">{totalCurrent.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                
                <td></td>
                <td className="px-3 py-4 text-right font-bold text-lg text-emerald-400">{(totalPrevious + totalCurrent).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                <td className="px-3 py-4 text-right font-bold text-emerald-400">
                  {totalBudget > 0 ? ((totalPrevious + totalCurrent) / totalBudget * 100).toFixed(1) : 0}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Resumen de Certificación */}
        <div className="mt-8 mx-auto w-full max-w-4xl">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Resumen de Facturación (Este Periodo)</h3>
            
            {(() => {
              const taxRate = budgetQuotation.taxRate || 21;
              const tax = totalCurrent * (taxRate / 100);
              const total = totalCurrent + tax;
              
              return (
                <div className="max-w-md ml-auto space-y-3">
                  <div className="flex justify-between items-center text-base pt-1">
                    <span className="font-bold text-slate-800">A Certificar (sin IVA)</span>
                    <span className="font-bold text-blue-600">{totalCurrent.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                    <span className="text-slate-500">Impuestos (IVA {taxRate}%)</span>
                    <span className="font-medium text-slate-700">{tax.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-800 text-lg">Total a Facturar (con IVA)</span>
                    <span className="font-black text-slate-900 text-xl">{total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {activeCertification && isPdfModalOpen && (
        <CertificationPdfModal 
          isOpen={isPdfModalOpen} 
          onClose={() => setIsPdfModalOpen(false)} 
          project={project} 
          baseQuotation={baseQuotation!} 
          budgetQuotation={budgetQuotation} 
          activeCertification={activeCertification}
          previousCertifications={previousCertifications}
          currentCertLines={currentCertLines}
        />
      )}

      {activeCertification && isTextsModalOpen && (
        <CertificationTextsModal
          isOpen={isTextsModalOpen}
          onClose={() => setIsTextsModalOpen(false)}
          certification={activeCertification}
          project={project}
          onSave={handleSaveCertification}
        />
      )}

      {/* Hidden element for direct PDF export */}
      {activeCertification && baseQuotation && budgetQuotation && (
        <div className="hidden">
          <CertificationDocument 
            project={project}
            baseQuotation={baseQuotation}
            budgetQuotation={budgetQuotation}
            activeCertification={activeCertification}
            previousCertifications={previousCertifications}
            currentCertLines={currentCertLines}
          />
        </div>
      )}

      {isEditModalOpen && activeCertification && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Editar Certificación</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre / Título</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                <input 
                  type="date" 
                  value={editForm.date}
                  onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  try {
                    const updated = await certificationsService.update(activeCertification.id, {
                      name: editForm.name,
                      date: new Date(editForm.date).toISOString()
                    });
                    setCertifications(certs => certs.map(c => c.id === updated.id ? updated : c));
                    setActiveCertification(updated);
                    setIsEditModalOpen(false);
                    toast.success('Certificación actualizada');
                  } catch (error) {
                    toast.error('Error al actualizar');
                  }
                }}
                className="px-4 py-2 bg-[#002D5A] text-white rounded-lg font-medium hover:bg-[#002D5A]/90 transition-colors shadow-sm"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
