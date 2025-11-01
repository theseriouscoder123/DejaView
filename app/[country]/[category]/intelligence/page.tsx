"use client";
import { useDashboard } from "@/app/context/DashboardContext";
import IntelligenceTab from "@/app/components/youtube/IntelligenceTab";

export default function IntelligencePage() {
  const { wordFrequency, recencyData, videos, tagFrequency,externalLinks } = useDashboard();
  return (
    <IntelligenceTab
      wordFrequency={wordFrequency}
      recencyData={recencyData}
      filteredVideos={videos}
      tagFrequency={tagFrequency}
      externalLinks={externalLinks}
    />
  );
}
    