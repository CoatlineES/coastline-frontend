/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Share2, 
  Plus, 
  Minus, 
  Send, 
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { FAQS } from '../data';
import { ScreenId } from '../types';

interface ContactViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function ContactView({ onNavigate }: ContactViewProps) {
  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'El nombre completo es requerido.';
    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El formato de correo no es válido.';
    }
    if (!phone.trim()) {
      newErrors.phone = 'El teléfono es requerido.';
    }
    if (!message.trim()) {
      newErrors.message = 'Describa brevemente sus necesidades.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <div className="flex-grow pt-[100px]">
      {/* Hero Section */}
      <section className="bg-primary relative overflow-hidden text-white py-24 px-6 md:px-16 text-center md:text-left" style={{ backgroundColor: '#003b70' }}>
        <div className="absolute inset-0 opacity-10 mix-blend-overlay">
          <img 
            alt="Architecture background" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9BEvloOfydznnESnzbMl3-9JLawRIRwlrwiflL35JkAOrWMuAZrXN0RB-plm-zUgI3xVbNluEq52QJcMGIxg22R4EFji_Wej0RRQrqPlAFHixr-LqgCAf47tMUMSTjNh45z-UUSOyTz-W6h0Qo8wfA_S7aDS_05myGlhtzCZRNAdLosKQW_61-m_6JLBBykZCDL0TeoHD59e2mXr-9PkaaPhqZupFb8wphi5W-cMyRpKG1VIKbV267VOdSVnB1kYQThC0ZWlPlfn6"
          />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="font-display font-bold text-4xl md:text-6xl mb-6 text-white">Contáctenos</h1>
          <p className="font-sans text-lg text-white/80 max-w-2xl">Estamos aquí para ayudarle a proteger su inversión arquitectónica.</p>
        </div>
      </section>

      {/* Main Content Info + Form */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column: Contact Details */}
          <div className="col-span-1 lg:col-span-4 space-y-12">
            <div>
              <h2 className="font-display font-bold text-3xl text-primary mb-8">Nuestra Presencia</h2>
              
              <div className="space-y-6">
                {/* Sede Central Card */}
                <div className="bg-white p-6 rounded-xl border border-surface-variant shadow-sm text-left">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg text-slate-600 shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-lg text-slate-800 mb-2">Sede Central</h3>
                      <p className="text-slate-600 font-sans text-sm leading-relaxed">
                        Calle de la Resina, 35.<br />
                        Nave 7, 28021 Madrid.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid for Phone and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-xl border border-surface-variant shadow-sm hover:border-primary/30 transition-colors text-left">
                    <div className="text-primary mb-4">
                      <Phone size={20} className="text-primary" />
                    </div>
                    <h3 className="font-sans font-bold text-slate-800 mb-1 text-sm">Teléfono</h3>
                    <p className="text-slate-600 font-sans text-sm">+34 91 491 61 97</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-surface-variant shadow-sm hover:border-primary/30 transition-colors text-left">
                    <div className="text-primary mb-4">
                      <Mail size={20} className="text-primary" />
                    </div>
                    <h3 className="font-sans font-bold text-slate-800 mb-1 text-sm">Email</h3>
                    <p className="text-slate-600 font-sans text-sm break-all">comercial@coatline.es</p>
                  </div>
                </div>

                {/* Stylized Map Placeholder */}
                <div className="w-full h-64 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop&grayscale')] bg-cover bg-center opacity-50 mix-blend-luminosity group-hover:opacity-70 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-primary/5 mix-blend-multiply"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <MapPin size={32} className="text-secondary drop-shadow-md fill-secondary" />
                    <div className="w-8 h-2 bg-black/20 blur-[2px] rounded-[100%] mt-1"></div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="col-span-1 lg:col-span-8">
            <div className="bg-white p-8 md:p-12 rounded-2xl border border-surface-variant shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left">
              
              {!isSubmitted ? (
                <>
                  <div className="mb-10">
                    <h2 className="font-display font-bold text-3xl text-primary mb-3">Envíenos un Mensaje</h2>
                    <p className="text-slate-600 font-sans text-sm md:text-base">
                      Complete el formulario y nuestro equipo de ingeniería se pondrá en contacto con usted a la brevedad.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="relative">
                        <label className="block font-sans font-bold text-xs text-slate-800 mb-2" htmlFor="name">
                          Nombre Completo
                        </label>
                        <input 
                          type="text" 
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ej. Juan Pérez"
                          className={`w-full bg-slate-50 border-b-2 ${errors.name ? 'border-red-400' : 'border-surface-variant'} focus:border-primary px-4 py-3 text-slate-800 transition-colors outline-none rounded-t-md font-sans text-sm`}
                        />
                        {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.name}</p>}
                      </div>

                      <div className="relative">
                        <label className="block font-sans font-bold text-xs text-slate-800 mb-2" htmlFor="company">
                          Empresa / Estudio
                        </label>
                        <input 
                          type="text" 
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Nombre de su empresa"
                          className="w-full bg-slate-50 border-b-2 border-surface-variant focus:border-primary px-4 py-3 text-slate-800 transition-colors outline-none rounded-t-md font-sans text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="relative">
                        <label className="block font-sans font-bold text-xs text-slate-800 mb-2" htmlFor="email">
                          Correo Electrónico
                        </label>
                        <input 
                          type="email" 
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="su@email.com"
                          className={`w-full bg-slate-50 border-b-2 ${errors.email ? 'border-red-400' : 'border-surface-variant'} focus:border-primary px-4 py-3 text-slate-800 transition-colors outline-none rounded-t-md font-sans text-sm`}
                        />
                        {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.email}</p>}
                      </div>

                      <div className="relative">
                        <label className="block font-sans font-bold text-xs text-slate-800 mb-2" htmlFor="phone">
                          Teléfono
                        </label>
                        <input 
                          type="tel" 
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+34 ..."
                          className={`w-full bg-slate-50 border-b-2 ${errors.phone ? 'border-red-400' : 'border-surface-variant'} focus:border-primary px-4 py-3 text-slate-800 transition-colors outline-none rounded-t-md font-sans text-sm`}
                        />
                        {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block font-sans font-bold text-xs text-slate-800 mb-2" htmlFor="message">
                        Detalles del Proyecto / Consulta
                      </label>
                      <textarea 
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describa brevemente sus necesidades..."
                        rows={5}
                        className={`w-full bg-slate-50 border-b-2 ${errors.message ? 'border-red-400' : 'border-surface-variant'} focus:border-primary px-4 py-3 text-slate-800 transition-colors outline-none resize-none rounded-t-md font-sans text-sm`}
                      ></textarea>
                      {errors.message && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.message}</p>}
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit"
                        className="w-full md:w-auto bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest py-4 px-12 rounded hover:bg-secondary-container transition-all shadow-md hover:shadow-lg hover:-translate-y-1 duration-300 flex items-center justify-center gap-2 group cursor-pointer"
                      >
                        ENVIAR MENSAJE
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-200">
                    <CheckCircle size={36} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-2xl text-primary">Mensaje Enviado</h3>
                    <p className="text-slate-600 font-sans max-w-sm mx-auto text-sm">
                      Gracias, <strong className="text-secondary">{name}</strong>. Hemos recibido la información técnica de su propuesta. Un ingeniero especializado le contactará en un plazo máximo de 2 horas laborables.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
                    <p className="font-bold text-primary uppercase tracking-widest">Resumen de Radicación:</p>
                    <p><strong className="text-slate-400">Canal:</strong> Formulario Técnico Web de Entrada</p>
                    <p><strong className="text-slate-400">Empresa:</strong> {company || 'Particular'}</p>
                    <p><strong className="text-slate-400">Email:</strong> {email}</p>
                    <p><strong className="text-slate-400">Teléfono:</strong> {phone}</p>
                    <p><strong className="text-slate-400">Mensaje:</strong> <span className="italic text-slate-500">{message}</span></p>
                  </div>

                  <button 
                    onClick={handleReset}
                    className="px-6 py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-sans font-bold text-xs rounded transition-colors uppercase tracking-widest cursor-pointer mt-4"
                  >
                    Enviar Otro Mensaje
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-surface-container py-24 px-6 md:px-16 border-t border-surface-variant">
        <div className="max-w-[800px] mx-auto">
          
          <div className="text-center mb-16 space-y-2">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary">Consultas Frecuentes</h2>
            <p className="font-sans text-base text-slate-600">
              Respuestas rápidas a las preguntas más comunes de nuestros clientes.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-white border border-surface-variant rounded-xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-on-surface hover:bg-slate-50 transition-colors text-left"
                  >
                    <h3 className="font-sans font-bold text-base md:text-lg text-slate-800 pr-4">
                      {faq.question}
                    </h3>
                    <span className={`shrink-0 rounded-full p-1.5 transition-colors ${isExpanded ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary'}`}>
                      {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-6 pt-0 border-t border-slate-100 mt-2 text-sm text-slate-600 leading-relaxed bg-[#fcf9f8]/30 text-left">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
