import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, DollarSign, ArrowUpRight, BarChart2, Activity, CheckCircle, AlertTriangle, Info, FolderKanban, Calendar, Clock, CreditCard, Shield } from 'lucide-react';
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
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Cargando panel de control...</p>
      </div>
    );
  }

  const kpis = data ? [
    { title: 'Facturación MTD', value: `${((data.facturacionMTD || 0) / 1000).toFixed(1)}K €`, trend: data.trends?.facturacion || '0%', isPositive: true, icon: <DollarSign size={22} className="text-emerald-500" /> },
    { title: 'Proyectos Activos', value: (data.proyectosActivos || 0).toString(), trend: data.trends?.proyectos || '0%', isPositive: true, icon: <FolderKanban size={22} className="text-blue-500" /> },
    { title: 'Cotizaciones Aprobadas', value: (data.cotizacionesAprobadasMTD || 0).toString(), trend: data.trends?.aprobadas || '0%', isPositive: true, icon: <CheckCircle size={22} className="text-purple-500" /> },
    { title: 'Personal Activo', value: (data.personalActivo || 0).toString(), trend: data.trends?.personal || '0%', isPositive: true, icon: <Users size={22} className="text-orange-500" /> },
  ] : [];

  const quickLinks = [
    { title: 'Gestión de Usuarios', desc: 'Altas, roles y permisos', icon: <Shield size={24} />, path: '/app/empleado/usuarios', color: 'bg-indigo-50 text-indigo-600', borderColor: 'group-hover:border-indigo-200' },
    { title: 'Proyectos', desc: 'Cartera de proyectos', icon: <FolderKanban size={24} />, path: '/app/empleado/proyectos', color: 'bg-blue-50 text-blue-600', borderColor: 'group-hover:border-blue-200' },
    { title: 'CRM Comercial', desc: 'Clientes y cotizaciones', icon: <TrendingUp size={24} />, path: '/app/empleado/crm', color: 'bg-emerald-50 text-emerald-600', borderColor: 'group-hover:border-emerald-200' },
    { title: 'Planificación Global', desc: 'Gantt y asignaciones', icon: <Calendar size={24} />, path: '/app/empleado/planificacion-global', color: 'bg-amber-50 text-amber-600', borderColor: 'group-hover:border-amber-200' },
    { title: 'Costes Laborales', desc: 'Control financiero', icon: <CreditCard size={24} />, path: '/app/empleado/costes', color: 'bg-rose-50 text-rose-600', borderColor: 'group-hover:border-rose-200' },
    { title: 'Partes Diarios', desc: 'Validación de horas', icon: <Clock size={24} />, path: '/app/empleado/todos-partes', color: 'bg-cyan-50 text-cyan-600', borderColor: 'group-hover:border-cyan-200' },
  ];

  return (
    <div className="w-full space-y-8 pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-800 tracking-tight">
            Bienvenido, <span className="text-primary">{user?.nombre || 'Administrador'}</span>
          </h1>
          <p className="font-sans text-slate-500 mt-1 text-lg">Resumen global de operaciones, finanzas y accesos rápidos.</p>
        </div>
        <button 
          onClick={() => navigate('/app/empleado/ejecutivo')}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <BarChart2 size={18} /> Panel Avanzado
        </button>
      </header>

      {/* KPIs Financieros/Operativos */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={20} className="text-slate-400"/> Resumen de Rendimiento (MTD)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((kpi, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group cursor-default"
            >
              <div className="absolute -right-6 -top-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                {React.cloneElement(kpi.icon as React.ReactElement, { size: 100 })}
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 shadow-sm`}>
                  {kpi.icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${kpi.isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                  {kpi.trend} <ArrowUpRight size={14} />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{kpi.title}</h3>
                <div className="text-3xl font-display font-black text-slate-800">{kpi.value}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Access */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={20} className="text-slate-400"/> Accesos Rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, idx) => (
            <motion.button
              key={idx}
              onClick={() => navigate(link.path)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + (idx * 0.05) }}
              className={`group flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md text-left transition-all ${link.borderColor}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${link.color}`}>
                {link.icon}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors text-base">{link.title}</h4>
                <p className="text-sm text-slate-500 mt-0.5">{link.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Shortcuts */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" /> CRM y Comercial
            </h3>
            <button onClick={() => navigate('/app/empleado/crm')} className="text-sm font-bold text-primary hover:underline">Ver todo</button>
          </div>
          <div className="space-y-5">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
              <Info size={20} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-orange-900 font-medium">
                  Existen <span className="font-bold text-orange-600 text-lg">{data?.cotizacionesPendientes || 0}</span> cotizaciones pendientes de revisión o firma.
                </p>
                <button onClick={() => navigate('/app/empleado/crm?tab=quotations')} className="text-xs font-bold text-orange-700 mt-2 hover:underline">Ir a cotizaciones →</button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate('/app/empleado/crm')} className="p-4 rounded-xl border border-slate-200 hover:border-primary hover:shadow-sm text-left transition-all group bg-slate-50 hover:bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-700 group-hover:text-primary">Clientes</h4>
                  <ArrowUpRight size={16} className="text-slate-400 group-hover:text-primary" />
                </div>
                <p className="text-xs text-slate-500">Gestión de cartera y contactos</p>
              </button>
              <button onClick={() => navigate('/app/empleado/crm?tab=quotations')} className="p-4 rounded-xl border border-slate-200 hover:border-primary hover:shadow-sm text-left transition-all group bg-slate-50 hover:bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-700 group-hover:text-primary">Cotizaciones</h4>
                  <ArrowUpRight size={16} className="text-slate-400 group-hover:text-primary" />
                </div>
                <p className="text-xs text-slate-500">Presupuestos y embudo</p>
              </button>
            </div>
          </div>
        </motion.section>

        {/* Administration Alerts */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col"
        >
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-6">
            <AlertTriangle size={20} className="text-rose-500" /> Alertas de Sistema
          </h3>
          <div className="space-y-3 flex-grow overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
            {data?.systemAlerts && data.systemAlerts.length > 0 ? (
              data.systemAlerts.map((alert, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${alert.type === 'warning' ? 'bg-orange-50 border-orange-100' : alert.type === 'error' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="text-orange-500 mt-0.5 shrink-0" size={18} />
                  ) : alert.type === 'error' ? (
                    <AlertTriangle className="text-rose-500 mt-0.5 shrink-0" size={18} />
                  ) : (
                    <Info className="text-slate-400 mt-0.5 shrink-0" size={18} />
                  )}
                  <div>
                    <h4 className={`font-bold text-sm ${alert.type === 'warning' ? 'text-orange-900' : alert.type === 'error' ? 'text-rose-900' : 'text-slate-700'}`}>{alert.title}</h4>
                    <p className={`text-xs mt-1 leading-relaxed ${alert.type === 'warning' ? 'text-orange-700' : alert.type === 'error' ? 'text-rose-700' : 'text-slate-500'}`}>{alert.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-center h-full">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle size={24} />
                </div>
                <h4 className="font-bold text-emerald-800 text-sm">Todo en orden</h4>
                <p className="text-xs text-emerald-600 mt-1 max-w-[200px]">No hay alertas críticas en el sistema en este momento.</p>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
