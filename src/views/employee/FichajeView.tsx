import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Play, Square, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { myDayService, AttendanceRecord } from '../../services/my-day.service';

type Status = 'inactivo' | 'activo';

interface LogEntry {
  id: string;
  type: 'Entrada' | 'Salida';
  time: string;
  location?: string;
}

export default function FichajeView() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState<Status>('inactivo');
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const records = await myDayService.getTodayAttendance();
      const newHistory: LogEntry[] = [];
      let currentStatus: Status = 'inactivo';

      records.forEach(record => {
        if (record.clockOut) {
          newHistory.push({
            id: `out-${record.id}`,
            type: 'Salida',
            time: new Date(record.clockOut).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            location: record.clockOutLocation || undefined
          });
        }
        if (record.clockIn) {
          newHistory.push({
            id: `in-${record.id}`,
            type: 'Entrada',
            time: new Date(record.clockIn).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            location: record.clockInLocation || undefined
          });
        }
      });

      if (records.length > 0) {
        const latest = records[0];
        if (latest.clockIn && !latest.clockOut) {
          currentStatus = 'activo';
        }
      }

      setHistory(newHistory);
      setStatus(currentStatus);
    } catch (error) {
      console.error('Error fetching attendance', error);
    } finally {
      setIsLoading(false);
    }
  };

  const timeString = currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const actionInProgress = useRef(false);

  const requestLocationAndLog = async (action: 'in' | 'out', nextStatus: Status) => {
    if (actionInProgress.current) return;
    actionInProgress.current = true;
    
    setErrorMsg('');
    setIsLocating(true);

    let hasClockedIn = false;

    const doClockIn = async (locationStr?: string) => {
      if (hasClockedIn) return;
      hasClockedIn = true;

      try {
        if (action === 'in') {
          await myDayService.clockIn(locationStr);
          toast.success('¡Entrada registrada!');
        } else {
          await myDayService.clockOut(locationStr);
          toast.success('¡Salida registrada!');
        }
        
        await fetchAttendance(); // Refresca los datos reales de la base de datos
      } catch (error: any) {
        setErrorMsg(error.response?.data?.error || 'Error al registrar fichaje en el servidor');
        // Si hay error (como "Ya hay un turno activo"), forzamos a recargar para sincronizar la pantalla
        fetchAttendance();
      } finally {
        setIsLocating(false);
        actionInProgress.current = false;
      }
    };

    if (!navigator.geolocation) {
      setErrorMsg('Geolocalización no soportada por el navegador.');
      setIsLocating(false);
      actionInProgress.current = false;
      return;
    }

    const handleLocationError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setIsLocating(false);
        setErrorMsg('Has bloqueado el acceso a la ubicación. Para fichar, debes hacer clic en el icono del candado en la barra de direcciones de tu navegador y cambiar el permiso a "Permitir".');
      } else {
        // Fallback a baja precisión si el GPS de alta precisión falla o tarda mucho
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
            doClockIn(loc);
          },
          (err) => {
            setIsLocating(false);
            toast.success('Permiso concedido, pero la señal GPS falló. Registrando sin ubicación...', { icon: '⚠️' });
            doClockIn();
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: Infinity }
        );
      }
    };

    // Primero intentamos con alta precisión (GPS)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
        doClockIn(loc);
      },
      handleLocationError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleAction = (action: 'in' | 'out') => {
    if (action === 'in') {
      requestLocationAndLog('in', 'activo');
    } else {
      if (!confirm('¿Estás seguro de que quieres fichar tu salida por hoy?')) return;
      requestLocationAndLog('out', 'inactivo');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  // Remove hasFinished logic, allow multiple clock in/out
  // const hasFinished = history.some(h => h.type === 'Salida');

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8 pb-24">
      <header>
        <h1 className="font-display font-bold text-3xl text-slate-800">Fichaje Operativo</h1>
        <p className="font-sans text-slate-500 capitalize">{dateString}</p>
      </header>

      {/* Clock & Status */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {status === 'activo' && <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse" />}
        {status === 'inactivo' && <div className="absolute top-0 left-0 w-full h-1 bg-slate-300" />}

        <div className="text-center mb-8">
          <div className="font-mono text-5xl md:text-7xl font-bold text-primary tracking-tight mb-2">
            {timeString}
          </div>
          <div className="flex items-center justify-center gap-2">
            {status === 'inactivo' ? (
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                 <Square size={12}/> Fuera de turno
              </span>
            ) : (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> Turno Activo
              </span>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="w-full max-w-md bg-red-50 text-red-600 font-sans text-sm p-4 rounded-xl border border-red-100 flex items-start gap-3 mb-6">
            <AlertTriangle className="shrink-0" size={18} />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 w-full max-w-md">
          {status === 'inactivo' && (
            <button
              onClick={() => handleAction('in')}
              disabled={isLocating}
              className="flex-1 bg-primary text-white font-bold py-4 px-6 rounded-2xl hover:bg-[#002a50] transition-colors shadow-lg flex flex-col items-center gap-2 disabled:opacity-50"
            >
              {isLocating ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Play size={24} />}
              <span>Entrada</span>
            </button>
          )}

          {status === 'activo' && (
            <button
              onClick={() => handleAction('out')}
              disabled={isLocating}
              className="flex-1 bg-red-500 text-white font-bold py-4 px-6 rounded-2xl hover:bg-red-600 transition-colors shadow-lg flex flex-col items-center gap-2 disabled:opacity-50"
            >
              {isLocating ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Square size={24} />}
              <span>Salida</span>
            </button>
          )}
        </div>
      </section>

      {/* History Log */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Clock size={18} className="text-secondary" /> Actividad de Hoy
        </h2>

        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-sans text-sm">
            No hay registros en el día de hoy.
          </div>
        ) : (
          <ul className="space-y-4">
            {history.map((log) => (
              <li key={log.id} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {log.type === 'Entrada' && <Play size={16} className="text-green-600" />}
                  {log.type === 'Salida' && <Square size={16} className="text-red-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-slate-800">{log.type}</p>
                    <span className="font-mono text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{log.time}</span>
                  </div>
                  {log.location && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin size={12} /> {log.location}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
