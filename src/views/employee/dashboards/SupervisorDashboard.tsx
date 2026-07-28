import React from 'react';
import { motion } from 'motion/react';
import { Users, AlertTriangle, Briefcase, ChevronRight, Activity, FileText } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Header */}
      <header className="mb-6">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800">
          Supervisión de Campo
        </h1>
        <p className="font-sans text-slate-500">Bienvenido/a, {user?.name}</p>
      </header>

      {/* Estado del Equipo (Hero Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { title: 'Técnicos Activos', value: '14', subtitle: 'de 16 asignados', color: 'blue' },
          { title: 'Ausencias Hoy', value: '2', subtitle: 'Vacaciones/Baja', color: 'slate' },
          { title: 'Obras en Curso', value: '5', subtitle: 'En ejecución', color: 'emerald' },
          { title: 'Partes Pendientes', value: '12', subtitle: 'Esperando tu revisión', color: 'red' },
        ].map((metric, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden`}
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-${metric.color}-500`} />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{metric.title}</h3>
            <div className="text-3xl font-display font-black text-slate-800 mb-1">{metric.value}</div>
            <p className="text-xs font-medium text-slate-400">{metric.subtitle}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Tareas de Aprobación */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-secondary" /> Acción Requerida
            </h3>
            <button 
              onClick={() => navigate('/app/empleado/todos-partes')}
              className="text-sm font-bold text-primary hover:text-secondary flex items-center gap-1"
            >
              Ver todos <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            {[
              { tech: 'Carlos López', project: 'Edificio Norte - Filtraciones', hours: '8h', status: 'Pendiente' },
              { tech: 'Ana García', project: 'Mantenimiento Nave SUR', hours: '6.5h', status: 'Pendiente' },
            ].map((parte, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#001c3a]/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center text-slate-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{parte.tech}</h4>
                    <p className="text-xs text-slate-500">{parte.project}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-[#001c3a]">{parte.hours}</span>
                  <button className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-secondary hover:border-secondary/30 transition-colors">
                    Revisar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Accesos Rápidos Proyectos */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
        >
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Briefcase size={18} className="text-[#001c3a]" /> Obras Activas
          </h3>
          <ul className="space-y-4">
            {[
              { name: 'Reparación Cúpula Central', progress: 75 },
              { name: 'Impermeabilización Parking', progress: 30 },
              { name: 'Mantenimiento Preventivo A2', progress: 90 },
            ].map((obra, i) => (
              <li key={i}>
                <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                  <span>{obra.name}</span>
                  <span>{obra.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-[#001c3a] h-2 rounded-full" style={{ width: `${obra.progress}%` }}></div>
                </div>
              </li>
            ))}
          </ul>
          <button 
            onClick={() => navigate('/app/empleado/proyectos')}
            className="w-full mt-6 py-3 border-2 border-slate-100 text-slate-500 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
          >
            Abrir Gestión de Proyectos
          </button>
        </motion.section>

      </div>
    </div>
  );
}
