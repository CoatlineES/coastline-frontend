import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  Settings, 
  Droplet, 
  Scale, 
  Target, 
  CheckCircle, 
  Zap,
  Eye,
  SlidersHorizontal,
  Radar,
  FileText,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  X
} from 'lucide-react';
import { ScreenId } from '../types';
import CssDetectorCart from '../components/animations/CssDetectorCart';
import CssDetectionFloor from '../components/animations/CssDetectionFloor';

interface DetectionViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function DetectionView({ onNavigate }: DetectionViewProps) {
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    // Limitar la animación a cuando el ratón esté relativamente cerca (ej. 120px)
    if (distance < 120) {
      mouseX.set(distX);
      mouseY.set(distY);
    } else {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const springConfig = { damping: 25, stiffness: 150 };
  const evadeX = useSpring(useTransform(mouseX, [-300, 300], [80, -80]), springConfig);
  const evadeY = useSpring(useTransform(mouseY, [-300, 300], [80, -80]), springConfig);
  const evadeRotateZ = useSpring(useTransform(mouseX, [-300, 300], [-10, 10]), springConfig);
  const evadeRotateX = useSpring(useTransform(mouseY, [-300, 300], [-10, 10]), springConfig);

  const cards = [
    // PAR 1: CUBIERTA CON GRAVA
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpJ4wDqvwX3eBAtMFUAc-5c6rIfSTPLHA5N_0PIKC1JwtF-Y_Uwiv_kw2bpKwcNO3lPSq5A2otIX9yi2PQCBgSU7o8Q9_rGYAon10HMRphVa4tdLpXDuNJal92BWP-znyeE7dQ97Nw2Ng-4XYPJs3gM_0zPM8NONMWREgryZOOXVrXYIZ2H_T_nujsge52ijOMlBjvEq0m61Vq5A2kBl0reXc9cFeCS44uG-8zWYmPgT6BjyNfmfGTLyFRNdIEkvCICm3c0bmA_Z2a',
      title: 'Área inspeccionada',
      subtitle: 'Delimitación en verde',
      desc: 'Sistema: cubierta protegida con grava, doble capa de XPS y membrana de PVC.',
      status: 'verified',
      extendedDesc: 'Inspección certificada con delimitación en verde. El escáner dieléctrico verificó el 100% de la superficie sin detectar anomalías. La membrana de PVC subyacente se encuentra en perfecto estado de estanqueidad bajo la doble capa de XPS y la protección de grava pesada.'
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg98vAOTFz0TBPaa945PYFp-2YEr7SYgypJz_aznLKyfRi5B0Ra5Ee00O4zz9b1XsmjEZMzACSUrYvzNNMetkwSb7j3J3nqFdZ_rUWdBpxpku5V1m8I004Tx7cdppgb_uAlGPvsRetPrY03sS6l8mCd3n7lV4PAc5kOsodRZ8pmDE13VjD4Lfb_j5e67jtQ580z9BEGzkOpq4mjs_UDyr88KFmbEWJngqT8K-9GRcKFR13Zv_jcyRYA6-ayBa6Zz7Ik8GSno3si5vO',
      title: 'Fugas detectadas',
      subtitle: 'Clasificación COAT-DDP. Discontinuidades en membrana.',
      desc: 'Sistema: cubierta protegida con grava, doble capa de XPS y membrana de PVC.',
      status: 'error',
      extendedDesc: 'Se localizaron discontinuidades milimétricas bajo Clasificación COAT-DDP. El rastreo de inducción permitió marcar exactamente el punto de falla en la membrana de PVC, evitando la retirada masiva de la cubierta de grava para su reparación.'
    },
    
    // PAR 2: BALDOSA SOBRE MORTERO
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuRumt8LX_MmOPq9XESv8VyTWuGQUjYt5bMPT3gng98CzrScvmqOU0AD92_HE3GdeSalBtb5RWLzRcuxg1fPwcPyrCn9PFMMY2jOItJUFa92Lczlmu8lj_kap3KY7-LuSqnGgFpaKo3jywrDxm6nuuMAz6n6KROd0jmQDnTYWpMpckS4k0A_Oqv9T4ZdNDKc6x4csdqVhFZTxSmEFmcThzmnb5fTfz1l_P0XLsZDzdf_7j--9Zni7_9vAt79WQrdWSLTm9CUwI2B7-',
      title: 'Área inspeccionada',
      subtitle: 'Delimitación en verde',
      desc: 'Sistema: protección de pavimento de baldosa sobre recrecido de mortero, geotextil y membrana de tela asfáltica.',
      status: 'verified',
      extendedDesc: 'La delimitación en verde confirma el estado óptimo de toda la superficie analizada. La membrana de tela asfáltica se mantiene completamente estanca por debajo de las capas de geotextil, el mortero de agarre y el pavimento de baldosa exterior.'
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzRdlf6f-RaYu5cPJlj9fleKVCmIjL--UF13Jk4G-aRixadhw4Hh1JTUWqMY4iDgaoVWNYzjHO9qki5qiLpSzM_-CqMYUuGJPAHlM_Fh9Yzr25BuY794q-Pv0qS7TooOAUC4wJjXPtWrRe4Nn0aBzHoDcEzeWvKbgnrRJFmrL_SL9HuLHNTM9383XftQqzcFGM6BlrLo9A_JF1IhbGaj4LTfuYuI3AEk2WJVRMBUS0wbb6DB0QAn660k-MN1r57SmWUOjy0s-pa3Jk',
      title: 'Fugas detectadas',
      subtitle: 'Clasificación COAT-DDP. Discontinuidades en membrana.',
      desc: 'Sistema: protección de pavimento de baldosa sobre recrecido de mortero, geotextil y membrana de tela asfáltica.',
      status: 'error',
      extendedDesc: 'Bajo clasificación COAT-DDP, se detectaron discontinuidades y pérdida de estanqueidad en la tela asfáltica debajo del recrecido de mortero. El diagnóstico preciso permitió una intervención quirúrgica directa sobre la baldosa afectada, ahorrando grandes demoliciones.'
    },

