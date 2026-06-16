import React from 'react';
import { motion } from 'motion/react';
import { Cookie, Info, Settings, ShieldAlert } from 'lucide-react';
import { ScreenId } from '../types';

interface CookiesViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function CookiesView({ onNavigate }: CookiesViewProps) {
  return (
    <div className="w-full text-on-surface bg-background min-h-screen pt-20">
      
      {/* Hero Header */}
      <header className="relative w-full py-16 md:py-24 bg-[#001c3a] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 mb-6"
          >
            <Cookie size={32} className="text-secondary" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-3xl md:text-5xl text-white mb-6"
          >
            Política de Cookies
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 font-sans max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
          >
            Nuestra web utiliza cookies para mejorar la experiencia de usuario y ofrecer 
            contenidos adaptados. Conozca qué son, cuáles utilizamos y cómo gestionarlas.
          </motion.p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100"
        >
          <div className="prose prose-slate prose-headings:font-display prose-headings:text-primary max-w-none">
            
            <h2 className="flex items-center gap-2 text-xl font-bold mb-4 border-b border-slate-100 pb-2">
              <Info size={20} className="text-secondary" /> 1. ¿Qué son las cookies?
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas 
              páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar 
              y recuperar información sobre los hábitos de navegación de un usuario o de su equipo 
              y, dependiendo de la información que contengan, pueden utilizarse para reconocer al usuario.
            </p>

            <h2 className="flex items-center gap-2 text-xl font-bold mb-4 border-b border-slate-100 pb-2">
              <ShieldAlert size={20} className="text-secondary" /> 2. ¿Qué tipos de cookies utiliza esta página web?
            </h2>
            <ul className="list-disc pl-5 text-slate-600 text-sm mb-8 space-y-2">
              <li><strong>Cookies técnicas:</strong> Son aquellas que permiten al usuario la navegación a través 
              de la página web y la utilización de las diferentes opciones o servicios que en ella existen.</li>
              <li><strong>Cookies de análisis:</strong> Son aquellas que, tratadas por nosotros o por terceros, 
              nos permiten cuantificar el número de usuarios y realizar la medición y análisis estadístico 
              de la utilización que hacen del servicio ofertado.</li>
              <li><strong>Cookies de personalización:</strong> Permiten recordar información para que el usuario 
              acceda al servicio con determinadas características que pueden diferenciar su experiencia.</li>
            </ul>

            <h2 className="flex items-center gap-2 text-xl font-bold mb-4 border-b border-slate-100 pb-2">
              <Settings size={20} className="text-secondary" /> 3. Revocación y eliminación de cookies
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Usted puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante 
              la configuración de las opciones del navegador instalado en su ordenador:
            </p>
            <ul className="list-disc pl-5 text-slate-600 text-sm mb-8 space-y-2">
              <li>Para más información sobre el navegador Chrome pulsa aquí.</li>
              <li>Para más información sobre el navegador Firefox pulsa aquí.</li>
              <li>Para más información sobre el navegador Safari pulsa aquí.</li>
              <li>Para más información sobre el navegador Edge pulsa aquí.</li>
            </ul>
            
            <p className="text-xs text-slate-400 mt-12 pt-4 border-t border-slate-100">
              Última actualización: 15 de Junio de 2026
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
