/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenId = 'home' | 'detection' | 'cases' | 'contact' | 'login' | 'legal' | 'privacy' | 'cookies';

export interface LeakIntervention {
  id: string;
  title: string;
  location: string;
  membraneType: string;
  testVoltage: string;
  severity: 'Crítico' | 'Moderado' | 'Leve' | 'Sin Fallo';
  status: 'Completado' | 'En Curso' | 'Bajo Monitoreo' | 'Prioritario';
  timestamp: string;
  technician: string;
  detectedPoints: number;
  description: string;
  efficiencyRating: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  location: string;
  area: string;
  year: string;
  solution: string;
  description: string;
  image: string;
  efficiency: string;
  longevityScore: string;
}
