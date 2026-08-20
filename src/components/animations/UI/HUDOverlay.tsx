import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HUDOverlayProps {
  currentPhase: number;
}

// Spring animation config for premium feel
const springTransition = { type: "spring", stiffness: 300, damping: 25 };
const panelVariants = {
  hidden: { opacity: 0, y: -15, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 } 
  }
};

const staggerItem = {
  hidden: { opacity: 0, x: -10, filter: 'blur(4px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// Reusable Scanning Line Background Component
const Scanline: React.FC<{ color?: string }> = ({ color = "from-transparent via-[#0ea5e9]/10 to-transparent" }) => (
  <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none z-0">
    <motion.div 
      className={`absolute top-0 left-0 right-0 h-12 bg-gradient-to-b ${color} opacity-40`}
      animate={{ y: [-48, 200] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
    />
  </div>
);

export const HUDOverlay: React.FC<HUDOverlayProps> = ({ currentPhase }) => {
  // A consistent grid layout for phases with 3 parts (Left, Center, Right)
  const gridLayout3 = "relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 w-full px-4 md:px-8 max-w-7xl mx-auto";
  
  // A wider flex layout for phases with only 2 parts (Left, Right) to utilize more width
  const gridLayout2 = "relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 w-full px-4 md:px-8 max-w-7xl mx-auto";

  return (
    <div className="pointer-events-none flex w-full relative z-30 justify-center">
      <AnimatePresence mode="wait">
        
        {currentPhase === 1 && (
          <motion.div 
            key="phase1"
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit" transition={springTransition}
            className="bg-[#0a1120]/80 backdrop-blur-xl border-b border-red-500/30 py-2 px-4 rounded-t-3xl shadow-xl relative overflow-hidden w-full"
          >
            <Scanline color="from-transparent via-red-500/10 to-transparent" />
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className={gridLayout2}>
              <motion.div variants={staggerItem} className="text-red-500 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]"></span>
                Alerta Estructural
              </motion.div>
              
              <div className="hidden md:flex w-px h-4 bg-red-500/30"></div>
              
              <motion.div variants={staggerItem} className="text-slate-300 font-sans text-[11px] md:text-sm leading-tight font-light text-right pr-0 md:pr-12 lg:pr-20">
                Superficie comprometida. Filtraciones detectadas en capa superior.
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {currentPhase === 2 && (
          <motion.div 
            key="phase2"
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit" transition={springTransition}
            className="bg-[#0a1120]/80 backdrop-blur-xl border-b border-[#0ea5e9]/30 py-2 px-4 rounded-t-3xl shadow-xl relative overflow-hidden w-full"
          >
            <Scanline />
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className={gridLayout2}>
              <motion.div variants={staggerItem} className="text-[#0ea5e9] font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Detección Eléctrica
              </motion.div>
              
              <div className="hidden md:flex w-px h-4 bg-[#0ea5e9]/30"></div>
              
              <motion.div variants={staggerItem} className="text-slate-300 font-sans text-[11px] md:text-sm leading-tight font-light text-right pr-0 md:pr-12 lg:pr-20">
                <span className="text-white font-medium mr-2">Mapeo activo.</span> 
                Trazando pulsos de bajo voltaje.
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {currentPhase === 3 && (
          <motion.div 
            key="phase3"
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit" transition={springTransition}
            className="bg-[#0a1120]/90 backdrop-blur-xl border-b border-red-500/40 py-2 px-4 rounded-t-3xl shadow-xl relative overflow-hidden w-full"
          >
            <Scanline color="from-transparent via-red-500/15 to-transparent" />
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className={gridLayout3}>
              <motion.div variants={staggerItem} className="text-red-400 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2 justify-self-start">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                Diagnóstico Crítico
              </motion.div>

              <div className="flex gap-4 justify-self-center">
                <motion.div variants={staggerItem} className="flex items-center gap-2 bg-black/40 rounded px-3 py-1.5 border border-white/5">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Puntos:</span>
                  <span className="text-white font-mono text-xs font-bold">03 FUGAS</span>
                </motion.div>
                <motion.div variants={staggerItem} className="flex items-center gap-2 bg-red-500/10 rounded px-3 py-1.5 border border-red-500/30">
                  <span className="text-red-300 text-[10px] uppercase font-sans">Riesgo:</span>
                  <span className="text-red-400 font-mono text-xs font-bold">ALTO (87%)</span>
                </motion.div>
              </div>

              <motion.div variants={staggerItem} className="text-slate-400 text-[11px] md:text-sm font-sans font-light text-right justify-self-end pr-0 md:pr-12 lg:pr-20">
                Protocolo <span className="text-[#df3d52] font-bold">Coatline</span> requerido.
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {currentPhase === 4 && (
          <motion.div 
            key="phase4"
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit" transition={springTransition}
            className="bg-[#0a1120]/80 backdrop-blur-xl border-b border-[#285a8a]/50 py-2 px-4 rounded-t-3xl shadow-xl relative overflow-hidden w-full"
          >
            <Scanline color="from-transparent via-[#285a8a]/30 to-transparent" />
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className={gridLayout3}>
              <motion.div variants={staggerItem} className="text-[#0ea5e9] font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2 justify-self-start">
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                Intervención Coatline
              </motion.div>
              
              <motion.div variants={staggerItem} className="w-full max-w-[200px] md:max-w-xs justify-self-center bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/10 relative">
                <motion.div 
                  className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#285a8a] to-[#0ea5e9] rounded-full" 
                  initial={{ width: "0%" }} 
                  animate={{ width: "100%" }} 
                  transition={{ duration: 6, ease: "linear" }}
                />
              </motion.div>

              <motion.div variants={staggerItem} className="text-slate-300 font-sans text-[11px] md:text-sm leading-tight font-light text-right justify-self-end pr-0 md:pr-12 lg:pr-20">
                Despliegue de malla estructural y membrana líquida.
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {currentPhase === 5 && (
          <motion.div 
            key="phase5"
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit" transition={springTransition}
            className="bg-[#0a1120]/80 backdrop-blur-xl border-b border-[#0ea5e9]/40 py-2 px-4 rounded-t-3xl shadow-xl relative overflow-hidden w-full"
          >
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className={gridLayout2}>
              <motion.div variants={staggerItem} className="text-[#0ea5e9] font-mono text-[10px] md:text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse shadow-[0_0_8px_#0ea5e9]"></span>
                Sistema Hidrofóbico
              </motion.div>
              
              <div className="hidden md:flex w-px h-4 bg-[#0ea5e9]/30"></div>
              
              <motion.div variants={staggerItem} className="text-white font-sans text-[11px] md:text-sm font-bold tracking-wide text-right pr-0 md:pr-12 lg:pr-20">
                Protección al 100%
              </motion.div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

