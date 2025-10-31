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
      {/* Mobile Card View - YouTube Style */}
      <div className="lg:hidden space-y-4">
        {filteredVideos.map((video, idx) => (
          <div key={video.id} className="flex gap-3">
            {/* Thumbnail with duration overlay */}
            <Link href={`/video/${video.id}`} className="flex-shrink-0 relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-40 h-24 rounded-lg object-cover"
              />
              {/* Duration Badge */}
              <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs font-medium text-white">
                {video.durationBucket}
              </div>
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <Link href={`/video/${video.id}`}>
                <h3 className="text-sm font-medium line-clamp-2 mb-1">{video.title}</h3>
              </Link>

              {/* Channel */}
              <Link href={`/channel/${video.channelId}`} className="text-xs text-secondary hover:text-primary block mb-2">
                {video.channelTitle}
              </Link>

              {/* Stats Row */}
              <div className="flex items-center gap-2 text-xs text-secondary mb-2">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatNumber(video.viewCount)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatTimeAgo(video.publishedAt)}
                </span>
              </div>

              {/* Metrics Row */}
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-medium ${video.performanceTier.color} bg-opacity-20`}>
                  {video.performanceTier.label}
                </span>
                <span className="flex items-center gap-1 text-success font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {video.engagementRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
