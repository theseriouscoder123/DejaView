"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageCircle,
  Clock,
  Calendar,
  Award,
  Zap,
  Target,
  BarChart3,
  Hash,
  FileText,
  Settings,
  ExternalLink,
  ChevronRight,
  Play,
  CheckCircle,
  XCircle,
  TrendingDown,
} from "lucide-react";
import { fetchYouTubeVideo } from "@/app/services/youtube.api";
import Image from "next/image";
import DetailsHeader from "@/app/components/generic/header";
type VideoData = {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnails: any;
  tags: string[];
  categoryId: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: {
    formatted: string;
    seconds: number;
  };
  daysOld: number;
  viewsPerDay: number;
  viewsPerHour: number;
  engagementRate: number;
  likeRatio: number;
  commentRatio: number;
  successScore: number;
  definition: string;
  caption: boolean;
  licensedContent: boolean;
};

interface StatCardProps {
  icon: React.ReactElement;
  label: string;
  value: string | number;
  subtitle: string;
  color: string;
}

interface ScoreCircleProps {
  score: number;
  tier: {
    color: string;
    label: string;
    icon: string;
  };
}

interface MetricRowProps {
  label: string;
  value: string | number;
  isPositive?: boolean;
}

interface TagBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success";
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

interface ProgressBarProps {
  percentage: number;
  color: string;
}

interface ChecklistItemProps {
  label: string;
  checked: boolean;
  warning?: boolean;
}

// Utility Functions
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num?.toString() || "0";
};

const parseDuration = (duration: any) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] || "").replace("H", "") || 0;
  const minutes = (match[2] || "").replace("M", "") || 0;
  const seconds = (match[3] || "").replace("S", "") || 0;
  return {
    hours: parseInt(hours),
    minutes: parseInt(minutes),
    seconds: parseInt(seconds),
    total: parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds),
    formatted: `${hours > 0 ? hours + ":" : ""}${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`,
  };
};

const calculateSuccessScore = (
  views: number,
  engagement: number,
  velocity: number,
  daysOld: number
) => {
  const viewScore = Math.min((views / 1000000) * 30, 40);
  const engagementScore = Math.min(engagement * 2, 30);
  const velocityScore = Math.min((velocity / 10000) * 20, 20);
  const recencyBonus = daysOld < 7 ? 10 : daysOld < 30 ? 5 : 0;
  return Math.min(
    Math.round(viewScore + engagementScore + velocityScore + recencyBonus),
    100
  );
};

const getPerformanceTier = (score: number) => {
  if (score >= 80) return { label: "Viral", color: "#FF3366", icon: "🚀" };
  if (score >= 60) return { label: "Hot", color: "#FFB800", icon: "🔥" };
  if (score >= 40) return { label: "Rising", color: "#00F5A0", icon: "📈" };
  return { label: "Steady", color: "#00D4FF", icon: "📊" };
};

const getVelocityTier = (viewsPerHour: number) => {
  if (viewsPerHour >= 50000)
    return { label: "Explosive Growth", color: "#FF3366" };
  if (viewsPerHour >= 10000) return { label: "Rapid Growth", color: "#FFB800" };
  if (viewsPerHour >= 1000) return { label: "Steady Growth", color: "#00F5A0" };
  return { label: "Slow Growth", color: "#64748B" };
};
// Sub-Components
const ScoreCircle = ({ score, tier }: ScoreCircleProps) => (
  <div className="relative w-40 h-40 mx-auto">
    <svg className="w-full h-full transform -rotate-90">
      <circle
        cx="80"
        cy="80"
        r="70"
        stroke="#E2E8F0"
        strokeWidth="10"
        fill="none"
      />
      <circle
        cx="80"
        cy="80"
        r="70"
        stroke={tier.color}
        strokeWidth="10"
        fill="none"
        strokeDasharray={`${(score / 100) * 440} 440`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease-in-out" }}
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center flex-col">
      <div className="text-5xl font-bold" style={{ color: tier.color }}>
        {score}
      </div>
      <div className="text-xs text-secondary mt-1 uppercase tracking-wider">
        SCORE
      </div>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, subtitle, color }: StatCardProps) => (
  <div className="glass-card rounded-xl p-5 hover:shadow-xl transition-all">
    <div className="flex items-center gap-3 mb-3">
      <div
        className="p-2.5 rounded-lg"
        style={{ backgroundColor: `${color}15` }}
      >
        {React.cloneElement(icon as React.ReactElement<any>, {
          style: { color },
        })}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-secondary uppercase tracking-wider font-medium">
          {label}
        </div>
        <div className="text-2xl font-bold text-primary truncate">{value}</div>
      </div>
    </div>
    {subtitle && <div className="text-xs text-secondary">{subtitle}</div>}
  </div>
);

