/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  AlertTriangle, 
  Droplet, 
  Leaf, 
  ArrowRight, 
  ChevronDown, 
  MapPin, 
  Phone, 
  Mail, 
  Check, 
  ShieldCheck, 
  Calendar, 
  TrendingUp, 
  FileText 
} from 'lucide-react';
import { ScreenId } from '../types';

interface HomeViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  // Hero Form Submission State
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // FAQ expanded tracking
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Proceso dynamically tracked hover/click state (steps 1-5)
  const [activeStep, setActiveStep] = useState<number>(3); // Defaults to step 3 as highlighted in HTML

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.telefono) {
      setErrorMsg('Por favor, rellene todos los campos requeridos.');
      return;
    }
    setIsSubmitted(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Steps data
  const steps = [
    {
      num: 1,
      title: 'Limpieza profesional',
      desc: 'Retirada de residuos, vegetación y grava suelta para preparar la superficie.',
      icon: 'cleaning_services',
      img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop'
    },
    {
      num: 2,
      title: 'Detección inteligente',
      desc: 'Identificación de fallos mediante escáneres, termografía y drones.',
      icon: 'search',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnBMc9Y50l5eENtm62hqtyCoehLMnjluUpUlou4vzGiDqKdZCfdN1p_JtWozsCbWV-BhnlRYlHdqRf94CmFS9zfGJsJBpiya4XyH13tblVU6H_ok7qAuB4e3012r6PKpLxxbhw5Cp0OWIO95Jg3IsmrEb8ci_ZUSn_2yhTZaQllit79K_OT3n9aeWhpm8RqBmAdMMXXip_MAJkvd2ILDF7xJyag2quROP8rxybtqWwW71QgTn8X3p4MqaB9DAM11q4YHX9yA5RquWi'
    },
    {
      num: 3,
      title: 'Plan de actuación',
      desc: 'Actuación precisa sin prevenir áreas sanas, optimizando recursos y tiempos de ejecución.',
      icon: 'description',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSs4yJI-tD2QIHJdKR469AovAB7_0XcHzyjiEysQydaww48drJybwFlnXW837J7Q0DFgyQwGtADjkRMn7lpsW3z6zoTd6rWXe2JPSXRNdXie_Hv2hhYGjcXmZ8Kdvit62pxFa33i8KHTdmcZGLX9tRxb766ybqZCqkyiqwfcinm-_xUJzhHWEL4uUDsJ4mAeoku43lrqMpWRs5z3Auplg5bk5J7UyzuZRby3YwRpLoTfTxjzPY2Ko1x2QjFgSJw1AEmE2vrSdVWoiW'
    },
    {
      num: 4,
      title: 'Prueba de estanqueidad',
      desc: 'Verificación rigurosa sin agua bajo estricta normativa UNE vigente.',
      icon: 'water_drop',
      img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop'
    },
    {
      num: 5,
      title: 'Opciones de mejora',
      desc: 'Instalación de cubiertas verdes, blancas, solares o azules de alta eficiencia.',
      icon: 'eco',
      img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop'
    }
  ];

  // FAQs data
  const faqs = [
    {
      question: '¿Qué incluye el programa ZERO FILTRACIONES?',
      answer: (
        <div>
          <p>Es un servicio de mantenimiento preventivo y predictivo con:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm md:text-base">
            <li>Inspecciones periódicas con tecnología avanzada.</li>
            <li>Diagnóstico preciso sin desmontaje de instalaciones existentes.</li>
            <li>Limpieza de superficies, sellado de fisuras y reaplicación de impermeabilización.</li>
            <li>Cobertura integral de la mayoría de actuaciones mediante tarifa mensual.</li>
          </ul>
        </div>
      )
    },
    {
      question: '¿Qué garantía tienen los trabajos realizados por Coatline?',
      answer: 'Ofrecemos una garantía completa sobre la impermeabilización de superficies y cubiertas existentes, siempre que el cliente esté adherido al programa ZERO FILTRACIONES. La garantía permanece activa mientras se mantenga la suscripción al programa, que incluye inspecciones y mantenimientos preventivos.'
    },
    {
      question: '¿Cuál es el coste del programa ZERO FILTRACIONES?',
      answer: 'El programa funciona mediante una cuota mensual fija, calculada según el tamaño y la complejidad de la superficie, los materiales necesarios y el nivel de mantenimiento requerido. Ofrecemos planes de suscripción flexibles con financiación de 36 a 60 meses.'
    },
    {
      question: '¿Puede Coatline emitir certificados de estanqueidad?',
      answer: 'Sí. Emitimos certificados de estanqueidad conforme a normativa UNE, sin necesidad de pruebas de llenado. Esto permite validar técnicamente la estanqueidad sin consumir agua ni añadir peso, ideal para promotores, constructoras y direcciones facultativas.'
    }
  ];

  // Brands logos
  const brands = [
    { name: 'Grupo Puma', url: 'https://lh3.googleusercontent.com/aida/AP1WRLtWrRUONSVCGy1JeM0c1l836syvyedeyvP_qdQ9DFazWvD-YgtvSvYg-rRTb55sHWWAo9YWt-0Ein4w9ppTP79E2ukx59XrjVRIYccGSI3yNBHr1dFklyaskxpZN30I8a395kp2BP2mVmQAhn7EEd4ARE6RxdIqIP3N__2QbrLcv3AohDqXU2CbL-t8LeqWolO6WO4Nn3OToL8oOyd1hpjrqMBWJDxG3j_iyXVmSkO4F3bQx_hqTfBkwFuE' },
    { name: 'MAPEI', url: 'https://lh3.googleusercontent.com/aida/AP1WRLuQXIejOcIkpdv7yMqO6DjaDsGQOMU09oPpCurzE5nzy3vDUB-68-aV7ItF4D31T5w6FUOy1dTn-aDy08YlxZJYUkKQGnvI0bagJp_I_GLmps250-b-5412SxWp4P7izsoQsE4mbAbryBX5RXGMjokpoU7i1e-t17a0kQ8madbIXJjF8jhKhEUU5eBMrS0GNbSsXA8SQXMEOr0tea6IGTt480HJLY0F4D_9wOjSIHBrlLe9fIFcIvFwX79i' },
    { name: 'BMI Group', url: 'https://lh3.googleusercontent.com/aida/AP1WRLuSxnte7NcrcHzVw_TIaU40RL5gjGh5VQ-IUWarmf00TbEBqLJljbiAwTFh_4-oIRN6oFPSxnWSwvVtdP3AUWZKzAOKJvbvtlIjxvnDmnoaU_sxi1tKi5wo-kudKZOK7L6XiPpcO5wECbnqysA-yTgx7-SYYdpGSOs3EM9FwSSuOH68BlOcHy7TD6mJVxG30jwSLrifn-bsrz8UNN2Ibq08U7P83jcxDNahS6wu5kY9PoP7MJsZlE3Jw0mo' },
    { name: 'Revestech', url: 'https://lh3.googleusercontent.com/aida/AP1WRLtclosXm-k7jJw-BvuQLqH30DmM05Aj2M8nt4dFmWcErO_4uwsJ6NBndS88YsPV9_Kq3e7l20HTofuRRbbylCr5dd53LYdQB-m2rZMiT1GmplAGzxbyv2betsbpOrZtr-Eo-TYBtGoCAEGLC0m5dyCgY3G3-BXCPsuniRO4OyBq_iXFhfmIWWBI6j5wLSmIZ8d5D6KwkK0MwMZQ9Dj1nBD5Mcglg6tjJfZ-kgMtycxqRUtfdbqXisJbdQN8' },
    { name: 'Rollgum', url: 'https://lh3.googleusercontent.com/aida/AP1WRLvQZdG9DykQ0Zl7fYqNkLt6PUcipiu3v4Xq5LNBGzGoQORuJIb6ntNtfjDBcMJNoOE9Fa67HB7viSCuhsB9jNVHPyYiNW4NrTsHMdAgkBiMcmnBqKQHiVHRza7kBKTsonG1Qz0mzmX5fIJdE42UFhKf4teLNJpmZxPEifR9NXT8Yk2zsYGXzzx1xjtuU5wGz1WTev4wk8ufqmdjWdispWfWe6NOE0e2U-a5OtXZuQaeM459fyhL_9WxvEVt' },
    { name: 'Soprema', url: 'https://lh3.googleusercontent.com/aida/AP1WRLunOeBvfP14HPyNsiRtir6pKwzmhODmur8nVwldsf4yuOL_rjFnW4lbcrjelnAe_3pqLyUTQYhN8AFR3Gfmjge2MtyehChgYxOsHdAS4HJMopqcsbINBLHh_MtBOklBrEfe4xj5OuUgxRQ-F_3x6fqZwm6s0Z6c1E7tZkqV5sOKYNMOc4rFaX4y6COFySpwNQK9rQLQSLCBJJMTMOl__LEQNHkLvtxFa4v2YtyL2Fr3f7iXQPkS10gTp1iB' },
    { name: 'Alchimica', url: 'https://lh3.googleusercontent.com/aida/AP1WRLtLikmYjIts2CKvGz4jGTGzoE8wmtmsPcr6ANv4jjaDm9BHjK-k0U3RsKakQSVHnXDk_sgBQOKIMaf0poDZNQHiZF3vzai0Dxm6KK2x9P8Qnjz9LH-kP8JKuYJHx862lisIilaGc-oOaMJxjmj6XFU-lpajigLszFbiyjgldonukzVivldLFpFB48jDq1zkxElYg0mk4ppn-dTIHWi3MuCUXasZsB45fMKlYOZr9m_LXBvjL7nkr5iWn7sG' }
  ];

  return (
    <div className="w-full text-on-surface">
      
      {/* Hero Section */}
      <header className="relative pt-[120px] pb-24 px-6 md:px-16 bg-surface overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Prestigious modern office building with a green roof and solar panels" 
            className="w-full h-full object-cover object-center opacity-85" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwUBV3A2IiYvG9inHKqmQ4s98ilo-gyvRSk4nT2-O4il9V9HpWS0h9bImWQEoESSwNNoVL43s7-FmJ-lswni0oQ5KVy1Z4lLZRBxnz5v_t8fUW3lNEDCL6QI39eEv8k-13XKG0s6m6K1XYeLc7E-kA-V3vTO36J6bkIi0loYURWYEqlBZP2IJzyQaVGVra3PNGkzuGcrVa9nzwKnol3n0LtgX6g4NCA2t2hcgnhdd4tg3WCc0XgNFvV_K0WPNJV3eSXcFTyI263i5T" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001c3a]/95 to-[#001c3a]/65 mix-blend-multiply backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 text-left">
          <div className="md:col-span-7 space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight"
            >
              Mantenemos sus superficies siempre en perfecto estado
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-secondary font-bold tracking-tight"
            >
              ¡Un compromiso garantizado!
            </motion.p>
          </div>
          
          <div className="md:col-span-5 mt-10 md:mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-panel p-8 rounded-xl shadow-2xl relative border-none bg-surface/15 backdrop-blur-lg text-white"
            >
              <h3 className="font-display text-xl md:text-2xl font-bold text-pure-white mb-6">Solicite información</h3>
              
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {errorMsg && (
                      <p className="text-sm text-red-400 bg-red-950/40 p-2.5 rounded border border-red-500/20">{errorMsg}</p>
                    )}
                    <div>
                      <input 
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleFormChange}
                        className="w-full bg-white/10 border border-pure-white/20 rounded px-4 py-3 text-pure-white focus:outline-none focus:border-secondary focus:bg-white/15 transition-all font-sans placeholder:text-pure-white/60 text-sm" 
                        placeholder="Nombre completo" 
                        type="text" 
                        required
                      />
                    </div>
                    <div>
                      <input 
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        className="w-full bg-white/10 border border-pure-white/20 rounded px-4 py-3 text-pure-white focus:outline-none focus:border-secondary focus:bg-white/15 transition-all font-sans placeholder:text-pure-white/60 text-sm" 
                        placeholder="Email corporativo" 
                        type="email" 
                        required
                      />
                    </div>
                    <div>
                      <input 
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleFormChange}
                        className="w-full bg-white/10 border border-pure-white/20 rounded px-4 py-3 text-pure-white focus:outline-none focus:border-secondary focus:bg-white/15 transition-all font-sans placeholder:text-pure-white/60 text-sm" 
                        placeholder="Teléfono móvil" 
                        type="tel" 
                        required
                      />
                    </div>
                    <button 
                      className="w-full bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest py-4 rounded hover:bg-secondary-container transition-all shadow-lg active:scale-[0.98]" 
                      type="submit"
                    >
                      Enviar
                    </button>
                    <p className="text-[10px] text-pure-white/50 text-center mt-4 leading-normal">
                      He leído y acepto la Política de privacidad y protección de datos.
                    </p>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8 space-y-4"
                  >
                    <div className="w-16 h-16 bg-secondary/20 border border-secondary text-secondary rounded-full flex items-center justify-center mx-auto">
                      <Check size={32} />
                    </div>
                    <h4 className="font-display text-lg font-bold text-white">¡Muchas gracias, {formData.nombre}!</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Nuestros ingenieros han recibido su solicitud. Nos pondremos en contacto para coordinar un dossier de pre-diagnóstico técnico sin compromiso.
                    </p>
                    <button 
                      onClick={() => { setIsSubmitted(false); setFormData({ nombre: '', email: '', telefono: '' }); }}
                      className="text-xs text-secondary hover:underline font-bold mt-2"
                    >
                      Enviar otro formulario
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ZERO FILTRACIONES Section */}
      <section className="py-24 px-6 md:px-16 bg-primary text-white relative" style={{ backgroundColor: '#001c3a' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-4xl mx-auto space-y-6">
            <div className="inline-flex flex-col items-center justify-center w-28 h-28 rounded-full border border-secondary/45 mb-4 bg-primary-container/20 p-2 text-center shadow-lg">
              <span className="font-display text-lg font-extrabold text-white leading-none">ZERO</span>
              <span className="text-[9px] font-bold tracking-widest text-secondary uppercase mt-0.5">FILTRACIONES</span>
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-pure-white tracking-tight">
              Beneficios del programa
            </h2>
            <p className="font-sans text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              ZERO FILTRACIONES es un programa de mantenimiento inteligente y proactivo que previene la aparición de filtraciones en superficies y cubiertas mediante tecnología avanzada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="border border-pure-white/10 bg-white/5 rounded-xl p-8 hover:bg-white/10 transition-colors group">
              <div className="text-[36px] font-display font-extrabold text-secondary mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                01.
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-4">Máxima protección</h3>
              <p className="font-sans text-sm text-slate-300 leading-relaxed">
                Olvídese de incidencias mediante un programa que le garantiza la eficacia y durabilidad de sus superficies y cubiertas.
              </p>
            </div>
            
            {/* Pillar 2 */}
            <div className="border border-pure-white/10 bg-white/5 rounded-xl p-8 hover:bg-white/10 transition-colors group">
              <div className="text-[36px] font-display font-extrabold text-secondary mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                02.
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-4">Prolongue la vida útil</h3>
              <p className="font-sans text-sm text-slate-300 leading-relaxed">
                Revisiones preventivas periódicas que aumentarán la integridad estructural de su propiedad y mejorarán su eficiencia térmica.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="border border-pure-white/10 bg-white/5 rounded-xl p-8 hover:bg-white/10 transition-colors group">
              <div className="text-[36px] font-display font-extrabold text-secondary mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                03.
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-4">Control de costes</h3>
              <p className="font-sans text-sm text-slate-300 leading-relaxed">
                Adhiriéndose al programa todos los costes de nuestras actuaciones quedarán cubiertos mediante el pago de una tarifa fija mensual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 5-Step Process Section */}
      <section className="py-24 px-6 md:px-16 bg-surface-container">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary tracking-tight">Proceso ZERO</h2>
            <p className="font-sans text-base md:text-lg text-on-surface-variant">
              Un proceso de cinco pasos que repetiremos cíclicamente de manera preventiva y que garantizará el perfecto estado de sus superficies.
            </p>
          </div>

          {/* Interactive Responsive Accordion Grid */}
          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 w-full h-auto lg:h-[450px]">
            {steps.map((step) => {
              const isCurrentlyActive = activeStep === step.num;
              return (
                <div 
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  onMouseEnter={() => setActiveStep(step.num)}
                  className={`group relative overflow-hidden rounded-xl shadow-lg transition-all duration-500 ease-out cursor-pointer min-h-[250px] lg:min-h-0 ${
                    isCurrentlyActive 
                      ? 'flex-grow lg:flex-[1.5] shadow-2xl shadow-primary/30 border-2 border-secondary' 
                      : 'flex-1 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${step.img})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001c3a] via-[#001c3a]/75 to-transparent opacity-90 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-left z-10">
                    <span className="material-symbols-outlined text-white mb-2 text-3xl opacity-90">
                      {step.icon}
                    </span>
                    <span className="text-[10px] font-sans font-extrabold text-secondary uppercase tracking-widest mb-1 block">
                      PASO {step.num}
                    </span>
                    <h3 className="font-display font-extrabold text-lg md:text-xl text-white mb-2">
                      {step.title}
                    </h3>
                    
                    {/* Animated height text depending on expansion state */}
                    <p className={`font-sans text-xs md:text-sm text-slate-200 leading-relaxed transition-all duration-300 overflow-hidden ${
                      isCurrentlyActive ? 'max-h-[140px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-0'
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content: Productos y Servicios */}
      <main className="py-24 px-6 md:px-16 bg-surface">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto space-y-6">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary tracking-tight">
              PRODUCTOS Y SERVICIOS
            </h2>
            <div className="w-16 h-1 bg-secondary mx-auto"></div>
            <p className="font-sans text-base md:text-lg text-on-surface-variant">
              Coatline pone a su disposición servicios que le permitirán solucionar cualquier incidencia que surja en sus superficies. En el programa <span className="font-bold text-primary">ZERO FILTRACIONES</span> están incluidos todos estos servicios.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            
            {/* Service 1: Mantenimiento Preventivo (Col-span 7) */}
            <div className="lg:col-span-7 bg-white border border-surface-variant rounded-xl p-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl group">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Wrench className="text-primary w-8 h-8 group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-lg md:text-xl text-primary uppercase">
                    MANTENIMIENTO PREVENTIVO
                  </h3>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    Un adecuado mantenimiento de su cubierta le permitirá un importante ahorro al prevenir posibles problemas causados por elementos externos. Nuestro equipo de inspección identifica incidencias con la última tecnología.
                  </p>
                </div>
              </div>
            </div>

            {/* Service 2: Respuesta Emergencias (Col-span 5) */}
            <div className="lg:col-span-5 bg-white border border-surface-variant rounded-xl p-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500" />
              <div className="flex flex-col h-full justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded bg-secondary/10 flex items-center justify-center group-hover:bg-secondary text-secondary group-hover:text-white transition-colors">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg md:text-xl text-primary uppercase">
                    RESPUESTA ANTE EMERGENCIAS
                  </h3>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    Respuesta rápida ante filtraciones repentinas o cualquier incidencia para contener el problema lo más pronto posible y dar la mejor solución en el menor tiempo.
                  </p>
                </div>
              </div>
            </div>

            {/* Service 3: Impermeabilización (Col-span 12) */}
            <div 
              className="lg:col-span-12 bg-primary text-white rounded-xl p-8 md:p-12 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl group relative overflow-hidden text-left" 
              style={{ backgroundColor: '#001c3a' }}
            >
              <div 
                className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-700" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD8JC_kiZH37kX5YNJ241KFj74FSuIh6SYjV9PPlGIWHjJngnZXgNo8dAQ1IP-4PrnBhO_W-wq225mRcCjIpuqKy9mdKxO3v5kB806xcirKFwDaJPRlzQK4Ac6JLaw0RgcnM733F9HCljMH7OlTynTKQRLNqKaz6CBaR0rEx5i0dSL7hVynrozSS98CLeyoZItnAlS1aEDKio0tzGofmBcSlBOgnJhL3NPg2xy0o_vbCqfaflSIAs1JSYGa1p2ggf73oPyC7RlMYJQf')" }}
              />
              <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center h-full justify-between">
                <div className="space-y-4 max-w-4xl">
                  <div className="w-12 h-12 rounded bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Droplet className="text-white w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-xl md:text-2xl tracking-tight uppercase">
                    IMPERMEABILIZACIÓN CERTIFICADA
                  </h3>
                  <p className="font-sans text-sm md:text-base text-slate-100 leading-relaxed">
                    Certificados para aplicar diferentes sistemas de impermeabilización y techado en proyectos de nueva construcción, reinstalación o reparación, respetando estándares del fabricante.
                  </p>
                </div>
                <div className="shrink-0">
                  <button 
                    onClick={() => onNavigate('detection', 'none')} 
                    className="inline-flex items-center gap-2 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded hover:bg-secondary-container transition-all"
                  >
                    Ver Especialidades <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Service 4: Eficiencia Energetica (Col-span 12) */}
            <div className="lg:col-span-12 bg-white border border-surface-variant rounded-xl p-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl group">
              <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                <div className="w-full md:w-1/2 aspect-video bg-surface-container rounded-lg overflow-hidden relative shadow-md">
                  <img 
                    alt="Eficiencia Energética" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    src="https://lh3.googleusercontent.com/aida/AP1WRLsI8TeoH_FfCLBS6qg8_DfIZMEmbTh1fCxO84w9JupeyGpkDaQepH84yReEjLMDgYNtD5_dHQB_bp1vf6bK4B7seU_lNpUpmK44WTa8XvRjfsmMG5dMya8xeyEkLFjztQ-ZnNENiXz0mUVuT_xDpyYmBepoL_RhEHQOdkl30pniQF52eeqGsYSJEcuPY8UjcNm1tJLcm4jwQXY9_RPiWE_5pbP0VYhLXb1IzYhxVmbpq3E0nTjNN0QLYsPz" 
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-4 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded text-primary font-sans font-bold text-xs">
                    <Leaf size={14} className="text-secondary" />
                    LEED / BREEAM
                  </div>
                  <h3 className="font-display font-bold text-xl md:text-2xl text-primary">
                    EFICIENCIA ENERGÉTICA Y VALORIZACIÓN
                  </h3>
                  <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed">
                    Soluciones de mejora energética (cubiertas verdes, blancas reflectantes, solares y azules) que aumentan la valoración en certificaciones LEED y BREEAM.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Social Proof / Metrics */}
      <section className="py-20 px-6 md:px-16 bg-surface-container-low border-y border-surface-variant/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-4xl mx-auto space-y-4">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-primary tracking-tight">
              Marcas que confían en nosotros
            </h2>
            <p className="font-sans text-sm md:text-base text-on-surface-variant max-w-3xl mx-auto">
              En Coatline combinamos innovación y experiencia. Desarrollamos y fabricamos soluciones propias que complementamos, según los requisitos del proyecto, con materiales de los principales fabricantes del sector. Trabajamos con marcas como:
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 items-center justify-items-center">
            {brands.map((b, idx) => (
              <div 
                key={idx}
                className="w-full flex items-center justify-center transition-all duration-300 hover:scale-[1.08] hover:shadow-md h-24 p-4 bg-white rounded-lg border border-surface-variant/30 group"
              >
                <img 
                  alt={b.name} 
                  className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" 
                  src={b.url} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE NOSOTROS Section */}
      <section className="py-24 px-6 md:px-16 bg-surface-container border-b border-surface-variant/30">
        <div className="max-w-7xl mx-auto text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <h2 className="font-display font-bold text-3xl md:text-4xl text-primary tracking-tight uppercase">
                  Sobre Nosotros
                </h2>
                <div className="w-16 h-1 bg-secondary" />
                <h3 className="font-display text-xl md:text-2xl font-bold text-primary leading-tight mt-6">
                  Compañía internacional líder en soluciones de ingeniería para la impermeabilización de superficies y cubiertas desde 2005.
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="space-y-2 border-l-2 border-secondary pl-4">
                  <h4 className="font-display font-bold text-sm text-secondary uppercase tracking-wider">Trayectoria</h4>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    19 años aportando experiencia a clientes particulares y grandes corporaciones.
                  </p>
                </div>
                <div className="space-y-2 border-l-2 border-secondary pl-4">
                  <h4 className="font-display font-bold text-sm text-secondary uppercase tracking-wider">Expansión</h4>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    Estrategia global con fuerte presencia en el continente americano y consolidación en el mercado europeo.
                  </p>
                </div>
                <div className="space-y-2 border-l-2 border-secondary pl-4">
                  <h4 className="font-display font-bold text-sm text-secondary uppercase tracking-wider">Metodología</h4>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    Programas de cobertura centrados en la prevención, detección inteligente y gestión técnica personalizada.
                  </p>
                </div>
                <div className="space-y-2 border-l-2 border-secondary pl-4">
                  <h4 className="font-display font-bold text-sm text-secondary uppercase tracking-wider">Compromiso</h4>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    Excelencia en el servicio y satisfacción del cliente como referentes de calidad en el sector.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative z-10">
                <img 
                  alt="Mantenimiento con drones de alta tecnología" 
                  className="w-full h-full object-cover hover:scale-105 transition-all duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4qXKKubNKotT2NTzOU9xUeJvEKRBTDDCu9DvqO3jI7yMvTKn3mW65LA7LFjJydyyP5xEXp_j5Vq_TXCTPZVxLbQIzB5MZg_EXkgGD4-J4Uvbdc0Y-zDJnmd8jTJB9omND-1D_NwmUXnCKLOc8SY42Z0MvNN8yZM_CFMJFMAQPk3se2t7cOkr5kwYraXtAEu8n1ChPqph2u8K18GcPE7MnHe2zAnCrOGoOBoLFPi2rPlwfz9s2AFUK_i3cU2w76XWFP-m-zpTKDS0j" 
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-secondary/20 rounded-2xl -z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 md:px-16 bg-white text-left">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary tracking-tight">
              Preguntas Frecuentes
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((f, index) => {
              const isFaqOpen = openFaq === index;
              return (
                <div key={index} className="border-b border-surface-variant/40 pb-4 transition-all">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center text-left font-display font-bold text-base md:text-lg text-primary hover:text-secondary transition-colors focus:outline-none py-2"
                  >
                    <span>{f.question}</span>
                    <ChevronDown 
                      size={20} 
                      className={`text-slate-400 transition-transform duration-300 ${isFaqOpen ? 'rotate-180 text-secondary' : 'rotate-0'}`} 
                    />
                  </button>
                  
                  {/* Smoother height toggle transition using CSS heights */}
                  <div 
                    className={`transition-all duration-300 overflow-hidden ${
                      isFaqOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="text-on-surface-variant font-sans text-sm md:text-base leading-relaxed">
                      {f.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-6 md:px-16 bg-surface-container">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center space-y-6">
          <h3 className="font-display font-bold text-2xl md:text-3xl text-primary">
            ¿Necesita proteger su inversión arquitectónica?
          </h3>
          <p className="font-sans text-sm md:text-base text-on-surface-variant max-w-2xl leading-relaxed">
            Contacte con nuestro equipo de especialistas para una evaluación técnica de sus superficies y descubra cómo el programa Zero Filtraciones puede garantizar la integridad estructural de su proyecto a largo plazo.
          </p>
          <button 
            type="button"
            onClick={() => onNavigate('contact', 'push')}
            className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest rounded hover:bg-secondary-container transition-all gap-2 shadow-lg active:scale-[0.98]"
          >
            Solicitar Información
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

    </div>
  );
}
