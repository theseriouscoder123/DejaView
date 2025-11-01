"use client";
// Import useState and useEffect
import React, { useMemo, useState, useEffect } from "react";
import { Eye, Heart, Target, Zap, SmilePlus } from "lucide-react";
import MetricCard from "./MetricCard";
import { formatNumber } from "@/app/utils/youtube.utils";
import { Video, Category } from "@/app/types/youtube.types";

import { useParams } from "next/navigation";
// Import recharts components for the pie chart
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface OverviewTabProps {
  metrics: {
    avgViews: number;
    avgEngagement: number;
    hotNow: number;
  } | null;
  avgMetrics: {
    averageTimeToTrend: number;
    averageDuration: number;
    averageTitleLength: number;
    averageDescriptionLength: number;
  } | null;
  filteredVideos: Video[];
  categories: Category[];
}

// Define the shape of the API response
interface SentimentResponse {
  sentimentScore: number;
  sentimentLabel: string;
}

// Define a color palette for the chart
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#DA627D",
  "#62B6CB",
  "#FB6107",
  "#A0E7E5",
  "#B4F8C8",
];

export default function OverviewTab({
  metrics,
  filteredVideos,
  categories,
  avgMetrics,

}: OverviewTabProps) {
  const totalViews = filteredVideos.reduce((sum, v) => sum + v.viewCount, 0);
  const totalLikes = filteredVideos.reduce((sum, v) => sum + v.likeCount, 0);
  const totalComments = filteredVideos.reduce(
    (sum, v) => sum + v.commentCount,
    0
  );

  const params = useParams<{ country: string; category: string }>();
  const { country, category } = params;

  // --- State for Sentiment Analysis ---
  const [sentimentScore, setSentimentScore] = useState<number | null>(null);
  const [sentimentLabel, setSentimentLabel] = useState<string | null>(null);
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);
  const [sentimentError, setSentimentError] = useState<string | null>(null);

  // --- Effect to Fetch Sentiment Data ---
  useEffect(() => {
    // Define the async function to call the API
    const fetchSentiment = async () => {
      // Don't run if there are no videos to analyze
      if (!filteredVideos || filteredVideos.length === 0) {
        setSentimentScore(0);
        setSentimentLabel("Neutral");
        return;
      }

      setIsLoadingSentiment(true);
      setSentimentError(null);

      try {
        const response = await fetch("/api/sentiment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videos:  filteredVideos.map(v => ({
            title: v.title,
            description: v.description,
          })) }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch sentiment");
        }

        const data: SentimentResponse = await response.json();
        setSentimentScore(data.sentimentScore);
        setSentimentLabel(data.sentimentLabel);
      } catch (error: any) {
        console.error("Sentiment analysis error:", error);
        setSentimentError("Analysis failed");
        setSentimentScore(null); // Clear old data on error
        setSentimentLabel(null);
      } finally {
        setIsLoadingSentiment(false);
      }
    };

    // Call the function
    fetchSentiment();
  }, [filteredVideos]); // Re-run whenever the filteredVideos prop changes

  // --- Logic for Pie Chart Data ---
  const categoryMap = useMemo(
    () =>
      categories.reduce((acc, category) => {
        acc[category.id] = category.name;
        return acc;
      }, {} as { [key: string]: string }),
    [categories]
  );

  const categoryCounts = filteredVideos.reduce((acc, video) => {
    const category = video.categoryId;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const chartData = Object.entries(categoryCounts)
    .map(([id, count]) => ({
      name: categoryMap[id] || `Unknown (${id})`,
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  // --- Logic for Sentiment Card Display ---
  let sentimentCardValue: string | number = "...";
  let sentimentCardSubtitle: string = "Analyzing...";

  if (!isLoadingSentiment) {
    if (sentimentError) {
      sentimentCardValue = "N/A";
      sentimentCardSubtitle = sentimentError;
    } else if (sentimentScore !== null) {
      sentimentCardValue = sentimentScore;
      sentimentCardSubtitle = sentimentLabel || "Neutral";
    } else {
      // Default state if something unexpected happens
      sentimentCardValue = 0;
      sentimentCardSubtitle = "Neutral";
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        Overview
      </h2>
      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        {/* --- UPDATED SENTIMENT CARD --- */}
        <MetricCard
          icon={<SmilePlus className="w-6 h-6" />}
          label="Title Sentiment"
          value={sentimentCardSubtitle}
          color="info"
        />
      </div>

      {/* Quick Stats */}
      {/* Combined Quick + Average Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
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

        {/* Average Metrics */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Average Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div className="text-center p-4 glass-card-light rounded-lg">
              {avgMetrics && avgMetrics.averageTimeToTrend > 0 ? (
                <>
                  <p className="text-2xl font-bold text-info">
                    {avgMetrics.averageTimeToTrend < 24
                      ? `${avgMetrics.averageTimeToTrend.toFixed(0)}h`
                      : `${(avgMetrics.averageTimeToTrend / 24).toFixed(1)}d`}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-secondary">
                  Calculating...
                </p>
              )}
              <p className="text-sm text-secondary mt-1">Time to Trend</p>
            </div>
            <div className="text-center p-4 glass-card-light rounded-lg">
              {avgMetrics && avgMetrics.averageDuration > 0 ? (
                <>
                  <p className="text-2xl font-bold text-success">
                    {Math.floor(avgMetrics.averageDuration / 60)}:
                    {String(
                      Math.floor(avgMetrics.averageDuration % 60)
                    ).padStart(2, "0")}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-secondary">
                  Calculating...
                </p>
              )}
              <p className="text-sm text-secondary mt-1">Video Duration</p>
            </div>
            <div className="text-center p-4 glass-card-light rounded-lg">
              {avgMetrics && avgMetrics.averageTitleLength > 0 ? (
                <>
                  <p className="text-2xl font-bold text-warning">
                    {avgMetrics.averageTitleLength.toFixed(0)}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-secondary">
                  Calculating...
                </p>
              )}
              <p className="text-sm text-secondary mt-1">Title Length</p>
            </div>
            <div className="text-center p-4 glass-card-light rounded-lg">
              {avgMetrics && avgMetrics.averageDescriptionLength > 0 ? (
                <>
                  <p className="text-2xl font-bold text-viral">
                    {avgMetrics.averageDescriptionLength > 1000
                      ? `${(avgMetrics.averageDescriptionLength / 1000).toFixed(
                          1
                        )}k`
                      : avgMetrics.averageDescriptionLength.toFixed(0)}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-secondary">
                  Calculating...
                </p>
              )}
              <p className="text-sm text-secondary mt-1">
                Description Length
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW: Category Distribution Pie Chart --- */}
      {country != "all" && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">
            Video Category Distribution
          </h3>
          {chartData.length > 0 ? (
            <div style={{ width: "100%", height: 400 }}>
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
                      backgroundColor: "rgba(30, 41, 59, 0.8)", // bg-slate-800 with opacity
                      borderColor: "rgba(51, 65, 85, 0.5)", // border-slate-700
                      borderRadius: "0.5rem", // rounded-lg
                      color: "#ffffff", // text-white
                    }}
                    itemStyle={{ color: "#ffffff" }}
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
      )}
    </div>
  );
}