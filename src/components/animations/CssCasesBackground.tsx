import React from 'react';

export default function CssCasesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#004e92] perspective-[1000px]">
      {/* 1. Base Blueprint Grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:40px_40px]" 
      />
      {/* Secondary micro-grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" 
      />

      {/* Blueprint Annotations & Labels */}
      <div className="absolute top-8 left-8 text-white/50 font-mono text-sm tracking-widest border border-white/20 p-2 uppercase">
        Proyecto: Inspección de Cubiertas<br/>
        Plano: Planta General - Sector A<br/>
        Escala: 1:100 | Rev: 02
      </div>

      <div className="absolute top-[220px] left-[200px] text-white/40 font-mono text-xs tracking-widest uppercase">
        ◄--- 15.00 m ---►
      </div>
      
      <div className="absolute top-[400px] left-[550px] text-white/40 font-mono text-xs tracking-widest uppercase">
        ZONA DE MÁQUINAS
      </div>

      {/* 2. Abstract Architecture Lines (simulating a roof plan) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-80">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 stroke-white stroke-[2] fill-none">
          {/* Main Outline */}
          <path d="M 100 100 L 400 100 L 500 250 L 200 250 Z" className="opacity-40" />
          <path d="M 400 100 L 700 150 L 600 300 L 500 250 Z" className="opacity-30" />
          <path d="M 200 250 L 500 250 L 500 600 L 100 500 Z" className="opacity-50" />
          <path d="M 500 250 L 600 300 L 700 700 L 500 600 Z" className="opacity-40" />
          
          {/* Internal structural walls */}
          <path d="M 500 250 L 500 150" strokeDasharray="5,5" className="opacity-50" />
          <path d="M 200 250 L 200 150" strokeDasharray="5,5" className="opacity-50" />
          <path d="M 600 300 L 600 200" strokeDasharray="5,5" className="opacity-50" />
          <path d="M 300 100 L 300 250" className="opacity-40" />
          <path d="M 500 450 L 700 500" strokeDasharray="10,5" className="opacity-40" />
        </svg>
      </div>

      {/* 3. Dynamic Animated Leak Points (Puntos de Fuga) - Reduced and contained within the blueprint shape */}
      <LeakPoint top="180px" left="550px" delay={0} status="Fuga Capilar - Junta" />
      <LeakPoint top="350px" left="600px" delay={1.2} status="Infiltración Profunda" />
      <LeakPoint top="550px" left="650px" delay={0.5} status="Falla de Soldadura" />

      {/* Sweeping Scanner Line (Vertical) */}
      <div className="absolute top-0 bottom-0 w-1 bg-sky-300/40 shadow-[0_0_20px_#38bdf8] animate-[scan-horizontal_12s_ease-in-out_infinite_alternate]" />
      <div className="absolute top-0 bottom-0 w-[400px] bg-gradient-to-r from-transparent via-sky-400/5 to-transparent animate-[scan-horizontal_12s_ease-in-out_infinite_alternate] -translate-x-[200px]" />

      {/* Vignette to blend edges */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#001c3a] via-transparent to-transparent opacity-90 pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_150px_#001c3a] pointer-events-none" />
    </div>
  );
}

function LeakPoint({ top, left, delay, status }: { top: string, left: string, delay: number, status: string }) {
  return (
    <div className="absolute flex flex-col items-center justify-center pointer-events-none" style={{ top, left, animation: `float 6s ease-in-out infinite`, animationDelay: `${delay}s` }}>
      {/* Red Expanding rings for leaks */}
      <div className="absolute w-24 h-24 rounded-full border border-red-500/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: `${delay}s` }} />
      <div className="absolute w-12 h-12 rounded-full border border-red-400/60 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: `${delay + 0.3}s` }} />
      
      {/* Core Red Dot */}
      <div className="relative w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444]">
        <div className="absolute inset-0 bg-white rounded-full animate-pulse opacity-80" />
      </div>

      {/* Crosshair target lines */}
      <div className="absolute w-8 h-px bg-red-400/50" />
      <div className="absolute w-px h-8 bg-red-400/50" />

      {/* Data Label */}
      <div className="absolute top-4 left-4 bg-[#001c3a]/90 backdrop-blur-sm border border-red-500/40 px-2 py-1 rounded shadow-lg flex flex-col min-w-[140px]">
        <span className="text-[10px] font-mono text-red-400 tracking-widest leading-tight uppercase font-bold flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          ANOMALÍA
        </span>
        <span className="text-[9px] font-sans text-white/80 tracking-wide mt-0.5 truncate">{status}</span>
      </div>
    </div>
  );
}
