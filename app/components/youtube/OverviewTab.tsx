'use client';
import React, { useMemo } from 'react';
import { Eye, Heart, Target, Zap } from 'lucide-react';
import MetricCard from './MetricCard';
import { formatNumber } from '@/app/utils/youtube.utils';
import { Video, Category } from '@/app/types/youtube.types';
// Import recharts components for the pie chart
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface OverviewTabProps {
  metrics: {
    avgViews: number;
    avgEngagement: number;
    hotNow: number;
  } | null;
  filteredVideos: Video[];
  categories: Category[]
}

// Define a color palette for the chart
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#DA627D',
  '#62B6CB',
  '#FB6107',
  '#A0E7E5',
  '#B4F8C8',
];

export default function OverviewTab({
  metrics,
  filteredVideos,
  categories,
}: OverviewTabProps) {
  const totalViews = filteredVideos.reduce((sum, v) => sum + v.viewCount, 0);
  const totalLikes = filteredVideos.reduce((sum, v) => sum + v.likeCount, 0);
  const totalComments = filteredVideos.reduce(
    (sum, v) => sum + v.commentCount,
    0
  );

// --- Logic for Pie Chart Data ---
  // 1. Create a lookup map for category IDs to names
  const categoryMap = useMemo(
    () =>
      categories.reduce(
        (acc, category) => {
          acc[category.id] = category.name;
          return acc;
        },
        {} as { [key: string]: string }
      ),
    [categories]
  ); // Memoize to avoid re-calculating on every render

  // 2. Count videos by categoryId
  const categoryCounts = filteredVideos.reduce(
    (acc, video) => {
      const category = video.categoryId;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as { [key: string]: number }
  );

  // 3. Format data for recharts, mapping ID to name
  const chartData = Object.entries(categoryCounts)
    .map(([id, count]) => ({
      name: categoryMap[id] || `Unknown (${id})`, // Use the map, with a fallback
      value: count,
    }))
    .sort((a, b) => b.value - a.value); // Sort descending by count
 

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        Overview
      </h2>
      {/* Hero Metrics */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={<Eye className="w-6 h-6" />}
          label="Average Views"
          value={formatNumber(metrics?.avgViews || 0)}
          color="info"
        />
        <MetricCard
          icon={<Heart className="w-6 h-6" />}
          label="Avg Engagement Rate"
          value={`${metrics?.avgEngagement.toFixed(2)}%`}
          color="success"
        />
        <MetricCard
          icon={<Zap className="w-6 h-6" />}
          label="Hot Now"
          value={metrics?.hotNow || 0}
          subtitle="< 24 hours"
          color="viral"
        />
      </div>

      {/* Quick Stats */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 glass-card-light rounded-lg">
            <p className="text-2xl font-bold text-success">
              {filteredVideos.length}
            </p>
            <p className="text-sm text-secondary mt-1">Total Videos</p>
          </div>
          <div className="text-center p-4 glass-card-light rounded-lg">
            <p className="text-2xl font-bold text-viral">
              {formatNumber(totalViews)}
            </p>
            <p className="text-sm text-secondary mt-1">Total Views</p>
          </div>
          <div className="text-center p-4 glass-card-light rounded-lg">
            <p className="text-2xl font-bold text-warning">
              {formatNumber(totalLikes)}
            </p>
            <p className="text-sm text-secondary mt-1">Total Likes</p>
          </div>
          <div className="text-center p-4 glass-card-light rounded-lg">
            <p className="text-2xl font-bold text-info">
              {formatNumber(totalComments)}
            </p>
            <p className="text-sm text-secondary mt-1">Total Comments</p>
          </div>
        </div>
      </div>

      {/* --- NEW: Category Distribution Pie Chart --- */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">
          Video Category Distribution
        </h3>
        {chartData.length > 0 ? (
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${((percent as number) * 100).toFixed(0)}%)`
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} videos`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.8)', // bg-slate-800 with opacity
                    borderColor: 'rgba(51, 65, 85, 0.5)', // border-slate-700
                    borderRadius: '0.5rem', // rounded-lg
                    color: '#ffffff', // text-white
                  }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-secondary">
            <p>No category data available to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}

