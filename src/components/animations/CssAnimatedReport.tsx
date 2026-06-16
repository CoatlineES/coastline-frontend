import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import thermalScan from '../../assets/thermal_scan.png';

export default function CssAnimatedReport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Normalize to [-1, 1]
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const springConfig = { damping: 25, stiffness: 120 };
  
  // Base rotation is about x: 6, y: -6. The mouse will tilt it +/- 8 degrees from base.
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [14, -2]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-14, 2]), springConfig);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[420px] mx-auto aspect-[3/4] perspective-[1200px] z-10"
    >
      
      {/* 3D Floating Tablet Device */}
      <motion.div 
        style={{ rotateX, rotateY }}
        className="absolute inset-0 bg-[#111] rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_0_0_0_2px_#333,inset_0_0_0_8px_#000] flex flex-col overflow-hidden border-8 border-[#1a1a1a]"
      >
        
        {/* Tablet Camera / Sensor */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#0a0a0a] border border-[#222] shadow-[inset_0_0_2px_#000] z-30" />
        
        {/* Screen Glare (Glass Reflection) */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-[2rem]">
          <div className="absolute top-[-50%] left-[-50%] right-[-50%] bottom-[-50%] bg-gradient-to-tr from-transparent via-white/5 to-white/20 transform rotate-[25deg] translate-x-[-20%] mix-blend-screen" />
        </div>

        {/* Screen Content - Digital App Interface */}
        <div className="relative z-10 flex-grow bg-[#faf9f8] m-[14px] rounded-[1.5rem] flex flex-col overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]">
          
          {/* Header */}
          <div className="bg-[#f0ece1]/50 border-b border-slate-300/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary" size={24} />
              <div>
                <h3 className="font-mono text-primary font-bold text-sm tracking-wider">APP INSPECCIÓN</h3>
                <p className="font-mono text-slate-500 text-[10px] tracking-widest">SINC: ONLINE</p>
              </div>
            </div>
            {/* Tablet Status Icons (Battery, Wifi) */}
            <div className="flex gap-1.5 items-center">
              <div className="w-4 h-3 border border-slate-400 rounded-sm p-[1px]"><div className="w-full h-full bg-slate-500 rounded-[1px]" /></div>
              <div className="flex gap-[2px] items-end h-3">
                 <div className="w-1 h-1 bg-slate-400" />
                 <div className="w-1 h-1.5 bg-slate-400" />
                 <div className="w-1 h-2.5 bg-slate-400" />
                 <div className="w-1 h-3 bg-slate-400" />
              </div>
            </div>
          </div>

          {/* Report Body */}
          <div className="p-6 flex-grow flex flex-col gap-6 relative">
            
            {/* Scanning Line overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary shadow-[0_0_15px_#f08a00] animate-[scan-vertical_4s_ease-in-out_infinite_alternate] z-10" />
            
            {/* Block 1 */}
            <div className="space-y-3">
              <div className="h-3 bg-slate-300/70 rounded w-1/3 animate-pulse" />
              <div className="h-2 bg-slate-200/70 rounded w-full" />
              <div className="h-2 bg-slate-200/70 rounded w-5/6" />
              <div className="h-2 bg-slate-200/70 rounded w-4/6" />
            </div>

            {/* Block 2: Thermal Scan Image */}
            <div className="flex items-center gap-6 py-2">
              <div className="relative w-20 h-20 shrink-0 border-2 border-slate-300/80 rounded-lg shadow-inner overflow-hidden">
                <img src={thermalScan} alt="Escaneo Térmico" className="w-full h-full object-cover" />
                {/* Target reticle overlay on the image */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-red-500 rounded-full flex items-center justify-center animate-pulse">
                   <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2 flex-grow">
                <div className="h-2 bg-slate-300/70 rounded w-1/2" />
                <div className="h-2 bg-slate-200/70 rounded w-full" />
                <div className="h-2 bg-slate-200/70 rounded w-full" />
              </div>
            </div>

            {/* Block 3 */}
            <div className="space-y-3">
              <div className="h-3 bg-slate-300/70 rounded w-1/4 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="h-2 bg-slate-200/70 rounded w-full" />
              <div className="h-2 bg-slate-200/70 rounded w-3/4" />
            </div>

            {/* Verification Stamp - Animated */}
            <div className="mt-auto pt-6 border-t border-slate-300/50 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Análisis IA</span>
                <span className="font-mono text-xs text-primary font-bold tracking-widest flex items-center gap-2">
                  <AlertTriangle size={14} className="text-secondary" />
                  FUGAS DETECTADAS
                </span>
              </div>
              
              {/* Digital Badge instead of ink stamp for the tablet */}
              <div className="border-2 border-red-500 bg-red-50 text-red-600 font-sans font-bold text-sm px-4 py-1.5 rounded-full shadow-sm animate-[stamp_1s_ease-out_forwards] opacity-0 flex items-center gap-1.5" style={{ animationDelay: '1.5s' }}>
                <CheckCircle2 size={16} />
                CONFIRMADO
              </div>
            </div>

          </div>
        </div>
      </motion.div>
      
      {/* Decorative blurred shadow behind the tablet */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-black/20 blur-3xl -z-20" />
    </div>
  );
}
