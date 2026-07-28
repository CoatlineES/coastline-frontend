import React, { useState, useEffect } from 'react';
import { X, FileText, ChevronLeft, Plus, MoveUp, MoveDown, Trash2, Eye, Download, Loader2 } from 'lucide-react';
import api from '../../../../services/api';
import { Project } from '../../../../services/types';
import { ProjectPlan } from '../../../../services/project-planning.service';

interface PlanDeObraPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  plan: ProjectPlan | null;
  reportType: 'cliente' | 'interno';
}

interface DocumentBlock {
  id: string;
  type: string;
  title: string;
  content: string;
}

const DEFAULT_BLOCKS: DocumentBlock[] = [
  {
    id: 'b1',
    type: 'Resumen ejecutivo',
    title: 'Resumen ejecutivo reparación estándar',
    content: 'Coatline ha desarrollado una planificación preliminar para la ejecución de los trabajos de reparación e impermeabilización en {{PROYECTO}}.\n\nLa planificación propuesta contempla una ejecución por fases y subzonas, priorizando las áreas clasificadas como críticas y minimizando la afección a usuarios y zonas comunes.'
  },
  {
    id: 'b2',
    type: 'Alcance de trabajos',
    title: 'Alcance estándar reparación',
    content: 'Los trabajos contemplados en el presente proyecto incluyen:\n\n- retirada de acabados y capas afectadas\n- preparación y limpieza del soporte\n- imprimación\n- ejecución del sistema impermeabilizante\n- ensayos y controles de calidad\n- cierre y entrega de áreas intervenidas\n\nLas actuaciones se ejecutarán siguiendo las especificaciones técnicas definidas por Coatline y las condiciones particulares de cada zona de intervención.'
  },
  {
    id: 'b3',
    type: 'Metodologías',
    title: 'Metodología preparación soporte',
    content: 'Previamente a la ejecución del sistema impermeabilizante, se procederá a la limpieza y preparación del soporte, eliminando restos sueltos, contaminantes y elementos que puedan comprometer la adherencia o continuidad del sistema.'
  },
  {
    id: 'b4',
    type: 'Metodologías',
    title: 'Metodología imprimación',
    content: 'Se aplicará imprimación compatible con el sistema impermeabilizante previsto, garantizando la correcta adherencia entre soporte y capas posteriores.\n\nLa aplicación se realizará conforme a especificaciones técnicas del fabricante y condiciones ambientales adecuadas.'
  },
  {
    id: 'b5',
    type: 'Metodologías',
    title: 'Metodología membrana líquida',
    content: 'La impermeabilización se ejecutará mediante sistema de membrana líquida continua, aplicada en las capas necesarias para garantizar la estanqueidad y durabilidad del sistema.\n\nSe respetarán tiempos de secado, consumos y espesores indicados por el fabricante.'
  },
  {
    id: 'b6',
    type: 'Metodologías',
    title: 'Metodología reparación del soporte',
    content: 'Antes de la impermeabilización se ejecutará una recuperación del soporte de lámina bituminosa existente, garantizando continuidad, solapes y encuentros según especificaciones técnicas del fabricante para poder generar un espacio sin fisuras sobre el cual aplicar la impermeabilización líquida elegida.'
  },
  {
    id: 'b7',
    type: 'Actividades',
    title: 'Actividad retirada de acabados',
    content: 'Se procederá a la retirada controlada de acabados y capas superficiales existentes en las zonas afectadas, garantizando la correcta gestión de residuos y la preparación adecuada del soporte para las fases posteriores.'
  },
  {
    id: 'b8',
    type: 'Actividades',
    title: 'Actividad demolición',
    content: 'Las demoliciones previstas se ejecutarán de forma controlada y sectorizada, minimizando afecciones a elementos existentes y garantizando la seguridad durante los trabajos.'
  },
  {
    id: 'b9',
    type: 'Actividades',
    title: 'Actividad limpieza',
    content: 'Tras las fases de retirada y demolición, se procederá a la limpieza integral de las superficies de trabajo para garantizar condiciones adecuadas de ejecución.'
  },
  {
    id: 'b10',
    type: 'Actividades',
    title: 'Aplicación capa 1',
    content: 'Se ejecutará la primera capa del sistema impermeabilizante conforme a las especificaciones técnicas definidas para el proyecto.'
  },
  {
    id: 'b11',
    type: 'Actividades',
    title: 'Aplicación capa 2',
    content: 'Se ejecutará la segunda capa del sistema impermeabilizante, asegurando continuidad, espesores y correcta ejecución de encuentros y remates.'
  },
  {
    id: 'b12',
    type: 'Actividades',
    title: 'Ensayo Coatline',
    content: 'Finalizadas las fases principales de impermeabilización, se realizarán ensayos y verificaciones internas de control Coatline para comprobar la correcta ejecución del sistema.'
  },
  {
    id: 'b13',
    type: 'Actividades',
    title: 'Cierre de área intervenida',
    content: 'Una vez completadas las actuaciones y verificaciones correspondientes, se procederá al cierre y limpieza final de las áreas intervenidas.'
  },
  {
    id: 'b14',
    type: 'Actividades',
    title: 'Entrega de trabajos',
    content: 'Finalizados los trabajos y verificadas las condiciones de estanqueidad y calidad, se procederá a la entrega de las áreas intervenidas al cliente o propiedad.'
  },
  {
    id: 'b15',
    type: 'Coordinación y operativa',
    title: 'Coordinación operativa con propiedad',
    content: 'La ejecución de los trabajos se realizará minimizando la afección a usuarios y coordinando accesos, restricciones y operativa diaria con la propiedad y/o administración de la finca.'
  },
  {
    id: 'b16',
    type: 'QA/QC y ensayos',
    title: 'Control de calidad y ensayos',
    content: 'Durante la ejecución se realizarán controles internos de calidad y verificaciones de estanqueidad con el objetivo de garantizar el correcto funcionamiento del sistema impermeabilizante.'
  },
  {
    id: 'b17',
    type: 'Recursos',
    title: 'Recursos asignados',
    content: 'Los trabajos serán ejecutados por personal especializado de Coatline, bajo supervisión del jefe de obra asignado al proyecto, utilizando medios y recursos adecuados a la tipología de intervención prevista'
  },
  {
    id: 'b18',
    type: 'Conclusiones',
    title: 'Conclusión estándar',
    content: 'La planificación propuesta permite desarrollar los trabajos de forma sectorizada, organizada y compatible con la operativa habitual del edificio, priorizando las zonas críticas detectadas y optimizando tiempos de ejecución.'
  }
];

