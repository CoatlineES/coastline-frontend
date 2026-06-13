/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScreenId } from '../types';

interface CasesViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function CasesView({ onNavigate }: CasesViewProps) {
  const cases = [
    {
      title: 'David Lloyd',
      category: 'Deportes & Ocio',
      description: 'Protección integral de superficies y mantenimiento estructural para instalaciones de alto tráfico con estándares de precisión olímpica.',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLtU5Arwhmcbx6VqqcoeIXdn0ojgXsHpG6WzOD4C533W2pm9AgymenzaToebyKBTMaJ0Sz_VDI05-BDr_95V3BWplXa-Ne-QPnfxTV-DZNrmDO6rqvcqseHOO6wgWxetQWKYtdhuaTMoq3BjPE-AzDp9V7N5JUFMN8_NBm1WTXklbG8QNXppobX0O3qvxRDPJT0wS2u9YInueK5SbEsimei9jARbJltCVQdFZIkLQ1nApFIkJV95T3nXXXuC',
      colSpan: 'md:col-span-8',
      imageHeight: 'h-[500px]'
    },
    {
      title: 'Netflix',
      category: 'Corporativo',
      description: 'Sellado de precisión en naves de producción y estudios de grabación.',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLvAsEudRGuzwWRS1y_vstLfg8aukP3Ebx53IykONMn4pzD4hB9XE08G8dBdOlybE1epLjr13tfCC1jK_r2juxUhghcOnFlAyLUTi0tZYJugk8UTtcotFQpJUvAISu_BWaAOeboWi-waEDNNV5gRaZ-qkFPzfhOPilcJSGTWQI_XD1uaJ7oxaYs-XUT5Cpf3bA_C2lQkvfemo1Ayj8JhsVEl1Rq3FCiuos50ZnzsHnd9XHbSy-NBER-sJ6NK',
      colSpan: 'md:col-span-4',
      imageHeight: 'h-[300px] md:h-[calc(100%-140px)]'
    },
    {
      title: 'Holiday Inn',
      category: 'Hostelería',
      description: 'Impermeabilización avanzada de cubiertas y protección de fachadas.',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLu3kVbdVepLM_zEXqwivp69QsCzkxnUwAKr9wD6DFShZPDEKaO9h04acU1P9ck6QKSkmzNty3nbWQ9I6Uyz9jp-0gMyFZHX7GeRLhacVHr0idn5TdQ8-szez9pt2js6IQGM5S9RdmrrMCFMJ8347EZIrl5dXTaeHB_p9CZZXVWS-h-xbC11WoWuSyqNcERqIwWYRnJKI9TcnTWOaU8K8ZBSgHZZ84iRtWrXHLoUdoAMFsc-Zzh2zxFxkEmV',
      colSpan: 'md:col-span-5',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'UPM',
      category: 'Educación',
      description: 'Mantenimiento preventivo integral en campus universitario de alto valor histórico.',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLvhSuTc1eyRpuMpA4K-bbcudKsKY0gISL7Thvux4ozn5EcIFGLsHJtnhFC1wfmgBWw-g5zMuPMt2L0eE51R7J-F2ZlEIzW0yq3aaEX2IqjmHa5ogyo_20btf5nG3_OOlO_1rdm8zs-1jNVUQBXFC-4iRE8oS2KL9NrunhEQ7tRCOoZq5VMV_k_H3xkOr5g5NeJJc0T3VyM1WkObigczzx8IKRON0FaQj0xgWEgSQo834Oiw11WAyBkKmB9M',
      colSpan: 'md:col-span-7',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Valdebebas',
      category: 'Desarrollo Urbano',
      description: 'Intervención a gran escala en infraestructura urbana residencial, garantizando durabilidad y estética arquitectónica.',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLv4NUv0Pw-opYChkz7LTy4_BDn45KNwfQyrJAJdnINC0zD16TDSrPZTOb3CxMU3Cbswzji5qwYzW7UeOHLlMWqpfCv3ttlW6s98LLhGfADWfHALOfA3lWnNIFqMrV4Yd-jetJ0Lc4vLKMzNDMqfqTMxddwzWMBE6HNl_I2rlNc4tGEB3LsNAzYmLN3sGr6CkpyRFtmNxC74TRgosRmv-_blmR6FSgLHD3JOBPrCP9wQyi5CPKoKl7cIVMSQ',
      colSpan: 'md:col-span-12',
      imageHeight: 'h-[450px]'
    },
    {
      title: 'Mallplaza',
      category: 'Retail',
      description: 'Soluciones de recubrimiento técnico para zonas de alto tránsito peatonal.',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLvfXEXgD8Z49yUMwnflkMWNjFgejh9ZaPa0W9cxEcl5Sxr97IeuEcb2M6ResXQ3McAijZD3mLHmEYe0P0eJsSvLonWV1oMLDBskhfuU4wHbmPe16-QzoTCz-ZB1bR8M6sVJAF6gds3KgoFL__KMJaHuHFGc9tcTdvh9ZSxIO0MzA-68CeIPMOeZdWh2Td5eVU8KX6H3Y2t-1I7OQ-6u87NvUvZ8UlKy3-0N-weRzVOLkTTm1xNxFI35-pg',
      colSpan: 'md:col-span-6',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Jardín Plaza',
      category: 'Comercial',
      description: 'Restauración estética y protección climática en complejos comerciales abiertos.',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLuYApPu1voGUIqxkPPdkNPnUimEEXbEY7f8_s-WQAfxNLJHQMEKaDeoTjygbJdCUe2pfEqzuuTE93xErqzFTRjpYM0XLpZoDVrqoQj_7d1uhOGU5baiOufbmSPeVOTH0SQ-Fnt1z6kaNWWdtPytwO58VhSA7kPyRTTHr6JM7e1xD9aE1TmBKIrmrnOqoAE4j4vCPLfm1TauGG_gljgbceYuaiXhv8fPBIrZsVxjlgjtceC-2UJhsFBrdsNx',
      colSpan: 'md:col-span-6',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Ciudad La Salle',
      category: 'Residencial',
      description: 'Mantenimiento de fachadas y sistemas de impermeabilización en gran conjunto residencial.',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLuJyrOglEZ37g6bjujMjrsSfqfkn0bEQWmazhz8XvesJZQ7Yzqs-LEgc24dECjVUND4F6_nfURMlFYNHd_iuYvvuhYmVk5XOgLQNWMhJV4pWCdzYfRgxD45zgiiC5w9pWuYTsof5PEw9oVS5bG9MYz9PYRk8gPL9-pN0ScPsUBO9z71QsQhECeSuBtA62r6ex90VjcydLz5hadmPq9plCKEy4jYIb4eQSnMndV_-6a4BKS7P9M3T5xMJMs',
      colSpan: 'md:col-span-7',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Aspaen',
      category: 'Educación',
      description: 'Protección estructural y renovación de cubiertas en instalaciones educativas campestres.',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLt0uqx4jemo2qKZqiD2KOH0OigZl5e8BYYHbI-niAdnkCsI2dnIewd0ITfMQSivydDQF9JWo_iglSKud2iwl4L_rnEWPqdb_zqISExvxqE-_roCytDzN2k4evk6v63uJ7mOxHpQXn318yBp5J-u1cU4NVVLeb-lQhC43xINAPKoi_MaFwEa51WyWI1kQzwV7mqLE0w3YLGm-jxNRPtVsoflwYy_LW-oVYhAXixyxS6BIKBEj-1FPVzW5nOj',
      colSpan: 'md:col-span-5',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Cantina La 15',
      category: 'Restauración',
      description: 'Tratamientos especializados para superficies en ambientes gastronómicos de alta gama.',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLu6h6ifXi1JHdVNynf4fq-xen3taNluyYmXNf5a044j5rd9woLIOsOQ1q9VAWjvxFNmf_c8VPGQZFH_WSxfNphn5e4PELFb1ZegMQlwAnvdINzXbb_m-J9-IiufkX-6fWNZRSWb3m-fN0RtV0J3WlFEIOTiYAUszcrJc0tkr1kFg1YjqyKZFGWw9pFfFJGfllCLaCLDxN2zYHw2B1rHMeejuR0rn2wIhcR4TfoE2v1Hvv67jw4vFAyLIBef',
      colSpan: 'md:col-span-6',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Avidanti',
      category: 'Salud',
      description: 'Mantenimiento técnico y sellado aséptico en infraestructuras hospitalarias de alta complejidad.',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLtzS-gD2rLi95ODX8eDUhiBPFZ41F-aOFDln-LHSKMfB7D7wfkRxpgIfPiqE88EbSgv6rqIbVDlt7wxw48cYnyi3YK5wkDs5oU6RjNs7vYUXj73UUVXgORD44FbPj2CcS718vqzXPjZ3ZPX7PvP_fBHBuc3hM81l9-bIopwrmC4du4padKgwlKmR8HBHK8I7KDTw-5Wui4SyWnSIwMxo29J3ewLXcWk5Vf37L_XdbvLVaYk9a3VVCAqW1_F',
      colSpan: 'md:col-span-6',
      imageHeight: 'h-[300px]'
    }
  ];

