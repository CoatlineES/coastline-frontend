import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, UserCheck, Lock, Eye } from 'lucide-react';
import { ScreenId } from '../types';

interface PrivacyViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function PrivacyView({ onNavigate }: PrivacyViewProps) {
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
            <ShieldCheck size={32} className="text-secondary" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-3xl md:text-5xl text-white mb-6"
          >
            Política de Privacidad
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 font-sans max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
          >
            En Coatline valoramos su privacidad. Descubra cómo recopilamos, utilizamos y 
            protegemos sus datos personales según la normativa vigente.
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
              <UserCheck size={20} className="text-secondary" /> 1. Responsable del Tratamiento
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Identidad: Coatline S.L.<br />
              Dirección Postal: Calle de la Resina, 35. Nave 7, 28021 Madrid<br />
              Teléfono: +34 91 491 61 97<br />
              Correo electrónico: privacidad@coatline.es
            </p>

            <h2 className="flex items-center gap-2 text-xl font-bold mb-4 border-b border-slate-100 pb-2">
              <Eye size={20} className="text-secondary" /> 2. Finalidad del Tratamiento de los Datos
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              En Coatline tratamos la información que nos facilitan las personas interesadas con el fin de:
            </p>
            <ul className="list-disc pl-5 text-slate-600 text-sm mb-8 space-y-2">
              <li>Atender, gestionar y resolver sus consultas o solicitudes de presupuesto.</li>
              <li>Gestionar la relación contractual y prestación de nuestros servicios de detección electrónica.</li>
              <li>Envío de comunicaciones comerciales (siempre y cuando haya consentido previamente).</li>
            </ul>

            <h2 className="flex items-center gap-2 text-xl font-bold mb-4 border-b border-slate-100 pb-2">
              <ShieldCheck size={20} className="text-secondary" /> 3. Legitimación
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              La base legal para el tratamiento de sus datos es el consentimiento prestado al 
              comunicarse con nosotros, así como la ejecución del contrato de prestación de servicios 
              en caso de ser cliente de Coatline.
            </p>

            <h2 className="flex items-center gap-2 text-xl font-bold mb-4 border-b border-slate-100 pb-2">
              <Lock size={20} className="text-secondary" /> 4. Conservación y Derechos
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Los datos personales proporcionados se conservarán mientras se mantenga la relación mercantil 
              y no se solicite su supresión por el interesado.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              Usted tiene derecho a obtener confirmación sobre si en Coatline estamos tratando 
              sus datos personales, por tanto tiene derecho a acceder a sus datos personales, 
              rectificar los datos inexactos o solicitar su supresión cuando los datos ya no sean 
              necesarios. Podrá ejercer estos derechos dirigiéndose a privacidad@coatline.es.
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