    // PAR 3: BALDOSA SOBRE GEOTEXTIL
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoRTjZfxsy9MADBtVn0tfLMTmsZt6NQKwIsQt7qSIlB4DyDZe2g1h4ya5IHxM9paCNMJ0sHTaIe-Sblzr8xA5t93K_dRQ75VJ8GjpJnga44mAvQBWoc4QD7_QLh6lCYhamovQEoIpGxDSZ9AMyoCsejnWlR6dCsmGV04mT4oJVCqbEQ6Fj36Gpm1UdZenTq-vJ-jZHLa8oj3MJpv9sRRsI7sL0hDjZnkaNIAivXaSdyrfUndr5rw9eJ7i60Z-IQ44RSkqCsPDBj-yB',
      title: 'Área inspeccionada',
      subtitle: 'Delimitación en verde',
      desc: 'Sistema: protección de pavimento de baldosa sobre geotextil y membrana de tela asfáltica.',
      status: 'verified',
      extendedDesc: 'Barrido electrónico completado con delimitación en verde exitosa. El sistema de impermeabilización asfáltico, situado inmediatamente debajo del geotextil y el pavimento directo, se encuentra sin fallos de continuidad en toda su extensión.'
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6gsPaTM3XJBKauIBgTGAhW93OxtkWnHZ0eNlAIHgErL5LCmblIcxenxTT5eahr_OTGYRTIqpPZ1EEYVPKjhm1MVVHVqW5E0dumdb01SMMLWGykaP9QFYIzeS2skr6597HKvYfWubG4AKGsRtJxxlRNJWdEXMlxFErB-yk6zq0DHQgvtzrlrAFZu66p2nyqLzjGMti3v4gqcR2PxVaV0mlQm0I5LUdx8ZFoWFTF2RLjPo-6HJoXoPJ89arnbXYGVXg4cP1jS7DapoI',
      title: 'Fugas detectadas',
      subtitle: 'Clasificación COAT-DDP. Discontinuidades en membrana.',
      desc: 'Sistema: protección de pavimento de baldosa sobre geotextil y membrana de tela asfáltica.',
      status: 'error',
      extendedDesc: 'El informe COAT-DDP reveló discontinuidades críticas en los solapes de la tela asfáltica oculta bajo el geotextil. Gracias a la detección dieléctrica, la fuga fue mapeada en la superficie de la baldosa, posibilitando reparaciones localizadas y de bajo coste.'
    },

    // PAR 4: CAPA VEGETAL
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFj649NQ6BiOF_qAeUp3lvmwYR5QLkfk4nfunFI2DVLsLnFPVehgBdCOoRVdojizQtggDtfvLHCziMgPN72iVC0GH7qfpOmxHV9Sjb7x7uAWDhARPT7RYceiZU8qBUvSSMfz3mnh8D5z12P4lJB6T1mJLOVqheOyLOWsYgELhjWaRyycyep4Yq0J_gVtcrpL_b_tBy-2mL5OeQoxYR6jlCpac-3yzVe7JNCeAOxjYTIkvoWwKcMN8Fl20JrFIg9ZjskztPSBERIkPQ',
      title: 'Área inspeccionada',
      subtitle: 'Delimitación en verde',
      desc: 'Sistema: protección de pavimento de capa vegetal en ajardinamiento, geotextil y membrana de PVC.',
      status: 'verified',
      extendedDesc: 'Certificación de área verde. El flujo electromagnético penetró el espesor de la capa vegetal del ajardinamiento confirmando la ausencia total de capilaridades, perforaciones por raíces o rupturas en la membrana de PVC que sella la estructura.'
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMCZxZNgJDfBCEO9lqsiwwiFQb9Ntzd0taJfnXxZZ1nfos-bIM5fMhZrhrfNb_HflvGsl0n-i3OqKU1FIeCnQrDCR5NUZKTpOFU1gQytRswbO1G-hlrEDhwGnGXESwxOVc7MFRyEQ8LHr9CuJS1RPWm6rsSpXn_hU-t3Htb05C45aqYkGrFF6uPQMql41cvDGhwc3zLPrpYLs5TOT50PdpHXWuHp5Arq5dzcqNDlnwoHEp8t8fA3AadQCFcTVLfMIm_QwoSef2-QeJ',
      title: 'Fugas detectadas',
      subtitle: 'Clasificación COAT-DDP. Discontinuidades en membrana.',
      desc: 'Sistema: protección de pavimento de capa vegetal en ajardinamiento, geotextil y membrana de PVC.',
      status: 'error',
      extendedDesc: 'Identificación positiva (COAT-DDP) de discontinuidades en la membrana de PVC, ocasionadas posiblemente por estrés radicular o tensiones del sustrato. La fuga fue triangulada con éxito sin necesidad de levantar o destruir la totalidad del paisajismo ajardinado.'
    }
  ];

  return (
    <div className="w-full text-on-surface">
      {/* Hero Section */}
      <header className="relative w-full min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          <CssDetectionFloor />
          {/* Subtle white vignette to ensure text readability on the light roof */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent z-10 pointer-events-none" />
        </div>
        
        <div className="relative z-30 max-w-7xl mx-auto px-6 md:px-16 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Typography */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-center space-y-4">
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center self-start gap-2 px-3 py-1.5 mb-2 rounded-full bg-white/50 border border-slate-300 backdrop-blur-sm shadow-sm"
            >
              <Settings size={14} className="text-secondary" />
              <span className="font-sans font-bold text-slate-800 uppercase tracking-widest text-[10px]">
                Tecnología de Vanguardia
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-slate-900 leading-[1.15] tracking-tight"
            >
              Detección Electrónica de Filtraciones
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="text-sm md:text-base lg:text-lg text-slate-700 font-sans max-w-xl leading-relaxed font-medium"
            >
              Diagnóstico de alta precisión sin consumo de agua ni alteraciones estructurales. Tecnología no invasiva que identifica microfisuras con exactitud milimétrica.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4"
            >
              <a 
                href="#tecnologia" 
                onClick={(e) => { e.preventDefault(); document.getElementById('tecnologia')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-5 py-2.5 md:px-6 md:py-3 bg-transparent border-2 border-[#001c3a] text-[#001c3a] font-sans font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#001c3a]/5 transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Conocer la Tecnología
              </a>
              <a 
                href="#contacto" 
                onClick={(e) => { e.preventDefault(); document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-5 py-2.5 md:px-6 md:py-3 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#9a0c2d] transition-all shadow-lg shadow-secondary/30 active:scale-95 flex items-center gap-2 group w-full sm:w-auto justify-center"
              >
                Solicitar Diagnóstico <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>

          {/* Right Column: Animated Detector Cart */}
          <div 
            className="md:col-span-6 lg:col-span-7 relative h-full flex items-center justify-center pt-10 md:pt-0 pointer-events-auto"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Background Glow */}
            <div className="absolute w-[80%] h-[50%] bg-blue-500/20 rounded-full blur-[80px] z-0 pointer-events-none"></div>

            <motion.div
              initial={{ opacity: 0, x: '50vw', rotate: -10 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 2, type: "spring", stiffness: 30, damping: 15, delay: 0.4 }}
              className="relative z-10 w-full pointer-events-none"
            >
              {/* Slight continuous forward/backward hovering motion */}
              <motion.div
                animate={{ x: [-20, 20, -20], y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                className="w-full flex justify-center items-center pointer-events-auto"
              >
                <motion.div
                  style={{
                    x: evadeX,
                    y: evadeY,
                    rotateZ: evadeRotateZ,
                    rotateX: evadeRotateX
                  }}
                  whileHover={{ scale: 1.1, cursor: 'grab' }}
                  whileTap={{ scale: 0.95, cursor: 'grabbing' }}
                  className="w-full flex justify-center"
                >
                  <CssDetectorCart />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </header>

      <main>
        {/* The Core Concept: Bento Grid */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center lg:items-start"
          >
            
            {/* Intro Text */}
            <div className="md:col-span-5 flex flex-col justify-center pr-0 md:pr-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-6 tight-tracking">
                Prueba de Estanqueidad Sin Llenado
              </h2>
              <p className="font-sans text-base text-on-surface-variant mb-6 leading-relaxed">
                La estanqueidad electrónica representa el estándar más avanzado en inspección arquitectónica. Sustituye los métodos tradicionales de inundación por un mapeo de conductividad eléctrica que garantiza resultados inmediatos y precisos.
              </p>
              <div className="w-16 h-px bg-outline-variant mb-6" />
              <p className="font-sans text-sm text-outline leading-relaxed">
                Metodología avalada y conforme a las normativas UNE vigentes para ensayos no destructivos en edificación.
              </p>
            </div>
            
            {/* Benefits Bento */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 md:mt-0">
              
              <div className="bg-white border border-surface-variant p-8 rounded-xl flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <Droplet className="text-primary w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-primary mb-3 text-lg">Cero Consumo de Agua</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Elimina la necesidad de inundar cubiertas, ahorrando miles de litros de agua y recursos por proyecto.
                </p>
              </div>
              
              <div className="bg-white border border-surface-variant p-8 rounded-xl flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <Scale className="text-primary w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-primary mb-3 text-lg">Sin Sobrecarga Estructural</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Protege la integridad del edificio al evitar el peso masivo asociado a las pruebas de estanqueidad tradicionales.
                </p>
              </div>
              
              <div className="bg-white border border-surface-variant p-8 rounded-xl flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <Target className="text-primary w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-primary mb-3 text-lg">Alta Precisión</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Localiza porosidades y fisuras microscópicas invisibles al ojo humano con exactitud sub-milimétrica.
                </p>
              </div>
              
              <div className="bg-primary border border-primary p-8 rounded-xl flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group" style={{ backgroundColor: '#003b70' }}>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <CheckCircle className="text-white w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-white mb-3 text-lg">Normativa UNE</h3>
                <p className="font-sans text-sm text-blue-100 leading-relaxed">
                  Procedimientos estandarizados y certificados que cumplen con los más altos requisitos técnicos europeos.
                </p>
              </div>

            </div>
          </motion.div>
        </section>

        {/* Technology Breakdown */}
        <section className="py-24 bg-surface-container-low border-y border-surface-variant/40" id="tecnologia">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-6 md:px-16"
          >
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="font-sans font-bold text-xs text-primary uppercase tracking-widest mb-4 block">
                Sistemas de Diagnóstico
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-primary">
                Dualidad Tecnológica para Cobertura Total
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Low Voltage */}
              <div className="bg-white border border-surface-variant p-10 lg:p-12 rounded-xl flex flex-col relative overflow-hidden group hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <Zap strokeWidth={1} className="w-48 h-48 text-primary" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-display font-bold text-2xl text-primary mb-4 flex items-center gap-3">
                    Baja Tensión 
                    <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant font-sans font-bold text-[10px] rounded uppercase">Húmedo</span>
                  </h3>
                  <p className="font-sans text-sm text-on-surface-variant mb-8 leading-relaxed">
                    Ideal para superficies de impermeabilización expuestas o bajo cargas ligeras. Utiliza un circuito de baja tensión y un mapeo de vectores de flujo sobre una superficie pre-humedecida. La corriente fluye hacia las penetraciones conectadas a tierra, dirigiendo al técnico exactamente al punto de fallo.
                  </p>
                  <ul className="space-y-4 font-sans text-sm text-on-surface-variant">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      Superficies expuestas y techos verdes extensivos.
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      Mapeo perimetral y de campos amplios.
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      Resolución de lectura direccional.
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* High Voltage */}
              <div className="bg-white border border-surface-variant p-10 lg:p-12 rounded-xl flex flex-col relative overflow-hidden group hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <Zap strokeWidth={1.5} className="w-48 h-48 text-primary" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-display font-bold text-2xl text-primary mb-4 flex items-center gap-3">
                    Alta Tensión
                    <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant font-sans font-bold text-[10px] rounded uppercase">Seco</span>
                  </h3>
                  <p className="font-sans text-sm text-on-surface-variant mb-8 leading-relaxed">
                    Diseñado para membranas secas expuestas. Un electrodo en forma de escoba o rodillo con carga de alta tensión se pasa sobre la superficie. Cualquier discontinuidad permite que la corriente forme un arco eléctrico hacia el sustrato conductor, activando una señal visual y auditiva inmediata.
                  </p>
                  <ul className="space-y-4 font-sans text-sm text-on-surface-variant">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      Membranas bituminosas, PVC, TPO y recubrimientos líquidos.
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      Inspección extremadamente rápida (hasta 2000 m²/día).
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      Detección de defectos capilares microscópicos.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Process Section */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-16 text-center">
            Metodología de Inspección
          </h2>
          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-surface-variant border-t border-dashed border-slate-300" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative z-10">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300 cursor-default">
                <div className="w-24 h-24 rounded-full bg-white border border-surface-variant flex items-center justify-center mb-6 shadow-sm relative group-hover:shadow-md transition-shadow">
                  <span className="font-display font-extrabold text-2xl text-primary">01</span>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                    <Eye size={16} />
                  </div>
                </div>
                <h4 className="font-sans font-bold text-primary mb-3">Auditoría Visual</h4>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Inspección preliminar del sustrato y condiciones de la membrana para determinar la viabilidad técnica.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300 cursor-default">
                <div className="w-24 h-24 rounded-full bg-white border border-surface-variant flex items-center justify-center mb-6 shadow-sm relative group-hover:shadow-md transition-shadow">
                  <span className="font-display font-extrabold text-2xl text-primary">02</span>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                    <SlidersHorizontal size={16} />
                  </div>
                </div>
                <h4 className="font-sans font-bold text-primary mb-3">Calibración</h4>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Ajuste de sensibilidad del equipo según el grosor del material aislante y conductividad del sustrato.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300 cursor-default">
                <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center mb-6 shadow-md relative ring-4 ring-primary/10 group-hover:shadow-xl transition-shadow">
                  <span className="font-display font-extrabold text-2xl">03</span>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-md">
                    <Radar size={16} />
                  </div>
                </div>
                <h4 className="font-sans font-bold text-primary mb-3">Barrido Electrónico</h4>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Ejecución sistemática del escaneo, marcando físicamente cada anomalía detectada en tiempo real.
                </p>
              </div>
              
              {/* Step 4 */}
              <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300 cursor-default">
                <div className="w-24 h-24 rounded-full bg-white border border-surface-variant flex items-center justify-center mb-6 shadow-sm relative group-hover:shadow-md transition-shadow">
                  <span className="font-display font-extrabold text-2xl text-primary">04</span>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                    <FileText size={16} />
                  </div>
                </div>
                <h4 className="font-sans font-bold text-primary mb-3">Informe Técnico</h4>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Entrega de documentación planimétrica detallando patologías, coordenadas y recomendaciones de reparación.
                </p>
              </div>

            </div>
          </div>
          </motion.div>
        </section>

        {/* Asymmetric Detail Section */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-t border-surface-variant/40">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
          >
            <div className="md:col-span-6 relative h-[500px] rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
              <img 
                alt="Instrumental" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO9lRgqsXOHLFU5onbx5GvMUiDlOH-lG7BIG3Ou1BTws-0kdxrp97RmqJE84igddm-LyxRCIzvBj22aiaV5gPA-69ENsYUdOvKvkCJ6Vcis2vz-137oWFnTzzjk-5z-pvE46_LGZmqQoRF1x9QSapbY1rvlPi7oeiq8iHd0mzpxr816jxoUxrsANqiuBuVdPIDDPiE104MbtGIc_xKLnAtLfmfwn5IUldNtetvnG_lhQmdt-6hSD0kNbEzbHlCieAf46HbU-LqRihJ" 
              />
            </div>
            <div className="md:col-span-5 md:col-start-8 flex flex-col pt-8 md:pt-0">
              <h2 className="font-display font-bold text-3xl md:text-3xl text-primary mb-6">
                Equipamiento de Grado Instrumental
              </h2>
              <p className="font-sans text-base text-on-surface-variant mb-8 leading-relaxed">
                No comprometemos la precisión. Coatline emplea exclusivamente equipos de calibración instrumental de última generación, capaces de adaptarse a variaciones resistivas ambientales y materiales complejos.
              </p>
              <ul className="space-y-6">
                <li className="flex flex-col">
                  <span className="font-sans font-bold text-primary mb-1">Calibración Dinámica</span>
                  <span className="font-sans text-sm text-on-surface-variant leading-relaxed">Ajuste continuo a las condiciones de humedad y temperatura del entorno.</span>
                </li>
                <li className="w-full h-px bg-surface-variant" />
                <li className="flex flex-col">
                  <span className="font-sans font-bold text-primary mb-1">Técnicos Certificados</span>
                  <span className="font-sans text-sm text-on-surface-variant leading-relaxed">Operadores formados específicamente en termodinámica y comportamiento eléctrico de polímeros.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </section>

        {/* Intervenciones Reales en Obra */}
        <section id="casos-reales" className="py-24 px-6 md:px-16 bg-primary text-white relative overflow-hidden" style={{ backgroundColor: '#002B54' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <img 
              alt="Drone inspection" 
              className="w-full h-full object-cover grayscale" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLtEDcDFvNu8D5U3A-uzTqD63IRxtZ6TufJbN9phijt3N5tYaremtj1MTpci_K76Il3T4DTRdF04Wp2lcipvRwrMJNkFLEC3WjoMAYtHhW1E1VrkvV1esrbKXe91f8MViBAwfuhlWSY5zxY0Rfzzjy1JuOmu1GhHFhdpdFQv3_p1Jz9JAHWTbbnE8FPW3PjJ1eiBRsxrf1azJjq65F58MyprJJ4GvCfsuHA6bSuVk-YKer_stj0LI8SR-JVS" 
            />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-pure-white mb-6">
                Intervenciones Reales en Obra
              </h2>
              <p className="font-sans text-base text-blue-100 leading-relaxed">
                Resultados tangibles en el terreno. Nuestra tecnología garantiza una fiabilidad absoluta, permitiendo inspeccionar hasta 2000 m²/día con precisión milimétrica y sin ningún consumo de agua.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedCard(card)}
                  className="bg-white rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      alt="Área inspeccionada" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      src={card.img} 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-primary text-xs font-bold flex items-center gap-2">
                        Ver Detalles <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow text-left">
                    <h3 className={`font-display font-bold text-lg mb-1 ${card.status === 'verified' ? 'text-primary' : 'text-secondary'}`}>
                      {card.title}
                    </h3>
                    <p className={`font-sans text-[10px] uppercase tracking-wider font-bold mb-3 ${card.status === 'verified' ? 'text-green-600' : 'text-red-600'}`}>
                      {card.subtitle}
                    </p>
                    <p className="font-sans text-xs md:text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
                      {card.desc}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      {card.status === 'verified' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded text-green-700">
                          <CheckCircle size={14} className="fill-green-100" />
                          <span className="font-sans font-bold text-[9px] uppercase tracking-wider mt-0.5">INSPECCIÓN VERIFICADA</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded text-secondary">
                          <AlertCircle size={14} className="fill-red-100" />
                          <span className="font-sans font-bold text-[9px] uppercase tracking-wider mt-0.5">FUGAS DETECTADAS</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </motion.div>

          {/* Detailed Modal Component */}
          <AnimatePresence>
            {selectedCard && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 text-slate-900">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setSelectedCard(null)}
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                >
                  <button 
                    onClick={() => setSelectedCard(null)}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                  >
                    <X size={20} />
                  </button>

                  <div className="w-full md:w-2/5 h-64 md:h-auto relative">
                    <img 
                      src={selectedCard.img} 
                      alt="Intervención detallada" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r" />
                    
                    <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                      {selectedCard.status === 'verified' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/90 backdrop-blur rounded text-white shadow-lg">
                          <CheckCircle size={16} />
                          <span className="font-sans font-bold text-[10px] uppercase tracking-wider">VERIFICADA</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/90 backdrop-blur rounded text-white shadow-lg">
                          <AlertCircle size={16} />
                          <span className="font-sans font-bold text-[10px] uppercase tracking-wider">DETECTADA</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col bg-slate-50 overflow-y-auto">
                    <div className="mb-2 flex flex-col">
                      <h3 className={`font-display font-bold text-2xl mb-1 ${selectedCard.status === 'verified' ? 'text-primary' : 'text-secondary'}`}>
                        {selectedCard.title}
                      </h3>
                      <p className={`font-sans text-xs uppercase tracking-wider font-bold ${selectedCard.status === 'verified' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedCard.subtitle}
                      </p>
                    </div>
                    
                    <div className="mt-4 mb-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm border-l-4" style={{ borderLeftColor: selectedCard.status === 'verified' ? '#22c55e' : '#ef4444' }}>
                      <p className="font-sans text-sm font-medium text-slate-700">
                        {selectedCard.desc}
                      </p>
                    </div>

                    <div className="prose prose-slate prose-sm max-w-none">
                      <p className="font-sans text-slate-600 leading-relaxed text-[15px]">
                        {selectedCard.extendedDesc}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                      <button 
                        onClick={() => setSelectedCard(null)}
                        className="px-6 py-2.5 bg-primary text-white font-sans font-bold text-xs uppercase tracking-wider rounded hover:bg-[#001c3a] transition-colors"
                      >
                        Cerrar Detalles
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-6 md:px-16" id="contacto" style={{ backgroundColor: '#13487e' }}>
          <div className="max-w-4xl mx-auto text-center">
            <ShieldCheck size={48} className="mx-auto text-blue-300 mb-6" strokeWidth={1} />
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-6">
              Proteja su activo con precisión milimétrica
            </h2>
            <p className="font-sans text-base text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              Evite reparaciones costosas y daños estructurales a largo plazo. Programe una inspección electrónica y obtenga certeza absoluta sobre el estado de su impermeabilización.
            </p>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 md:p-12 text-center shadow-2xl max-w-2xl mx-auto flex flex-col items-center">
              <h3 className="font-display font-bold text-2xl text-white mb-4">¿Listo para certificar su cubierta?</h3>
              <p className="font-sans text-blue-100 mb-8 max-w-md mx-auto leading-relaxed">
                Nuestros ingenieros evaluarán la viabilidad técnica de su proyecto y diseñarán el protocolo de rastreo dieléctrico adecuado para su instalación.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                <button 
                  onClick={() => onNavigate('contact', 'push')}
                  className="px-8 py-4 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#9a0c2d] transition-all shadow-lg shadow-secondary/30 active:scale-95 flex items-center justify-center gap-2 group"
                >
                  Ir al formulario de contacto <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => onNavigate('cases', 'push')}
                  className="px-8 py-4 bg-transparent border border-blue-300/50 text-blue-100 font-sans font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-white/5 transition-colors active:scale-95 flex items-center justify-center"
                >
                  Ir a casos reales
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
