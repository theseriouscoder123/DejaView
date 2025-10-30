'use client';
import React from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Country } from '@/app/types/youtube.types';
import CountrySelector from './CountrySelector';
import { COUNTRIES, CATEGORIES } from '@/app/config/youtube.config';
import Image from 'next/image';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="DejaView Logo"
              width={42}
              height={42}
            />
            <h1 className="text-2xl font-bold">DejaView</h1>
          </div>
          <div className="flex items-center gap-4">
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
              className="p-2 glass-card-light rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Row: Logo, Title, and Refresh */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="DejaView Logo"
                width={32}
                height={32}
              />
              <h1 className="text-xl font-bold">DejaView</h1>
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 glass-card-light rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Bottom Row: Country Selector and Last Updated */}
          <div className="flex items-center justify-between gap-3">
            <CountrySelector
              countries={COUNTRIES}
              selectedCountry={selectedCountryData}
              showDropdown={showCountryDropdown}
              onToggle={onToggleCountryDropdown}
              onSelect={onCountrySelect}
            />
            <div className="text-xs text-secondary whitespace-nowrap">
              {lastUpdated?.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) ?? 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}