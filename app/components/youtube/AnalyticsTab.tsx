'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

type ScatterDataPoint = {
  x: number;
  y: number;
  title: string;
  views: number;
  engagement: number;
};

type DurationDataPoint = {
  bucket: string;
  count: number;
  avgEngagement: number;
};

const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

type Video = {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: Date;
  thumbnail: string;
  categoryId: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
  ageInHours: number;
  viralVelocity: number;
  successScore: number;
  durationSeconds: number;
  durationBucket: string;
  recencyBucket: string;
  performanceTier: string;
};

const CHART_COLORS = {
  primary: '#8884d8',
  secondary: '#aaaaaa',
  success: '#00F5A0',
  info: '#00B8D4',
  viral: '#FF38B8',
};

interface AnalyticsTabProps {
  scatterData: ScatterDataPoint[];
  topVelocity: Video[];
  durationData: DurationDataPoint[];
  heatmapData: number[][];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload?.[0]) {
    const data = payload[0].payload;
    if ('title' in data) {
      return (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-3 rounded-lg shadow-lg max-w-xs text-gray-900">
          <p className="font-semibold text-sm mb-1 line-clamp-2">
            {data.title}
          </p>
          <p className="text-xs text-gray-700">
            Views: {formatNumber(data.views)}
          </p>
          <p className="text-xs text-gray-700">
            Engagement: {data.engagement.toFixed(2)}%
          </p>
        </div>
      );
    }
    if ('avgEngagement' in data) {
      return (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-3 rounded-lg shadow-lg text-gray-900">
          <p className="text-sm font-semibold">Bucket: {data.bucket}</p>
          <p className="text-sm">Count: {payload[0].value}</p>
          <p className="text-xs text-gray-700">
            Avg Engagement: {data.avgEngagement.toFixed(2)}%
          </p>
        </div>
      );
    }
  }
  return null;
};

export default function AnalyticsTab({
  scatterData,
  topVelocity,
  durationData,
  heatmapData,
}: AnalyticsTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
        <BarChart3 className="w-6 h-6 text-green-500" />
        Analytics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Engagement Quality Matrix
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                type="number"
                dataKey="x"
                name="Views"
                stroke={CHART_COLORS.secondary}
                tickFormatter={formatNumber}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Engagement"
                stroke={CHART_COLORS.secondary}
                tickFormatter={(val) => `${val.toFixed(1)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={scatterData} fill={CHART_COLORS.success} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Viral Velocity</h3>
          <div className="space-y-4">
            {topVelocity.map((video, idx) => (
              <div key={video.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-green-400 text-white flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-20 h-12 rounded object-cover border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-800">
                    {video.title}
                  </p>
                  <p className="text-lg font-bold text-pink-500">
                    {formatNumber(video.viralVelocity)}{' '}
                    <span className="text-xs text-gray-500">views/hr</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Duration Sweet Spot</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={durationData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" stroke={CHART_COLORS.secondary} />
              <YAxis
                type="category"
                dataKey="bucket"
                stroke={CHART_COLORS.secondary}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill={CHART_COLORS.info}
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Golden Hour Heatmap
          </h3>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="flex gap-1 mb-2">
                <div className="w-12 flex-shrink-0"></div>
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className="w-8 flex-shrink-0 text-xs text-center text-gray-500"
                  >
                    {i}
                  </div>
                ))}
              </div>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                (day, dayIdx) => (
                  <div key={day} className="flex gap-1 mb-1">
                    <div className="w-12 flex-shrink-0 text-xs text-gray-500 flex items-center">
                      {day}
                    </div>
                    {heatmapData[dayIdx]?.map((count, hourIdx) => {
                      const intensity = Math.min(count / 3, 1);
                      return (
                        <div
                          key={hourIdx}
                          className="w-8 h-8 flex-shrink-0 rounded transition-all hover:scale-110 cursor-pointer"
                          style={{
                            backgroundColor: `rgba(0, 245, 160, ${
                              intensity * 0.8 + 0.05
                            })`,
                            border: '1px solid rgba(0,0,0,0.05)',
                          }}
                          title={`${day} ${hourIdx}:00 - ${count} videos`}
                        />
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

