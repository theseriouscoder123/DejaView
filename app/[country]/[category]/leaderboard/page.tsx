"use client";
import { useDashboard } from "@/app/context/DashboardContext";
import LeaderboardTab from "@/app/components/youtube/LeaderboardTab";

export default function LeaderboardPage() {
  const { topVideos } = useDashboard();
  return <LeaderboardTab topVideos={topVideos} />;
}
