import React from 'react';

export const ActivityKpiPdfReport = React.forwardRef<HTMLDivElement, { data: any, filtersInfo: string }>(({ data, filtersInfo }, ref) => {
  if (!data || !data.metrics) return null;
  const { metrics } = data;

  return (
    <div ref={ref} className="bg-white text-slate-800 p-8 w-[210mm] min-h-[297mm] font-sans" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
      
      {/* HEADER */}
      <div className="border-b-2 border-[#002D5A] pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#002D5A]">INFORME DE ACTIVIDADES</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">Coastline CRM</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Filtros Aplicados</p>
          <p className="text-sm font-semibold text-slate-700">{filtersInfo || 'Todos los registros'}</p>
          <p className="text-xs text-slate-400 mt-1">Generado: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* SECCIÓN 1: KPIs GLOBALES */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider text-sm">Métricas Generales</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Actividades</p>
            <p className="text-2xl font-black text-[#002D5A]">{metrics.totalActivities}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Tasa de Finalización</p>
            <p className="text-2xl font-black text-emerald-700">{metrics.completionRate.toFixed(1)}%</p>
            <p className="text-xs text-emerald-600/70">{metrics.completedActivities} completadas</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1.5: DISTRIBUCIÓN POR ESTADO Y RESULTADO */}
      <div className="mb-8 flex gap-6">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider text-sm">Por Estado (Panel)</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'planned', label: 'Planificadas' },
              { key: 'noDate', label: 'Sin fecha' },
              { key: 'overdue', label: 'Vencidas' },
              { key: 'inProgress', label: 'En curso' },
              { key: 'completed', label: 'Completadas' }
            ].map(status => (
              <div key={status.key} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5 truncate">{status.label}</p>
                <p className="text-lg font-black text-[#002D5A]">{metrics.dashboardDistribution?.[status.key] || 0}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider text-sm">Por Resultado</h2>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(metrics.resultDistribution || {}).map(([result, count]: any) => {
              const labels: any = { CALL_BACK: 'Llamar más tarde', INTERESTED: 'Interesado', NO_ANSWER: 'No responde', SUCCESSFUL: 'Exitoso', UNSUCCESSFUL: 'Fallido', NO_RESULT: 'Sin resultado' };
              const label = labels[result] || result;
              return (
                <div key={result} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5 truncate">{label}</p>
                  <p className="text-lg font-black text-[#002D5A]">{count}</p>
                </div>
              );
            })}
            {(!metrics.resultDistribution || Object.keys(metrics.resultDistribution).length === 0) && (
              <p className="text-sm text-slate-500">No hay datos.</p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: RENDIMIENTO POR USUARIO */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider text-sm">Rendimiento por Empleado</h2>
        
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#002D5A] text-white">
              <th className="p-2 rounded-tl-lg font-bold w-[100px]">Empleado</th>
              <th className="p-2 font-bold text-center text-[11px]">Plan.</th>
              <th className="p-2 font-bold text-center text-[11px]">Venc.</th>
              <th className="p-2 font-bold text-center text-[11px]">En curso</th>
              <th className="p-2 font-bold text-center text-[11px]">Compl.</th>
              <th className="p-2 font-bold text-center text-[11px]">Total</th>
              <th className="p-2 font-bold text-center text-[11px]">Negocios</th>
              <th className="p-2 rounded-tr-lg font-bold text-center text-[11px]">Proyectos</th>
            </tr>
          </thead>
          <tbody>
            {metrics.userPerformance.map((user: any, idx: number) => {
              const successResultRate = user.assigned > 0 ? ((user.results?.SUCCESSFUL || 0) / user.assigned) * 100 : 0;
              return (
                <tr key={idx} className="border-b border-slate-100 last:border-none">
                  <td className="p-2 font-semibold text-slate-700 truncate max-w-[100px] text-[11px]">{user.name}</td>
                  <td className="p-2 text-center text-slate-600 text-[11px]">{(user.filters?.planned || 0) + (user.filters?.noDate || 0)}</td>
                  <td className="p-2 text-center text-red-600 font-bold text-[11px]">{user.filters?.overdue || 0}</td>
                  <td className="p-2 text-center text-amber-600 font-bold text-[11px]">{user.filters?.inProgress || 0}</td>
                  <td className="p-2 text-center text-emerald-600 font-bold text-[11px]">{user.filters?.completed || 0}</td>
                  <td className="p-2 text-center text-[#002D5A] font-black text-[11px]">{user.assigned || 0}</td>
                  <td className="p-2 text-center text-slate-700 font-bold text-[11px]">{user.dealsGenerated || 0}</td>
                  <td className="p-2 text-center text-slate-700 font-bold text-[11px]">{user.projectsGenerated || 0}</td>
                </tr>
              );
            })}
          </tbody>
          {metrics.userPerformance.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-400 font-medium">No hay datos de usuarios en este periodo</td>
              </tr>
            </tbody>
          )}
        </table>
      </div>

    </div>
  );
});
