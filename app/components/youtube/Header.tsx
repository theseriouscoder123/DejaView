'use client';

import React from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Country } from '@/app/types/youtube.types';
import CountrySelector from './CountrySelector';
import { COUNTRIES, CATEGORIES } from '@/app/config/youtube.config';

interface HeaderProps {
  selectedCountryData?: Country;
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
  showCountryDropdown: boolean;
  onToggleCountryDropdown: () => void;
  onCountrySelect: (code: string) => void;
  selectedCategory: string;
  onCategorySelect: (id: string) => void;
}

export default function Header({
  selectedCountryData,
  lastUpdated,
  loading,
  onRefresh,
  showCountryDropdown,
  onToggleCountryDropdown,
  onCountrySelect,
  selectedCategory,
  onCategorySelect,
}: HeaderProps) {
  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-viral" />
            <h1 className="text-2xl font-bold">DejaView</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Country Selector Dropdown */}
            <CountrySelector
              countries={COUNTRIES}
              selectedCountry={selectedCountryData}
              showDropdown={showCountryDropdown}
              onToggle={onToggleCountryDropdown}
              onSelect={onCountrySelect}
            />

            <div className="text-sm text-secondary">
              Last updated: {lastUpdated?.toLocaleTimeString() ?? 'N/A'}
            </div>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 glass-card-light rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:animate-spin"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        
      </div>
    </nav>
  );
}

