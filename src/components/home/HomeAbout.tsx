import React from 'react';
import { motion } from 'motion/react';

export default function HomeAbout() {
  return (
    <section id="nosotros" className="py-24 px-6 md:px-16 bg-surface-container border-b border-surface-variant/30">
      <div className="max-w-7xl mx-auto text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
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
            <div className="rounded-2xl overflow-hidden shadow-2xl relative z-10">
              <img
                alt="Mantenimiento con drones de alta tecnología"
                className="w-full h-auto object-contain hover:scale-[1.02] transition-all duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4qXKKubNKotT2NTzOU9xUeJvEKRBTDDCu9DvqO3jI7yMvTKn3mW65LA7LFjJydyyP5xEXp_j5Vq_TXCTPZVxLbQIzB5MZg_EXkgGD4-J4Uvbdc0Y-zDJnmd8jTJB9omND-1D_NwmUXnCKLOc8SY42Z0MvNN8yZM_CFMJFMAQPk3se2t7cOkr5kwYraXtAEu8n1ChPqph2u8K18GcPE7MnHe2zAnCrOGoOBoLFPi2rPlwfz9s2AFUK_i3cU2w76XWFP-m-zpTKDS0j"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-secondary/20 rounded-2xl -z-0" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
