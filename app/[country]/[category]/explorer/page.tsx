"use client";
import { useDashboard } from "@/app/context/DashboardContext";
import ExplorerTab from "@/app/components/youtube/ExplorerTab";

export default function ExplorerPage() {
  const { videos } = useDashboard();
  return <ExplorerTab filteredVideos={videos} />;
}
