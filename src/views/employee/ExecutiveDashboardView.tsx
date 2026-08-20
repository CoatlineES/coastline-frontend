import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Briefcase, Download, ArrowUpRight, ArrowDownRight, Target, Activity } from 'lucide-react';

const revenueData = [
  { name: 'Ene', facturacion: 45000, costes: 28000 },
  { name: 'Feb', facturacion: 52000, costes: 30000 },
  { name: 'Mar', facturacion: 48000, costes: 29000 },
  { name: 'Abr', facturacion: 61000, costes: 35000 },
  { name: 'May', facturacion: 59000, costes: 33000 },
  { name: 'Jun', facturacion: 72000, costes: 40000 },
  { name: 'Jul', facturacion: 85000, costes: 46000 },
  { name: 'Ago', facturacion: 145500, costes: 62000 },
];

const projectStatusData = [
  { name: 'Adjudicados', value: 8, color: '#f59e0b' }, // amber-500
  { name: 'En ejecución', value: 12, color: '#6366f1' }, // indigo-500
  { name: 'Ejecutados', value: 4, color: '#14b8a6' }, // teal-500
  { name: 'Facturados', value: 3, color: '#10b981' }, // emerald-500
  { name: 'Cerrados', value: 5, color: '#3b82f6' }, // blue-500
  { name: 'Cancelados', value: 2, color: '#ef4444' }, // red-500
];

const crmFunnelData = [
  { name: 'Contactos Iniciales', value: 45 },
  { name: 'Visitas / Evaluaciones', value: 30 },
  { name: 'Cotizaciones Enviadas', value: 24 },
  { name: 'En Negociación', value: 14 },
  { name: 'Cerrados (Ganados)', value: 8 },
];

export default function ExecutiveDashboardView() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 bg-slate-50/50 p-2 md:p-6 rounded-3xl">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-800 tracking-tight">
            Panel Ejecutivo Avanzado
          </h1>
          <p className="font-sans text-slate-500 mt-1 text-lg">Métricas financieras, rendimiento de proyectos y embudo comercial.</p>
        </div>
      </header>

      {/* Top Meta KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-gradient-to-br from-primary to-[#003060] p-6 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10"><DollarSign size={120} /></div>
          <h3 className="font-medium text-primary-100 mb-1">Ingresos YTD</h3>
          <div className="text-4xl font-display font-bold mb-4">567.5K €</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full"><ArrowUpRight size={14}/> 12.5%</span>
            <span className="text-primary-200">vs año anterior</span>
          </div>
        </motion.div>
        
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 text-slate-800"><TrendingUp size={120} /></div>
          <h3 className="font-medium text-slate-500 mb-1">Margen Bruto Promedio</h3>
          <div className="text-4xl font-display font-bold text-slate-800 mb-4">32.4%</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full border border-emerald-100"><ArrowUpRight size={14}/> 2.1%</span>
            <span className="text-slate-400">vs mes anterior</span>
          </div>
        </motion.div>
        
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 text-slate-800"><Target size={120} /></div>
          <h3 className="font-medium text-slate-500 mb-1">Ratio de Conversión CRM</h3>
          <div className="text-4xl font-display font-bold text-slate-800 mb-4">17.8%</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded-full border border-rose-100"><ArrowDownRight size={14}/> 0.5%</span>
            <span className="text-slate-400">vs trimestre anterior</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.3}} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><DollarSign size={20} className="text-emerald-500"/> Facturación vs Costes (2026)</h2>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFacturacion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCostes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value / 1000}k`} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="facturacion" name="Facturación" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFacturacion)" />
                <Area type="monotone" dataKey="costes" name="Costes" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCostes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Project Status Pie Chart */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.4}} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><Briefcase size={20} className="text-blue-500"/> Estado de Proyectos</h2>
          <p className="text-sm text-slate-500 mb-6">Distribución actual de la cartera</p>
          
          <div className="flex-grow flex items-center justify-center relative min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-display font-bold text-slate-800">26</span>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Totales</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {projectStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-slate-600">{item.name}</span>
                <span className="text-sm font-bold text-slate-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Funnel */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.5}} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Target size={20} className="text-orange-500"/> Embudo de Conversión (CRM)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crmFunnelData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 500}} width={140} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#f97316" radius={[0, 8, 8, 0]} barSize={24}>
                  {crmFunnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === crmFunnelData.length - 1 ? '#10b981' : '#f97316'} fillOpacity={1 - (index * 0.15)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pending Invoices / Alerts */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.6}} className="bg-[#001c3a] p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 blur-3xl rounded-full -translate-x-1/3 translate-y-1/3" />
          
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Activity size={20} className="text-secondary"/> Alertas Financieras</h2>
            
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/15 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Facturas Vencidas</h4>
                    <p className="text-xs text-slate-300">3 clientes con pagos pendientes</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-400">12,450 €</div>
                  <div className="text-xs text-slate-400">Ver detalles &rarr;</div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/15 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Desviación de Costes</h4>
                    <p className="text-xs text-slate-300">Proyecto "Residencial Costa"</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-400">+8.5%</div>
                  <div className="text-xs text-slate-400">Ver impacto &rarr;</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-8">
            <button className="w-full py-3 rounded-xl bg-white text-[#001c3a] font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg">
              Generar Informe Completo
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
