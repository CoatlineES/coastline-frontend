import React from 'react';
import waterproofRoof from '../../assets/waterproof_roof.png';

export default function CssDetectionFloor() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-slate-200">
      
      {/* Inline styles for local high-tech animations */}
      <style>{`
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 0 400px; }
        }
        @keyframes scan-sweep {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes radar-ring {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); box-shadow: 0 0 15px rgba(183, 15, 54, 0.8); }
        }
        @keyframes anomaly-drift-1 {
          0% { top: -10%; opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes anomaly-drift-2 {
          0% { top: -40%; opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 80%; opacity: 0; }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 3D Perspective Container */}
      <div 
        className="relative w-[200vw] h-[200vh] flex items-center justify-center"
        style={{
          transform: 'perspective(1000px) rotateX(75deg) scale(1.2) translateY(-10%)',
          transformOrigin: 'center 40%'
        }}
      >
        
        {/* Realistic Waterproof Roof Base (White/Light Grey) */}
        <div 
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: `url(${waterproofRoof})`,
            backgroundSize: '400px 400px',
            backgroundRepeat: 'repeat',
            animation: 'grid-move 10s linear infinite',
            filter: 'grayscale(100%) brightness(2.0) contrast(0.8)'
          }}
        />

        {/* High-Tech Glowing Grid (Reduced intensity) */}
        <div 
          className="absolute inset-0 opacity-10 mix-blend-multiply"
          style={{
            backgroundImage: `
              linear-gradient(to bottom, rgba(6, 182, 212, 0.4) 1px, transparent 1px),
              linear-gradient(to right, rgba(6, 182, 212, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            animation: 'grid-move 10s linear infinite'
          }}
        />

        {/* --- High-Tech Anomaly Markers --- */}
        {/* Marker 1 */}
        <div className="absolute left-[32%] w-0 h-0 z-20" style={{ animation: 'anomaly-drift-1 60s linear infinite -15s' }}>
          <div className="absolute top-0 left-0 w-3 h-3 bg-secondary rounded-full" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
          <div className="absolute top-0 left-0 w-48 h-48 border-2 border-secondary rounded-full" style={{ animation: 'radar-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' }} />
          <div className="absolute top-0 left-0 w-48 h-48 border border-secondary/50 rounded-full" style={{ animation: 'radar-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 1.5s' }} />
          
          {/* Rotating Crosshairs */}
          <div className="absolute top-0 left-0" style={{ animation: 'spin-slow 15s linear infinite' }}>
            <div className="absolute top-[-40px] left-[-1px] w-[2px] h-[80px] bg-secondary/60" />
            <div className="absolute top-[-1px] left-[-40px] w-[80px] h-[2px] bg-secondary/60" />
          </div>

          <div className="absolute top-[-20px] left-[15px] text-secondary font-mono text-[10px] font-bold tracking-widest bg-white/90 px-1.5 py-0.5 rounded backdrop-blur-sm border border-secondary/30 shadow-md">
            COAT-DDP DETECTED
          </div>
        </div>

        {/* Marker 2 */}
        <div className="absolute left-[65%] w-0 h-0 z-20" style={{ animation: 'anomaly-drift-2 60s linear infinite -25s' }}>
          <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-secondary rounded-full" style={{ animation: 'pulse-dot 2.5s ease-in-out infinite 0.5s' }} />
          <div className="absolute top-0 left-0 w-32 h-32 border-2 border-secondary rounded-full" style={{ animation: 'radar-ring 4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' }} />
          
          {/* Rotating Crosshairs */}
          <div className="absolute top-0 left-0" style={{ animation: 'spin-slow 20s linear infinite reverse' }}>
            <div className="absolute top-[-30px] left-[-1px] w-[2px] h-[60px] bg-secondary/60" />
            <div className="absolute top-[-1px] left-[-30px] w-[60px] h-[2px] bg-secondary/60" />
          </div>

          <div className="absolute top-[10px] left-[15px] text-secondary font-mono text-[9px] font-bold tracking-widest bg-white/90 px-1.5 py-0.5 rounded backdrop-blur-sm border border-secondary/30 shadow-md opacity-80">
            MICRO-FISURA
          </div>
        </div>

        {/* Scanning Laser Beam Line (Reduced intensity) */}
        <div 
          className="absolute left-[-50vw] w-[300vw] h-[2px] bg-cyan-400/50 shadow-[0_0_15px_3px_rgba(34,211,238,0.4)] z-10"
          style={{ animation: 'scan-sweep 4s linear infinite' }}
        >
          {/* Glowing gradient trail behind the laser */}
          <div className="absolute bottom-[100%] left-0 w-full h-[400px] bg-gradient-to-t from-cyan-400/10 to-transparent"></div>
        </div>
        
      </div>
      
      {/* Vignette effect to fade edges into the background seamlessly */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#fcf9f8_95%)] z-20 pointer-events-none" />
    </div>
  );
}
