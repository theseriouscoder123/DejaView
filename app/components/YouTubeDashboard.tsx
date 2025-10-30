"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  COUNTRIES,
  MAIN_TABS,
  CATEGORIES as STATIC_CATEGORIES, // Renamed static import to avoid conflict
} from "@/app/config/youtube.config";
import { useYouTubeData } from "@/app/hooks/useYouTubeData";
import { fetchCategories } from "@/app/services/youtube.api"; // Assuming service path
import { Category } from "@/app/types/youtube.types"; // Assuming types path
import Header from "./youtube/Header";
import MainTabs from "./youtube/MainTabs";
import OverviewTab from "./youtube/OverviewTab";
import LeaderboardTab from "./youtube/LeaderboardTab";
import AnalyticsTab from "./youtube/AnalyticsTab";
import IntelligenceTab from "./youtube/IntelligenceTab";
import ExplorerTab from "./youtube/ExplorerTab";
import LoadingSpinner from "./youtube/LoadingSpinner";
import ExportButton from "./youtube/ExportButton";
import CategoryTabs from "./youtube/CategoryTabs";
import { HelpCircle } from "lucide-react"; // Fallback icon

// Main Component
export default function YouTubeDashboard() {
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeMainTab, setActiveMainTab] = useState("overview");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

  // State for dynamically loaded categories
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true); // Fetch dynamic categories when country changes

  useEffect(() => {
    const loadCategories = async () => {
      setCategoryLoading(true);
      try {
        const fetchedMap = await fetchCategories(selectedCountry);

        // Process the fetched map, merging with static icons
        const processedList: Category[] = Object.values(fetchedMap).map(
          (fetchedCat) => {
            // Find static category data (which has the icon) by ID
            const staticCatData =
              STATIC_CATEGORIES[
                fetchedCat.id as keyof typeof STATIC_CATEGORIES
              ];
            return {
              id: fetchedCat.id,
              name: fetchedCat.name,
              // Use static icon if found, else fallback
              icon: staticCatData ? staticCatData.icon : HelpCircle,
            };
          }
        );

        // Set the final list, keeping the user's reverse preference
        setCategoryList(processedList.reverse());

        // Ensure 'all' is still selected if category list changes
        if (!fetchedMap[selectedCategory]) {
          setSelectedCategory("all");
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategoryList([]); // Set empty on error
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategories();
  }, [selectedCountry]); // Re-fetch when selectedCountry changes // Custom hook for fetching main video data

  const {
    loading: videoLoading, // Renamed to avoid conflict
    lastUpdated,
    refreshData,
    videos,
    metrics,
    topVideos,
    scatterData,
    topVelocity,
    durationData,
    heatmapData,
    wordFrequency,
    recencyData,
  } = useYouTubeData(selectedCountry, selectedCategory);

  const selectedCountryData = useMemo(
    () => COUNTRIES.find((c) => c.code === selectedCountry),
    [selectedCountry]
  );

  const handleRefresh = () => {
    refreshData(); // This refreshes video data
    // We could also add a category refresh here if needed
  };

  const handleExport = () => {
    const exportData = videos.map((v) => ({
      ...v,
      publishedAt: v.publishedAt.toISOString(),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `youtube-trending-${selectedCountry}-${selectedCategory}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Combined loading state
  const isLoading = videoLoading && videos.length === 0;

  const renderTabContent = () => {
    if (isLoading) return null; // Don't render tabs if main content is loading

    switch (activeMainTab) {
      case "overview":
        return (
          <OverviewTab
            metrics={metrics}
            filteredVideos={videos}
            categories={categoryList}
          />
        );
      case "leaderboard":
        return <LeaderboardTab topVideos={topVideos} />;
      case "analytics":
        return (
          <AnalyticsTab
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            scatterData={scatterData}
            topVelocity={topVelocity}
            durationData={durationData}
            heatmapData={heatmapData}
          />
        );
      case "intelligence":
        return (
          <IntelligenceTab
            wordFrequency={wordFrequency}
            recencyData={recencyData}
            filteredVideos={videos}
          />
        );
      case "explorer":
        return <ExplorerTab filteredVideos={videos} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background text-primary ">
      <Header
        selectedCountryData={selectedCountryData}
        lastUpdated={lastUpdated}
        loading={videoLoading || categoryLoading} // Show loader if either is loading
        onRefresh={handleRefresh}
        showCountryDropdown={showCountryDropdown}
        onToggleCountryDropdown={() =>
          setShowCountryDropdown(!showCountryDropdown)
        }
        onCountrySelect={(code) => {
          setSelectedCountry(code);
          setSelectedCategory("all");
          setActiveMainTab("overview");
          setShowCountryDropdown(false);
        }}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <MainTabs
          tabs={MAIN_TABS}
          activeTab={activeMainTab}
          onSelectTab={setActiveMainTab}
          isExpanded={isSidebarExpanded}
          setExpanded={setSidebarExpanded}
        />
        <div
          className={`
	            pb-12
	            md:pb-0
	            transition-all duration-300 ease-in-out
	            md:ml-20
	            
	          `}
        >
          {!categoryLoading && categoryList.length > 0 && (
            <CategoryTabs
              key={selectedCountry} // Add key to reset "More" state on country change
              categories={categoryList}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          )}
                              {renderTabContent()}       {" "}
        </div>
             {" "}
      </div>
            <ExportButton onExport={handleExport} />     {" "}
      {showCountryDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCountryDropdown(false)}
        />
      )}
         {" "}
    </div>
  );
}
