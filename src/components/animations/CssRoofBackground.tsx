import React from 'react';
import textureConcrete from '../../assets/texture_concrete.png';
import textureMetal from '../../assets/texture_metal.png';
import aiVent from '../../assets/ai_vent.png';

export default function CssRoofBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#eef2f6] perspective-[1000px]">
      
      {/* 1. Base White Roof with Highly Detailed Seamless Concrete Texture */}
      <div 
        className="absolute inset-0 opacity-[0.35] mix-blend-multiply pointer-events-none" 
        style={{ 
          backgroundImage: `url(${textureConcrete})`,
          backgroundSize: '400px 400px',
          backgroundRepeat: 'repeat'
        }}
      ></div>

      {/* 2. Roofing Membrane Seams (Realistic overlapping panels) */}
      <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-color-burn">
        {/* Horizontal Seams with highlight and shadow */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_98px,rgba(0,0,0,0.1)_98px,rgba(255,255,255,0.8)_99px,rgba(0,0,0,0.2)_100px)]"></div>
        {/* Vertical Panel Lines (Wider) */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_398px,rgba(0,0,0,0.1)_398px,rgba(255,255,255,0.8)_399px,rgba(0,0,0,0.2)_400px)]"></div>
      </div>

      {/* 3. Water puddles / Grime / Dirt Patches (Organic shading) */}
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.06)_0%,transparent_70%)] rounded-full blur-[20px] pointer-events-none"></div>
      <div className="absolute bottom-[5%] right-[15%] w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(50,60,70,0.08)_0%,transparent_60%)] rounded-full blur-[30px] pointer-events-none mix-blend-multiply"></div>
      
      {/* 4. Industrial HVAC Units & Vents (Drawn in CSS with realistic sun shadows) */}
      
      {/* Large AC Unit Left */}
      <div className="absolute top-[12%] left-[8%] w-56 h-64 bg-gradient-to-br from-[#f8fafc] to-[#cbd5e1] rounded shadow-[35px_45px_40px_rgba(0,0,0,0.3),inset_2px_2px_5px_rgba(255,255,255,0.9)] border border-slate-300 transform -rotate-1">
        {/* Unit Top Panel lines */}
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_20px,#000_20px,#000_21px)] rounded"></div>
        
        {/* Dual Fan grills */}
        <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-slate-900 border-[3px] border-slate-300 shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
           <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#334155_2px,#334155_3px)] opacity-60"></div>
           {/* Fan blades fake blur */}
           <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.1)_20deg,transparent_40deg,rgba(255,255,255,0.1)_140deg,transparent_160deg)] animate-spin" style={{ animationDuration: '0.5s' }}></div>
        </div>
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-slate-900 border-[3px] border-slate-300 shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
           <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#334155_2px,#334155_3px)] opacity-60"></div>
           {/* Fan blades fake blur */}
           <div className="absolute inset-0 bg-[conic-gradient(from_90deg,transparent,rgba(255,255,255,0.1)_20deg,transparent_40deg,rgba(255,255,255,0.1)_140deg,transparent_160deg)] animate-spin" style={{ animationDuration: '0.4s' }}></div>
        </div>
        
        {/* Heat sink side grill */}
        <div className="absolute bottom-4 left-4 right-4 h-24 bg-slate-800 rounded-sm shadow-inner overflow-hidden border border-slate-400">
           <div className="w-full h-full bg-[repeating-linear-gradient(90deg,#000,#000_2px,#334155_2px,#334155_4px)]"></div>
        </div>
      </div>

      {/* Electrical Conduit / Cables on the roof */}
      <div className="absolute top-[30%] left-[8%] w-[30%] h-[3px] bg-slate-600 shadow-[5px_10px_5px_rgba(0,0,0,0.2)] transform rotate-[15deg] origin-left border-y border-slate-800"></div>

      {/* Real Small Vent Right */}
      <div className="absolute bottom-[20%] right-[18%] w-32 h-32 z-10 flex items-center justify-center drop-shadow-[15px_20px_15px_rgba(0,0,0,0.5)]">
        <img src={aiVent} alt="Real Roof Vent" className="w-full h-full object-contain mix-blend-luminosity opacity-90" />
      </div>





    </div>
  );
}
