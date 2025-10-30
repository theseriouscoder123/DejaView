'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-12 h-12 text-success animate-spin mx-auto mb-4" />
        <p className="text-secondary text-lg">Loading trending videos...</p>
      </div>
    </div>
  );
}

