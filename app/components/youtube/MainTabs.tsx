'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname , useParams} from 'next/navigation';
import {
  LayoutDashboard,
  ChartScatter,
  ChartNoAxesCombined,
  Lightbulb,
  Telescope,
  Circle,
} from 'lucide-react';

// --- Icon Helper ---
const getIcon = (tabName: any, props = {}) => {
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
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// --- Tab Configuration ---
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "analytics", label: "Analytics" },
  { id: "intelligence", label: "Intelligence" },
  { id: "explorer", label: "Explorer" },
];

// --- ResponsiveSidebar Component ---
export default function ResponsiveSidebar() {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const pathname = usePathname();
  const params = useParams<{ country: string; category: string }>();
  const {country, category} = params
  
  // Determine active tab from pathname
  const activeTab = TABS.find(tab => pathname?.includes(`/${country}/${category}/${tab.id}`))?.id || 'overview';

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Hidden on mobile) - Fixed width, no expansion */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-20 w-20 bg-white"
      >
        <nav className="flex-1 px-4 py-6 mt-24">
          {/* Nav Items */}
          <ul className="space-y-3">
            {TABS.map((tab) => (
              <li key={tab.id} className="relative">
                <Link
                  href={`/${country}/${category}/${tab.id == "overview"? "" : tab.id}`}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`
                    flex items-center justify-center w-full h-12 rounded-lg
                    text-gray-600 
                    hover:bg-gray-100 
                    hover:text-gray-900 
                    transition-all duration-200
                    ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : ''
                    }
                  `}
                >
                  <div className="flex-shrink-0">
                    {getIcon(tab.id, { size: 20, strokeWidth: activeTab === tab.id ? 2.5 : 2 })}
                  </div>
                </Link>
                
                {/* Tooltip */}
                {hoveredTab === tab.id && (
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
                    {tab.label}
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

      {/* 2. MOBILE BOTTOM NAV (Hidden on desktop) */}
      <nav
        className="
          md:hidden fixed bottom-0 left-0 w-full h-16 z-20
          bg-white border-t 
          flex justify-around items-center
        "
      >
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`/dashboard/${tab.id}`}
            className={`
              flex flex-col items-center justify-center w-full h-full
              rounded-lg
              transition-all duration-200
              ${
                activeTab === tab.id
                  ? 'text-blue-600 '
                  : 'text-gray-500 hover:text-blue-500'
              }
            `}
          >
            {getIcon(tab.id, { size: 20, strokeWidth: activeTab === tab.id ? 2.5 : 2 })}
            <span className="text-xs font-medium mt-1">{tab.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}