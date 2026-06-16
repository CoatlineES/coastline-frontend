import React from 'react';
import textureMesh from '../../assets/texture_mesh.png';
import texturePropeller from '../../assets/texture_propeller_nobg.png';
import textureLens from '../../assets/texture_lens.png';
import droneBodySprite from '../../assets/drone_body_sprite.png';
import droneMotorSprite from '../../assets/new_drone_motor_sprite.png';
import coatlineLogoBadge from '../../assets/coatline_logo_badge.png';
import scannerConeImg from '../../assets/scanner_cone.png';

export default function CssDrone() {
  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto drop-shadow-[0_60px_60px_rgba(0,0,0,0.6)] flex items-center justify-center">
      
      {/* 
        DRONE STRUCTURE CONTAINER
      */}
      <div className="relative w-full h-full">

        {/* --- MAIN CENTRAL BODY (Photorealistic Sprite) --- */}
        {/* We place the body first in the DOM or use z-0 so it sits BEHIND the spinning propellers */}
        {/* --- SCANNER BEAM (IMAGE BASED) --- */}
        <div className="absolute top-1/2 left-1/2 -ml-[300px] w-[600px] h-[600px] flex justify-center origin-top animate-[scan-beam_4s_ease-in-out_infinite_alternate] z-[-5] pointer-events-none mix-blend-screen opacity-[0.05]">
           <img src={scannerConeImg} alt="Scanner Beam" className="w-full h-full object-fill drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
        </div>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] flex flex-col items-center justify-center z-0 drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
          style={{
            backgroundImage: `url(${droneBodySprite})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Integrated Photorealistic Logo Badge */}
          <div 
             className="absolute flex flex-col items-center justify-center z-10 w-[20%] h-14 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] rounded-md"
             style={{
                backgroundImage: `url(${coatlineLogoBadge})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
             }}
          ></div>
        </div>

        {/* --- ROTORS & PROPELLERS --- */}
        {/* Helper function to render rotors to avoid duplication */}
        {[
          { top: '15%', left: '15%', delay: '0s', color: 'bg-[#b70f36]', shadow: 'rgba(183,15,54,1)', dir: 'normal' },
          { top: '15%', left: '85%', delay: '0.2s', color: 'bg-[#b70f36]', shadow: 'rgba(183,15,54,1)', dir: 'reverse' },
          { top: '85%', left: '15%', delay: '0.4s', color: 'bg-[#b70f36]', shadow: 'rgba(183,15,54,1)', dir: 'reverse' },
          { top: '85%', left: '85%', delay: '0.1s', color: 'bg-[#b70f36]', shadow: 'rgba(183,15,54,1)', dir: 'normal' },
        ].map((rotor, idx) => (
          <div key={idx} className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10" style={{ top: rotor.top, left: rotor.left }}>
            
            {/* Rotor Motor Base (Photorealistic Sprite with Coatline Tint) */}
            <div 
               className="w-16 h-16 rounded-full flex items-center justify-center relative shadow-[0_10px_20px_rgba(0,0,0,0.6)] overflow-hidden border-2 border-[#b70f36]/40"
               style={{
                 backgroundImage: `url(${droneMotorSprite})`,
                 backgroundSize: '110%',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat'
               }}
            >
              {/* Coatline Blue Tint Overlay for the Motor */}
              <div className="absolute inset-0 bg-[#001c3a] mix-blend-color opacity-70"></div>
              <div className="absolute inset-0 bg-[#001c3a] mix-blend-overlay opacity-50"></div>
              
              {/* Propeller Guards (Rings) */}
              <div className="absolute w-[210px] h-[210px] rounded-full border-[3px] border-slate-700/50 shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-none"></div>

              {/* Spinning Propeller Blades (Restored to original white but with a colored glow) */}
              <div 
                className="absolute w-[260px] h-[260px] rounded-full animate-spin z-20 pointer-events-none opacity-[0.95]" 
                style={{ 
                  animationDuration: '0.12s', 
                  animationDirection: rotor.dir as 'normal' | 'reverse',
                  backgroundImage: `url(${texturePropeller})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: `drop-shadow(0px 0px 5px ${rotor.shadow}) brightness(1.2) contrast(1.5)`,
                }}
              ></div>
            </div>
          </div>
        ))}

        {/* End Main Body */}

      </div>
    </div>
  );
}
