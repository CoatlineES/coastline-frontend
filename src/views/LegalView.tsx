import React from 'react';
import { motion } from 'motion/react';
import { Scale, ArrowRight, Shield, FileText } from 'lucide-react';
import { ScreenId } from '../types';

interface LegalViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function LegalView({ onNavigate }: LegalViewProps) {
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
            <Scale size={32} className="text-secondary" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-3xl md:text-5xl text-white mb-6"
          >
            Aviso Legal
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 font-sans max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
          >
            Información general y condiciones de uso del sitio web de Coatline, 
            garantizando la transparencia y la seguridad jurídica para todos nuestros usuarios.
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
              <FileText size={20} className="text-secondary" /> 1. Datos Identificativos
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, 
              de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSICE), 
              se reflejan los siguientes datos:
            </p>
            <ul className="list-disc pl-5 text-slate-600 text-sm mb-8 space-y-2">
              <li><strong>Empresa:</strong> Coatline S.L.</li>
              <li><strong>NIF:</strong> B-XXXXXXX</li>
              <li><strong>Dirección:</strong> Calle de la Resina, 35. Nave 7, 28021 Madrid</li>
              <li><strong>Correo electrónico:</strong> comercial@coatline.es</li>
              <li><strong>Teléfono:</strong> +34 91 491 61 97</li>
            </ul>

            <h2 className="flex items-center gap-2 text-xl font-bold mb-4 border-b border-slate-100 pb-2">
              <Shield size={20} className="text-secondary" /> 2. Usuarios y Uso del Portal
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              El acceso y/o uso de este portal de Coatline atribuye la condición de USUARIO, 
              que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas. 
              El USUARIO asume la responsabilidad del uso del portal y se compromete a hacer un uso 
              adecuado de los contenidos y servicios que Coatline ofrece a través de su portal.
            </p>

            <h2 className="flex items-center gap-2 text-xl font-bold mb-4 border-b border-slate-100 pb-2">
              <Scale size={20} className="text-secondary" /> 3. Propiedad Intelectual e Industrial
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              Coatline por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual 
              e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, 
              imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, 
              estructura y diseño, etc.). Todos los derechos reservados.
            </p>

            <h2 className="flex items-center gap-2 text-xl font-bold mb-4 border-b border-slate-100 pb-2">
              <FileText size={20} className="text-secondary" /> 4. Exclusión de Garantías y Responsabilidad
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              Coatline no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza 
              que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, 
              falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos 
              en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.
            </p>
            
            <p className="text-xs text-slate-400 mt-12 pt-4 border-t border-slate-100">
              Última actualización: 15 de Junio de 2026
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
