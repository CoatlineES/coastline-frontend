import React from 'react';
import { motion } from 'motion/react';
import stickerZero from '../../assets/sticker_zero_nobg.png';

export default function HomeZeroFiltraciones() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section id="zero-filtraciones" className="py-24 px-6 md:px-16 bg-primary text-white relative" style={{ backgroundColor: '#001c3a' }}>
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      <div className="max-w-7xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16 max-w-4xl mx-auto space-y-6"
        >
          <motion.div 
            initial={{ scale: 2.5, opacity: 0, rotate: -15 }}
            whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex justify-center mb-8 relative z-10"
          >
            <motion.img 
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              src={stickerZero} 
              alt="Programa Zero Filtraciones Garantizada" 
              className="w-48 h-auto object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)]" 
            />
          </motion.div>
          <motion.h2 variants={itemVariants} className="font-display font-bold text-3xl md:text-4xl text-pure-white tracking-tight">
            Beneficios del programa
          </motion.h2>
          <motion.p variants={itemVariants} className="font-sans text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            ZERO FILTRACIONES es un programa de mantenimiento inteligente y proactivo que previene la aparición de filtraciones en superficies y cubiertas mediante tecnología avanzada.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={itemVariants} className="border border-pure-white/10 bg-white/5 rounded-xl p-8 hover:bg-white/10 transition-colors group">
            <div className="text-[36px] font-display font-extrabold text-secondary mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
              01.
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-4">Máxima protección</h3>
            <p className="font-sans text-sm text-slate-300 leading-relaxed">
              Olvídese de incidencias mediante un programa que le garantiza la eficacia y durabilidad de sus superficies y cubiertas.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="border border-pure-white/10 bg-white/5 rounded-xl p-8 hover:bg-white/10 transition-colors group">
            <div className="text-[36px] font-display font-extrabold text-secondary mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
              02.
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-4">Prolongue la vida útil</h3>
            <p className="font-sans text-sm text-slate-300 leading-relaxed">
              Revisiones preventivas periódicas que aumentarán la integridad estructural de su propiedad y mejorarán su eficiencia térmica.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="border border-pure-white/10 bg-white/5 rounded-xl p-8 hover:bg-white/10 transition-colors group">
            <div className="text-[36px] font-display font-extrabold text-secondary mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
              03.
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-4">Control de costes</h3>
            <p className="font-sans text-sm text-slate-300 leading-relaxed">
              Adhiriéndose al programa todos los costes de nuestras actuaciones quedarán cubiertos mediante el pago de una tarifa fija mensual.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
