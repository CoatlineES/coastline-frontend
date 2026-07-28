import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Layers, List, FileText, BookOpen } from 'lucide-react';
import ResourcesView from './ResourcesView';
import ApusView from './ApusView';

import PartidasView from './PartidasView';
import CapitulosView from './CapitulosView';
import ClausesLibraryView from './ClausesLibraryView';
import PlantillasView from './PlantillasView';

type LibrarySubTab = 'recursos' | 'apus' | 'partidas' | 'capitulos' | 'clausulas' | 'plantillas';

export default function LibraryView() {
  const [activeSubTab, setActiveSubTab] = useState<LibrarySubTab>('recursos');

  const subTabs = [
    { id: 'recursos', label: 'Recursos', icon: <Database size={16} /> },
    { id: 'apus', label: 'APUs', icon: <Layers size={16} /> },
    { id: 'partidas', label: 'Partidas', icon: <List size={16} /> },
    { id: 'capitulos', label: 'Capítulos', icon: <BookOpen size={16} /> },
    { id: 'clausulas', label: 'Cláusulas', icon: <FileText size={16} /> },
    { id: 'plantillas', label: 'Plantillas', icon: <BookOpen size={16} /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Sub-menú de botones redondeados */}
      <div className="flex items-center gap-3 mb-6">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as LibrarySubTab)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeSubTab === tab.id
                ? 'bg-[#001c3a] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <motion.div
        key={activeSubTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]"
      >
        {activeSubTab === 'recursos' && <ResourcesView />}
        {activeSubTab === 'apus' && <ApusView />}
        {activeSubTab === 'partidas' && <PartidasView />}
        {activeSubTab === 'capitulos' && <CapitulosView />}
        {activeSubTab === 'clausulas' && <ClausesLibraryView />}
        {activeSubTab === 'plantillas' && <PlantillasView />}
        {activeSubTab !== 'recursos' && activeSubTab !== 'apus' && activeSubTab !== 'partidas' && activeSubTab !== 'capitulos' && activeSubTab !== 'clausulas' && activeSubTab !== 'plantillas' && (
          <div className="flex items-center justify-center h-full text-slate-500 p-16">
            <p>Módulo de {subTabs.find(t => t.id === activeSubTab)?.label} en construcción...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
