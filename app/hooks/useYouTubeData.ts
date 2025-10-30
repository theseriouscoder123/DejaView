'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Video } from '@/app/types/youtube.types';
import { fetchTrendingVideos } from '@/app/services/youtube.api';

type CacheEntry = {
  videos: Video[];
  lastUpdated: Date;
};

export const useYouTubeData = (
  selectedCountry: string,
  selectedCategory: string
) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const cache = useRef(new Map<string, CacheEntry>());

  const fetchData = useCallback(async (regionCode: string, categoryId: string) => {
    const cacheKey = `${regionCode}-${categoryId}`;
    
    const cachedEntry = cache.current.get(cacheKey);
    if (cachedEntry) {
      setVideos(cachedEntry.videos);
      setLastUpdated(cachedEntry.lastUpdated);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedVideos = await fetchTrendingVideos(regionCode, categoryId);
      const now = new Date();

      setVideos(fetchedVideos);
      setLastUpdated(now);

      cache.current.set(cacheKey, { videos: fetchedVideos, lastUpdated: now });
    } catch (error) {
      console.error('Error in useYouTubeData fetching:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedCountry, selectedCategory);
  }, [selectedCountry, selectedCategory, fetchData]);

  const refreshData = useCallback(() => {
    const cacheKey = `${selectedCountry}-${selectedCategory}`;
    cache.current.delete(cacheKey);
    fetchData(selectedCountry, selectedCategory);
  }, [selectedCountry, selectedCategory, fetchData]);

  const metrics = useMemo(() => {
    if (videos.length === 0)
      return { avgViews: 0, avgEngagement: 0, hotNow: 0 };

    const avgViews =
      videos.reduce((sum, v) => sum + v.viewCount, 0) /
      videos.length;
    const avgEngagement =
      videos.reduce((sum, v) => sum + v.engagementRate, 0) /
      videos.length;
    const hotNow = videos.filter((v) => v.ageInHours < 24).length;

    return { avgViews, avgEngagement, hotNow };
  }, [videos]);

  const topVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => b.successScore - a.successScore)
      .slice(0, 10);
  }, [videos]);

  const scatterData = useMemo(() => {
    return videos.map((v) => ({
      x: v.viewCount,
      y: v.engagementRate,
      title: v.title,
      views: v.viewCount,
      engagement: v.engagementRate,
    }));
  }, [videos]);

  const topVelocity = useMemo(() => {
    return [...videos]
      .sort((a, b) => b.viralVelocity - a.viralVelocity)
      .slice(0, 5);
  }, [videos]);

  const durationData = useMemo(() => {
    const buckets: {
      [key: string]: { count: number; totalEngagement: number };
    } = {};
    videos.forEach((v) => {
      const bucket = v.durationBucket;
      if (!buckets[bucket]) {
        buckets[bucket] = { count: 0, totalEngagement: 0 };
      }
      buckets[bucket].count++;
      buckets[bucket].totalEngagement += v.engagementRate;
    });

    const order = ['<3min', '3-8min', '8-15min', '15-30min', '30min+'];
    return order.map((bucket) => ({
      bucket,
      count: buckets[bucket]?.count || 0,
      avgEngagement: buckets[bucket]
        ? buckets[bucket].totalEngagement / buckets[bucket].count
        : 0,
    }));
  }, [videos]);

  const heatmapData = useMemo(() => {
    const grid = Array(7)
      .fill(null)
      .map(() => Array(24).fill(0));

    videos.forEach((v) => {
      const day = v.publishedAt.getDay();
      const hour = v.publishedAt.getHours();
      grid[day][hour]++;
    });

    return grid;
  }, [videos]);

  const wordFrequency = useMemo(() => {
    const words: { [key: string]: number } = {};
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    ]);

    videos.forEach((v) => {
      const titleWords = v.title.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      titleWords.forEach((word) => {
        if (!stopWords.has(word)) {
          words[word] = (words[word] || 0) + 1;
        }
      });
    });

    return Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [videos]);

  const recencyData = useMemo(() => {
    const buckets: readonly string[] = [
      '<24hrs',
      '1-7 days',
      '7-30 days',
      '30+ days',
    ];
    const counts = buckets.map((bucket) => {
      const count = videos.filter(
        (v) => v.recencyBucket === bucket
      ).length;
      return {
        bucket,
        count,
        percentage:
          videos.length > 0
            ? ((count / videos.length) * 100).toFixed(1)
            : 0,
      };
    });
    return counts;
  }, [videos]);

  return {
    videos,
    loading,
    lastUpdated,
    refreshData,
    metrics,
    topVideos,
    scatterData,
    topVelocity,
    durationData,
    heatmapData,
    wordFrequency,
    recencyData,
  };
};


