'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
}

export default function ExportButton({ onExport }: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      className="fixed bottom-18 md:bottom-8 right-8 w-14 h-14 rounded-full bg-viral flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40"
      title="Export Data"
    >
      <Download className="w-6 h-6 text-white" />
    </button>
  );
}

