import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { UserCircle, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../../services/api';
import logoUrl from '../../assets/logo.png';

interface Worker {
  id: string;
  name: string;
}

interface Props {
  onSelectWorker: (workerId: string, workerName: string) => void;
}

export default function WorkerSelectionScreen({ onSelectWorker }: Props) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const { data } = await api.get('/contractors/workers');
        if (data.success) {
          setWorkers(data.data);
        } else {
          setError(data.message || 'Error al cargar trabajadores');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900">
      <div className="p-6 flex items-center justify-center border-b border-white/10 shrink-0">
        <img src={logoUrl} alt="Coatline" className="h-10 filter invert brightness-0" />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-white overflow-y-auto custom-scrollbar">
        <div className="max-w-xl w-full text-center">
          <ShieldAlert className="w-16 h-16 text-secondary mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">Identificación de Obrero</h1>
          <p className="text-slate-400 mb-8 text-lg">
            Por favor, selecciona tu nombre de la lista para continuar con tu sesión. Todas las acciones se registrarán a tu nombre.
          </p>

          {loading ? (
            <div className="flex flex-col items-center text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p>Cargando lista de trabajadores...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 text-red-200 p-4 rounded-xl border border-red-500/30">
              {error}
            </div>
          ) : workers.length === 0 ? (
            <div className="bg-white/5 text-slate-300 p-8 rounded-2xl border border-white/10">
              <p className="text-xl font-medium mb-2">No hay obreros registrados</p>
              <p className="text-sm text-slate-400">Dile al administrador que añada obreros a tu equipo de contratista.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
              {workers.map((worker) => (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={worker.id}
                  onClick={() => onSelectWorker(worker.id, worker.name)}
                  className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors text-left group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-red-800 rounded-full flex items-center justify-center font-bold text-xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                    {worker.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-lg flex-1 truncate">{worker.name}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
