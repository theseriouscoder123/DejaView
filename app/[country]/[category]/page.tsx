"use client";
import { useDashboard } from "@/app/context/DashboardContext";
import OverviewTab from "@/app/components/youtube/OverviewTab";

export default function OverviewPage() {
  const { metrics, videos, categoryList, avgMetrics } = useDashboard();
  return <OverviewTab avgMetrics={avgMetrics} metrics={metrics} filteredVideos={videos} categories={categoryList} />;
}
