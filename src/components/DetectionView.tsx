import React from 'react';
import { motion } from 'motion/react';
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
  ShieldCheck
} from 'lucide-react';
import { ScreenId } from '../types';

interface DetectionViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function DetectionView({ onNavigate }: DetectionViewProps) {
  const cards = [
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpJ4wDqvwX3eBAtMFUAc-5c6rIfSTPLHA5N_0PIKC1JwtF-Y_Uwiv_kw2bpKwcNO3lPSq5A2otIX9yi2PQCBgSU7o8Q9_rGYAon10HMRphVa4tdLpXDuNJal92BWP-znyeE7dQ97Nw2Ng-4XYPJs3gM_0zPM8NONMWREgryZOOXVrXYIZ2H_T_nujsge52ijOMlBjvEq0m61Vq5A2kBl0reXc9cFeCS44uG-8zWYmPgT6BjyNfmfGTLyFRNdIEkvCICm3c0bmA_Z2a',
      desc: 'Cubierta protegida con grava, doble capa de XPS y membrana de PVC.',
      status: 'verified'
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg98vAOTFz0TBPaa945PYFp-2YEr7SYgypJz_aznLKyfRi5B0Ra5Ee00O4zz9b1XsmjEZMzACSUrYvzNNMetkwSb7j3J3nqFdZ_rUWdBpxpku5V1m8I004Tx7cdppgb_uAlGPvsRetPrY03sS6l8mCd3n7lV4PAc5kOsodRZ8pmDE13VjD4Lfb_j5e67jtQ580z9BEGzkOpq4mjs_UDyr88KFmbEWJngqT8K-9GRcKFR13Zv_jcyRYA6-ayBa6Zz7Ik8GSno3si5vO',
      desc: 'Pavimento de baldosa sobre recrecido de mortero, geotextil y tela asfáltica.',
      status: 'error'
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuRumt8LX_MmOPq9XESv8VyTWuGQUjYt5bMPT3gng98CzrScvmqOU0AD92_HE3GdeSalBtb5RWLzRcuxg1fPwcPyrCn9PFMMY2jOItJUFa92Lczlmu8lj_kap3KY7-LuSqnGgFpaKo3jywrDxm6nuuMAz6n6KROd0jmQDnTYWpMpckS4k0A_Oqv9T4ZdNDKc6x4csdqVhFZTxSmEFmcThzmnb5fTfz1l_P0XLsZDzdf_7j--9Zni7_9vAt79WQrdWSLTm9CUwI2B7-',
      desc: 'Protección de pavimento de baldosa sobre geotextil y membrana asfáltica.',
      status: 'verified'
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzRdlf6f-RaYu5cPJlj9fleKVCmIjL--UF13Jk4G-aRixadhw4Hh1JTUWqMY4iDgaoVWNYzjHO9qki5qiLpSzM_-CqMYUuGJPAHlM_Fh9Yzr25BuY794q-Pv0qS7TooOAUC4wJjXPtWrRe4Nn0aBzHoDcEzeWvKbgnrRJFmrL_SL9HuLHNTM9383XftQqzcFGM6BlrLo9A_JF1IhbGaj4LTfuYuI3AEk2WJVRMBUS0wbb6DB0QAn660k-MN1r57SmWUOjy0s-pa3Jk',
      desc: 'Capa vegetal en ajardinamiento, geotextil y membrana de PVC.',
      status: 'error'
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoRTjZfxsy9MADBtVn0tfLMTmsZt6NQKwIsQt7qSIlB4DyDZe2g1h4ya5IHxM9paCNMJ0sHTaIe-Sblzr8xA5t93K_dRQ75VJ8GjpJnga44mAvQBWoc4QD7_QLh6lCYhamovQEoIpGxDSZ9AMyoCsejnWlR6dCsmGV04mT4oJVCqbEQ6Fj36Gpm1UdZenTq-vJ-jZHLa8oj3MJpv9sRRsI7sL0hDjZnkaNIAivXaSdyrfUndr5rw9eJ7i60Z-IQ44RSkqCsPDBj-yB',
      desc: 'Capa vegetal, baldosa de garbancillo, geotextil y tela asfáltica.',
      status: 'verified'
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6gsPaTM3XJBKauIBgTGAhW93OxtkWnHZ0eNlAIHgErL5LCmblIcxenxTT5eahr_OTGYRTIqpPZ1EEYVPKjhm1MVVHVqW5E0dumdb01SMMLWGykaP9QFYIzeS2skr6597HKvYfWubG4AKGsRtJxxlRNJWdEXMlxFErB-yk6zq0DHQgvtzrlrAFZu66p2nyqLzjGMti3v4gqcR2PxVaV0mlQm0I5LUdx8ZFoWFTF2RLjPo-6HJoXoPJ89arnbXYGVXg4cP1jS7DapoI',
      desc: 'Protección de pavimento de baldosa sobre geotextil y tela asfáltica.',
      status: 'error'
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFj649NQ6BiOF_qAeUp3lvmwYR5QLkfk4nfunFI2DVLsLnFPVehgBdCOoRVdojizQtggDtfvLHCziMgPN72iVC0GH7qfpOmxHV9Sjb7x7uAWDhARPT7RYceiZU8qBUvSSMfz3mnh8D5z12P4lJB6T1mJLOVqheOyLOWsYgELhjWaRyycyep4Yq0J_gVtcrpL_b_tBy-2mL5OeQoxYR6jlCpac-3yzVe7JNCeAOxjYTIkvoWwKcMN8Fl20JrFIg9ZjskztPSBERIkPQ',
      desc: 'Capa vegetal en ajardinamiento, geotextil y membrana de PVC.',
      status: 'verified'
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMCZxZNgJDfBCEO9lqsiwwiFQb9Ntzd0taJfnXxZZ1nfos-bIM5fMhZrhrfNb_HflvGsl0n-i3OqKU1FIeCnQrDCR5NUZKTpOFU1gQytRswbO1G-hlrEDhwGnGXESwxOVc7MFRyEQ8LHr9CuJS1RPWm6rsSpXn_hU-t3Htb05C45aqYkGrFF6uPQMql41cvDGhwc3zLPrpYLs5TOT50PdpHXWuHp5Arq5dzcqNDlnwoHEp8t8fA3AadQCFcTVLfMIm_QwoSef2-QeJ',
      desc: 'Capa vegetal, baldosa de garbancillo, geotextil y tela asfáltica.',
      status: 'error'
    }
  ];

  return (
    <div className="w-full text-on-surface">
      {/* Hero Section */}
      <header className="relative w-full min-h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20" />
          <img 
            alt="Detección Electrónica" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLt3DoPFazBuACM2vRZvvb32d_w7PEn_HwP6XwYMcnVjFvcKh7CMB5RYZ0iYzyNk6I8rAjJXqwapf8OtMN0ZeSVoOkx4dkIR5AC_8IngDt0Bk4xc17NcZ7OkAGBoWaAG5A9Gds1tW5X9cyhtfol_1wrjKJY76GpI9gU6kSutgl846N6x_Z0AxNNoEbgGjityLjzmpmVnl-qo5Te3cdKosW2FTSR2k6Ue2uX4AaSvwcLdeZTwOzz6xuedQHeg" 
          />
        </div>
        
        <div className="relative z-30 max-w-7xl mx-auto px-6 md:px-16 w-full">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-sm bg-surface-variant/20 border border-surface-variant/30 backdrop-blur-md"
            >
              <Settings size={14} className="text-secondary" />
              <span className="font-sans font-bold text-white uppercase tracking-widest text-[10px]">
                Tecnología de Vanguardia
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-bold text-4xl md:text-5xl lg:text-5xl text-pure-white mb-6 leading-tight"
            >
              Detección Electrónica de Filtraciones
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-sans text-base md:text-lg text-slate-200 mb-10 max-w-2xl leading-relaxed"
            >
              Diagnóstico de alta precisión sin consumo de agua ni alteraciones estructurales. Tecnología no invasiva que identifica microfisuras y fallos en sistemas de impermeabilización con exactitud milimétrica.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a 
                href="#contacto" 
                onClick={(e) => { e.preventDefault(); document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest rounded hover:bg-secondary-container transition-colors duration-300 shadow-lg"
              >
                Solicitar Diagnóstico
              </a>
              <a 
                href="#tecnologia" 
                onClick={(e) => { e.preventDefault(); document.getElementById('tecnologia')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-transparent border border-white text-white font-sans font-bold text-xs uppercase tracking-widest rounded hover:bg-white/10 transition-colors duration-300"
              >
                Conocer la Tecnología
              </a>
            </motion.div>
          </div>
        </div>
      </header>

      <main>
        {/* The Core Concept: Bento Grid */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center lg:items-start">
            
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
          </div>
        </section>

        {/* Technology Breakdown */}
        <section className="py-24 bg-surface-container-low border-y border-surface-variant/40" id="tecnologia">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
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
              <div className="bg-white border border-surface-variant p-10 lg:p-12 rounded-xl flex flex-col relative overflow-hidden group hover:shadow-lg transition-shadow">
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
              <div className="bg-white border border-surface-variant p-10 lg:p-12 rounded-xl flex flex-col relative overflow-hidden group hover:shadow-lg transition-shadow">
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
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-16 text-center">
            Metodología de Inspección
          </h2>
          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-surface-variant border-t border-dashed border-slate-300" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative z-10">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border border-surface-variant flex items-center justify-center mb-6 shadow-sm relative">
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
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border border-surface-variant flex items-center justify-center mb-6 shadow-sm relative">
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
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center mb-6 shadow-md relative ring-4 ring-primary/10">
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
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border border-surface-variant flex items-center justify-center mb-6 shadow-sm relative">
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
        </section>

        {/* Asymmetric Detail Section */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-t border-surface-variant/40">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6 relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <img 
                alt="Instrumental" 
                className="w-full h-full object-cover" 
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
          </div>
        </section>

        {/* Intervenciones Reales en Obra */}
        <section className="py-24 px-6 md:px-16 bg-primary text-white relative overflow-hidden" style={{ backgroundColor: '#002B54' }}>
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
                <div key={idx} className="bg-white rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      alt="Área inspeccionada" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                      src={card.img} 
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow text-left">
                    <h3 className="font-display font-bold text-lg text-primary mb-2">Área inspeccionada</h3>
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
            
            <div className="bg-white rounded-xl p-8 md:p-12 text-left shadow-2xl max-w-2xl mx-auto">
              <form className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="font-sans font-bold text-xs text-primary uppercase tracking-wide mb-2">Nombre</label>
                    <input 
                      className="w-full bg-surface-container border border-surface-variant rounded px-4 py-3 text-on-surface font-sans text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none placeholder:text-slate-400" 
                      placeholder="Su nombre" 
                      type="text" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-sans font-bold text-xs text-primary uppercase tracking-wide mb-2">Empresa</label>
                    <input 
                      className="w-full bg-surface-container border border-surface-variant rounded px-4 py-3 text-on-surface font-sans text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none placeholder:text-slate-400" 
                      placeholder="Su empresa" 
                      type="text" 
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="font-sans font-bold text-xs text-primary uppercase tracking-wide mb-2">Email Profesional</label>
                  <input 
                    className="w-full bg-surface-container border border-surface-variant rounded px-4 py-3 text-on-surface font-sans text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none placeholder:text-slate-400" 
                    placeholder="correo@empresa.com" 
                    type="email" 
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-sans font-bold text-xs text-primary uppercase tracking-wide mb-2">Detalles del Proyecto</label>
                  <textarea 
                    className="w-full bg-surface-container border border-surface-variant rounded px-4 py-3 text-on-surface font-sans text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none resize-none placeholder:text-slate-400" 
                    placeholder="Área aproximada, tipo de cubierta, síntomas..." 
                    rows={4}
                  />
                </div>
                <button 
                  className="w-full bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest py-4 rounded mt-4 hover:bg-secondary-container transition-colors shadow-lg active:scale-[0.98]" 
                  type="button"
                >
                  Solicitar Cotización de Inspección
                </button>
              </form>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
