"use client";

import React, { ReactNode } from "react";
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
} from "recharts";
// Assuming CHART_COLORS contains an array of distinct, vibrant colors that work well on a light background
import { CHART_COLORS } from "@/app/config/youtube.config";
import { Video } from "@/app/types/youtube.types";
import { ExternalLink, Globe, TrendingUp } from "lucide-react";
// Importing Lucide icons directly
import { ArrowRight } from "lucide-react";

// --- Tooltip Styles for Light Mode (Using simple white/light gray background) ---

const RecencyTooltip = ({ active, payload }: any) => {
  if (active && payload?.[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur-sm shadow-lg p-3 rounded-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{data.bucket}</p>
        <p className="text-sm text-gray-700">Count: {payload[0].value}</p>
        <p className="text-xs text-gray-500">{data.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

const LanguageTooltip = ({ active, payload }: any) => {
  if (active && payload?.[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur-sm shadow-lg p-3 rounded-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{data.name}</p>
        <p className="text-sm text-gray-700">Count: {data.value}</p>
        <p className="text-xs text-gray-500">
          {/* @ts-ignore */}
          {payload[0].percent?.toFixed(0)}% of total
        </p>
      </div>
    );
  }
  return null;
};

const ExternalLinksTooltip = ({ active, payload }: any) => {
  if (active && payload?.[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur-sm shadow-lg p-3 rounded-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{data.domain}</p>
        <p className="text-sm text-gray-700">
          Videos with link: {data.videosWithLink}
        </p>
        <p className="text-xs text-gray-500">
          {data.percentage}% of trending videos
        </p>
      </div>
    );
  }
  return null;
};

// --- Badge Component (Retained original styles which are light-friendly) ---

interface TagBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success";
}

const TagBadge = ({ children, variant = "default" }: TagBadgeProps) => {
  const styles = {
    default: { backgroundColor: "#F1F5F9", color: "#64748B" },
    primary: {
      backgroundColor: "#00D4FF15",
      color: "#15A5FF",
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
      className="px-3 py-1 rounded-full text-xs font-medium transition-transform hover:scale-110 flex-shrink-0"
      style={styles[variant]}
    >
      {children}
    </span>
  );
};

// --- Type Definitions (Retained) ---

interface IntelligenceTabProps {
  wordFrequency: [string, number][];
  recencyData: any[];
  tagFrequency: any[];
  filteredVideos: Video[];
  externalLinks: Array<{
    domain: string;
    count: number;
    percentage: string;

    videosWithLink: number;
  }>;
}

// --- Pie Chart Label Rendering (Text color changed to black for light mode) ---

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="black" // Explicitly black for light mode visibility
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// --- Custom Reusable Components (Modified for Light Mode Only) ---

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="pb-4 border-b border-gray-200 mb-6">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
    {children}
  </h2>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-base text-gray-500 mt-1">{children}</p>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-4">
    {children}
  </h3>
);

// --- Main Component ---

export default function IntelligenceTab({
  wordFrequency,
  recencyData,
  filteredVideos,
  tagFrequency,
  externalLinks,
}: IntelligenceTabProps) {
  // Define a set of vibrant colors for bars and pies
  const barColors = [
    CHART_COLORS.viral,
    CHART_COLORS.warning,
    CHART_COLORS.info,
    CHART_COLORS.secondary,

    "#3b82f6", // blue-500
    "#ec4899", // pink-500
    "#10b981", // emerald-500
    "#f97316", // orange-500
    "#8b5cf6", // violet-500
  ];
  const externalLinksChartData = React.useMemo(
    () =>
      externalLinks.map((link) => ({
        ...link,
        percentageValue: Number(link.percentage),
      })),
    [externalLinks]
  );
  const pieColors = [
    CHART_COLORS.viral,
    CHART_COLORS.info,
    "#FFBB28",
    "#FF8042",
    CHART_COLORS.warning,
    "#00C49F",
    CHART_COLORS.secondary,
    "#8884d8",
  ];

  // Language Data Memoization (Retained)
  const languageData = React.useMemo(() => {
    const langMap = new Map();

    const getLanguageName = (langCode: string) => {
      try {
        const displayNames = new Intl.DisplayNames(["en"], {
          type: "language",
        });
        return displayNames.of(langCode);
      } catch (error) {
        console.error(`Invalid language code provided: ${langCode}`, error);
        return langCode;
      }
    };

    filteredVideos.forEach((video) => {
      const langCode = video.lang || "Unknown";
      const baseLang = langCode.split("-")[0];
      const langName =
        getLanguageName(langCode) ||
        getLanguageName(baseLang) ||
        langCode.toUpperCase();

      langMap.set(langName, (langMap.get(langName) || 0) + 1);
    });

    return Array.from(langMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredVideos]);

  // Icon Utility (Modified to return Lucide components instead of strings/emojis for consistency)
  const getDomainIconComponent = (domain: string) => {
    const lowerDomain = domain.toLowerCase();
    // Using Globe as default/fallback for all external links for simplicity and light-mode theme
    return Globe;
  };

  // Custom Card/Section for Intelligence Tab: changed from 'glass-card' to standard light mode card style
  const IntelligenceSection = ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-6 shadow-md ${className}`}
    >
      {children}
    </div>
  );

  // Custom background for the word/tag clouds (was 'glass-card-light')
  const CloudBackground = ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <div
      className={`bg-gray-50 border border-gray-100 rounded-lg ${className}`}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen">
      {" "}
      {/* Set a light background for the page/container */}
      <h2 className="text-2xl font-bold mb-8 text-gray-900">
        Content Intelligence Dashboard
      </h2>
      <div className="space-y-8">
        {/* Word Cloud & Keywords */}
        <IntelligenceSection>
          <h3 className="text-xl font-bold mb-6 text-gray-800">
            Title DNA Analyzer
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <h4 className="text-sm font-medium text-indigo-600 mb-4 uppercase tracking-widest">
                Word Cloud
              </h4>
              <CloudBackground className="flex flex-wrap gap-3 items-center justify-center p-8 min-h-[300px]">
                {wordFrequency.map(([word, freq], idx) => (
                  <span
                    key={word}
                    className="cursor-pointer hover:scale-110 transition-transform font-bold"
                    style={{
                      fontSize: `${
                        12 + (freq / (wordFrequency[0]?.[1] || 1)) * 24
                      }px`,
                      color: `hsl(${(idx * 30) % 360}, 70%, 30%)`, // Darker HSL for light background
                    }}
                  >
                    {word}
                  </span>
                ))}
              </CloudBackground>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-sm font-medium text-indigo-600 mb-4 uppercase tracking-widest">
                Top Keywords
              </h4>
              <div className="space-y-3">
                {wordFrequency.slice(0, 10).map(([word, freq]) => (
                  <div key={word} className="flex items-center gap-3">
                    <span className="text-sm w-24 truncate text-gray-700">
                      {word}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full"
                        style={{
                          width: `${
                            (freq / (wordFrequency[0]?.[1] || 1)) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {freq}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </IntelligenceSection>

        {/* Tag Insights */}
        <IntelligenceSection>
          <h3 className="text-xl font-bold mb-6 text-gray-800">Tag Insights</h3>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <h4 className="text-sm font-medium text-indigo-600 mb-4 uppercase tracking-widest">
                Tag Cloud
              </h4>
              <CloudBackground className="flex flex-wrap gap-2 justify-center p-6 min-h-[200px]">
                {tagFrequency.map(([tag]) => (
                  <TagBadge key={tag} variant="primary">
                    #{tag}
                  </TagBadge>
                ))}
              </CloudBackground>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-sm font-medium text-indigo-600 mb-4 uppercase tracking-widest">
                Top Tags
              </h4>
              <div className="space-y-3">
                {tagFrequency.slice(0, 10).map(([tag, freq]) => (
                  <div key={tag} className="flex items-center gap-3">
                    <span className="text-sm w-24 truncate text-gray-700">
                      #{tag}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full"
                        style={{
                          width: `${
                            (freq / (tagFrequency[0]?.[1] || 1)) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {freq}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </IntelligenceSection>

        {/* Monetization & Community Links Card (Using the custom Card component) */}
        <Card className="min-w-full">
          <CardHeader>
            <CardTitle>Community Engagement & Monetization</CardTitle>
            <CardDescription>
              Where your community lives and how you drive revenue.
            </CardDescription>
          </CardHeader>

          <div className="pt-4">
            {externalLinks && externalLinks.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-10 md:gap-14">
                {/* --- COLUMN 1: Donut Chart --- */}
                <div className="flex flex-col items-center xl:items-start">
                  <SectionTitle>Platform Distribution</SectionTitle>

                  {/* Container for the chart: centered, aspect ratio controlled */}
                  <div className="w-full max-w-md aspect-square min-h-[300px] flex-shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={externalLinksChartData}
                          dataKey="percentageValue"
                          nameKey="domain"
                          cx="50%"
                          cy="50%"
                          outerRadius={140}
                          stroke="#FFFFFF"
                          strokeWidth={1}
                          label={({ name, percent }) =>
                            `${name?.split(".")[0]}`
                          }
                        >
                          {externalLinks.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={barColors[index % barColors.length]}
                              className="cursor-pointer transition-opacity hover:opacity-80 outline-none"
                            />
                          ))}
                        </Pie>
                        {/* <Legend /> */}
                        <Tooltip content={<ExternalLinksTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* --- COLUMN 2: Top Platforms List (acts as legend) --- */}
                <div className="flex flex-col">
                  <SectionTitle>Top Platforms</SectionTitle>

                  {/* Custom ScrollArea using Tailwind classes for max height and custom scrollbar */}
                  <div className="max-h-[400px] overflow-y-auto pr-3 space-y-3">
                    {externalLinks.map((link, idx) => {
                      const Icon =
                        getDomainIconComponent(link.domain) || TrendingUp; // Fallback icon
                      const color = barColors[idx % barColors.length];

                      return (
                        <div
                          key={link.domain}
                          className="flex items-center justify-between gap-4 p-3 rounded-xl border border-transparent hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* 1. Icon Container */}
                            <div
                              className="p-3 rounded-xl flex-shrink-0"
                              style={{ backgroundColor: `${color}20` }} // Using color with alpha (20) for background
                            >
                              <Icon
                                className="w-5 h-5"
                                style={{ color: color }}
                              />
                            </div>

                            {/* 2. Text (Domain & Count) */}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate text-gray-900">
                                {link.domain}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                {link.videosWithLink} videos
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                              </div>
                            </div>
                          </div>

                          {/* 3. Percentage - Custom Badge/Pill style */}
                          <div
                            className="text-lg font-extrabold px-3 py-1.5 rounded-full flex-shrink-0 text-center"
                            style={{
                              color: color,
                              backgroundColor: `${color}20`,
                              minWidth: "70px",
                            }} // Added min-width for alignment
                          >
                            {Math.round(Number(link.percentage))}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* === EMPTY STATE (Light Mode) === */
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-gray-500 p-8 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                <Globe
                  className="w-20 h-20 mx-auto mb-6 text-gray-300"
                  strokeWidth={1}
                />
                <p className="text-xl font-semibold text-gray-900">
                  No External Links Detected
                </p>
                <p className="text-sm mt-3 max-w-sm">
                  Links from your video descriptions will appear here once our
                  system processes your content. Please check back later.
                </p>
                <button className="mt-6 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-1">
                  Configure Data Sources <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Charts Row: Recency & Language Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recency Distribution */}
          <IntelligenceSection>
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              Recency Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={recencyData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                {/* Lighter, subtle grid lines for light mode */}
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                {/* Dark text for axis for light mode */}
                <XAxis
                  dataKey="bucket"
                  stroke="#4b5563"
                  tick={{ fill: "#4b5563" }}
                />
                <YAxis stroke="#4b5563" tick={{ fill: "#4b5563" }} />
                <Tooltip content={<RecencyTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} >
                  {recencyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColors[index % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </IntelligenceSection>

          {/* Language Distribution */}
        <IntelligenceSection>
  <h3 className="text-xl font-bold mb-6 text-gray-800">
    Language Distribution
  </h3>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Tooltip content={<LanguageTooltip />} />
      <Legend
        iconType="circle"
        wrapperStyle={{ paddingTop: "10px" }}
      />
      <Pie
        data={languageData}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
        nameKey="name"
      >
        {languageData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={pieColors[index % pieColors.length]}
          />
        ))}
      </Pie>
    </PieChart>
  </ResponsiveContainer>
</IntelligenceSection>
        </div>
        {/* --- END CHARTS ROW --- */}
      </div>
    </div>
  );
}
