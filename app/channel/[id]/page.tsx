"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TrendingUp, Users, Video, Eye, ThumbsUp, Calendar, Award, Zap, Target, BarChart3, ExternalLink, ChevronRight, Clock, MessageCircle, PlayCircle } from 'lucide-react';
import { fetchChannelVideos, fetchYouTubeChannel } from '@/app/services/youtube.api';
import Image from 'next/image';
import DetailsHeader from '../../components/generic/header';
type ChannelData = {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnails: {
    high?: { url: string };
    medium?: { url: string };
  };
  country: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  avgViewsPerVideo: number;
  channelAge: number;
  uploadsPerMonth: any;
  engagementScore: number;
  growthPotential: {
    label: string;
    color: string;
    icon: string;
  };
  bannerUrl: string;
  keywords: string;
};

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
  trend?: string;
};

type RecentVideo = {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
};

const ChannelDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;
  
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'YOUR_YOUTUBE_API_KEY';

  useEffect(() => {
    if (channelId) {
      fetchChannelDetails();
    }
  }, [channelId]);

  const fetchChannelDetails = async () => {
    try {
      setLoading(true);
      const [channel, videos] = await Promise.all([
        fetchYouTubeChannel(channelId, API_KEY),
        fetchChannelVideos(channelId, API_KEY, 12)
      ]);
      
      setChannelData(processChannelData(channel));
      setRecentVideos(videos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processChannelData = (channel: any): ChannelData => {
    const stats = channel.statistics;
    const snippet = channel.snippet;
    const branding = channel.brandingSettings;

    const subscriberCount = parseInt(stats.subscriberCount || 0);
    const viewCount = parseInt(stats.viewCount || 0);
    const videoCount = parseInt(stats.videoCount || 0);

    const avgViewsPerVideo = videoCount > 0 ? Math.floor(viewCount / videoCount) : 0;
    const channelAge = Math.floor((Date.now() - new Date(snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24));
    const uploadsPerMonth = videoCount > 0 ? (videoCount / (channelAge / 30)).toFixed(1) : 0;

    const engagementScore = calculateChannelEngagementScore(subscriberCount, avgViewsPerVideo, videoCount);
    const growthPotential = calculateGrowthPotential(subscriberCount, viewCount, channelAge, videoCount);

    return {
      id: channel.id,
      title: snippet.title,
      description: snippet.description,
      customUrl: snippet.customUrl,
      publishedAt: snippet.publishedAt,
      thumbnails: snippet.thumbnails,
      country: snippet.country,
      subscriberCount,
      viewCount,
      videoCount,
      avgViewsPerVideo,
      channelAge,
      uploadsPerMonth: Number(uploadsPerMonth),
      engagementScore,
      growthPotential,
      bannerUrl: branding?.image?.bannerExternalUrl,
      keywords: branding?.channel?.keywords
    };
  };

  const calculateChannelEngagementScore = (subs: number, avgViews: number, videos: number): number => {
    const viewToSubRatio = subs > 0 ? (avgViews / subs) * 100 : 0;
    const contentConsistency = Math.min((videos / 100) * 20, 20);
    const baseScore = Math.min(viewToSubRatio * 40, 40);
    const volumeBonus = Math.min((videos / 500) * 20, 20);
    const engagementBonus = viewToSubRatio > 10 ? 20 : viewToSubRatio > 5 ? 10 : 0;
    
    return Math.min(Math.round(baseScore + contentConsistency + volumeBonus + engagementBonus), 100);
  };

  const calculateGrowthPotential = (subs: number, views: number, age: number, videos: number): any => {
    const subsPerDay = age > 0 ? subs / age : 0;
    const viewsPerDay = age > 0 ? views / age : 0;
    const uploadFrequency = videos > 0 ? (videos / (age / 30)) : 0;
    
    let potential = 'Steady';
    let color = 'text-info';
    let icon = '📊';
    
    if (subsPerDay > 1000 && uploadFrequency > 4) {
      potential = 'Explosive';
      color = 'text-viral';
      icon = '🚀';
    } else if (subsPerDay > 100 && uploadFrequency > 2) {
      potential = 'High Growth';
      color = 'text-success';
      icon = '📈';
    } else if (subsPerDay > 10) {
      potential = 'Growing';
      color = 'text-warning';
      icon = '⚡';
    }
    
    return { label: potential, color, icon };
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTierBadge = (subscribers: number): { label: string; color: string; icon: string; } => {
    if (subscribers >= 10000000) return { label: 'Diamond', color: 'from-purple-500 to-pink-500', icon: '💎' };
    if (subscribers >= 1000000) return { label: 'Gold', color: 'from-yellow-500 to-orange-500', icon: '🏆' };
    if (subscribers >= 100000) return { label: 'Silver', color: 'from-gray-400 to-gray-500', icon: '🥈' };
    return { label: 'Bronze', color: 'from-orange-700 to-orange-900', icon: '🥉' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-card rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-card rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="bg-card rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-primary mb-2">Error Loading Channel</h2>
          <p className="text-secondary mb-6">{error}</p>
          <p className="text-sm text-secondary">
            Please replace YOUR_YOUTUBE_API_KEY with a valid YouTube Data API v3 key
          </p>
        </div>
      </div>
    );
  }

  if (!channelData) return null;

  const tier = getTierBadge(channelData.subscriberCount);
  const growth = channelData.growthPotential;

  return (
    <div className="min-h-screen bg-background">
<DetailsHeader 
  linkUrl={`https://www.youtube.com/channel/${channelData.id}`}
  linkText="View on YouTube"
  linkIcon="youtube"
/>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {channelData.bannerUrl && (
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={channelData.bannerUrl} 
              alt="Channel banner"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        
        <div className="bg-card rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            
            <div className="flex-shrink-0">
              <img 
                src={channelData.thumbnails.high?.url || channelData.thumbnails.medium?.url}
                alt={channelData.title}
                className="w-32 h-32 rounded-full border-4 border-primary/10"
              />
            </div>

            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-primary">{channelData.title}</h1>
                  {channelData.customUrl && (
                    <span className="px-3 py-1 bg-info/10 text-info rounded-full text-sm font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>
                {channelData.customUrl && (
                  <p className="text-secondary">@{channelData.customUrl}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="text-secondary" size={18} />
                  <span className="font-bold text-primary">{formatNumber(channelData.subscriberCount)}</span>
                  <span className="text-secondary">subscribers</span>
                </div>
                <span className="text-secondary">•</span>
                <div className="flex items-center gap-2">
                  <Video className="text-secondary" size={18} />
                  <span className="font-bold text-primary">{formatNumber(channelData.videoCount)}</span>
                  <span className="text-secondary">videos</span>
                </div>
                <span className="text-secondary">•</span>
                <div className="flex items-center gap-2">
                  <Eye className="text-secondary" size={18} />
                  <span className="font-bold text-primary">{formatNumber(channelData.viewCount)}</span>
                  <span className="text-secondary">views</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className={`px-4 py-2 bg-gradient-to-r ${tier.color} rounded-lg text-white font-semibold flex items-center gap-2`}>
                  <span className="text-xl">{tier.icon}</span>
                  <span>{tier.label} Creator</span>
                </div>
                <div className={`px-4 py-2 ${growth.color === 'text-viral' ? 'bg-viral/10' : growth.color === 'text-success' ? 'bg-success/10' : 'bg-info/10'} rounded-lg font-semibold flex items-center gap-2`}>
                  <span className="text-xl">{growth.icon}</span>
                  <span className={growth.color}>{growth.label}</span>
                </div>
              </div>

              {channelData.description && (
                <p className="text-secondary text-sm leading-relaxed line-clamp-3">
                  {channelData.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-secondary">
                <Calendar size={16} />
                <span>Joined {new Date(channelData.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <span className="ml-2 px-2 py-1 bg-info/10 text-info rounded-full text-xs">
                  {Math.floor(channelData.channelAge / 365)} years old
                </span>
              </div>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={<Users className="text-success" size={24} />}
            label="Total Subscribers"
            value={formatNumber(channelData.subscriberCount)}
            subtitle={tier.label + ' tier creator'}
            trend={growth.label}
          />
          <MetricCard
            icon={<Eye className="text-info" size={24} />}
            label="Total Views"
            value={formatNumber(channelData.viewCount)}
            subtitle="All-time channel views"
            trend="Growing"
          />
          <MetricCard
            icon={<Video className="text-warning" size={24} />}
            label="Video Count"
            value={formatNumber(channelData.videoCount)}
            subtitle={`${channelData.uploadsPerMonth} per month`}
            trend="Active"
          />
          <MetricCard
            icon={<BarChart3 className="text-viral" size={24} />}
            label="Avg Views/Video"
            value={formatNumber(channelData.avgViewsPerVideo)}
            subtitle="Per video average"
            trend="Strong"
          />
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-gradient-to-br from-viral/10 via-warning/10 to-success/10 rounded-2xl p-8 shadow-lg border border-primary/10">
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold bg-gradient-to-r from-viral via-warning to-success bg-clip-text text-transparent">
                {channelData.engagementScore}
              </div>
              <div className="text-sm font-medium text-secondary uppercase tracking-wider">
                Channel Engagement Score
              </div>
              <div className="pt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">View-to-Sub Ratio</span>
                  <span className="font-bold text-primary">
                    {((channelData.avgViewsPerVideo / channelData.subscriberCount) * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Upload Frequency</span>
                  <span className="font-bold text-primary">{channelData.uploadsPerMonth}/month</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Content Volume</span>
                  <span className="font-bold text-primary">{channelData.videoCount} videos</span>
                </div>
              </div>
            </div>
          </div>

          
          <div className="bg-card rounded-2xl p-6 shadow-lg space-y-6">
            <h2 className="text-xl font-bold text-primary flex items-center gap-3">
              <TrendingUp size={24} />
              Growth Metrics
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Avg Views Per Video</span>
                  <span className="font-bold text-primary">{formatNumber(channelData.avgViewsPerVideo)}</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-success to-viral"
                    style={{ width: `${Math.min((channelData.avgViewsPerVideo / 1000000) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Total Channel Views</span>
                  <span className="font-bold text-primary">{formatNumber(channelData.viewCount)}</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-info to-success"
                    style={{ width: `${Math.min((channelData.viewCount / 1000000000) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Upload Consistency</span>
                  <span className="font-bold text-primary">{channelData.uploadsPerMonth}/month</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-warning to-success"
                    style={{ width: `${Math.min((parseFloat(channelData.uploadsPerMonth) / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-success/10 to-viral/10 rounded-lg p-4 border border-success/20">
                <div className="text-sm font-semibold text-primary mb-2">📊 Performance Insights</div>
                <div className="text-xs text-secondary space-y-1">
                  {channelData.avgViewsPerVideo > channelData.subscriberCount * 0.1 && (
                    <div>✓ Excellent view-to-subscriber ratio</div>
                  )}
                  {channelData.uploadsPerMonth > 4 && (
                    <div>✓ Highly consistent upload schedule</div>
                  )}
                  {channelData.videoCount > 100 && (
                    <div>✓ Extensive content library</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-card rounded-2xl p-6 shadow-lg space-y-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-3">
            <Target size={24} />
            Content Strategy Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-secondary">Upload Frequency</div>
              <div className="text-2xl font-bold text-primary">{channelData.uploadsPerMonth}</div>
              <div className="text-xs text-secondary">videos per month</div>
              <div className="mt-2 text-xs">
                {parseFloat(channelData.uploadsPerMonth) > 8 ? (
                  <span className="text-success">🔥 Very Active</span>
                ) : parseFloat(channelData.uploadsPerMonth) > 4 ? (
                  <span className="text-warning">📈 Active</span>
                ) : (
                  <span className="text-info">📊 Moderate</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-secondary">Channel Age</div>
              <div className="text-2xl font-bold text-primary">{Math.floor(channelData.channelAge / 365)}</div>
              <div className="text-xs text-secondary">years on YouTube</div>
              <div className="mt-2 text-xs">
                {channelData.channelAge > 1825 ? (
                  <span className="text-success">🏆 Veteran</span>
                ) : channelData.channelAge > 365 ? (
                  <span className="text-warning">⭐ Established</span>
                ) : (
                  <span className="text-info">🌱 Growing</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-secondary">Content Volume</div>
              <div className="text-2xl font-bold text-primary">{channelData.videoCount}</div>
              <div className="text-xs text-secondary">total videos</div>
              <div className="mt-2 text-xs">
                {channelData.videoCount > 500 ? (
                  <span className="text-success">💎 Massive Library</span>
                ) : channelData.videoCount > 100 ? (
                  <span className="text-warning">📚 Large Library</span>
                ) : (
                  <span className="text-info">📖 Building</span>
                )}
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-card rounded-2xl p-6 shadow-lg space-y-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-3">
            <PlayCircle size={24} />
            Recent Videos ({recentVideos.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentVideos.map((video) => (
              <a
                key={video.id.videoId}
                href={`/video/${video.id.videoId}`}
                className="group cursor-pointer"
              >
                <div className="bg-primary/5 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                  <div className="relative aspect-video">
                    <img 
                      src={video.snippet.thumbnails.medium.url}
                      alt={video.snippet.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-primary text-sm line-clamp-2 group-hover:text-viral transition-colors">
                      {video.snippet.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-secondary">
                      <Clock size={12} />
                      <span>{new Date(video.snippet.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        
        {channelData.description && (
          <div className="bg-card rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-primary mb-4">About</h2>
            <div className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">
              {channelData.description}
            </div>
          </div>
        )}

        
        <div className="bg-gradient-to-r from-viral/5 to-success/5 rounded-2xl p-6 border border-primary/10">
          <h3 className="font-bold text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a
              href={`https://www.youtube.com/channel/${channelData.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-card hover:bg-primary/5 rounded-lg transition-colors text-sm font-medium"
            >
              <ExternalLink size={16} />
              View Channel
            </a>
            <a
              href={`https://www.youtube.com/channel/${channelData.id}/videos`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-card hover:bg-primary/5 rounded-lg transition-colors text-sm font-medium"
            >
              <Video size={16} />
              All Videos
            </a>
            <a
              href={`https://www.youtube.com/channel/${channelData.id}/about`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-card hover:bg-primary/5 rounded-lg transition-colors text-sm font-medium"
            >
              <Target size={16} />
              About
            </a>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-card hover:bg-primary/5 rounded-lg transition-colors text-sm font-medium">
              <BarChart3 size={16} />
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, subtitle, trend }: MetricCardProps) => (
  <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-primary/5 rounded-xl">{icon}</div>
      {trend && (
        <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <div className="text-sm text-secondary mb-1">{label}</div>
    <div className="text-2xl font-bold text-primary mb-1">{value}</div>
    <div className="text-xs text-secondary">{subtitle}</div>
  </div>
);

export default ChannelDetailsPage;