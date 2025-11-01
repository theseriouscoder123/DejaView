"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useYouTubeData } from "@/app/hooks/useYouTubeData";
import { fetchCategories } from "@/app/services/youtube.api";
import {
  COUNTRIES,
  CATEGORIES as STATIC_CATEGORIES,
} from "@/app/config/youtube.config";
import Header from "@/app/components/youtube/Header";
import MainTabs from "@/app/components/youtube/MainTabs";
import CategoryTabs from "@/app/components/youtube/CategoryTabs";
import ExportButton from "@/app/components/youtube/ExportButton";
import LoadingSpinner from "@/app/components/youtube/LoadingSpinner";
import { HelpCircle } from "lucide-react";
import { DashboardContext } from "@/app/context/DashboardContext";
import { useParams } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ country: string; category: string }>();
  const { country, category } = params;

  const [selectedCountry, setSelectedCountry] = useState(country);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);

  // Fetch categories dynamically when country changes
  useEffect(() => {
    const loadCategories = async () => {
      setCategoryLoading(true);
      try {
        const fetchedMap = await fetchCategories(selectedCountry);
        const processedList = Object.values(fetchedMap).map(
          (fetchedCat: any) => {
            const staticCat =
              STATIC_CATEGORIES[
                fetchedCat.id as keyof typeof STATIC_CATEGORIES
              ];
            return {
              id: fetchedCat.id,
              name: fetchedCat.name,
              icon: staticCat ? staticCat.icon : HelpCircle,
            };
          }
        );
        setCategoryList(processedList.reverse());
      } catch (e) {
        console.error("Failed to fetch categories:", e);
        setCategoryList([]);
      } finally {
        setCategoryLoading(false);
      }
    };

    if (selectedCountry !== "global") {
      loadCategories();
    }
  }, [selectedCountry]);

  // Main YouTube data
  const {
    loading: videoLoading,
    lastUpdated,
    refreshData,
    videos,
    metrics,
    avgMetrics,
    topVideos,
    scatterData,
    topVelocity,
    durationData,
    heatmapData,
    wordFrequency,
    recencyData,
    tagFrequency,
    techStats,
    externalLinks,
  } = useYouTubeData(selectedCountry, selectedCategory);

  const selectedCountryData = useMemo(
    () => COUNTRIES.find((c) => c.code === selectedCountry),
    [selectedCountry]
  );

  const isLoading = videoLoading && videos.length === 0;
  if (isLoading) return <LoadingSpinner />;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(videos, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `youtube-trending-${selectedCountry}-${selectedCategory}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updatePath = (country: string, category: string) => {
    router.push(`/${country}/${category}/`);
  };

  return (
    <DashboardContext.Provider
      value={{
        selectedCountry,
        setSelectedCountry,
        selectedCategory,
        setSelectedCategory,
        videos,
        metrics,
        topVideos,
        scatterData,
        topVelocity,
        durationData,
        heatmapData,
        wordFrequency,
        recencyData,
        categoryList,
        refreshData,
        loading: videoLoading,
        lastUpdated,
        tagFrequency,
        techStats,
        avgMetrics,
        externalLinks,
      }}
    >
      <div className="min-h-screen bg-background text-primary">
        <Header
        trendingTitles={videos.map((v) => v.title)}
          selectedCountryData={selectedCountryData}
          lastUpdated={lastUpdated}
          loading={videoLoading || categoryLoading}
          onRefresh={refreshData}
          showCountryDropdown={showCountryDropdown}
          onToggleCountryDropdown={() =>
            setShowCountryDropdown(!showCountryDropdown)
          }
          onCountrySelect={(code) => {
            setSelectedCountry(code);
            updatePath(code, selectedCategory);
          }}
          selectedCategory={selectedCategory}
          onCategorySelect={(cat) => {
            setSelectedCategory(cat);
            updatePath(selectedCountry, cat);
          }}
        />

        <div className="max-w-7xl mx-auto px-6 py-6">
          <MainTabs />

          {!categoryLoading && categoryList.length > 0 && (
            <div className={`pb-12 md:pb-0 transition-all duration-300 ease-in-out md:ml-20 ${country == "global"? "": "mb-5"}`}>
              <CategoryTabs
                key={selectedCountry}
                categories={categoryList}
                selectedCategory={selectedCategory}
                onSelect={(cat) => {
                  setSelectedCategory(cat);
                  updatePath(selectedCountry, cat);
                }}
              />
            </div>
          )}

          <div className="pb-12 md:pb-0 md:ml-20 transition-all duration-300 ease-in-out">
            {children}
          </div>
        </div>

        <ExportButton onExport={handleExport} />

        {showCountryDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCountryDropdown(false)}
          />
        )}
      </div>
    </DashboardContext.Provider>
  );
}
