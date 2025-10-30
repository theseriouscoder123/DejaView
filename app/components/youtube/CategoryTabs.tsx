'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Music, Gamepad2, Film, Newspaper, Lightbulb, Dumbbell, Utensils } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  icon: React.ElementType;
};

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelect: (id: string) => void;
}

export default function CategoryTabs({
  categories = [],
  selectedCategory,
  onSelect,
}: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 10);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const newScrollLeft =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative group" style={{ backgroundColor: '#F1F5F9' }}>
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-200">
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </div>
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex gap-2 min-w-min px-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onSelect(category.id)}
                className={`group/btn px-4 py-2.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover/btn:scale-110 ${
                  selectedCategory === category.id ? 'text-white' : 'text-slate-600'
                }`} />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-200">
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </div>
        </button>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}