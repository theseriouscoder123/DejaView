'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
// Assuming CHART_COLORS is an object like { viral: '...', warning: '...', ... }
import { CHART_COLORS } from '@/app/config/youtube.config'; 
import { Video } from '@/app/types/youtube.types';

interface IntelligenceTabProps {
  wordFrequency: [string, number][];
  recencyData: any[];
  filteredVideos: Video[]; // Assuming Video type has a 'lang' property
}

// Tooltip for Recency Bar Chart
const RecencyTooltip = ({ active, payload }: any) => {
  if (active && payload?.[0]) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 rounded-lg">
        <p className="text-sm font-semibold">{data.bucket}</p>
        <p className="text-sm">Count: {payload[0].value}</p>
        <p className="text-xs text-secondary">{data.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

// Tooltip for Language Pie Chart
const LanguageTooltip = ({ active, payload }: any) => {
  if (active && payload?.[0]) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 rounded-lg">
        <p className="text-sm font-semibold">{data.name}</p>
        <p className="text-sm">Count: {data.value}</p>
        <p className="text-xs text-secondary">
          {/* @ts-ignore */}
          {payload[0].percent?.toFixed(0)}% of total
        </p>
      </div>
    );
  }
  return null;
};

// Helper for custom labels on the pie chart
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't render label if slice is too small

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function IntelligenceTab({
  wordFrequency,
  recencyData,
  filteredVideos
}: IntelligenceTabProps) {
  
  // Colors for Recency Bar Chart
  const barColors = [
    CHART_COLORS.viral,
    CHART_COLORS.warning,
    CHART_COLORS.info,
    CHART_COLORS.secondary,
  ];

  // Colors for Language Pie Chart
  const pieColors = [
    CHART_COLORS.viral,
    CHART_COLORS.info,
    '#FFBB28', // A yellow
    '#FF8042', // An orange
    CHART_COLORS.warning,
    '#00C49F', // A teal
    CHART_COLORS.secondary,
    '#8884d8', // A purple
  ];
  
  // Process data for Language Pie Chart
  const languageData = React.useMemo(() => {
    const langMap = new Map();
    
    // Simple map to convert common lang codes to names
const getLanguageName = (langCode:string) => {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
    return displayNames.of(langCode);
  } catch (error) {
    console.error(`Invalid language code provided: ${langCode}`, error);
    return langCode;
  }
};

    filteredVideos.forEach(video => {
      // Use video.lang, default to 'Unknown'
      const langCode = video.lang || 'Unknown';
      
      // Try to get the base language (e.g., 'en' from 'en-IN')
      const baseLang = langCode.split('-')[0];
      
      // Find the name: specific (en-IN), base (en), or the code itself
      const langName = getLanguageName(langCode)
        || getLanguageName(baseLang)
          
                     || langCode.toUpperCase();
      
      langMap.set(langName, (langMap.get(langName) || 0) + 1);
    });

    // Convert map to array format for recharts
    return Array.from(langMap.entries()).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort descending
  }, [filteredVideos]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Content Intelligence</h2>

      <div className="space-y-6">
        {/* Word Cloud & Keywords */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Title DNA Analyzer</h3>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <h4 className="text-sm font-medium text-secondary mb-4">
                Word Cloud
              </h4>
              <div className="flex flex-wrap gap-3 items-center justify-center p-8 glass-card-light rounded-lg min-h-[300px]">
                {wordFrequency.map(([word, freq], idx) => (
                  <span
                    key={word}
                    className="cursor-pointer hover:scale-110 transition-transform font-bold"
                    style={{
                      fontSize: `${
                        12 + (freq / (wordFrequency[0]?.[1] || 1)) * 24
                      }px`,
                      color: `hsl(${(idx * 30) % 360}, 70%, 60%)`,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-sm font-medium text-secondary mb-4">
                Top Keywords
              </h4>
              <div className="space-y-2">
                {wordFrequency.slice(0, 10).map(([word, freq]) => (
                  <div key={word} className="flex items-center gap-3">
                    <span className="text-sm w-24 truncate">{word}</span>
                    <div className="flex-1 bg-card rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-viral to-success h-full rounded-full"
                        style={{
                          width: `${
                            (freq / (wordFrequency[0]?.[1] || 1)) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-secondary w-8 text-right">
                      {freq}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- CHARTS ROW: Recency & Language Distribution --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recency Distribution */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Recency Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="bucket" stroke={CHART_COLORS.secondary} />
                <YAxis stroke={CHART_COLORS.secondary} />
                <Tooltip content={<RecencyTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {recencyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColors[index % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Language Distribution */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Language Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip content={<LanguageTooltip />} />
                <Legend />
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* --- END CHARTS ROW --- */}

      </div>
    </div>
  );
}

