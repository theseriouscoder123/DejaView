'use client';

import React, { useState } from 'react';
import { TrendingUp, RefreshCw, Search, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Country } from '@/app/types/youtube.types';
import CountrySelector from './CountrySelector';
import SearchModal from './SearchModal';
import TitleSuggesterModal from '@/app/components/youtube/TitleSuggestorModal';
import { routeYouTubeUrl } from '@/app/services/youtube.api';
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
  trendingTitles?: string[]; // Add this for title suggester
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
  trendingTitles = [],
}: HeaderProps) {
  const router = useRouter();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);

  const handleSearch = async (url: string) => {
    await routeYouTubeUrl(url, router);
  };

  // Get category name from ID


  return (
    <>
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
              
              {/* AI Title Suggester Button */}
              <button
                onClick={() => setShowTitleModal(true)}
                disabled={!trendingTitles.length}
                className="glass-card px-4 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-transform shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-800">AI Titles</span>
              </button>

              {/* Search Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="glass-card px-4 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-transform shadow-sm"
              >
                <Search className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-800">Search YouTube</span>
              </button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Top Row: Logo, Title, Buttons */}
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
              
              <div className="flex items-center gap-2">
                {/* AI Title Button - Mobile */}
                <button
                  onClick={() => setShowTitleModal(true)}
                  disabled={!trendingTitles.length}
                  className="p-2 glass-card rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  title="AI Title Suggester"
                >
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </button>

                {/* Search Button - Mobile */}
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="p-2 glass-card rounded-lg hover:scale-105 transition-transform"
                  title="Search YouTube"
                >
                  <Search className="w-5 h-5 text-gray-700" />
                </button>

                {/* Refresh Button */}
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="p-2 glass-card-light rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Bottom Row: Country Selector */}
            <div className="flex items-center justify-between gap-3">
              <CountrySelector
                countries={COUNTRIES}
                selectedCountry={selectedCountryData}
                showDropdown={showCountryDropdown}
                onToggle={onToggleCountryDropdown}
                onSelect={onCountrySelect}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
      />

      {/* Title Suggester Modal */}
      <TitleSuggesterModal
        isOpen={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        trendingTitles={trendingTitles}
        region={selectedCountryData?.name || 'Global'}
        category={selectedCategory}
      />
    </>
  );
}