export function PlanDeObraPdfModal({ isOpen, onClose, project, plan, reportType }: PlanDeObraPdfModalProps) {
  const [blocks, setBlocks] = useState<DocumentBlock[]>(reportType === 'interno' ? [] : DEFAULT_BLOCKS);
  const [documentTitle, setDocumentTitle] = useState('Plan de obra');
  const [isExporting, setIsExporting] = useState(false);
  const [coverType, setCoverType] = useState(reportType === 'interno' ? 'Sin portada (genérica)' : 'Portada premium Coatline');
  const [observations, setObservations] = useState(reportType === 'interno' ? '' : 'El presente documento es una estimación de tiempos basada en las condiciones actuales e información disponible. Las fechas son aproximadas y pueden sufrir modificaciones justificadas por causas de fuerza mayor o imprevistos técnicos durante la ejecución.');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Reset blocks and cover based on report type whenever it opens or changes
    setBlocks(reportType === 'interno' ? [] : DEFAULT_BLOCKS);
    setCoverType(reportType === 'interno' ? 'Sin portada (genérica)' : 'Portada premium Coatline');
    setObservations(reportType === 'interno' ? '' : 'El presente documento es una estimación de tiempos basada en las condiciones actuales e información disponible. Las fechas son aproximadas y pueden sufrir modificaciones justificadas por causas de fuerza mayor o imprevistos técnicos durante la ejecución.');
  }, [reportType, isOpen]);

  useEffect(() => {
    if (project?.account?.name) {
      setDocumentTitle(project.account.name);
    } else if (project?.name) {
      setDocumentTitle(project.name);
    } else {
      setDocumentTitle('Plan de obra');
    }
  }, [project]);

  if (!isOpen) return null;

  const handleUpdateBlock = (id: string, field: keyof DocumentBlock, value: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setBlocks(newBlocks);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('pdf-preview-content');
    if (!element) return;

    setIsExporting(true);
    try {
      // Wrap the content with Tailwind and required fonts
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; background-color: white; margin: 0; padding: 0; }
            .break-before-page { break-before: page; }
            .break-inside-avoid { break-inside: avoid; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body class="bg-white">
          <div style="width: 794px; margin: 0 auto; position: relative;">
            ${element.outerHTML}
          </div>
        </body>
        </html>
      `;

      const fileNameWithPrefix = `Plan de obra - ${documentTitle}`;
      const response = await api.post('/projects/generate-pdf', {
        html: htmlContent,
        filename: fileNameWithPrefix
      }, {
        responseType: 'blob'
      });

      // Download the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileNameWithPrefix}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const addEmptyBlock = () => {
    setBlocks(prev => [...prev, { id: Date.now().toString(), type: 'Nuevo bloque', title: 'Título del bloque', content: '' }]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10 shrink-0">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Plan de obra para cliente — Paso 2 de 2</p>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-[#002D5A]" size={24} />
              Paso 5 — Composición del documento
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-slate-200/50 p-6 flex flex-col items-center">
          {isPreviewMode ? (
            <div 
              id="pdf-preview-content"
              className="w-[794px] bg-white min-h-[1123px] h-auto shrink-0 relative animate-in slide-in-from-bottom-4 duration-300 mx-auto"
            >
              
              {/* CINTA AZUL SUPERIOR (OPCIONAL DE DISEÑO) */}
              <div className="h-4 bg-[#002D5A] w-full absolute top-0 left-0"></div>

              <div className="p-12 md:p-16 mt-4">
                <p className="text-[#002D5A] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Plan de trabajo de obra</p>
                <h1 className="text-4xl font-extrabold text-slate-800 mb-8 border-b-2 border-[#002D5A] pb-6">{documentTitle}</h1>
                
                <p className="text-[#002D5A] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 mt-12">Contenido</p>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Índice del documento</h2>
                
                <div className="flex flex-col gap-0 border-t border-slate-200 mb-16">
                  <div className="flex gap-6 py-4 border-b border-slate-100">
                    <div className="text-[#002D5A] text-xl font-bold">01</div>
                    <div>
                      <div className="font-bold text-slate-800">Resumen ejecutivo</div>
                      <div className="text-sm text-slate-500">Visión general del alcance, magnitud y objetivos del plan.</div>
                    </div>
                  </div>
                  <div className="flex gap-6 py-4 border-b border-slate-100">
                    <div className="text-[#002D5A] text-xl font-bold">02</div>
                    <div>
                      <div className="font-bold text-slate-800">Memoria técnica y metodologías</div>
                      <div className="text-sm text-slate-500">Criterios de ejecución y bloques técnicos aplicables.</div>
                    </div>
                  </div>
                  <div className="flex gap-6 py-4 border-b border-slate-100">
                    <div className="text-[#002D5A] text-xl font-bold">03</div>
                    <div>
                      <div className="font-bold text-slate-800">Actividades clave</div>
                      <div className="text-sm text-slate-500">Cronograma de hitos y actividades principales del plan.</div>
                    </div>
                  </div>
                  <div className="flex gap-6 py-4 border-b border-slate-100">
                    <div className="text-[#002D5A] text-xl font-bold">04</div>
                    <div>
                      <div className="font-bold text-slate-800">Recursos asignados y conclusiones</div>
                      <div className="text-sm text-slate-500">Equipo humano, materiales, medios auxiliares y síntesis.</div>
                    </div>
                  </div>
                </div>

                {/* Render Resumen Ejecutivo like the first page block */}
                {blocks.filter(b => b.type.toLowerCase().includes('resumen')).map(block => (
                  <div key={block.id} className="bg-slate-50 rounded-xl p-8 md:p-10 border-l-[6px] border-[#002D5A] mb-12">
                    <p className="text-[#002D5A] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">{block.type}</p>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{block.title}</h2>
                    <div className="w-12 h-1 bg-slate-300 mb-6"></div>
                    <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {block.content.replace(/\{\{PROYECTO\}\}/g, project.name || 'Proyecto')}
                    </div>
                  </div>
                ))}

                {/* Render the rest of the blocks as cards like Page 2 */}
                <div className="space-y-6">
                  {blocks.filter(b => !b.type.toLowerCase().includes('resumen')).map(block => (
                    <div key={block.id} className="border border-slate-200 rounded-xl border-l-[6px] border-l-[#002D5A] p-6 md:p-8 bg-white break-inside-avoid">
                      <div className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full inline-block mb-4">
                        {block.type}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-4">{block.title}</h3>
                      <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {block.content.replace(/\{\{PROYECTO\}\}/g, project.name || 'Proyecto')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- PLANIFICACIÓN TEMPORAL (GANTT & DETALLE) --- */}
                {plan && plan.tasks && plan.tasks.length > 0 && (
                  <div className="mt-16 border-t border-slate-200 pt-16 break-before-page">
                    <p className="text-[#002D5A] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">08 · Planificación temporal</p>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Cronograma por capítulos y fases</h2>
                    <p className="text-slate-600 mb-8">Cada capítulo del presupuesto representa una zona de obra. Dentro, las fases se ejecutan en su secuencia natural con sus fechas previstas.</p>

                    <div className="grid grid-cols-2 gap-6 mb-12">
                      <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Duración total</p>
                        <p className="text-xl font-bold text-[#002D5A]">
                          {(() => {
                            const projectStart = Math.min(...plan.tasks.map(t => new Date(t.startDate || new Date()).getTime()));
                            const projectEnd = Math.max(...plan.tasks.map(t => new Date(t.endDate || 0).getTime()));
                            return Math.max(1, Math.round((projectEnd - projectStart) / 86400000));
                          })()} días laborables
                        </p>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Inicio</p>
                        <p className="text-xl font-bold text-slate-800">
                          {new Date(Math.min(...plan.tasks.map(t => new Date(t.startDate || new Date()).getTime()))).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Fin estimado</p>
                        <p className="text-xl font-bold text-slate-800">
                          {new Date(Math.max(...plan.tasks.map(t => new Date(t.endDate || 0).getTime()))).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Capítulos</p>
                        <p className="text-xl font-bold text-slate-800">{plan.tasks.length}</p>
                      </div>
                    </div>
                    
                    {/* Simplified Gantt for PDF printing */}
                    <h3 className="text-[#002D5A] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 mt-8 break-before-page">Gantt visual</h3>
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Línea de tiempo por capítulos y partidas</h2>

                    {(() => {
                      // Recursive helper to get all flat tasks inside a chapter
                      const getFlatTasks = (node: any): any[] => {
                        if (node.type === 'TASK') return [node];
                        if (node.children) return node.children.flatMap(getFlatTasks);
                        return [];
                      };

                      const allTasks = plan.tasks.flatMap(getFlatTasks);
                      
                      // Normalize project bounds to full days
                      const projectStartMs = allTasks.length > 0 ? Math.min(...allTasks.map(t => new Date(t.startDate || new Date()).setHours(0,0,0,0))) : new Date().setHours(0,0,0,0);
                      const projectEndMs = allTasks.length > 0 ? Math.max(...allTasks.map(t => {
                        const d = new Date(t.endDate || t.startDate || new Date());
                        // If it's a 1-day task and both dates are 00:00:00, ensure it spans the whole day
                        return d.setHours(23,59,59,999);
                      })) : new Date().setHours(23,59,59,999);
                      
                      const totalDurationMs = projectEndMs - projectStartMs;
                      const totalDays = Math.ceil(totalDurationMs / 86400000);

                      const getLeftPct = (date?: string) => {
                        if (!date) return 0;
                        const ms = new Date(date).setHours(0,0,0,0);
                        return Math.max(0, Math.min(100, ((ms - projectStartMs) / totalDurationMs) * 100));
                      };
                      
                      const getWidthPct = (start?: string, end?: string) => {
                        if (!start) return 0;
                        const s = new Date(start).setHours(0,0,0,0);
                        const e = new Date(end || start).setHours(23,59,59,999);
                        return Math.max(0.5, Math.min(100 - getLeftPct(start), ((e - s) / totalDurationMs) * 100));
                      };

                      // Generate timeline markers (grid lines)
                      const markers = [];
                      const maxMarkers = 8;
                      const step = Math.max(1, Math.ceil(totalDays / maxMarkers));

                      for (let i = 0; i <= totalDays; i += step) {
                        const date = new Date(projectStartMs + i * 86400000);
                        // Make sure we don't exceed 100%
                        const pct = Math.min(100, (i / totalDays) * 100);
                        markers.push({
                          pct,
                          label: date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
                        });
                      }

                      return (
                        <div className="border border-slate-200 rounded-xl overflow-hidden mb-16 shadow-sm flex flex-col relative z-0 break-inside-avoid">
                          {/* Header */}
                          <div className="flex bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-semibold relative z-20">
                            <div className="w-[40%] px-4 py-3 border-r border-slate-200 shrink-0 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Capítulo / Partida</div>
                            <div className="w-[60%] relative h-[38px] bg-slate-50 overflow-hidden">
                              {markers.map((m, i) => (
                                <div 
                                  key={i} 
                                  className="absolute top-0 h-full flex flex-col justify-end pb-1.5 text-[9px] text-slate-400 font-medium"
                                  style={{ 
                                    left: `${m.pct}%`, 
                                    transform: m.pct === 100 ? 'translateX(-100%)' : m.pct === 0 ? 'translateX(4px)' : 'translateX(-50%)'
                                  }}
                                >
                                  {m.label}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Rows */}
                          <div className="flex flex-col relative">
                            {/* Grid lines background */}
                            <div className="absolute inset-0 pointer-events-none flex z-0">
                               <div className="w-[40%] border-r border-slate-200 shrink-0 bg-white"></div>
                               <div className="w-[60%] relative overflow-hidden bg-slate-50/30">
                                  {markers.map((m, i) => (
                                    <div 
                                      key={i} 
                                      className="absolute top-0 bottom-0 border-l border-slate-200/60"
                                      style={{ left: `${m.pct}%` }}
                                    ></div>
                                  ))}
                               </div>
                            </div>

                            <div className="flex flex-col divide-y divide-slate-100 relative z-10">
                              {plan.tasks.map(chapter => (
                                <React.Fragment key={chapter.id}>
                                  {/* Chapter Row */}
                                  <div className="flex bg-slate-50/80 hover:bg-slate-100/50 transition-colors">
                                    <div className="w-[40%] px-4 py-3 font-bold text-[#002D5A] text-xs border-r border-slate-200 truncate shrink-0">
                                      {chapter.name.toUpperCase()}
                                    </div>
                                    <div className="w-[60%] py-2 relative">
                                      <div className="w-full h-full relative">
                                        <div 
                                          className="absolute top-1/2 -translate-y-1/2 h-3.5 bg-[#002D5A] rounded opacity-70"
                                          style={{ 
                                            left: `${getLeftPct(chapter.startDate)}%`, 
                                            width: `${getWidthPct(chapter.startDate, chapter.endDate)}%` 
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  {/* Task Rows */}
                                  {getFlatTasks(chapter).map((task: any) => (
                                    <div key={task.id} className="flex bg-white hover:bg-slate-50 transition-colors">
                                      <div className="w-[40%] px-4 py-2 text-slate-600 text-xs pl-8 flex items-center gap-2 border-r border-slate-200 shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] shrink-0"></div>
                                        <span className="truncate">{task.name.toUpperCase()}</span>
                                      </div>
                                      <div className="w-[60%] py-2 relative">
                                        <div className="w-full h-full relative">
                                          <div 
                                            className="absolute top-1/2 -translate-y-1/2 h-2.5 bg-[#38bdf8] rounded"
                                            style={{ 
                                              left: `${getLeftPct(task.startDate)}%`, 
                                              width: `${getWidthPct(task.startDate, task.endDate)}%` 
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 p-3 text-[10px] text-slate-400 border-t border-slate-200 z-20 relative">
                            Las barras representan la duración y posición temporal de cada partida dentro del plazo global del proyecto.
                          </div>
                        </div>
                      );
                    })()}

                    {/* Detailed Chapter Tables */}
                    {plan.tasks.map((chapter, index) => (
                      <div key={`detail-${chapter.id}`} className="mb-16 break-inside-avoid">
                        <div className="bg-[#002D5A] text-white p-6 rounded-t-xl flex justify-between items-end">
                          <div>
                            <p className="text-[10px] opacity-70 uppercase tracking-widest mb-1">Capítulo {index + 1}</p>
                            <h2 className="text-lg font-bold">{chapter.name.toUpperCase()}</h2>
                          </div>
                          <div className="text-right">
                            <p className="text-xs opacity-70 mb-1">{new Date(chapter.startDate || '').toLocaleDateString()} → {new Date(chapter.endDate || '').toLocaleDateString()}</p>
                            <p className="text-sm font-bold">{chapter.durationDays} día(s)</p>
                          </div>
                        </div>

                        <div className="border border-t-0 border-slate-200 rounded-b-xl overflow-hidden bg-white">
                          {(() => {
                            const hasSubzones = chapter.children?.some(c => c.type === 'SUBZONE');
                            if (hasSubzones) {
                              return chapter.children?.map((subzone, szIndex) => (
                                <div key={`sz-${subzone.id}`} className="mb-4 last:mb-0">
                                  <div className="bg-[#38bdf8] text-white px-4 py-2 text-sm font-bold flex justify-between items-center">
                                    <span>{szIndex + 1}. {subzone.name}</span>
                                    <span className="text-xs opacity-90">{subzone.children?.length || 0} partida(s)</span>
                                  </div>
                                  <table className="w-full text-xs text-left">
                                    <thead className="text-slate-500 border-b border-slate-100 bg-slate-50">
                                      <tr>
                                        <th className="px-4 py-2 font-semibold">Partida / Desglose</th>
                                        <th className="px-4 py-2 font-semibold text-right w-20">Cantidad</th>
                                        <th className="px-4 py-2 font-semibold w-24">Inicio</th>
                                        <th className="px-4 py-2 font-semibold w-24">Fin</th>
                                        <th className="px-4 py-2 font-semibold text-right w-16">Días</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {subzone.children?.map(task => (
                                        <React.Fragment key={task.id}>
                                          <tr className="text-slate-700 bg-white">
                                            <td className="px-4 py-3 font-semibold">{task.name}</td>
                                            <td className="px-4 py-3 text-right font-medium">{task.quantity || 0} {task.unit || 'ud'}</td>
                                            <td className="px-4 py-3">{new Date(task.startDate || '').toLocaleDateString()}</td>
                                            <td className="px-4 py-3">{new Date(task.endDate || '').toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-right font-bold">{task.durationDays || 1}</td>
                                          </tr>
                                          {reportType === 'interno' && task.components && task.components.length > 0 && task.components.map((comp: any) => (
                                            <tr key={comp.id} className="text-slate-500 bg-slate-50/30">
                                              <td className="px-4 py-2 pl-8 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                                <span className="truncate">{comp.concept}</span>
                                              </td>
                                              <td className="px-4 py-2 text-right">{comp.quantity} {comp.unit || 'ud'}</td>
                                              <td className="px-4 py-2" colSpan={3}></td>
                                            </tr>
                                          ))}
                                        </React.Fragment>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ));
                            } else {
                              return (
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                    <tr>
                                      <th className="px-4 py-2 font-semibold">Partida / Desglose</th>
                                      <th className="px-4 py-2 font-semibold text-right w-20">Cantidad</th>
                                      <th className="px-4 py-2 font-semibold w-24">Inicio</th>
                                      <th className="px-4 py-2 font-semibold w-24">Fin</th>
                                      <th className="px-4 py-2 font-semibold text-right w-16">Días</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {chapter.children?.map(task => (
                                      <React.Fragment key={task.id}>
                                        <tr className="text-slate-700 bg-white">
                                          <td className="px-4 py-3 font-semibold">{task.name}</td>
                                          <td className="px-4 py-3 text-right font-medium">{task.quantity || 0} {task.unit || 'ud'}</td>
                                          <td className="px-4 py-3">{new Date(task.startDate || '').toLocaleDateString()}</td>
                                          <td className="px-4 py-3">{new Date(task.endDate || '').toLocaleDateString()}</td>
                                          <td className="px-4 py-3 text-right font-bold">{task.durationDays || 1}</td>
                                        </tr>
                                        {reportType === 'interno' && task.components && task.components.length > 0 && task.components.map((comp: any) => (
                                          <tr key={comp.id} className="text-slate-500 bg-slate-50/30">
                                            <td className="px-4 py-2 pl-8 flex items-center gap-2">
                                              <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                              <span className="truncate">{comp.concept}</span>
                                            </td>
                                            <td className="px-4 py-2 text-right">{comp.quantity} {comp.unit || 'ud'}</td>
                                            <td className="px-4 py-2" colSpan={3}></td>
                                          </tr>
                                        ))}
                                      </React.Fragment>
                                    ))}
                                  </tbody>
                                </table>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    ))}
                    
                    {/* Observaciones y Validación */}
                    <div className="mt-16 border-t border-slate-200 pt-16 break-inside-avoid pb-8">
                      <p className="text-[#002D5A] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">09 · Cierre</p>
                      <h2 className="text-2xl font-bold text-slate-800 mb-6">Observaciones y validación</h2>
                      
                      {observations ? (
                        <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {observations}
                        </div>
                      ) : (
                        <p className="text-slate-500">No se han registrado observaciones particulares para este plan de trabajo.</p>
                      )}
                    </div>
                    
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed border border-blue-100 shadow-sm">
                Hemos cargado los bloques estándar. Edita textos, reordena, añade o elimina los que no apliquen. 
                Las variables como <code className="bg-white px-1.5 py-0.5 rounded text-blue-600 font-bold mx-0.5">&#123;&#123;PROYECTO&#125;&#125;</code> se sustituirán automáticamente al exportar.
              </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Título del documento</label>
                <input 
                  type="text" 
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Portada</label>
                <select 
                  value={coverType}
                  onChange={(e) => setCoverType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent transition-all"
                >
                  <option value="Sin portada (genérica)">Sin portada (genérica)</option>
                  <option value="Portada premium Coatline">Portada premium Coatline</option>
                  <option value="Portada minimalista">Portada minimalista</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 col-span-2 mt-2">
                <label className="text-sm font-semibold text-slate-700">Observaciones y validación</label>
                <textarea 
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002D5A] focus:border-transparent transition-all min-h-[80px]"
                  placeholder="Escribe aquí notas adicionales o aclaraciones..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-[#002D5A] text-white text-xs px-2 py-0.5 rounded-full">{blocks.length}</span>
              bloques en el documento
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={addEmptyBlock}
                className="text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
              >
                <Plus size={16} /> Insertar desde biblioteca
              </button>
              <button 
                onClick={addEmptyBlock}
                className="text-sm font-medium text-[#002D5A] bg-blue-50 border border-blue-100 hover:bg-blue-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
              >
                <Plus size={16} /> Bloque vacío
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {blocks.map((block, index) => (
              <div key={block.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden group focus-within:ring-2 focus-within:ring-[#002D5A]/20 focus-within:border-[#002D5A]/30 transition-all">
                <div className="bg-slate-100/50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded uppercase">{block.type}</span>
                    <input 
                      type="text" 
                      value={block.title}
                      onChange={(e) => handleUpdateBlock(block.id, 'title', e.target.value)}
                      className="bg-transparent border-none font-semibold text-slate-800 text-sm focus:outline-none focus:ring-0 w-64"
                      placeholder="Título del bloque"
                    />
                  </div>
                  <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-[#002D5A] hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed">
                      <MoveUp size={16} />
                    </button>
                    <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1.5 text-slate-400 hover:text-[#002D5A] hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed">
                      <MoveDown size={16} />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <button onClick={() => removeBlock(block.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <textarea 
                    value={block.content}
                    onChange={(e) => handleUpdateBlock(block.id, 'content', e.target.value)}
                    className="w-full text-sm text-slate-600 leading-relaxed border-none focus:outline-none focus:ring-0 resize-y min-h-[80px]"
                    placeholder="Escribe el contenido aquí..."
                  />
                </div>
              </div>
            ))}
          </div>
            </>
          )}

        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-200 px-6 py-4 bg-white flex items-center justify-between shrink-0">
          <button 
            onClick={() => isPreviewMode ? setIsPreviewMode(false) : onClose()}
            className="text-slate-600 hover:text-slate-800 font-medium px-4 py-2 flex items-center gap-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={20} /> {isPreviewMode ? 'Volver a Edición' : 'Atrás'}
          </button>
          
          <div className="flex items-center gap-3">
            {isPreviewMode ? (
              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#002D5A] hover:bg-[#002D5A]/90 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isExporting ? 'Generando...' : 'Exportar a PDF'}
              </button>
            ) : (
              <button 
                onClick={() => setIsPreviewMode(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Eye className="w-5 h-5" /> Vista previa
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}