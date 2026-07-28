import React, { useState, useRef } from 'react';
import { QuotationChapter } from '../../../types/quotation';
import { Loader2, Wand2, RefreshCw, Download } from 'lucide-react';
import { quotationsService } from '../../../services/quotations.service';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';

interface QuotationGanttProps {
  quotationId: string;
  chapters: QuotationChapter[];
  onUpdate: () => void;
}

export default function QuotationGantt({ quotationId, chapters, onUpdate }: QuotationGanttProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Format today's date as YYYY-MM-DD for the date input default
  const getTodayFormatted = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState(getTodayFormatted());

  const ganttRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!startDate) {
      toast.error('Selecciona una fecha de inicio');
      return;
    }
    
    setIsGenerating(true);
    try {
      await quotationsService.generatePlan(quotationId, startDate);
      toast.success('Plan estimado generado con éxito');
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el plan estimado');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPdf = () => {
    if (!ganttRef.current) return;
    const element = ganttRef.current;
    
    toast.loading('Generando PDF...', { id: 'pdf-toast' });
    
    const opt = {
      margin:       15,
      filename:     `plan-de-obra-${quotationId.substring(0,6)}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save()
      .then(() => toast.success('PDF descargado con éxito', { id: 'pdf-toast' }))
      .catch((e: any) => {
        console.error(e);
        toast.error('Error al generar PDF', { id: 'pdf-toast' });
      });
  };
  if (!chapters || chapters.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No hay capítulos para mostrar en el plan de obra.
      </div>
    );
  }

  // Find min and max dates
  let minDate = new Date();
  let maxDate = new Date();
  let hasValidDates = false;

  chapters.forEach(c => {
    if (c.startDate) {
      const start = new Date(c.startDate);
      if (!hasValidDates || start < minDate) minDate = start;
      hasValidDates = true;
    }
    if (c.endDate) {
      const end = new Date(c.endDate);
      if (!hasValidDates || end > maxDate) maxDate = end;
      hasValidDates = true;
    }
  });

  if (!hasValidDates) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center border border-dashed border-slate-300 rounded-xl bg-slate-50 gap-4">
        <p className="text-slate-500 max-w-md">
          Aún no se han configurado fechas de inicio y fin en los capítulos para generar el cronograma visual.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-2">
          <div className="flex flex-col text-left">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1">Fecha de inicio</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none"
            />
          </div>
          
          <div className="hidden sm:block w-px h-10 bg-slate-200 mx-2"></div>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-pink-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4 sm:mt-0"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            <span>{isGenerating ? 'Generando...' : 'Generar Cronograma Estimado'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <button
          onClick={handleExportPdf}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Download size={14} />
          <span>Descargar PDF</span>
        </button>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium mr-1">Regenerar desde:</span>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs border-b border-slate-300 text-slate-700 outline-none px-1 py-0.5 bg-transparent"
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 p-1.5 rounded transition-colors disabled:opacity-50"
            title="Regenerar fechas automáticamente"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div ref={ganttRef} className="min-w-[600px] border border-slate-200 rounded-xl bg-white p-6">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Cronograma Estimado del Proyecto</h3>
            <p className="text-sm text-slate-500">Plan de ejecución por capítulos</p>
          </div>
          
          <div className="flex text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
            <div className="w-1/3">Capítulo</div>
            <div className="flex-1">Duración</div>
            <div className="w-24 text-right">Inicio</div>
          </div>
          
          {chapters.map((chapter, i) => {
          if (!chapter.startDate || !chapter.endDate) {
            return (
              <div key={chapter.id} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                <div className="w-1/3 font-medium text-sm text-slate-700 truncate">{chapter.title}</div>
                <div className="flex-1 text-xs text-slate-400 italic">Fechas no definidas</div>
              </div>
            );
          }

          const start = new Date(chapter.startDate);
          const end = new Date(chapter.endDate);
          const totalDuration = maxDate.getTime() - minDate.getTime();
          const startPercent = totalDuration === 0 ? 0 : ((start.getTime() - minDate.getTime()) / totalDuration) * 100;
          const widthPercent = totalDuration === 0 ? 100 : ((end.getTime() - start.getTime()) / totalDuration) * 100;

          return (
            <div key={chapter.id} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
              <div className="w-1/3 font-medium text-sm text-slate-700 truncate" title={chapter.title}>
                {i + 1}. {chapter.title}
              </div>
              <div className="flex-1 relative h-6 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 bottom-0 bg-primary/80 rounded-full flex items-center justify-center text-[10px] text-white font-bold px-2 whitespace-nowrap overflow-hidden transition-all"
                  style={{ left: `${startPercent}%`, width: `${Math.max(widthPercent, 5)}%` }}
                  title={`${start.toLocaleDateString()} - ${end.toLocaleDateString()}`}
                >
                  {widthPercent > 10 && `${Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))}d`}
                </div>
              </div>
              <div className="w-24 text-right text-xs text-slate-500 shrink-0">
                {start.toLocaleDateString()}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
