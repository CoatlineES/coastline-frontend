import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, FileText, MapPin, Play, Square, Navigation, Loader2, CheckCircle2, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { myDayService, MyDayTask, AttendanceRecord } from '../../../services/my-day.service';
import { dailyLogsService, DailyLog } from '../../../services/daily-logs.service';
import { usersService } from '../../../services/users.service';
import toast from 'react-hot-toast';
import { WeeklyTasksWidget } from './components/WeeklyTasksWidget';

export default function TecnicoDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isWorking, setIsWorking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentAttendance, setCurrentAttendance] = useState<AttendanceRecord | null>(null);
  const [suggestedTasks, setSuggestedTasks] = useState<MyDayTask[]>([]);
  const [todayLogs, setTodayLogs] = useState<DailyLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isTogglingWork, setIsTogglingWork] = useState(false);

  const [contractorWorkers, setContractorWorkers] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  const isContractor = typeof user?.role === 'object' ? (user.role as any).name === 'CONTRATISTA' : user?.role === 'CONTRATISTA';
  const isObrero = typeof user?.role === 'object' ? (user.role as any).name === 'OBRERO' : user?.role === 'OBRERO';
  const showClockIn = !isContractor && !isObrero;

  useEffect(() => {
    if (isContractor && user?.id) {
      usersService.getContractorWorkers(user.id).then(res => {
        const data = res.data || res;
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setContractorWorkers(list);
        const storedId = localStorage.getItem('contractor_worker_id');
        if (storedId && list.find((w: any) => w.id === storedId)) {
          setSelectedWorkerId(storedId);
        } else if (list.length > 0) {
          setSelectedWorkerId(list[0].id);
          localStorage.setItem('contractor_worker_id', list[0].id);
        }
      }).catch(console.error);
    }
  }, [isContractor, user?.id]);

  useEffect(() => {
    if (isContractor && !selectedWorkerId) return;
    fetchDashboardData();
  }, [selectedWorkerId, isContractor]);

  const handleWorkerChange = (id: string) => {
    setSelectedWorkerId(id);
    localStorage.setItem('contractor_worker_id', id);
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoadingData(true);
      const [attendanceRecords, tasks, logs] = await Promise.all([
        myDayService.getTodayAttendance(),
        myDayService.getSuggestedTasks().catch(() => []),
        dailyLogsService.getToday().catch(() => [])
      ]);
      
      // Prioritize unplanned tasks
      const sortedTasks = [...tasks].sort((a, b) => {
        if (a.isUnplanned && !b.isUnplanned) return -1;
        if (!a.isUnplanned && b.isUnplanned) return 1;
        return 0;
      });
      
      setSuggestedTasks(sortedTasks);
      setTodayLogs(logs);

      // Check attendance
      if (attendanceRecords && attendanceRecords.length > 0) {
        // Encontramos el turno activo (sin clockOut) o el último si todos están cerrados
        const activeTurn = attendanceRecords.find(r => !r.clockOut);
        if (activeTurn) {
          setCurrentAttendance(activeTurn);
          setIsWorking(true);
          // Calcular tiempo inicial
          const start = new Date(activeTurn.clockIn as string).getTime();
          setElapsedTime(Math.floor((Date.now() - start) / 1000));
        } else {
          setCurrentAttendance(attendanceRecords[attendanceRecords.length - 1]);
          setIsWorking(false);
          // Sumar tiempos de todos los turnos del día
          let totalSeconds = 0;
          attendanceRecords.forEach(r => {
            if (r.clockIn && r.clockOut) {
              totalSeconds += Math.floor((new Date(r.clockOut).getTime() - new Date(r.clockIn).getTime()) / 1000);
            }
          });
          setElapsedTime(totalSeconds);
        }
      } else {
        setIsWorking(false);
        setElapsedTime(0);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar datos del panel');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Cronómetro real basado en hora actual vs hora de inicio
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorking && currentAttendance?.clockIn) {
      interval = setInterval(() => {
        // Obtenemos el tiempo base de turnos anteriores (si los hay)
        // Para simplificar, aquí mostramos solo el tiempo del turno actual si está corriendo
        const start = new Date(currentAttendance.clockIn as string).getTime();
        setElapsedTime(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorking, currentAttendance]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleWork = () => {
    if (isTogglingWork) return;

    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización');
      executeToggleWork(null);
      return;
    }

    setIsTogglingWork(true);
    toast.loading('Obteniendo ubicación...', { id: 'geo-toast' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude},${position.coords.longitude}`;
        executeToggleWork(coords);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        toast.error('No se pudo obtener la ubicación. Fichando sin coordenadas.', { id: 'geo-toast' });
        executeToggleWork(null);
      },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  const executeToggleWork = async (location: string | null) => {
    toast.loading(isWorking ? 'Fichando salida...' : 'Fichando entrada...', { id: 'geo-toast' });
    try {
      if (isWorking) {
        await myDayService.clockOut(location || undefined);
        toast.success('Salida registrada correctamente', { id: 'geo-toast' });
        setIsWorking(false);
      } else {
        await myDayService.clockIn(location || undefined);
        toast.success('Entrada registrada correctamente', { id: 'geo-toast' });
        setIsWorking(true);
      }
      // Recargar datos para tener los timestamps exactos del servidor
      await fetchDashboardData();
    } catch (error: any) {
      console.error('Error toggling work:', error);
      toast.error(error.response?.data?.message || 'Error al fichar', { id: 'geo-toast' });
    } finally {
      setIsTogglingWork(false);
    }
  };

  const activeWorker = contractorWorkers.find(w => w.id === selectedWorkerId);
  const displayFirstName = activeWorker ? activeWorker.name.split(' ')[0] : user?.name?.split(' ')[0] || '';

  return (
    <div className="w-full">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800">
            Hola, {displayFirstName}
          </h1>
          <p className="font-sans text-slate-500">¿Listo para el turno de hoy?</p>
        </div>
        {isContractor && contractorWorkers.length > 0 && (
          <div className="flex flex-col">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Viendo datos de:</label>
             <select 
               value={selectedWorkerId} 
               onChange={e => handleWorkerChange(e.target.value)}
               className="bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#001c3a]/20 font-medium"
             >
               <option value="">Yo ({user?.name.split(' ')[0]})</option>
               {contractorWorkers.map(w => (
                 <option key={w.id} value={w.id}>{w.name}</option>
               ))}
             </select>
          </div>
        )}
      </header>
      
      {isLoadingData ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-primary opacity-50" size={32} />
        </div>
      ) : (
        <>

      {/* Próxima Tarea (Hero Area) */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#001c3a] to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-[#001c3a]/20 mb-6 relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-4 text-white/70">
          <MapPin size={18} />
          <span className="text-sm font-bold uppercase tracking-wider">Tu próximo destino</span>
        </div>
        
        {suggestedTasks.length > 0 ? (
          (() => {
            const assignedTask = suggestedTasks.find(t => 
              t.components?.some(c => c.plannedWorkers && c.plannedWorkers.length > 0)
            );
            const mainTask = assignedTask || suggestedTasks[0];
            const assignedManpower = mainTask.components?.find(c => c.resourceType === 'MANO_OBRA' && c.plannedWorkers && c.plannedWorkers.length > 0);
            const roleName = assignedManpower?.concept || '';

            const otherTasks = suggestedTasks.filter(t => t.id !== mainTask.id);

            return (
              <>
                {mainTask.isUnplanned && (
                  <div className="inline-block bg-orange-500/20 text-orange-200 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                    TAREA EXTRA - PRIORIDAD ALTA
                  </div>
                )}
                <p className="text-white font-sans max-w-2xl mb-4 text-lg md:text-xl leading-relaxed">
                  Tu proyecto para el día de hoy es <strong>{mainTask.plan?.project?.name || 'Proyecto Asignado'}</strong>{mainTask.plan?.project?.address ? ` (ubicado en ${mainTask.plan.project.address}${mainTask.plan.project.city ? `, ${mainTask.plan.project.city}` : ''})` : ''}, realizando la partida <strong>{mainTask.name}</strong>{roleName ? ` como ${roleName}` : ''}.
                  {mainTask.description && <span className="block mt-2 text-white/70 text-base">{mainTask.description}</span>}
                </p>

                {otherTasks.length > 0 && (
                  <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4 max-w-2xl">
                    <h3 className="text-sm font-bold text-white/80 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <FileText size={14} /> Otras tareas planificadas para hoy
                    </h3>
                    <ul className="space-y-2">
                      {otherTasks.map(t => (
                        <li key={t.id} className="text-white/60 text-sm flex flex-col md:flex-row md:items-center justify-between gap-1">
                           <span><strong>{t.name}</strong> en {t.plan?.project?.name || 'Proyecto'}</span>
                           {t.isUnplanned && <span className="text-orange-300 text-[10px] font-bold border border-orange-400/30 px-1.5 py-0.5 rounded bg-orange-400/10">TAREA EXTRA</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => navigate('/app/empleado/partes')}
                    className="bg-secondary hover:bg-secondary-container text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
                  >
                    <Navigation size={18} /> Iniciar {mainTask.isUnplanned ? 'Tarea Extra' : 'Tarea'}
                  </button>
                </div>
              </>
            );
          })()
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2 opacity-70">
              Sin asignaciones
            </h2>
            <p className="text-white/60 font-sans max-w-xl mb-6">
              No tienes ninguna tarea específica asignada para hoy.
            </p>
            <button 
                onClick={() => navigate('/app/empleado/partes')}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 backdrop-blur-sm border border-white/10"
              >
                <FileText size={18} /> Crear Parte Libre
            </button>
          </>
        )}
      </motion.section>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Widget Fichaje Interactivo - Solo visible para empleados regulares */}
        {showClockIn && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-[#001c3a]">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Tu Jornada</h3>
                  <p className="text-sm text-slate-500">Hoy, {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${isWorking ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                <span className={`w-2 h-2 rounded-full ${isWorking ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                {isWorking ? 'En curso' : 'Pausado'}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-4xl font-display font-black text-slate-800 tabular-nums tracking-tight">
                {formatTime(elapsedTime)}
              </span>
              <button 
                onClick={handleToggleWork}
                disabled={isTogglingWork}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${isWorking ? 'bg-red-500 shadow-red-500/30' : 'bg-[#001c3a] shadow-[#001c3a]/30'}`}
              >
                {isTogglingWork ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : isWorking ? (
                  <Square fill="currentColor" size={20} />
                ) : (
                  <Play fill="currentColor" size={24} className="ml-1" />
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Rellenar Parte */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/app/empleado/partes')}
          className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer hover:border-[#001c3a]/30 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Parte Diario</h3>
              <p className="text-sm text-slate-500">Documenta tu trabajo</p>
            </div>
          </div>
          
          {todayLogs.length > 0 ? (
            <div className="flex flex-col gap-2">
              {todayLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700 truncate">
                      {log.project?.name || 'Proyecto'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0 ml-2">
                    {log.tasks.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText size={12} />{log.tasks.length} partida{log.tasks.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {log.workers.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users size={12} />{log.workers.length}
                      </span>
                    )}
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
              <span className="text-xs text-slate-400 mt-1 text-center">Toca para ver o editar</span>
            </div>
          ) : (
            <div className="text-sm font-medium">
              {isWorking ? (
                <span className="text-amber-600">No olvides documentar tu trabajo antes de acabar.</span>
              ) : (
                <span className="text-slate-500">Mantén tu registro de actividad al día.</span>
              )}
            </div>
          )}
        </motion.div>

      </div>

      {/* Planificación Semanal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <WeeklyTasksWidget 
          isContractor={isContractor} 
          selectedWorkerId={selectedWorkerId} 
        />
      </motion.div>

      {/* Avisos */}
      {/* 
        Ocultado temporalmente por falta de endpoint real en backend 
      */}
      {/* <motion.section 
        ...
      </motion.section> */}

      </>
      )}

    </div>
  );
}
