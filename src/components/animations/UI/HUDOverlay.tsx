import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HUDOverlayProps {
  currentPhase: number;
}

// Spring animation config for premium feel
const springTransition = { type: "spring", stiffness: 300, damping: 25 };
const panelVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export const HUDOverlay: React.FC<HUDOverlayProps> = ({ currentPhase }) => {
  return (
    <div className="pointer-events-none flex flex-col gap-4 relative z-30">
      <AnimatePresence mode="wait">
        
        {currentPhase === 1 && (
          <motion.div 
            key="phase1"
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit" transition={springTransition}
            className="bg-[#0a1120]/40 backdrop-blur-2xl border border-white/10 rounded-xl p-4 w-full md:w-72 shadow-2xl"
          >
            <div className="text-red-500 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              Alerta Estructural
            </div>
            <div className="text-slate-300 font-sans text-xs leading-relaxed font-light">
              Superficie comprometida. Filtraciones detectadas en la capa superior del sustrato debido a desgaste climático severo.
            </div>
          </motion.div>
        )}

        {currentPhase === 2 && (
          <motion.div 
            key="phase2"
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit" transition={springTransition}
            className="bg-[#0a1120]/40 backdrop-blur-2xl border border-[#0ea5e9]/30 rounded-xl p-4 w-full md:w-72 shadow-[0_8px_32px_rgba(14,165,233,0.15)]"
          >
            <div className="text-[#0ea5e9] font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Detección Eléctrica
            </div>
            <div className="text-slate-300 font-sans text-xs leading-relaxed font-light">
              Mapeo topográfico activo. Trazando pulsos de bajo voltaje para localizar los puntos exactos de infiltración térmica.
            </div>
          </motion.div>
        )}

        {currentPhase === 3 && (
          <motion.div 
            key="phase3"
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit" transition={springTransition}
            className="bg-[#0a1120]/60 backdrop-blur-3xl border border-red-500/40 rounded-xl p-4 w-full md:w-72 shadow-[0_8px_32px_rgba(239,68,68,0.2)]"
          >
            <div className="text-red-400 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Diagnóstico Crítico
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center bg-black/20 rounded p-2 border border-white/5">
                <span className="text-slate-400 text-[10px] font-sans">Puntos de Fuga</span>
                <span className="text-white font-mono text-xs font-bold">03 DETECTADOS</span>
              </div>
              <div className="flex justify-between items-center bg-red-500/10 rounded p-2 border border-red-500/20">
                <span className="text-red-300 text-[10px] font-sans">Nivel de Riesgo</span>
                <span className="text-red-400 font-mono text-xs font-bold">ALTO (87%)</span>
              </div>
            </div>

            <div className="text-slate-400 text-[10px] font-sans font-light">
              Protocolo de intervención <span className="text-white font-medium">Coatline</span> requerido de inmediato.
            </div>
          </motion.div>
        )}

        {currentPhase === 4 && (
          <motion.div 
            key="phase4"
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit" transition={springTransition}
            className="bg-[#0a1120]/40 backdrop-blur-2xl border border-[#4299e1]/30 rounded-xl p-4 w-full md:w-72 shadow-[0_8px_32px_rgba(66,153,225,0.15)]"
          >
            <div className="text-[#4299e1] font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
              Intervención Coatline
            </div>
            <div className="text-slate-300 font-sans text-xs leading-relaxed font-light mb-3">
              Despliegue de malla estructural de fibra y membrana líquida de poliuretano de alto desempeño.
            </div>
            
            <div className="w-full bg-black/40 rounded-full h-1 overflow-hidden border border-white/5">
              <motion.div 
                className="bg-[#4299e1] h-1 rounded-full shadow-[0_0_10px_#4299e1]" 
                initial={{ width: "0%" }} 
                animate={{ width: "100%" }} 
                transition={{ duration: 4, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}

        {currentPhase === 5 && (
          <motion.div 
            key="phase5"
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit" transition={springTransition}
            className="flex flex-col gap-1"
          >
            <div className="text-[#4299e1] font-mono text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4299e1] animate-pulse shadow-[0_0_8px_#4299e1]"></span>
              Sistema Hidrofóbico
            </div>
            <div className="text-white font-sans text-sm font-medium tracking-wide">
              Protección Activa al 100%
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