const MetricRow = ({ label, value, isPositive = true }: MetricRowProps) => (
  <div
    className="flex items-center justify-between py-2.5 border-b last:border-0"
    style={{ borderColor: "rgba(0,0,0,0.05)" }}
  >
    <span className="text-sm text-secondary">{label}</span>
    <span
      className="text-sm font-semibold"
      style={{ color: isPositive ? "#00F5A0" : "#64748B" }}
    >
      {value}
    </span>
  </div>
);

const TagBadge = ({ children, variant = "default" }: TagBadgeProps) => {
  const styles = {
    default: { backgroundColor: "#F1F5F9", color: "#64748B" },
    primary: {
      backgroundColor: "#00D4FF15",
      color: "#00D4FF",
      border: "1px solid #00D4FF30",
    },
    success: {
      backgroundColor: "#00F5A015",
      color: "#00F5A0",
      border: "1px solid #00F5A030",
    },
  };

  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-medium"
      style={styles[variant]}
    >
      {children}
    </span>
  );
};

const SectionHeader = ({ icon, title, subtitle }: SectionHeaderProps) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 glass-card-light rounded-lg">{icon}</div>
    <div>
      <h2 className="text-xl font-bold text-primary">{title}</h2>
      {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
    </div>
  </div>
);

const ProgressBar = ({ percentage, color }: ProgressBarProps) => (
  <div
    className="w-full rounded-full h-2"
    style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
  >
    <div
      className="h-2 rounded-full transition-all duration-500"
      style={{
        width: `${Math.min(percentage, 100)}%`,
        backgroundColor: color,
      }}
    />
  </div>
);

const ChecklistItem = ({
  label,
  checked,
  warning = false,
}: ChecklistItemProps) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-primary">{label}</span>
    {checked ? (
      <CheckCircle
        size={18}
        style={{ color: warning ? "#FFB800" : "#00F5A0" }}
      />
    ) : (
      <XCircle size={18} style={{ color: "#E2E8F0" }} />
    )}
  </div>
);

