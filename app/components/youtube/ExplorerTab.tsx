'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Video } from "@/app/types/youtube.types";

import { formatNumber } from '@/app/utils/youtube.utils';

interface ExplorerTabProps {
  filteredVideos: Video[];
}

export default function ExplorerTab({ filteredVideos }: ExplorerTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Video Explorer</h2>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-card">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Video
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Channel
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Views
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Engagement
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Age
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Tier
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredVideos.map((video, idx) => (
                <tr
                  key={video.id}
                  className="hover:bg-card/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-secondary">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/video/${video.id}`}>
                      <div className="flex items-center gap-3">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-24 h-14 rounded object-cover flex-shrink-0"
                        />
                        <span className="text-sm max-w-xs line-clamp-2">
                          {video.title}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary max-w-[150px] truncate">
                    <Link href={`/channel/${video.channelId}`}>
                      {video.channelTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {formatNumber(video.viewCount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-success">
                      {video.engagementRate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary">
                    {video.durationBucket}
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary">
                    {formatDistanceToNow(video.publishedAt, {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${video.performanceTier.color} bg-opacity-20 whitespace-nowrap`}
                    >
                      {video.performanceTier.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

