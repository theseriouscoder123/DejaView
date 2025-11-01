"use client";
import { useDashboard } from "@/app/context/DashboardContext";
import AnalyticsTab from "@/app/components/youtube/AnalyticsTab";

export default function AnalyticsPage() {
  const {
    selectedCategory,
    setSelectedCategory,
    scatterData,
    topVelocity,
    durationData,
    heatmapData,
    techStats
  } = useDashboard();

  return (
    <AnalyticsTab
    techStats={techStats}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      scatterData={scatterData}
      topVelocity={topVelocity}
      durationData={durationData}
      heatmapData={heatmapData}
    />
  );
}
