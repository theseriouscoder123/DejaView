'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  ChartScatter,
  ChartNoAxesCombined,
  Lightbulb,
  Telescope,
  Circle,
} from 'lucide-react';

// --- Icon Helper ---
const getIcon = (tabName, props = {}) => {
  const iconProps = { size: 22, ...props };
  switch (tabName.toLowerCase()) {
    case 'overview':
      return <LayoutDashboard {...iconProps} />;
    case 'analytics':
      return <ChartScatter {...iconProps} />;
    case 'leaderboard':
      return <ChartNoAxesCombined {...iconProps}/>;
    case 'intelligence':
      return <Lightbulb {...iconProps} />;
    case 'explorer':
      return <Telescope {...iconProps} />;
    default:
      return <Circle {...iconProps} />;
  }
};

// --- Capitalize Helper ---
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// --- ResponsiveSidebar Component ---
interface ResponsiveSidebarProps {
  tabs: string[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isExpanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

export default function ResponsiveSidebar({
  tabs,
  activeTab,
  onSelectTab,
  isExpanded,
  setExpanded,
}: ResponsiveSidebarProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Hidden on mobile) - Fixed width, no expansion */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-20 w-20 bg-white"
      >
        <nav className="flex-1 px-4 py-6 mt-24">
          {/* Nav Items */}
          <ul className="space-y-3">
            {tabs.map((tab) => (
              <li key={tab} className="relative">
                <button
                  onClick={() => onSelectTab(tab)}
                  onMouseEnter={() => setHoveredTab(tab)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`
                    flex items-center justify-center w-full h-12 rounded-lg
                    text-gray-600 
                    hover:bg-gray-100 
                    hover:text-gray-900 
                    transition-all duration-200
                    ${
                      activeTab === tab
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : ''
                    }
                  `}
                >
                  <div className="flex-shrink-0">
                    {getIcon(tab, { size: 20, strokeWidth: activeTab === tab ? 2.5 : 2 })}
                  </div>
                </button>
                
                {/* Tooltip */}
                {hoveredTab === tab && (
                  <div
                    className="
                      absolute left-full ml-2 top-1/2 -translate-y-1/2
                      px-3 py-2 rounded-lg
                      bg-gray-900 text-white text-sm font-medium
                      whitespace-nowrap
                      pointer-events-none
                      shadow-lg
                      z-50
                      animate-in fade-in slide-in-from-left-1 duration-200
                    "
                  >
                    {capitalize(tab)}
                    {/* Arrow */}
                    <div
                      className="
                        absolute right-full top-1/2 -translate-y-1/2
                        border-4 border-transparent border-r-gray-900
                      "
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* 2. MOBILE BOTTOM NAV (Hidden on desktop) - Unchanged */}
      <nav
        className="
          md:hidden fixed bottom-0 left-0 w-full h-16 z-20
          bg-white border-t 
          flex justify-around items-center
        "
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onSelectTab(tab)}
            className={`
              flex flex-col items-center justify-center w-full h-full
              rounded-lg
              transition-all duration-200
              ${
                activeTab === tab
                  ? 'text-blue-600 '
                  : 'text-gray-500 hover:text-blue-500'
              }
            `}
          >
            {getIcon(tab, { size: 20, strokeWidth: activeTab === tab ? 2.5 : 2 })}
            <span className="text-xs font-medium mt-1">{capitalize(tab)}</span>
          </button>
        ))}
      </nav>
    </>
  );
}