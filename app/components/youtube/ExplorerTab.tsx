'use client';
import React from 'react';
import Link from 'next/link';
import { Video } from "@/app/types/youtube.types";
import { formatNumber } from '@/app/utils/youtube.utils';
import { Eye, TrendingUp, Clock, Calendar } from 'lucide-react';

interface ExplorerTabProps {
  filteredVideos: Video[];
}

// Helper function to format date
const formatTimeAgo = (date: Date | string) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears}y ago`;
  if (diffMonths > 0) return `${diffMonths}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return `${diffMins}m ago`;
};

export default function ExplorerTab({ filteredVideos }: ExplorerTabProps) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">Video Explorer</h2>
      
      {/* Desktop Table View */}
      <div className="hidden lg:block glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-card">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Video</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Channel</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Views</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Engagement</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Age</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredVideos.map((video, idx) => (
                <tr key={video.id} className="hover:bg-card/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-secondary">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/video/${video.id}`}>
                      <div className="flex items-center gap-3">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-24 h-14 rounded object-cover flex-shrink-0"
                        />
                        <span className="text-sm max-w-xs line-clamp-2">{video.title}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary max-w-[150px] truncate">
                    <Link href={`/channel/${video.channelId}`}>{video.channelTitle}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{formatNumber(video.viewCount)}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-success">
                      {video.engagementRate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary">{video.durationBucket}</td>
                  <td className="px-4 py-3 text-sm text-secondary">
                    {formatTimeAgo(video.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${video.performanceTier.color} bg-opacity-20 whitespace-nowrap`}>
                      {video.performanceTier.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredVideos.map((video, idx) => (
          <div key={video.id} className="glass-card rounded-xl p-3 sm:p-4">
            {/* Top Row: Rank + Thumbnail + Title */}
            <div className="flex gap-3 mb-3">
              {/* Rank Badge */}
              <div className="flex-shrink-0 w-8 h-8 bg-card rounded-lg flex items-center justify-center text-sm font-bold text-secondary">
                {idx + 1}
              </div>

              {/* Thumbnail */}
              <Link href={`/video/${video.id}`} className="flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-28 sm:w-32 h-16 sm:h-18 rounded-lg object-cover"
                />
              </Link>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <Link href={`/video/${video.id}`}>
                  <h3 className="text-sm font-semibold line-clamp-3 mb-1">{video.title}</h3>
                </Link>
                <Link href={`/channel/${video.channelId}`} className="text-xs text-secondary hover:text-primary">
                  {video.channelTitle}
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs ml-11">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-secondary" />
                <span className="font-medium">{formatNumber(video.viewCount)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
                <span className="font-medium text-success">{video.engagementRate.toFixed(1)}%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-secondary" />
                <span className="text-secondary">{video.durationBucket}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                <span className="text-secondary">{formatTimeAgo(video.publishedAt)}</span>
              </div>
            </div>

            {/* Tier Badge */}
            <div className="mt-3 ml-11">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${video.performanceTier.color} bg-opacity-20`}>
                {video.performanceTier.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}