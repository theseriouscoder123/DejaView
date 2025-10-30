'use client';
import React, { ReactElement } from 'react';

interface MetricCardProps {
  icon: ReactElement<{ className?: string }>;
  label: string;
  value: string | number;
  subtitle?: string;
  color: 'info' | 'success' | 'viral' | 'warning';
}

const colorClasses = {
  info: { bg: 'bg-info', text: 'text-info' },
  success: { bg: 'bg-success', text: 'text-success' },
  viral: { bg: 'bg-viral', text: 'text-viral' },
  warning: { bg: 'bg-warning', text: 'text-warning' },
};

export default function MetricCard({
  icon,
  label,
  value,
  subtitle,
  color,
}: MetricCardProps) {
  const classes = colorClasses[color] || colorClasses.info;
  
  return (
    <div className="glass-card rounded-xl p-6 hover:scale-105 transition-transform">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${classes.bg} bg-opacity-20`}>
          {React.cloneElement(icon, {
            className: 'w-6 h-6 text-white',
          })}
        </div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-secondary">{label}</div>
      {subtitle && <div className="text-xs text-secondary mt-1">{subtitle}</div>}
    </div>
  );
}