/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LeakIntervention, CaseStudy } from './types';

export const LEAK_INTERVENTIONS: LeakIntervention[] = [
  {
    id: 'EFD-2026-001',
    title: 'Cubierta Ajardinada Central',
    location: 'Sede Tecnológica, Las Tablas',
    membraneType: 'PVC Monofilamento 1.8mm',
    testVoltage: '24V DC / Alta Sensibilidad',
    severity: 'Crítico',
    status: 'Prioritario',
    timestamp: 'Hace 2 horas',
    technician: 'Ing. Carlos Ruiz',
    detectedPoints: 4,
    description: 'Filtración activa identificada en el cuadrante nordeste bajo capa de sustrato húmedo. Corriente de fuga localizada con precisión de +/- 5cm.',
    efficiencyRating: '99.4%'
  },
  {
    id: 'EFD-2026-002',
    title: 'Terrazas Ático Residencial',
    location: 'Paseo de la Castellana 140',
    membraneType: 'Betún Elastómero Bicapa',
    testVoltage: '40V DC',
    severity: 'Sin Fallo',
    status: 'Completado',
    timestamp: 'Ayer',
    technician: 'Sra. Elena Gómez',
    detectedPoints: 0,
    description: 'Integridad verificada al 100% sobre toda la superficie transitable. Ensayo de estanqueidad electrónica finalizado sin anomalías detectadas.',
    efficiencyRating: '100%'
  },
  {
    id: 'EFD-2026-003',
    title: 'Cubierta Invertida Nave 3',
    location: 'Polígono Industrial San Fernando',
    membraneType: 'TPO Reforzado 1.5mm',
    testVoltage: '32V DC',
    severity: 'Moderado',
    status: 'En Curso',
    timestamp: 'En tiempo real',
    technician: 'Dr. Alejandro Peña',
    detectedPoints: 2,
    description: 'Escaneo parcial en progreso. Se detecta una microperforación cerca del sumidero principal. Reparando sopleteado térmico local de forma coordinada.',
    efficiencyRating: '92.1%'
  },
  {
    id: 'EFD-2026-004',
    title: 'Plaza Central Ajardinada',
    location: 'Campus Corporativo, Alcobendas',
    membraneType: 'Polietileno de Alta Densidad',
    testVoltage: '15V DC',
    severity: 'Leve',
    status: 'Bajo Monitoreo',
    timestamp: 'Hace 3 días',
    technician: 'Ing. Carlos Ruiz',
    detectedPoints: 1,
    description: 'Fisura capilar controlada en junta de dilatación de impermeabilización. El sellante polimérico se encuentra estable y bajo monitoreo telemétrico.',
    efficiencyRating: '98.5%'
  },
  {
    id: 'EFD-2026-005',
    title: 'Foso Ascensor y Sótano -2',
    location: 'Torre Picasso, Madrid',
    membraneType: 'Poliurea Pura Proyectada',
    testVoltage: '48V DC / Impulsos',
    severity: 'Crítico',
    status: 'Prioritario',
    timestamp: 'Hace 4 horas',
    technician: 'Ing. Marcos Torres',
    detectedPoints: 3,
    description: 'Filtración por presión hidrostática negativa en junta estructural. Emisión de flujo eléctrico de retorno constante. Requiere inyección geotécnica de resinas.',
    efficiencyRating: '88.3%'
  },
  {
    id: 'EFD-2026-006',
    title: 'Cubierta Plana Multicapa',
    location: 'Hospital Infanta Sofía',
    membraneType: 'Ecológica Autoprotegida',
    testVoltage: '20V DC',
    severity: 'Sin Fallo',
    status: 'Completado',
    timestamp: 'Hace 2 días',
    technician: 'Ing. Sra. Elena Gómez',
    detectedPoints: 0,
    description: 'Diagnóstico preventivo anual de estanqueidad. Membrana sana sin poros de corrosión por agentes atmosféricos agresivos.',
    efficiencyRating: '100%'
  },
  {
    id: 'EFD-2026-007',
    title: 'Galería de Servicios Técnicos',
    location: 'Aeropuerto Barajas T4',
    membraneType: 'Membrana de Epoxi Líquida',
    testVoltage: '36V DC',
    severity: 'Moderado',
    status: 'En Curso',
    timestamp: 'Hace 1 hora',
    technician: 'Dr. Alejandro Peña',
    detectedPoints: 1,
    description: 'Ensayo con espectro electromagnético local en zona de pasillos de alta tensión. Localizada fuga difusa en el trasdós del muro cortina.',
    efficiencyRating: '95.0%'
  },
  {
    id: 'EFD-2026-008',
    title: 'Cubierta Metálica Sándwich',
    location: 'Centro Logístico Coslada',
    membraneType: 'FEP Autoadhesiva',
    testVoltage: '12V DC',
    severity: 'Leve',
    status: 'Bajo Monitoreo',
    timestamp: 'Hace 5 días',
    technician: 'Ing. Sra. Elena Gómez',
    detectedPoints: 1,
    description: 'Desprendimiento milimétrico en solape de canalón perimetral. Monitoreo constante de conductividad para evaluar tasa de degradación.',
    efficiencyRating: '97.6%'
  }
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-1',
    title: 'Torre de Cristal, Oficina Principal',
    category: 'Mantenimiento Preventivo',
    location: 'Madrid, España',
    area: '4.200 m²',
    year: '2025',
    solution: 'Detección Electrónica Avanzada EFD & Sellado con Membranas Elásticas de Alto Rendimiento',
    description: 'Diagnóstico no destructivo en la cubierta del rascacielos. Identificamos grietas imperceptibles antes de que afectaran el interior, reduciendo costos de reparación estructural en un 80% mediante micro-intervenciones localizadas en lugar de re-asfaltado completo.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    efficiency: '99.8%',
    longevityScore: '9.8/10'
  },
  {
    id: 'case-2',
    title: 'Museo de Arte Contemporáneo',
    category: 'Restauración Estructural',
    location: 'Bilbao, España',
    area: '2.800 m²',
    year: '2024',
    solution: 'Impermeabilización de Poliurea Fría y Ensayos de Estanqueidad por Sensorizado Eléctrico Continuo',
    description: 'Protección absoluta de galerías de arte que contienen obras invaluables. El sistema Coatline garantiza estanqueidad activa a través de sistemas de alerta basados en resistividad eléctrica de base alcalina.',
    image: 'https://images.unsplash.com/photo-1545641203-7d072a14e3b2?q=80&w=2070&auto=format&fit=crop',
    efficiency: '100%',
    longevityScore: '10/10'
  },
  {
    id: 'case-3',
    title: 'Residencial La Moraleja Premium',
    category: 'Residencial Exclusivo',
    location: 'Alcovemdas, Madrid',
    area: '1.200 m²',
    year: '2025',
    solution: 'Aislamiento de Cubierta Invertida con Detección de Fugas EFD sobre Ajardinamiento Activo',
    description: 'Soporte estético integrado en arquitectura de lujo. Detección permanente de fugas sin necesidad de levantar el sustrato vegetal ni el césped, manteniendo intactos los jardines exteriores flotantes.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    efficiency: '99.5%',
    longevityScore: '9.5/10'
  },
  {
    id: 'case-4',
    title: 'Naves Logísticas Inditex',
    category: 'Industrial',
    location: 'Zaragoza, España',
    area: '12.500 m²',
    year: '2024',
    solution: 'Revestimiento Reforzado con Rejilla EFD de Monitoreo Dinámico Automático',
    description: 'Proyecto industrial a gran escala para asegurar la cadena de suministro logístico. Nuestro sistema de escaneo automático redujo el tiempo de inspección programada de 14 días a solo 3 horas mediante mapeo de voltaje.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
    efficiency: '99.2%',
    longevityScore: '9.2/10'
  },
  {
    id: 'case-5',
    title: 'Edificio Histórico Gran Vía 32',
    category: 'Patrimonio Cultural',
    location: 'Madrid, España',
    area: '3.100 m²',
    year: '2025',
    solution: 'Consolidación de Estanqueidad de Cúpulas Antiguas Mediante Inyección de Microporos y Verificación EFD',
    description: 'Conservación de monumentos protegidos. Aplicamos resinas impermeables de bajísima viscosidad guiadas de forma exacta con cartografía electromagnética Coatline para salvaguardar frescos románicos subyacentes.',
    image: 'https://images.unsplash.com/photo-1568289569204-621caeae10f3?q=80&w=2074&auto=format&fit=crop',
    efficiency: '99.9%',
    longevityScore: '9.9/10'
  }
];

