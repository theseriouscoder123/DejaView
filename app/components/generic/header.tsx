import React from 'react';
import { ChevronRight, ExternalLink, Play } from 'lucide-react';
import Image from 'next/image';

interface DetailsHeaderProps {
  linkUrl: string;
  linkText: string;
  linkIcon?: 'youtube' | 'play';
}

export default function DetailsHeader({ linkUrl, linkText, linkIcon = 'youtube' }: DetailsHeaderProps) {
  // Determine button background color
  const buttonBgColor = linkIcon === 'youtube' ? '#000000' : '#FF0033';

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
              >
                <ChevronRight className="rotate-180 w-7 h-7" />
              </button>
              <Image
                src="/logo.png"
                alt="DejaView Logo"
                width={42}
                height={42}
              />
              <h1 className="text-xl font-bold">DejaView</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
              style={{ backgroundColor: buttonBgColor, color: 'white' }}
            >
              {linkIcon === 'play' ? (
                <Play size={16} fill="white" />
              ) : (
                <ExternalLink size={16} />
              )}
              {linkText}
            </a>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Row: Back Button, Logo, Title */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={() => window.history.back()}
                className="flex-shrink-0 text-secondary hover:text-primary transition-colors"
              >
                <ChevronRight className="rotate-180 w-6 h-6" />
              </button>
              <Image
                src="/logo.png"
                alt="DejaView Logo"
                width={32}
                height={32}
                className="flex-shrink-0"
              />
              <h1 className="text-lg font-bold truncate">DejaView</h1>
            </div>
          </div>

          {/* Compact Mobile Button */}
          <div className="flex justify-end">
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium text-sm"
              style={{ backgroundColor: buttonBgColor, color: 'white' }}
            >
              {linkIcon === 'play' ? (
                <Play size={14} fill="white" />
              ) : (
                <ExternalLink size={14} />
              )}
              {linkText}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
