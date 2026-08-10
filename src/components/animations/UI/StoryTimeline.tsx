import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryTimelineProps {
  currentPhase: number;
  setPhase: (phase: number) => void;
  isAutoPlay: boolean;
  toggleAutoPlay: () => void;
}

export const StoryTimeline: React.FC<StoryTimelineProps> = ({ currentPhase, setPhase, isAutoPlay, toggleAutoPlay }) => {
  const steps = [
    { id: 1, label: 'Deterioro' },
    { id: 2, label: 'Escaneo' },
    { id: 3, label: 'Diagnóstico' },
    { id: 4, label: 'Reparación' },
    { id: 5, label: 'Protección' },
  ];

  return (
    <div className="w-full max-w-[500px] mx-auto flex items-center gap-4 pointer-events-auto">
      
      {/* Play/Pause Button */}
      <button 
        onClick={toggleAutoPlay}
        className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center transition-all bg-[#0a1120]/60 backdrop-blur border border-white/10 hover:border-white/30 text-white shadow-lg"
        title={isAutoPlay ? "Pausar" : "Reanudar"}
      >
        {isAutoPlay ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        )}
      </button>

      {/* Segmented Timeline */}
      <div className="flex-1 flex gap-2">
        {steps.map((step) => {
          const isActive = currentPhase === step.id;
          const isPast = currentPhase > step.id;
          const isFuture = currentPhase < step.id;

          return (
            <div 
              key={step.id} 
              className="flex-1 group cursor-pointer"
              onClick={() => setPhase(step.id)}
            >
              {/* Text Label */}
              <div className="h-6 flex items-end mb-2">
                <AnimatePresence>
                  {(isActive || isPast) && (
                    <motion.span 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: isActive ? 1 : 0.4, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-[10px] font-mono tracking-wider font-semibold whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-[#4299e1]' : 'text-slate-500'}`}
                    >
                      {step.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Segment Bar */}
              <div className={`h-1.5 w-full rounded-full overflow-hidden transition-all duration-300 ${isFuture ? 'bg-white/5 group-hover:bg-white/10' : 'bg-white/10'}`}>
                {/* Fill Animation */}
                <motion.div 
                  className={`h-full ${isPast ? 'bg-slate-500' : 'bg-[#4299e1]'}`}
                  initial={{ width: isPast ? '100%' : '0%' }}
                  animate={{ width: isPast ? '100%' : (isActive ? '100%' : '0%') }}
                  transition={{ 
                    duration: isActive ? (step.id === 4 ? 6 : 4) : 0.3, // Matches phase duration
                    ease: "linear"
                  }}
                  style={{ 
                    boxShadow: isActive ? '0 0 10px rgba(66,153,225,0.8)' : 'none' 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
