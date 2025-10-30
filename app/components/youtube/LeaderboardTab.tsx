'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Star, ThumbsUp, TrendingUp } from 'lucide-react';
import { Video } from '@/app/types/youtube.types';
import { formatNumber } from '@/app/utils/youtube.utils';

interface LeaderboardTabProps {
  topVideos: Video[];
}

export default function LeaderboardTab({ topVideos }: LeaderboardTabProps) {
  const getRankStyle = (idx: number) => {
    switch (idx) {
      case 0:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg';
      case 1:
        return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-md';
      case 2:
        return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div>
<h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
  Top Performing Videos

</h2>


      <div className="space-y-3">
        {topVideos.map((video, idx) => (
          <div
            key={video.id}
            className="bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-start gap-4">
              {/* Rank Badge */}
              <div className="flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${getRankStyle(
                    idx
                  )}`}
                >
                  {idx + 1}
                </div>
              </div>

              {/* Thumbnail */}
              <Link 
                href={`/video/${video.id}`}
                className="flex-shrink-0 group"
              >
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-48 h-27 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {/* Performance indicator overlay */}
                  {idx < 3 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                      Top {idx + 1}
                    </div>
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/video/${video.id}`}
                  className="block group"
                >
                  <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                </Link>
                
                <Link 
                  href={`/channel/${video.channelId}`}
                  className="text-gray-600 text-sm hover:text-gray-900 transition-colors inline-block mb-4"
                >
                  {video.channelTitle}
                </Link>

                {/* Stats - Clean and minimal */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{formatNumber(video.viewCount)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{video.engagementRate.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Score: {video.successScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}