  return (
    <div className="flex-grow pt-[100px] text-on-surface">
      {/* Hero Section */}
      <header className="relative py-24 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Hero Background" 
            className="w-full h-full object-cover object-center opacity-80" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwUBV3A2IiYvG9inHKqmQ4s98ilo-gyvRSk4nT2-O4il9V9HpWS0h9bImWQEoESSwNNoVL43s7-FmJ-lswni0oQ5KVy1Z4lLZRBxnz5v_t8fUW3lNEDCL6QI39eEv8k-13XKG0s6m6K1XYeLc7E-kA-V3vTO36J6bkIi0loYURWYEqlBZP2IJzyQaVGVra3PNGkzuGcrVa9nzwKnol3n0LtgX6g4NCA2t2hcgnhdd4tg3WCc0XgNFvV_K0WPNJV3eSXcFTyI263i5T" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/60 mix-blend-multiply backdrop-blur-[1px]" style={{ backgroundColor: '#001c3a' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 pt-8">
          <div className="md:col-span-7 space-y-6 text-left">
            <h1 className="font-display font-bold text-5xl md:text-7xl text-white leading-tight">Casos de Éxito</h1>
            <p className="font-sans text-2xl font-bold text-secondary tracking-tight">¡Precisión arquitectónica demostrada!</p>
          </div>
          
          <div className="md:col-span-5 mt-10 md:mt-0">
            <div className="p-8 rounded-xl shadow-2xl relative border-none bg-white/10 backdrop-blur-md">
              <h3 className="font-display font-bold text-2xl text-white mb-6 text-left">Solicite información</h3>
              <form className="space-y-4">
                <div>
                  <input 
                    className="w-full bg-white/20 border border-white/20 rounded px-4 py-3 text-white focus:outline-none focus:border-secondary transition-colors font-sans text-sm placeholder:text-white/60" 
                    placeholder="Nombre" 
                    type="text" 
                  />
                </div>
                <div>
                  <input 
                    className="w-full bg-white/20 border border-white/20 rounded px-4 py-3 text-white focus:outline-none focus:border-secondary transition-colors font-sans text-sm placeholder:text-white/60" 
                    placeholder="Email" 
                    type="email" 
                  />
                </div>
                <div>
                  <input 
                    className="w-full bg-white/20 border border-white/20 rounded px-4 py-3 text-white focus:outline-none focus:border-secondary transition-colors font-sans text-sm placeholder:text-white/60" 
                    placeholder="Teléfono" 
                    type="tel" 
                  />
                </div>
                <button 
                  className="w-full bg-secondary text-white font-sans font-bold py-4 rounded hover:bg-secondary/90 transition-colors uppercase tracking-wider text-sm mt-2" 
                  type="button"
                >
                  Enviar
                </button>
                <p className="text-xs text-white/60 text-center mt-4">He leído y acepto la Política de privacidad.</p>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Projects Grid (Bento/Masonry Inspired) */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-24 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {cases.map((project, idx) => (
            <article 
              key={idx} 
              className={`${project.colSpan} group cursor-pointer bg-white border border-slate-200 overflow-hidden rounded-xl hover:-translate-y-1 hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col`}
            >
              <div className={`relative w-full overflow-hidden ${project.imageHeight}`}>
                <img 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                  src={project.image} 
                />
                <div className="absolute top-6 left-6">
                  <span className="inline-block bg-primary text-white px-3 py-1 font-sans font-bold text-[10px] uppercase tracking-widest rounded-sm shadow-sm" style={{ backgroundColor: '#003b70' }}>
                    {project.category}
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8 flex-grow flex flex-col text-left">
                <h3 className="font-display font-bold text-2xl md:text-3xl text-primary mb-3">{project.title}</h3>
                <p className="font-sans text-sm md:text-base text-slate-600 mb-0 leading-relaxed max-w-2xl">{project.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Metrics/Impact Section */}
      <section className="bg-primary text-white py-20 mb-24" style={{ backgroundColor: '#003b70' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-600/50">
            <div className="md:pr-12 pt-8 md:pt-0">
              <h4 className="font-display font-bold text-5xl md:text-6xl mb-3 text-white">+300</h4>
              <p className="font-sans font-bold text-xs text-blue-200 uppercase tracking-widest">Clientes Confían</p>
            </div>
            <div className="md:px-12 pt-8 md:pt-0">
              <h4 className="font-display font-bold text-5xl md:text-6xl mb-3 text-white">+1000</h4>
              <p className="font-sans font-bold text-xs text-blue-200 uppercase tracking-widest">Proyectos Ejecutados</p>
            </div>
            <div className="md:pl-12 pt-8 md:pt-0">
              <h4 className="font-display font-bold text-5xl md:text-6xl mb-3 text-white">+6M</h4>
              <p className="font-sans font-bold text-xs text-blue-200 uppercase tracking-widest">Metros Cuadrados Protegidos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 text-center mb-24">
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
      </section>
    </div>
  );
}