export const FAQS = [
  {
    question: '¿Qué es el ensayo de integridad mediante equipo electrónico (EFD)?',
    answer: 'Es un método de diagnóstico no destructivo extremadamente preciso que utiliza corriente eléctrica de bajo voltaje para detectar la presencia de microporos, fisuras microscópicas o roturas en sistemas de impermeabilización. Una diferencia de potencial eléctrico revela inmediatamente cualquier punto de fuga conectándose a tierra.'
  },
  {
    question: '¿En qué tipo de cubiertas se puede aplicar el ensayo EFD?',
    answer: 'Se puede aplicar con seguridad y rapidez en cubiertas planas, invertidas, transitables, ajardinadas y cubiertas con grava, así como en terrazas y cualquier sistema que emplee membranas sintéticas (PVC, TPO, EPDM, poliureas, o asfalto), siempre que se coloque un elemento conductor inferior o el agua sirva como vector humedecedor.'
  },
  {
    question: '¿Qué ventajas ofrece el EFD frente a la prueba de inundación tradicional?',
    answer: 'El EFD es infinitamente más rápido, no ejerce sobrecargas de peso peligrosas en la estructura con toneladas de agua, y localiza la coordenada exacta (con precisión milimétrica) de la rotura. Además, permite reparar e inspeccionar el mismo día sin paralizar las obras ni mojar los forjados.'
  },
  {
    question: '¿El ensayo electrónico requiere cortar los servicios o la actividad del edificio?',
    answer: 'No. El ensayo EFD de Coatline se realiza íntegramente por el exterior y sin alterar en absoluto el uso diario del inmueble. El bajo voltaje es seguro para personas, mascotas, equipos de telecomunicaciones y redes eléctricas.'
  },
  {
    question: '¿Qué documentación se entrega tras la detección de fugas?',
    answer: 'Entregamos un informe oficial de ingeniería visado por nuestros expertos técnicos que incluye el plano cartográfico de patologías detectadas con fotografía digitalizada de precisión, las coordenadas exactas de las anomalías y las propuestas certificadas de intervención.'
  }
];
