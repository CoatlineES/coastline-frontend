import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Filter, AlertCircle, Building2, User, Search, FileText, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../../services/api';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { exportAccountsKpiToExcel } from '../../../utils/exportAccountsKpiReport';

interface AccountReportData {
  id: string;
  name: string;
  sector: string;
  isContacted: boolean;
  lastContactDate: string | null;
  nextContactDate: string | null;
  contactsFollowedUp: string[];
  breakdown?: { calls: number; emails: number; meetings: number };
  activeProjects?: number;
  totalQuoted?: number;
  totalActivities?: number;
  completedActivities?: number;
  plannedWithDate?: number;
  plannedWithoutDate?: number;
}

interface SectorSummary {
  sector: string;
  total: number;
  contacted: number;
}

export const AccountsReportTab = () => {
  const [data, setData] = useState<AccountReportData[]>([]);
  const [summary, setSummary] = useState<SectorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [sector, setSector] = useState('');
  const [contacted, setContacted] = useState('');
  const [search, setSearch] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (sector) params.append('sector', sector);
      if (contacted) params.append('contacted', contacted);
      if (search) params.append('search', search);

      const res = await api.get(`/crm-reports/accounts?${params.toString()}`);
      setData(res.data.data.accountsData);
      setSummary(res.data.data.summaryBySector);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al obtener informe de empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sector, contacted]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => fetchReport(), 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Extraer sectores únicos para el filtro
  const uniqueSectors = Array.from(new Set(summary.map(s => s.sector)));

  const handleExportExcel = async () => {
    const filtersInfo = [
      sector ? `Sector: ${sector}` : '',
      contacted ? `Contactado: ${contacted === 'YES' ? 'Sí' : 'No'}` : ''
    ].filter(Boolean).join(' | ') || 'Todos los registros';
    
    await exportAccountsKpiToExcel(data, filtersInfo);
  };

  const handleExportPDF = () => {
    const element = document.getElementById('accounts-report-content');
    if (!element) return;
    
    const opt = {
      margin: 10,
      filename: `Reporte_Empresas_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 gap-4 items-center w-full overflow-x-auto">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#002D5A] focus:border-[#002D5A]"
            />
          </div>
          
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#002D5A] focus:border-[#002D5A] min-w-[150px]"
          >
            <option value="">Todos los sectores</option>
            {uniqueSectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={contacted}
            onChange={(e) => setContacted(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#002D5A] focus:border-[#002D5A] min-w-[150px]"
          >
            <option value="">Contactada: Todas</option>
            <option value="YES">Contactada: Sí</option>
            <option value="NO">Contactada: No</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-semibold border border-emerald-200 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors text-sm font-semibold border border-rose-200 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002D5A]"></div>
        </div>
      ) : (
        <div id="accounts-report-content" className="space-y-6">
          {summary.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-[#002D5A] mb-6 flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Penetración de Mercado por Sector (Total vs Contactadas)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="sector" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f1f5f9' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Bar dataKey="total" name="Total Registradas" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="contacted" name="Contactadas" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#002D5A]" />
                Detalle de Empresas ({data.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                    <th className="p-3">Empresa / Razón Social</th>
                    <th className="p-3">Sector</th>
                    <th className="p-3 text-center">Estado Contacto</th>
                    <th className="p-3 text-center border-l border-slate-200">Total Act.</th>
                    <th className="p-3 text-center">✅ Comp.</th>
                    <th className="p-3 text-center">📅 Plan. (F)</th>
                    <th className="p-3 text-center border-r border-slate-200">⏳ Plan. (SF)</th>
                    <th className="p-3 text-center" title="Llamadas">📞</th>
                    <th className="p-3 text-center" title="Correos">✉️</th>
                    <th className="p-3 text-center" title="Reuniones">🤝</th>
                    <th className="p-3 text-center">Proyectos Activos</th>
                    <th className="p-3 text-center border-l border-slate-200">Último Contacto</th>
                    <th className="p-3 text-center">Próximo Contacto</th>
                    <th className="p-3">Contactos clave</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-500 font-medium">
                        No hay empresas que coincidan con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    data.map((account) => (
                      <tr key={account.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-bold text-slate-800 text-sm">
                          {account.name}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                            {account.sector}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {account.isContacted ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Contactada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded-md">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Sin contactar
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center border-l border-slate-200 font-bold text-[#002D5A]">{account.totalActivities || 0}</td>
                        <td className="p-3 text-center text-sm font-semibold text-emerald-600">{account.completedActivities || 0}</td>
                        <td className="p-3 text-center text-sm font-semibold text-blue-600">{account.plannedWithDate || 0}</td>
                        <td className="p-3 text-center text-sm font-semibold text-amber-600 border-r border-slate-200">{account.plannedWithoutDate || 0}</td>
                        <td className="p-3 text-center text-slate-600 font-semibold">{account.breakdown?.calls || 0}</td>
                        <td className="p-3 text-center text-slate-600 font-semibold">{account.breakdown?.emails || 0}</td>
                        <td className="p-3 text-center text-slate-600 font-semibold">{account.breakdown?.meetings || 0}</td>
                        <td className="p-3 text-center">
                          <span className="text-xs font-bold text-[#002D5A]">{account.activeProjects || 0} Activos</span>
                        </td>
                        <td className="p-3 text-center text-sm text-slate-600 border-l border-slate-200">
                          {account.lastContactDate ? new Date(account.lastContactDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3 text-center text-sm text-slate-600">
                          {account.nextContactDate ? new Date(account.nextContactDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {account.contactsFollowedUp.length > 0 ? (
                              account.contactsFollowedUp.map((c, i) => (
                                <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100 whitespace-nowrap">
                                  {c}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">Ninguno</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Summary Table */}
            {data.length > 0 && (
              <div className="bg-slate-50 p-4 border-t border-slate-200">
                <div className="w-full">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Totales (Vista Actual)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm text-center flex flex-col justify-center">
                      <div className="text-[10px] md:text-xs text-slate-500 font-semibold uppercase mb-1">Total Act.</div>
                      <div className="text-lg md:text-xl font-bold text-[#002D5A]">{data.reduce((acc, curr) => acc + (curr.totalActivities || 0), 0)}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm text-center flex flex-col justify-center">
                      <div className="text-[10px] md:text-xs text-emerald-600 font-semibold uppercase mb-1">Completadas</div>
                      <div className="text-lg md:text-xl font-bold text-emerald-600">{data.reduce((acc, curr) => acc + (curr.completedActivities || 0), 0)}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm text-center flex flex-col justify-center">
                      <div className="text-[10px] md:text-xs text-blue-600 font-semibold uppercase mb-1">Plan. (F)</div>
                      <div className="text-lg md:text-xl font-bold text-blue-600">{data.reduce((acc, curr) => acc + (curr.plannedWithDate || 0), 0)}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm text-center flex flex-col justify-center">
                      <div className="text-[10px] md:text-xs text-amber-600 font-semibold uppercase mb-1">Plan. (SF)</div>
                      <div className="text-lg md:text-xl font-bold text-amber-600">{data.reduce((acc, curr) => acc + (curr.plannedWithoutDate || 0), 0)}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm text-center flex flex-col justify-center">
                      <div className="text-[10px] md:text-xs text-slate-500 font-semibold uppercase mb-1">Llamadas</div>
                      <div className="text-lg md:text-xl font-bold text-slate-700">{data.reduce((acc, curr) => acc + (curr.breakdown?.calls || 0), 0)}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm text-center flex flex-col justify-center">
                      <div className="text-[10px] md:text-xs text-slate-500 font-semibold uppercase mb-1">Correos</div>
                      <div className="text-lg md:text-xl font-bold text-slate-700">{data.reduce((acc, curr) => acc + (curr.breakdown?.emails || 0), 0)}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm text-center flex flex-col justify-center">
                      <div className="text-[10px] md:text-xs text-slate-500 font-semibold uppercase mb-1">Reuniones</div>
                      <div className="text-lg md:text-xl font-bold text-slate-700">{data.reduce((acc, curr) => acc + (curr.breakdown?.meetings || 0), 0)}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm text-center flex flex-col justify-center">
                      <div className="text-[10px] md:text-xs text-[#002D5A] font-semibold uppercase mb-1">Proyectos</div>
                      <div className="text-lg md:text-xl font-bold text-[#002D5A]">{data.reduce((acc, curr) => acc + (curr.activeProjects || 0), 0)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
