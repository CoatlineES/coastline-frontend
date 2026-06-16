import React, { useState } from 'react';
import { motion } from 'motion/react';

export default function HomeMethodology() {
  const [activeStep, setActiveStep] = useState<number>(3);

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

  return (
    <section id="metodologia" className="py-24 px-6 md:px-16 bg-surface-container">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary tracking-tight">Proceso ZERO</h2>
          <p className="font-sans text-base md:text-lg text-on-surface-variant">
            Un proceso de cinco pasos que repetiremos cíclicamente de manera preventiva y que garantizará el perfecto estado de sus superficies.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 w-full h-auto lg:h-[450px]">
          {steps.map((step) => {
            const isCurrentlyActive = activeStep === step.num;
            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(step.num)}
                onMouseEnter={() => setActiveStep(step.num)}
                className={`group relative overflow-hidden rounded-xl shadow-lg transition-all duration-500 ease-out cursor-pointer min-h-[250px] lg:min-h-0 ${isCurrentlyActive
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

                  <p className={`font-sans text-xs md:text-sm text-slate-200 leading-relaxed transition-all duration-300 overflow-hidden ${isCurrentlyActive ? 'max-h-[140px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-0'
                    }`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
