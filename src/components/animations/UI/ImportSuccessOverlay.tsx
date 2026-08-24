import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Database } from 'lucide-react';
// @ts-ignore
import Confetti from 'react-confetti';

interface ImportSuccessOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
}

export function ImportSuccessOverlay({ isOpen, onClose, count }: ImportSuccessOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0 pointer-events-none">
            {typeof window !== 'undefined' && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />}
          </div>
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center overflow-hidden border border-emerald-500/30"
          >
            {/* Background glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 rounded-full mx-auto flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              
              {/* Spinning ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-emerald-400/30 border-t-emerald-500 rounded-full"
              />
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-slate-800 dark:text-white mb-2 relative z-10"
            >
              ¡Importación Exitosa!
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 mb-6 relative z-10 bg-slate-50 dark:bg-slate-800/50 py-3 rounded-xl"
            >
              <Database className="w-5 h-5 text-emerald-500" />
              <span className="text-lg">
                <strong className="text-emerald-600 dark:text-emerald-400 text-2xl mx-1">{count}</strong> 
                registros importados
              </span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 relative z-10"
            >
              Continuar
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
