import React from 'react';
import { Globe, Share2, Phone, Mail, MapPin } from 'lucide-react';
import logoUrl from '../../assets/logo.png';
import { ScreenId } from '../../types';

interface FooterProps {
  onNavigate: (screen: ScreenId, mode?: 'none' | 'push') => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleAnchorClick = (e: React.MouseEvent, anchorId: string) => {
    e.preventDefault();
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = anchorId;
      onNavigate('home', 'none');
    }
  };

  return (
    <footer className="bg-[#001c3a] text-white w-full relative border-t border-white/5">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
          
          {/* Branding Column */}
          <div className="space-y-6">
            <div className="flex items-center">
              <span className="font-sans text-3xl font-normal tracking-wide text-white border-b-2 border-secondary pb-1">
                coatline
              </span>
            </div>
            <p className="font-sans text-sm text-slate-300 leading-relaxed">
              Mantenga sus superficies siempre en perfecto estado con soluciones de ingeniería premium.
            </p>
            <div className="flex gap-4 pt-2">
              <a className="text-white/80 hover:text-secondary transition-colors" href="#" aria-label="Language options">
                <Globe size={18} />
              </a>
              <a className="text-white/80 hover:text-secondary transition-colors" href="#" aria-label="Share options">
                <Share2 size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Servicios */}
          <div>
            <h4 className="font-sans font-bold text-xs text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-2">
              SERVICIOS
            </h4>
            <ul className="space-y-3 text-xs md:text-sm text-slate-300 font-semibold">
              <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate('detection', 'none'); }}>Detección Eléctrica</a></li>
              <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => handleAnchorClick(e, 'zero-filtraciones')}>Zero Filtraciones</a></li>
              <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => handleAnchorClick(e, 'servicios')}>Mantenimiento Preventivo</a></li>
              <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => handleAnchorClick(e, 'servicios')}>Impermeabilización Certificada</a></li>
              <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => handleAnchorClick(e, 'servicios')}>Eficiencia Energética</a></li>
            </ul>
          </div>

          {/* Column 3: Empresa */}
          <div>
            <h4 className="font-sans font-bold text-xs text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-2">
              EMPRESA
            </h4>
            <ul className="space-y-3 text-xs md:text-sm text-slate-300 font-semibold">
              <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => handleAnchorClick(e, 'nosotros')}>Sobre Nosotros</a></li>
              <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => handleAnchorClick(e, 'metodologia')}>Metodología</a></li>
              <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate('cases', 'none'); }}>Casos Reales</a></li>
              <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact', 'none'); }}>Contacto</a></li>
              <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate('login', 'push'); }}>Acceso Técnico</a></li>
            </ul>
          </div>

          {/* Column 4: Contacto */}
          <div>
            <h4 className="font-sans font-bold text-xs text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-2">
              CONTACTO
            </h4>
            <ul className="space-y-3.5 text-xs text-slate-300 font-semibold">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-secondary shrink-0 mt-0.5" />
                <span>Calle de la Resina, 35. Nave 7<br />28021 Madrid</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-secondary" />
                <span>+34 91 491 61 97</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-secondary" />
                <span className="break-all">comercial@coatline.es</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Subfooter */}
        <div className="border-t border-white/10 py-8 text-center mt-12 space-y-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-xs">
            <a className="text-white/40 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate('legal', 'none'); }}>Aviso Legal</a>
            <span className="hidden md:block text-white/10">|</span>
            <a className="text-white/40 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy', 'none'); }}>Política de Privacidad</a>
            <span className="hidden md:block text-white/10">|</span>
            <a className="text-white/40 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate('cookies', 'none'); }}>Cookies</a>
          </div>
          <p className="text-xs text-white/40 font-medium font-sans">
            © {new Date().getFullYear()} Coatline Architectural Maintenance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
