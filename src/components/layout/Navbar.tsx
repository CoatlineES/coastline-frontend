import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowUpRight, ChevronDown, User } from 'lucide-react';
import logoUrl from '../../assets/logo.png';
import { ScreenId } from '../../types';

interface NavbarProps {
  currentScreen: ScreenId;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  onNavigate: (screen: ScreenId, mode?: 'none' | 'push') => void;
}

export default function Navbar({ currentScreen, isMobileMenuOpen, setIsMobileMenuOpen, onNavigate }: NavbarProps) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-20 flex items-center justify-between">
          <a
            className="flex items-center hover:opacity-90 transition-opacity shrink-0 group"
            href="#"
            onClick={(e) => { 
              e.preventDefault(); 
              if (currentScreen === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                onNavigate('home', 'none'); 
              }
            }}
          >
            <img src={logoUrl} alt="Coatline" className="h-8 md:h-10 w-auto group-hover:scale-105 transition-transform" />
          </a>

          <div className="hidden md:flex items-center gap-8 justify-end">
            <div className="relative group flex items-center h-full py-6 -my-6">
              <a
                href="#"
                onClick={(e) => { 
                  e.preventDefault(); 
                  if (currentScreen === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    onNavigate('home', 'none'); 
                  }
                }}
                className={`font-sans font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1 py-1.5 px-2.5 rounded ${currentScreen === 'home' ? 'text-primary bg-primary/5 font-bold' : 'text-on-surface hover:text-primary'}`}
              >
                Inicio <ChevronDown size={14} className="opacity-70 group-hover:rotate-180 transition-transform duration-300" />
              </a>
              <div className="absolute top-full left-0 -mt-4 w-48 bg-surface rounded-md shadow-xl border border-outline-variant/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex flex-col py-2">
                {[
                  { id: 'zero-filtraciones', label: 'Zero Filtraciones' },
                  { id: 'metodologia', label: 'Metodología' },
                  { id: 'servicios', label: 'Servicios' },
                  { id: 'marcas', label: 'Marcas' },
                  { id: 'nosotros', label: 'Nosotros' },
                  { id: 'faqs', label: 'FAQs' },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(item.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.location.hash = item.id;
                        onNavigate('home', 'none');
                      }
                    }}
                    className="px-4 py-2.5 text-sm font-sans font-semibold text-on-surface hover:bg-surface-container-high hover:text-primary transition-colors text-left"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <a
              className={`font-sans font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1 py-1.5 px-2.5 rounded ${currentScreen === 'detection' ? 'text-primary bg-primary/5 font-bold' : 'text-on-surface hover:text-primary'}`}
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('detection', 'none'); }}
            >
              Detección Eléctrica
            </a>

            <a
              className={`font-sans font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1 py-1.5 px-2.5 rounded ${currentScreen === 'cases' ? 'text-primary bg-primary/5 font-bold' : 'text-on-surface hover:text-primary'}`}
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('cases', 'none'); }}
            >
              Casos Reales
            </a>

            <a
              className={`font-sans font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1 py-1.5 px-2.5 rounded ${currentScreen === 'contact' ? 'text-primary bg-primary/5 font-bold' : 'text-on-surface hover:text-primary'}`}
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('contact', 'none'); }}
            >
              Contacto
            </a>

            <a
              className="ml-4 px-6 py-2.5 bg-secondary text-white font-sans font-bold text-sm rounded hover:bg-secondary-container transition-all duration-300 uppercase tracking-wider leading-none shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('login', 'push'); }}
            >
              <User size={16} /> Acceso
            </a>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-primary p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 bg-white z-40 border-b border-slate-200 shadow-xl md:hidden p-6 text-left space-y-6"
          >
            <div className="flex flex-col gap-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Navegación Móvil</div>
              <div className="flex flex-col">
                <a
                  href="#"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (currentScreen === 'home') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      onNavigate('home', 'none'); 
                    }
                    setIsMobileMenuOpen(false); 
                  }}
                  className={`font-sans font-bold text-lg py-2 inline-block transition-all duration-300 hover:scale-105 active:scale-95 origin-left ${currentScreen === 'home' ? 'text-primary' : 'text-slate-800'}`}
                >
                  Inicio
                </a>
                {currentScreen === 'home' && (
                  <div className="pl-4 flex flex-col gap-2 mb-2 border-l-2 border-surface-variant/50 ml-2 mt-2">
                    {[
                      { id: 'zero-filtraciones', label: 'Zero Filtraciones' },
                      { id: 'metodologia', label: 'Metodología' },
                      { id: 'servicios', label: 'Servicios' },
                      { id: 'marcas', label: 'Marcas' },
                      { id: 'nosotros', label: 'Nosotros' },
                      { id: 'faqs', label: 'FAQs' },
                    ].map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsMobileMenuOpen(false);
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            window.location.hash = item.id;
                            onNavigate('home', 'none');
                          }
                        }}
                        className="text-sm font-sans font-medium text-on-surface-variant hover:text-primary py-1"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('detection', 'none'); }}
                className={`py-2 font-display font-semibold text-base flex items-center justify-between ${currentScreen === 'detection' ? 'text-primary font-bold' : 'text-slate-600'}`}
              >
                Detección Eléctrica <ArrowUpRight size={16} />
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('cases', 'none'); }}
                className={`py-2 font-display font-semibold text-base flex items-center justify-between ${currentScreen === 'cases' ? 'text-primary font-bold' : 'text-slate-600'}`}
              >
                Casos Reales <ArrowUpRight size={16} />
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('contact', 'none'); }}
                className={`py-2 font-display font-semibold text-base flex items-center justify-between ${currentScreen === 'contact' ? 'text-primary font-bold' : 'text-slate-600'}`}
              >
                Contacto <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('login', 'push'); }}
                className="flex items-center justify-center gap-2 w-full py-3 bg-secondary text-white font-sans font-bold text-xs rounded uppercase tracking-widest shadow-md"
              >
                <User size={16} /> Acceso
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
