import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, DollarSign, ArrowUpRight, BarChart2, Activity, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dashboardService, AdminDashboardSummary } from '../../../services/dashboard.service';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summary = await dashboardService.getAdminSummary();
        setData(summary);
      } catch (error) {
        console.error('Error fetching admin dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = data ? [
    { title: 'Facturación MTD', value: `${(data.facturacionMTD / 1000).toFixed(1)}K €`, trend: data.trends.facturacion, isPositive: true, icon: <DollarSign size={20} /> },
    { title: 'Proyectos Activos', value: data.proyectosActivos.toString(), trend: data.trends.proyectos, isPositive: true, icon: <Activity size={20} /> },
    { title: 'Cotizaciones Aprobadas', value: data.cotizacionesAprobadasMTD.toString(), trend: data.trends.aprobadas, isPositive: true, icon: <CheckCircle size={20} /> },
    { title: 'Personal Activo', value: data.personalActivo.toString(), trend: data.trends.personal, isPositive: true, icon: <Users size={20} /> },
  ] : [];

  return (
    <div className="w-full">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800">
            Vista Ejecutiva
          </h1>
          <p className="font-sans text-slate-500">Resumen global de operaciones y finanzas.</p>
        </div>
        <button 
          onClick={() => navigate('/app/empleado/ejecutivo')}
          className="bg-[#001c3a] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <BarChart2 size={18} /> Abrir Panel Completo
        </button>
      </header>

      {/* KPIs Financieros/Operativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                {kpi.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${kpi.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                {kpi.trend} <ArrowUpRight size={12} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{kpi.title}</h3>
              <div className="text-2xl font-display font-black text-slate-800">{kpi.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Shortcuts */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200"
        >
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-6">
            <Users size={20} className="text-[#001c3a]" /> CRM y Comercial
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-4">
              Existen <span className="font-bold text-secondary">{data?.cotizacionesPendientes || 0}</span> cotizaciones pendientes de revisión comercial o firma.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate('/app/empleado/crm')} className="p-4 rounded-xl border border-slate-200 hover:border-secondary hover:bg-secondary/5 text-left transition-colors group">
                <h4 className="font-bold text-slate-700 group-hover:text-secondary">Clientes</h4>
                <p className="text-xs text-slate-400 mt-1">Gestión de cartera</p>
              </button>
              <button onClick={() => navigate('/app/empleado/crm?tab=quotations')} className="p-4 rounded-xl border border-slate-200 hover:border-secondary hover:bg-secondary/5 text-left transition-colors group">
                <h4 className="font-bold text-slate-700 group-hover:text-secondary">Cotizaciones</h4>
                <p className="text-xs text-slate-400 mt-1">Presupuestos activos</p>
              </button>
            </div>
          </div>
        </motion.section>

        {/* Administration Alerts */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200"
        >
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-6">
            <Activity size={20} className="text-secondary" /> Alertas de Sistema
          </h3>
          <div className="space-y-4">
            {data?.systemAlerts && data.systemAlerts.length > 0 ? (
              data.systemAlerts.map((alert, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-start gap-4 ${alert.type === 'warning' ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="text-orange-500 mt-1 shrink-0" size={18} />
                  ) : (
                    <Info className="text-slate-400 mt-1 shrink-0" size={18} />
                  )}
                  <div>
                    <h4 className={`font-bold text-sm ${alert.type === 'warning' ? 'text-orange-900' : 'text-slate-700'}`}>{alert.title}</h4>
                    <p className={`text-xs mt-1 ${alert.type === 'warning' ? 'text-orange-700' : 'text-slate-500'}`}>{alert.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                <CheckCircle className="text-emerald-500 mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">Todo en orden</h4>
                  <p className="text-xs text-slate-500 mt-1">No hay alertas críticas en el sistema en este momento.</p>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
