import React from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';
import { ScreenId } from '../../types';
import WaterproofingShield from '../animations/WaterproofingShield';

interface HomeHeroProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function HomeHero({ onNavigate }: HomeHeroProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Calculate distance from center
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const springConfig = { damping: 25, stiffness: 150 };
  // Handlers for mouse movement are kept if needed for other global effects,
  // but the main shield logic handles its own mouse tracking now.

  return (
    <header className="relative pt-8 px-6 md:px-16 bg-slate-50 overflow-hidden h-[calc(100vh-80px)] flex flex-col justify-center">
      {/* Very subtle background gradient/pattern to add depth to the white space */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-slate-50 to-slate-100"></div>
      
      {/* Decorative corporate blur circles */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#285a8a]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#df3d52]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-8 items-center relative z-10 text-left h-full max-h-[calc(100vh-80px)] py-4">

        {/* Left Column: Typography */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-slate-900 leading-[1.15] tracking-tight"
          >
            Acabamos con las <br />
            <span className="text-[#df3d52]">Filtraciones</span> que otros <br />
            no pueden resolver.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
            className="text-sm md:text-base lg:text-lg text-slate-600 font-sans max-w-xl leading-relaxed font-medium"
          >
            No vendemos parches, aplicamos ingeniería. Soluciones definitivas con tecnología de impermeabilización de última generación.
          </motion.p>

          {/* Badges/Features */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(5px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 1.4, ease: "easeOut" }}
            className="flex flex-wrap items-center gap-4 py-2"
          >
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
              <ShieldCheck size={14} className="text-[#285a8a]" />
              <span className="text-xs text-slate-700 font-bold">Mapeo de patologías</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
              <TrendingUp size={14} className="text-[#285a8a]" />
              <span className="text-xs text-slate-700 font-bold">Intervención quirúrgica</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
              <ShieldCheck size={14} className="text-[#285a8a]" />
              <span className="text-xs text-slate-700 font-bold">Respaldo documentado</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1"
          >
            <a href="#servicios" className="px-5 py-2.5 md:px-6 md:py-3 bg-white border-2 border-slate-300 text-slate-700 font-sans font-bold text-xs uppercase tracking-wider rounded-lg hover:border-[#285a8a] hover:text-[#285a8a] transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center">
              Ver Servicios
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigate('contact', 'push'); }} 
              className="px-5 py-2.5 md:px-6 md:py-3 bg-[#df3d52] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#c03546] transition-all shadow-[0_4px_15px_rgba(223,61,82,0.3)] active:scale-95 flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
              Agendar Inspección <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>

        {/* Right Column: Hovering Shield Animation */}
        <div className="md:col-span-5 relative flex justify-center items-center h-full w-full translate-x-4 lg:translate-x-12">
          <WaterproofingShield />
        </div>
      </div>
    </header>
  );
}
