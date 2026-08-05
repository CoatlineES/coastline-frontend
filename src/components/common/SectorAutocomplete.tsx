import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const PREDEFINED_SECTORS = [
  'Constructoras',
  'Comunidades de Propietarios',
  'Instituciones Públicas',
  'Naves Industriales',
  'Hoteles / Centros Comerciales',
  'Particulares'
];

interface SectorAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  existingSectors?: string[];
}

export function SectorAutocomplete({ value, onChange, placeholder = 'Ej. Constructoras', className = '', existingSectors = [] }: SectorAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Combine predefined sectors with existing unique sectors from the database, removing duplicates
  const allSectors = Array.from(new Set([...PREDEFINED_SECTORS, ...existingSectors]));

  // Filter options based on current value, but show all if value is empty or exact match
  const filteredOptions = allSectors.filter(sector => 
    sector.toLowerCase().includes(value.toLowerCase())
  );

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pr-8 ${className}`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
          >
            <ul className="max-h-60 overflow-y-auto py-1 hide-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((sector) => (
                  <li
                    key={sector}
                    onClick={() => {
                      onChange(sector);
                      setIsOpen(false);
                    }}
                    className="px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                  >
                    {sector}
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-slate-400 italic text-center">
                  Presiona Enter para usar "{value}"
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
