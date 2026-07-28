import React from 'react';
import { motion } from 'motion/react';
import { FileText, Download, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

export default function ClientDashboardView() {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <header>
        <h1 className="font-display font-bold text-3xl text-slate-800 mb-2">Resumen de Obras Activas</h1>
        <p className="font-sans text-slate-500">Supervise el estado y descargue los informes técnicos de sus proyectos en tiempo real.</p>
      </header>

      {/* Active Project Card */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                En Ejecución
              </span>
              <span className="text-slate-400 text-sm font-bold flex items-center gap-1">
                <MapPin size={14} /> Centro Logístico Norte
              </span>
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-800">Impermeabilización TPO Nave 3</h2>
            <p className="text-slate-500 font-sans mt-1 text-sm">Fase actual: Sellado térmico de juntas perimetrales.</p>
          </div>
          
          <div className="flex flex-col items-end shrink-0">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Progreso General</span>
            <div className="flex items-center gap-4">
              <div className="w-48 h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full w-[65%]" />
              </div>
              <span className="font-bold text-xl text-slate-800">65%</span>
            </div>
          </div>
        </div>
        
        {/* Reports Mini-Table */}
        <div className="p-6 md:p-8">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-primary" /> Informes Generados Recientemente
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400">
                  <th className="pb-3 font-semibold uppercase tracking-wider">Documento</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider">Fecha</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider">Estado Técnico</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4 font-bold text-slate-700">INSP-0824 - Medición Humedad (Nave 3)</td>
                  <td className="py-4 text-slate-500">15 Oct 2023</td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold">
                      <CheckCircle2 size={14} /> Sin Fugas Detectadas
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="inline-flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors">
                      <Download size={16} /> <span className="hidden sm:inline">Descargar PDF</span>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-bold text-slate-700">CER-0823 - Certificación Fase 1</td>
                  <td className="py-4 text-slate-500">10 Oct 2023</td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-bold">
                      <ShieldCheck size={14} /> Aprobado Coatline
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="inline-flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors">
                      <Download size={16} /> <span className="hidden sm:inline">Descargar PDF</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 text-center">
            <button className="text-sm font-bold text-primary hover:underline">
              Ver el repositorio completo de informes
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
