'use client';

import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Country } from '@/app/types/youtube.types';

interface CountrySelectorProps {
  countries: Country[];
  selectedCountry?: Country;
  showDropdown: boolean;
  onToggle: () => void;
  onSelect: (code: string) => void;
}

export default function CountrySelector({
  countries,
  selectedCountry,
  showDropdown,
  onToggle,
  onSelect,
}: CountrySelectorProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="glass-card px-4 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {selectedCountry?.flag} {selectedCountry?.name}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 glass-card rounded-lg shadow-2xl overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => onSelect(country.code)}
                className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 ${
                  selectedCountry?.code === country.code ? 'bg-white/5' : ''
                }`}
              >
                <span className="text-xl">{country.flag}</span>
                <span className="text-sm">{country.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