const VideoDetailsPage = () => {
  const params = useParams();
  const videoId = params.id as string;

  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "content" | "metadata"
  >("overview");

  useEffect(() => {
    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      setLoading(true);
      const data = await fetchYouTubeVideo(videoId);
      setVideoData(processVideoData(data));
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const processVideoData = (video: any) => {
    const stats = video.statistics;
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;

    const viewCount = parseInt(stats.viewCount || 0);
    const likeCount = parseInt(stats.likeCount || 0);
    const commentCount = parseInt(stats.commentCount || 0);

    const publishedDate = new Date(snippet.publishedAt);
    const daysOld = Math.floor(
      (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const viewsPerDay =
      daysOld > 0 ? Math.floor(viewCount / daysOld) : viewCount;
    const viewsPerHour =
      daysOld > 0
        ? Math.floor(viewCount / (daysOld * 24))
        : Math.floor(viewCount / 24);

    const engagementRate =
      viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0;
    const likeRatio = viewCount > 0 ? (likeCount / viewCount) * 100 : 0;
    const commentRatio = viewCount > 0 ? (commentCount / viewCount) * 100 : 0;

    const duration = parseDuration(contentDetails.duration);
    const successScore = calculateSuccessScore(
      viewCount,
      engagementRate,
      viewsPerHour,
      daysOld
    );

    return {
      id: video.id,
      title: snippet.title,
      description: snippet.description,
      channelTitle: snippet.channelTitle,
      channelId: snippet.channelId,
      publishedAt: snippet.publishedAt,
      thumbnails: snippet.thumbnails,
      tags: snippet.tags || [],
      categoryId: snippet.categoryId,
      viewCount,
      likeCount,
      commentCount,
      duration,
      daysOld,
      viewsPerDay,
      viewsPerHour,
      engagementRate,
      likeRatio,
      commentRatio,
      successScore,
      definition: contentDetails.definition,
      caption: contentDetails.caption === "true",
      licensedContent: contentDetails.licensedContent,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto"
            style={{
              borderColor: "#00D4FF30",
              borderTopColor: "#00D4FF",
            }}
          ></div>
          <p className="text-secondary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            Error Loading Video
          </h2>
          <p className="text-secondary mb-6">{error}</p>
          <p className="text-sm text-secondary">
            Please replace YOUR_YOUTUBE_API_KEY with a valid YouTube Data API v3
            key
          </p>
        </div>
      </div>
    );
  }

  if (!videoData) return null;

  const tier = getPerformanceTier(videoData.successScore);
  const velocity = getVelocityTier(videoData.viewsPerHour);

  const titleLength = videoData.title.length;
  const titleScore =
    titleLength >= 50 && titleLength <= 70
      ? "optimal"
      : titleLength < 50
      ? "short"
      : "long";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DetailsHeader
        linkUrl={`https://www.youtube.com/watch?v=${videoData.id}`}
        linkText="Watch on YouTube"
        linkIcon="play"
      />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Video Player & Title Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Video Player */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${videoData.id}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-6 space-y-4">
                <h1 className="text-2xl font-bold text-primary leading-tight">
                  {videoData.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <Link
                    href={`/channel/${videoData.channelId}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {videoData.channelTitle}
                  </Link>
                  <span className="text-secondary">•</span>
                  <div className="flex items-center gap-2 text-secondary">
                    <Calendar size={14} />
                    {new Date(videoData.publishedAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </div>
                  <TagBadge>{videoData.daysOld} days ago</TagBadge>
                  <span className="text-secondary">•</span>
                  <div className="flex items-center gap-2 text-secondary">
                    <Clock size={14} />
                    {videoData.duration.formatted}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Performance Score */}
          <div className="space-y-6">
            <div
              className="glass-card rounded-2xl p-8"
              style={{
                background: `linear-gradient(135deg, ${tier.color}10, ${tier.color}05)`,
                border: `1px solid ${tier.color}20`,
              }}
            >
              <div className="text-center space-y-6">
                <ScoreCircle score={videoData.successScore} tier={tier} />
                <div>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm"
                    style={{
                      backgroundColor: `${tier.color}15`,
                      color: tier.color,
                      border: `1px solid ${tier.color}30`,
                    }}
                  >
                    <span className="text-lg">{tier.icon}</span>
                    <span>{tier.label}</span>
                  </div>
                  <p className="text-xs text-secondary mt-3">
                    Performance Tier
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap style={{ color: velocity.color }} size={20} />
                <div>
                  <div className="text-sm font-semibold text-primary">
                    {velocity.label}
                  </div>
                  <div className="text-xs text-secondary">Growth Velocity</div>
                </div>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: velocity.color }}
              >
                {formatNumber(videoData.viewsPerHour)}
                <span className="text-sm text-secondary ml-1">views/hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Eye size={20} />}
            label="Total Views"
            value={formatNumber(videoData.viewCount)}
            subtitle={`${formatNumber(videoData.viewsPerDay)} per day`}
            color="#00D4FF"
          />
          <StatCard
            icon={<ThumbsUp size={20} />}
            label="Likes"
            value={formatNumber(videoData.likeCount)}
            subtitle={`${videoData.likeRatio.toFixed(2)}% like ratio`}
            color="#00F5A0"
          />
          <StatCard
            icon={<MessageCircle size={20} />}
            label="Comments"
            value={formatNumber(videoData.commentCount)}
            subtitle={`${videoData.commentRatio.toFixed(2)}% comment ratio`}
            color="#FF3366"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Engagement"
            value={`${videoData.engagementRate.toFixed(1)}%`}
            subtitle="Total engagement rate"
            color="#FFB800"
          />
        </div>

        {/* Tab Navigation */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div
            className="flex border-b"
            style={{ borderColor: "rgba(0,0,0,0.05)" }}
          >
            {["overview", "content", "metadata"].map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab as "overview" | "content" | "metadata")
                }
                className="flex-1 px-6 py-4 text-sm font-medium transition-colors"
                style={{
                  color: activeTab === tab ? "#0F172A" : "#64748B",
                  backgroundColor:
                    activeTab === tab ? "rgba(0,0,0,0.02)" : "transparent",
                  borderBottom:
                    activeTab === tab
                      ? "2px solid #00D4FF"
                      : "2px solid transparent",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Breakdown */}
                <div className="space-y-4">
                  <SectionHeader
                    icon={<BarChart3 size={20} style={{ color: "#00D4FF" }} />}
                    title="Engagement Breakdown"
                    subtitle="How viewers interact with your content"
                  />
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-secondary">Like Rate</span>
                        <span
                          className="font-semibold"
                          style={{ color: "#00F5A0" }}
                        >
                          {videoData.likeRatio.toFixed(2)}%
                        </span>
                      </div>
                      <ProgressBar
                        percentage={videoData.likeRatio * 10}
                        color="#00F5A0"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-secondary">Comment Rate</span>
                        <span
                          className="font-semibold"
                          style={{ color: "#FF3366" }}
                        >
                          {videoData.commentRatio.toFixed(2)}%
                        </span>
                      </div>
                      <ProgressBar
                        percentage={videoData.commentRatio * 10}
                        color="#FF3366"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-secondary">
                          Overall Engagement
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: "#FFB800" }}
                        >
                          {videoData.engagementRate.toFixed(2)}%
                        </span>
                      </div>
                      <ProgressBar
                        percentage={videoData.engagementRate * 5}
                        color="#FFB800"
                      />
                    </div>
                  </div>
                </div>

                {/* Growth Metrics */}
                <div className="space-y-4">
                  <SectionHeader
                    icon={<Target size={20} style={{ color: "#FF3366" }} />}
                    title="Growth Metrics"
                    subtitle="Velocity and reach statistics"
                  />
                  <div className="glass-card-light rounded-xl p-4 space-y-1">
                    <MetricRow
                      label="Views per Hour"
                      value={formatNumber(videoData.viewsPerHour)}
                    />
                    <MetricRow
                      label="Views per Day"
                      value={formatNumber(videoData.viewsPerDay)}
                    />
                    <MetricRow
                      label="Days Since Upload"
                      value={`${videoData.daysOld} days`}
                    />
                    <MetricRow
                      label="Average Daily Growth"
                      value={`${formatNumber(
                        Math.floor(videoData.viewsPerDay)
                      )} views`}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Title Analysis */}
                <div className="space-y-4">
                  <SectionHeader
                    icon={<FileText size={20} style={{ color: "#00D4FF" }} />}
                    title="Title Analysis"
                    subtitle="SEO and clickability insights"
                  />
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-secondary">Character Count</span>
                        <span
                          className="font-semibold"
                          style={{
                            color:
                              titleScore === "optimal" ? "#00F5A0" : "#FFB800",
                          }}
                        >
                          {titleLength}{" "}
                          {titleScore === "optimal"
                            ? "(Optimal)"
                            : titleScore === "short"
                            ? "(Too Short)"
                            : "(Too Long)"}
                        </span>
                      </div>
                      <ProgressBar
                        percentage={(titleLength / 100) * 100}
                        color={titleScore === "optimal" ? "#00F5A0" : "#FFB800"}
                      />
                      <p className="text-xs text-secondary mt-1">
                        Ideal: 50-70 characters
                      </p>
                    </div>

                    <div className="glass-card-light rounded-xl p-4">
                      <div className="text-sm font-medium text-primary mb-3">
                        Title Features
                      </div>
                      <div className="space-y-2">
                        <ChecklistItem
                          label="Contains Numbers"
                          checked={/\d+/.test(videoData.title)}
                        />
                        <ChecklistItem
                          label="Has Question Mark"
                          checked={/\?/.test(videoData.title)}
                        />
                        <ChecklistItem
                          label="Uses Emojis"
                          checked={/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/u.test(
                            videoData.title
                          )}
                        />
                        <ChecklistItem
                          label="Power Words Present"
                          checked={[
                            "ultimate",
                            "proven",
                            "strategies",
                            "grow",
                            "amazing",
                            "incredible",
                          ].some((w) =>
                            videoData.title.toLowerCase().includes(w)
                          )}
                        />
                        <ChecklistItem
                          label="All Caps (Warning)"
                          checked={
                            videoData.title === videoData.title.toUpperCase() &&
                            videoData.title.length > 5
                          }
                          warning
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Preview */}
                <div className="space-y-4">
                  <SectionHeader
                    icon={<FileText size={20} style={{ color: "#00F5A0" }} />}
                    title="Description"
                    subtitle="Content preview"
                  />
                  <div className="glass-card-light rounded-xl p-4">
                    <div className="text-sm text-primary leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
                      {videoData.description || "No description available"}
                    </div>
                    <div
                      className="mt-4 pt-4 border-t"
                      style={{ borderColor: "rgba(0,0,0,0.05)" }}
                    >
                      <div className="text-xs text-secondary">
                        {videoData.description?.length || 0} characters
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "metadata" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tags */}
                <div className="space-y-4">
                  <SectionHeader
                    icon={<Hash size={20} style={{ color: "#FF3366" }} />}
                    title="Tags & Keywords"
                    subtitle={`${videoData.tags.length} tags used`}
                  />
                  {videoData.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {videoData.tags.map((tag, i) => (
                        <TagBadge key={i} variant="primary">
                          {tag}
                        </TagBadge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-secondary">No tags available</p>
                  )}
                </div>

                {/* Technical Info */}
                <div className="space-y-4">
                  <SectionHeader
                    icon={<Settings size={20} style={{ color: "#FFB800" }} />}
                    title="Technical Details"
                    subtitle="Video specifications"
                  />
                  <div className="glass-card-light rounded-xl p-4 space-y-1">
                    <MetricRow
                      label="Video Quality"
                      value={videoData.definition.toUpperCase()}
                    />
                    <MetricRow
                      label="Closed Captions"
                      value={videoData.caption ? "Available" : "Not Available"}
                      isPositive={videoData.caption}
                    />
                    <MetricRow
                      label="Licensed Content"
                      value={videoData.licensedContent ? "Yes" : "No"}
                      isPositive={videoData.licensedContent}
                    />
                    <MetricRow
                      label="Duration"
                      value={videoData.duration.formatted}
                    />
                    <MetricRow
                      label="Category ID"
                      value={videoData.categoryId}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoDetailsPage;
