'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function LoadingSpinner() {
  return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
          <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-6 relative" strokeWidth={2.5} />
        </div>
        <p className="text-slate-600 text-base font-medium">Loading trending videos...</p>
      </div>
    </div>
  );
}

