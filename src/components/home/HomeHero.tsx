import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';
import { ScreenId } from '../../types';
import CssDrone from '../animations/CssDrone';
import CssRoofBackground from '../animations/CssRoofBackground';

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
  const droneEvadeX = useSpring(useTransform(mouseX, [-300, 300], [80, -80]), springConfig);
  const droneEvadeY = useSpring(useTransform(mouseY, [-300, 300], [80, -80]), springConfig);
  const droneBank = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), springConfig);
  const dronePitch = useSpring(useTransform(mouseY, [-300, 300], [-10, 10]), springConfig);

  return (
    <header className="relative pt-[80px] px-6 md:px-16 bg-[#e2e8f0] overflow-hidden h-screen flex flex-col justify-center">
      {/* Cinematic Animated CSS Roof Background */}
      <motion.div
        initial={{ scale: 1.15, filter: 'blur(20px)', opacity: 0 }}
        animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0 origin-center"
      >
        <CssRoofBackground />
      </motion.div>

      {/* Subtle white vignette to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent z-0 pointer-events-none"></div>

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
            <span className="text-[#001c3a]">Filtraciones</span> que otros <br />
            no pueden resolver.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
            className="text-sm md:text-base lg:text-lg text-slate-700 font-sans max-w-xl leading-relaxed font-medium"
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
            <div className="flex items-center gap-1.5 bg-white/50 border border-slate-300 rounded-full px-3 py-1.5 backdrop-blur-sm shadow-sm">
              <ShieldCheck size={14} className="text-secondary" />
              <span className="text-xs text-slate-800 font-bold">Mapeo de patologías</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/50 border border-slate-300 rounded-full px-3 py-1.5 backdrop-blur-sm shadow-sm">
              <TrendingUp size={14} className="text-secondary" />
              <span className="text-xs text-slate-800 font-bold">Intervención quirúrgica</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/50 border border-slate-300 rounded-full px-3 py-1.5 backdrop-blur-sm shadow-sm">
              <ShieldCheck size={14} className="text-secondary" />
              <span className="text-xs text-slate-800 font-bold">Respaldo documentado</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1"
          >
            <a href="#servicios" className="px-5 py-2.5 md:px-6 md:py-3 bg-transparent border-2 border-[#001c3a] text-[#001c3a] font-sans font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#001c3a]/5 transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center">
              Ver Servicios
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigate('contact', 'push'); }} 
              className="px-5 py-2.5 md:px-6 md:py-3 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#9a0c2d] transition-all shadow-lg shadow-secondary/30 active:scale-95 flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
              Agendar Inspección <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>

        {/* Right Column: Hovering CSS Drone */}
        <div 
          className="md:col-span-5 relative flex justify-center items-center h-full w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background Glow for Drone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Entrance Swoop Animation (Scanning from left) */}
          <motion.div
            initial={{ opacity: 0, x: '-100vw', y: '-25vh', rotate: 45, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
            transition={{ duration: 5.5, type: "spring", stiffness: 20, damping: 15, delay: 0.2 }}
            className="relative z-10 w-full flex justify-center items-center pointer-events-none lg:right-[-10%] lg:top-[-10%]"
          >
            {/* Continuous Hover Animation */}
            <motion.div
              animate={{ y: [-15, 15, -15] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
              className="w-full flex justify-center items-center pointer-events-auto"
            >
              <motion.div
                style={{ 
                  x: droneEvadeX, 
                  y: droneEvadeY, 
                  rotateZ: droneBank,
                  rotateX: dronePitch
                }}
                className="w-full flex justify-center"
              >
                <CssDrone />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
