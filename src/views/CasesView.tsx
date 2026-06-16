/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScreenId } from '../types';
import CssCasesBackground from '../components/animations/CssCasesBackground';
import CssAnimatedReport from '../components/animations/CssAnimatedReport';
import image2 from '../assets/image.png';
import davidLoadImg from '../assets/davidLoad.png';
import holidayImg from '../assets/holiday.png';
import upmImg from '../assets/upm.png';
import valdebebasImg from '../assets/valdebebas.png';
import malplazaImg from '../assets/malplaza.png';
import jardinPlazaImg from '../assets/jardinPlaza.png';
import ciudadLImg from '../assets/ciudadL.png';
import haspenImg from '../assets/haspen.png';
import cantinaImg from '../assets/cantina.png';
import clinicaImg from '../assets/clinica.png';

interface CasesViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function CasesView({ onNavigate }: CasesViewProps) {
  const [activeCaseIndex, setActiveCaseIndex] = useState<number | null>(null);

  const cases = [
    {
      title: 'David Lloyd',
      category: 'Deportes & Ocio',
      description: 'Protección integral de superficies y mantenimiento estructural para instalaciones de alto tráfico con estándares de precisión olímpica.',
      longDescription: 'Nuestra intervención en David Lloyd representó un desafío técnico de alto nivel. Implementamos un sistema de protección integral en pavimentos deportivos y zonas de aguas, aplicando revestimientos de curado rápido para minimizar el impacto operativo. Se realizó un tratamiento preventivo en la estructura primaria, asegurando la impermeabilidad y la resistencia química requeridas en instalaciones de este calibre.',
      challenges: ['Altos requerimientos antideslizantes', 'Zonas con constante humedad (piscinas y spas)', 'Necesidad de ejecución sin frenar la actividad del club'],
      results: 'Instalaciones 100% protegidas contra filtraciones, mejora visual estética y cumplimiento de las normativas de seguridad deportiva.',
      image: davidLoadImg,
      colSpan: 'md:col-span-8',
      imageHeight: 'h-[500px]'
    },
    {
      title: 'Netflix',
      category: 'Corporativo',
      description: 'Sellado de precisión en naves de producción y estudios de grabación.',
      longDescription: 'Coatline lideró el proyecto de aislamiento e impermeabilización en los modernos estudios de Netflix. El enfoque principal fue el sellado de precisión en juntas de dilatación y la impermeabilización de cubiertas planas para garantizar una insonorización impecable y la protección del costoso equipo técnico de grabación.',
      challenges: ['Requisitos extremos de insonorización', 'Instalación de membranas sin interferencia magnética', 'Plazos de entrega muy ajustados para el inicio de rodajes'],
      results: 'Sellado técnico de clase A en todos los platós, cero filtraciones térmicas o acústicas registradas durante el primer año de operaciones.',
      image: image2,
      colSpan: 'md:col-span-4',
      imageHeight: 'h-[300px] md:h-[calc(100%-140px)]'
    },
    {
      title: 'Holiday Inn',
      category: 'Hostelería',
      description: 'Impermeabilización avanzada de cubiertas y protección de fachadas.',
      longDescription: 'Para la cadena Holiday Inn, realizamos una modernización completa de sus sistemas de aislamiento exterior. Se implementaron membranas líquidas de poliuretano en las cubiertas y un tratamiento hidrófugo en la fachada principal, mejorando radicalmente la eficiencia energética del edificio y protegiendo el confort de los huéspedes.',
      challenges: ['Intervención en un edificio operativo al 100%', 'Gestión de olores y ruidos para no afectar a los huéspedes', 'Condiciones climáticas adversas durante la aplicación'],
      results: 'Reducción del 20% en consumo energético de climatización y extensión de la vida útil de la fachada en más de 15 años.',
      image: holidayImg,
      colSpan: 'md:col-span-5',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'UPM',
      category: 'Educación',
      description: 'Mantenimiento preventivo integral en campus universitario de alto valor histórico.',
      longDescription: 'La Universidad Politécnica de Madrid confió en Coatline para el diagnóstico y saneamiento de filtraciones en uno de sus edificios históricos. Utilizamos tecnología DDP (Detección de Defectos de Porosidad) para mapear micro-fisuras sin afectar la integridad arquitectónica, seguido de una inyección de resinas especializadas.',
      challenges: ['Protección de patrimonio arquitectónico', 'Detección no invasiva en estructuras centenarias', 'Zonas de muy difícil acceso técnico'],
      results: 'Restauración estructural completa, eliminando el riesgo de deterioro interno y preservando la fachada histórica intacta.',
      image: upmImg,
      colSpan: 'md:col-span-7',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Valdebebas',
      category: 'Desarrollo Urbano',
      description: 'Intervención a gran escala en infraestructura urbana residencial, garantizando durabilidad y estética arquitectónica.',
      longDescription: 'Este megaproyecto de desarrollo urbano residencial en Valdebebas requirió de nuestra división de intervenciones a gran escala. Tratamos miles de metros cuadrados de cubiertas ajardinadas (roof gardens), terrazas comunitarias y zonas de garajes, implementando barreras anti-raíces y recubrimientos epóxicos de alta resistencia.',
      challenges: ['Coordinación logística masiva', 'Integración con paisajismo en cubiertas vegetales', 'Alta presión freática en niveles inferiores de garajes'],
      results: 'Garantía certificada de estanqueidad en todas las plataformas comunitarias, entregado 2 semanas antes de lo programado.',
      image: valdebebasImg,
      colSpan: 'md:col-span-12',
      imageHeight: 'h-[450px]'
    },
    {
      title: 'Mallplaza',
      category: 'Retail',
      description: 'Soluciones de recubrimiento técnico para zonas de alto tránsito peatonal.',
      longDescription: 'En Mallplaza, la prioridad fue renovar las zonas de alto tráfico comercial sin cerrar el complejo. Aplicamos sistemas de pavimentos continuos MMA (Metil Metacrilato) de curado ultra-rápido, capaces de soportar el paso constante de peatones y maquinaria de limpieza horas después de su aplicación.',
      challenges: ['Ventanas de trabajo nocturnas de tan solo 6 horas', 'Acabados estéticos de alto brillo', 'Resistencia extrema a la abrasión'],
      results: 'Renovación integral del pavimento con un acabado premium, sin reportar ni un solo día de cierre comercial.',
      image: malplazaImg,
      colSpan: 'md:col-span-6',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Jardín Plaza',
      category: 'Comercial',
      description: 'Restauración estética y protección climática en complejos comerciales abiertos.',
      longDescription: 'Un centro comercial al aire libre requiere protección constante contra los elementos. En Jardín Plaza, ejecutamos un plan de mantenimiento arquitectónico que incluyó el sellado de pasillos expuestos, limpieza y protección de domos translúcidos, y la impermeabilización de todas las jardineras suspendidas.',
      challenges: ['Exposición directa a rayos UV y lluvias torrenciales', 'Complejidad geométrica de las cubiertas textiles y domos', 'Tratamiento de múltiples sustratos diferentes'],
      results: 'Una barrera climática invisible que redujo las incidencias por filtraciones a cero, mejorando drásticamente la estética del recinto.',
      image: jardinPlazaImg,
      colSpan: 'md:col-span-6',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Ciudad La Salle',
      category: 'Residencial',
      description: 'Mantenimiento de fachadas y sistemas de impermeabilización en gran conjunto residencial.',
      longDescription: 'Nuestros equipos verticales intervinieron los múltiples bloques del complejo residencial Ciudad La Salle. El proyecto abordó la rehabilitación de fachadas mediante hidrofugantes nanotecnológicos y la reparación profunda de juntas de dilatación para solucionar problemas crónicos de humedad por capilaridad en plantas bajas.',
      challenges: ['Trabajo vertical en altura extrema', 'Intervención simultánea en 12 edificios', 'Molestias mínimas para los miles de residentes'],
      results: 'Eliminación definitiva de humedades interiores, revalorizando los inmuebles y asegurando el confort habitacional.',
      image: ciudadLImg,
      colSpan: 'md:col-span-7',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Colegio Aspaen',
      category: 'Educación',
      description: 'Protección estructural y renovación de cubiertas en instalaciones educativas campestres.',
      longDescription: 'En el Colegio Aspaen, realizamos la sustitución y el sellado de las cubiertas modulares de los pabellones. Utilizamos membranas termoplásticas TPO blancas que, además de impermeabilizar, actúan como reflectantes solares (Cool Roofs), reduciendo la temperatura interior de las aulas de forma pasiva.',
      challenges: ['Ejecución estricta durante las vacaciones escolares', 'Aislamiento térmico como objetivo secundario', 'Trabajo en zonas rodeadas de naturaleza protegida'],
      results: 'Aulas hasta 4°C más frescas en verano, proporcionando un ambiente óptimo para los estudiantes.',
      image: haspenImg,
      colSpan: 'md:col-span-5',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Cantina La 15',
      category: 'Restauración',
      description: 'Tratamientos especializados para superficies en ambientes gastronómicos de alta gama.',
      longDescription: 'Para el exclusivo restaurante Cantina La 15, instalamos un suelo higiénico de poliuretano-cemento en la cocina central, diseñado para soportar choques térmicos extremos, derrames de aceites hirviendo y limpieza con químicos agresivos, cumpliendo con las más altas normativas sanitarias.',
      challenges: ['Necesidad de acabados antibacterianos certificados', 'Resistencia a choques térmicos diarios', 'Drenajes industriales integrados sin juntas'],
      results: 'Una cocina de grado industrial, 100% aséptica, segura y de fácil limpieza que supera las normativas sanitarias internacionales.',
      image: cantinaImg,
      colSpan: 'md:col-span-6',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Clínicas Avidanti',
      category: 'Salud',
      description: 'Mantenimiento técnico y sellado aséptico en infraestructuras hospitalarias de alta complejidad.',
      longDescription: 'Coatline fue seleccionada para el sellado de quirófanos y salas blancas en las Clínicas Avidanti. Utilizamos masillas selladoras de grado médico con tecnología de iones de plata (efecto bactericida continuo) en todas las uniones de panel sándwich y pavimentos conductivos para evitar descargas estáticas.',
      challenges: ['Entorno crítico con protocolo de polvo cero', 'Certificación de salas limpias ISO', 'Aplicación de pavimentos ESD (antiestáticos)'],
      results: 'Acreditación inmediata de los quirófanos bajo las normativas más estrictas de bioseguridad.',
      image: clinicaImg,
      colSpan: 'md:col-span-6',
      imageHeight: 'h-[300px]'
    }
  ];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeCaseIndex !== null) {
      setActiveCaseIndex((activeCaseIndex + 1) % cases.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeCaseIndex !== null) {
      setActiveCaseIndex((activeCaseIndex - 1 + cases.length) % cases.length);
    }
  };

  return (
    <div className="w-full text-on-surface relative">
      {/* Hero Section */}
      <header className="relative py-24 px-6 md:px-16 overflow-hidden min-h-[500px] flex items-center">
        <CssCasesBackground />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 pt-8">
          <div className="md:col-span-7 space-y-6 text-left">
            <h1 className="font-display font-bold text-5xl md:text-7xl text-white leading-tight drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              Casos de Éxito
            </h1>
            <p className="font-sans text-2xl font-bold text-secondary tracking-tight drop-shadow-md">
              ¡Precisión arquitectónica demostrada!
            </p>
          </div>
          
          <div className="md:col-span-5 mt-10 md:mt-0">
            <CssAnimatedReport />
          </div>
        </div>
      </header>

      {/* Projects Grid (Bento/Masonry Inspired) */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-24 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {cases.map((project, idx) => (
            <article 
              key={idx} 
              onClick={() => setActiveCaseIndex(idx)}
              className={`${project.colSpan} group cursor-pointer bg-white border border-slate-200 overflow-hidden rounded-xl hover:-translate-y-1 hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col relative`}
            >
              <div className={`relative w-full overflow-hidden ${project.imageHeight}`}>
                <img 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                  src={project.image} 
                />
                <div className="absolute top-6 left-6 z-10">
                  <span className="inline-block bg-primary text-white px-3 py-1 font-sans font-bold text-[10px] uppercase tracking-widest rounded-sm shadow-sm" style={{ backgroundColor: '#003b70' }}>
                    {project.category}
                  </span>
                </div>
                {/* Hover Overlay indicating clickability */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-primary font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full shadow-lg">
                    Ver Proyecto
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8 flex-grow flex flex-col text-left bg-white relative z-10">
                <h3 className="font-display font-bold text-2xl md:text-3xl text-primary mb-3">{project.title}</h3>
                <p className="font-sans text-sm md:text-base text-slate-600 mb-0 leading-relaxed max-w-2xl">{project.description}</p>
              </div>
            </article>
          ))}
        </motion.div>
      </section>

      {/* Modal / Detailed Component */}
      <AnimatePresence>
        {activeCaseIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCaseIndex(null)}
              className="absolute inset-0 bg-primary/90 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setActiveCaseIndex(null)}
                className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-white text-primary rounded-full shadow-md backdrop-blur-sm transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-1/2 relative h-64 md:h-auto shrink-0 bg-slate-100">
                <img 
                  src={cases[activeCaseIndex].image} 
                  alt={cases[activeCaseIndex].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6">
                  <span className="inline-block bg-primary text-white px-3 py-1 font-sans font-bold text-[10px] uppercase tracking-widest rounded-sm shadow-sm" style={{ backgroundColor: '#003b70' }}>
                    {cases[activeCaseIndex].category}
                  </span>
                </div>
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white flex flex-col justify-between">
                <div>
                  <h2 className="font-display font-bold text-3xl md:text-5xl text-primary mb-6">
                    {cases[activeCaseIndex].title}
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-sans font-bold text-xs text-secondary uppercase tracking-widest mb-2">
                        El Proyecto
                      </h4>
                      <p className="font-sans text-sm md:text-base text-slate-600 leading-relaxed">
                        {cases[activeCaseIndex].longDescription}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-xs text-secondary uppercase tracking-widest mb-2">
                        Retos Técnicos
                      </h4>
                      <ul className="list-disc pl-4 text-sm text-slate-600 space-y-1">
                        {cases[activeCaseIndex].challenges.map((challenge, i) => (
                          <li key={i}>{challenge}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                      <h4 className="font-sans font-bold text-xs text-primary uppercase tracking-widest mb-2">
                        Resultados
                      </h4>
                      <p className="font-sans text-sm font-semibold text-slate-700">
                        {cases[activeCaseIndex].results}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Controls inside Modal */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100">
                  <button 
                    onClick={handlePrev}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-colors group"
                  >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Anterior
                  </button>
                  <span className="text-xs font-mono text-slate-400">
                    {activeCaseIndex + 1} / {cases.length}
                  </span>
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-colors group"
                  >
                    Siguiente
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Metrics/Impact Section */}
      <section className="bg-primary text-white py-20 mb-24" style={{ backgroundColor: '#003b70' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-6 md:px-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-600/50">
            <div className="md:pr-12 pt-8 md:pt-0 group hover:-translate-y-2 transition-transform duration-300 cursor-default">
              <h4 className="font-display font-bold text-5xl md:text-6xl mb-3 text-white group-hover:text-secondary transition-colors">+300</h4>
              <p className="font-sans font-bold text-xs text-blue-200 uppercase tracking-widest group-hover:text-white transition-colors">Clientes Confían</p>
            </div>
            <div className="md:px-12 pt-8 md:pt-0 group hover:-translate-y-2 transition-transform duration-300 cursor-default">
              <h4 className="font-display font-bold text-5xl md:text-6xl mb-3 text-white group-hover:text-secondary transition-colors">+1000</h4>
              <p className="font-sans font-bold text-xs text-blue-200 uppercase tracking-widest group-hover:text-white transition-colors">Proyectos Ejecutados</p>
            </div>
            <div className="md:pl-12 pt-8 md:pt-0 group hover:-translate-y-2 transition-transform duration-300 cursor-default">
              <h4 className="font-display font-bold text-5xl md:text-6xl mb-3 text-white group-hover:text-secondary transition-colors">+6M</h4>
              <p className="font-sans font-bold text-xs text-blue-200 uppercase tracking-widest group-hover:text-white transition-colors">Metros Cuadrados Protegidos</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 text-center mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
        <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-6">¿Preparado para proteger su inversión?</h2>
        <p className="font-sans text-lg text-slate-600 max-w-2xl mx-auto mb-10">
          Consulte con nuestros ingenieros para una evaluación técnica de sus instalaciones.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            type="button"
            className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest rounded hover:bg-secondary-container transition-colors shadow-lg"
          >
            Solicitar Información
          </button>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onNavigate('contact', 'push');
            }}
            className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-primary text-primary font-sans font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-50 transition-colors"
          >
            Contactar
          </a>
        </div>
        </motion.div>
      </section>
    </div>
  );
}
