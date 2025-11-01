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
    const techStats = useMemo(() => {
    if (videos.length === 0)
      return {
        subtitlePercent: 0,
        k4Percent: 0,
        emojiTitlePercent: 0,
        customThumbPercent: 0,
        taggedPercent: 0,
      };

    const total = videos.length;
    const subtitleCount = videos.filter((v) => v.hasSubtitles).length;
    const k4Count = videos.filter((v) => v.is4k).length;
    const emojiTitleCount = videos.filter((v) => v.hasEmojiInTitle).length;
    const customThumbCount = videos.filter((v) => v.hasCustomThumbnail).length;
    const taggedCount = videos.filter((v) => v.hasTags).length;

    return {
      subtitlePercent: (subtitleCount / total) * 100,
      k4Percent: (k4Count / total) * 100,
      emojiTitlePercent: (emojiTitleCount / total) * 100,
      customThumbPercent: (customThumbCount / total) * 100,
      taggedPercent: (taggedCount / total) * 100,
    };
  }, [videos]);

const tagFrequency = useMemo(() => {
  const tags: { [key: string]: number } = {};

  videos.forEach((v) => {
    if (Array.isArray(v.tags)) {
      v.tags.forEach((tag) => {
        const cleanTag = tag.toLowerCase().trim();
        if (cleanTag.length > 1) {
          tags[cleanTag] = (tags[cleanTag] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(tags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30); // Slightly more tags than title words
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

    const order = ['<1min','1-3min', '3-8min', '8-15min', '15-30min', '30min+'];
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
const avgMetrics = useMemo(() => {
  if (videos.length === 0)
    return {
      averageTimeToTrend: 0,
      averageDuration: 0,
      averageTitleLength: 0,
      averageDescriptionLength: 0,
    };

  console.log('=== AVG METRICS DEBUG ===');
  console.log('Total videos:', videos.length);
  console.log('Sample video ageInHours:', videos[0]?.ageInHours);
  console.log('Sample video durationSeconds:', videos[0]?.durationSeconds);
  console.log('Sample video title length:', videos[0]?.title?.length);
  console.log('Sample video description length:', videos[0]?.description?.length);

  const totalTimeToTrend = videos.reduce(
    (sum, v) => sum + (v.ageInHours || 0),
    0
  );
  const totalDuration = videos.reduce(
    (sum, v) => sum + (v.durationSeconds || 0),
    0
  );
  const totalTitleLength = videos.reduce(
    (sum, v) => sum + (v.title?.length || 0),
    0
  );
  const totalDescriptionLength = videos.reduce(
    (sum, v) => sum + (v.description?.length || 0),
    0
  );

  console.log('Totals:', {
    totalTimeToTrend,
    totalDuration,
    totalTitleLength,
    totalDescriptionLength
  });

  const result = {
    averageTimeToTrend: totalTimeToTrend / videos.length,
    averageDuration: totalDuration / videos.length,
    averageTitleLength: totalTitleLength / videos.length,
    averageDescriptionLength: totalDescriptionLength / videos.length,
  };

  console.log('Averages:', result);

  return result;
}, [videos]);
const externalLinks = useMemo(() => {
  const domainCounts: { [key: string]: number } = {};
  
  // Regex to match URLs in descriptions
  const urlRegex = /https?:\/\/(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)(?:\/[^\s]*)?/gi;
  
  videos.forEach((v) => {
    if (v.description) {
      const urls = v.description.matchAll(urlRegex);
      
      for (const match of urls) {
        let domain = match[1].toLowerCase();
        
        // Normalize common variations
        domain = domain
          .replace(/^(www\.|m\.)/, '') // Remove www. or m. prefix
          .replace(/\.com\..*$/, '.com') // Handle country-specific domains
          .replace(/\.co\..*$/, '.co'); // Handle .co.uk, .co.in, etc.
        
        // Group common platforms
        if (domain.includes('youtu.be') || domain.includes('youtube.com')) {
          domain = 'youtube.com';
        } else if (domain.includes('instagram.com') || domain.includes('instagr.am')) {
          domain = 'instagram.com';
        } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
          domain = 'twitter.com/x.com';
        } else if (domain.includes('discord.gg') || domain.includes('discord.com')) {
          domain = 'discord.gg';
        } else if (domain.includes('facebook.com') || domain.includes('fb.me')) {
          domain = 'facebook.com';
        } else if (domain.includes('tiktok.com')) {
          domain = 'tiktok.com';
        } else if (domain.includes('twitch.tv')) {
          domain = 'twitch.tv';
        } else if (domain.includes('patreon.com')) {
          domain = 'patreon.com';
        } else if (domain.includes('ko-fi.com')) {
          domain = 'ko-fi.com';
        } else if (domain.includes('shopify.com') || domain.includes('myshopify.com')) {
          domain = 'shopify.com';
        } else if (domain.includes('gofundme.com')) {
          domain = 'gofundme.com';
        } else if (domain.includes('linktree') || domain.includes('linktr.ee')) {
          domain = 'linktr.ee';
        } else if (domain.includes('spotify.com')) {
          domain = 'spotify.com';
        } else if (domain.includes('apple.com')) {
          domain = 'apple.com';
        }
        
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      }
    }
  });
  
  // Calculate percentages and return top 5
  const totalVideos = videos.length;
  const topDomains = Object.entries(domainCounts)
    .map(([domain, count]) => ({
      domain,
      count,
      percentage: totalVideos > 0 ? ((count / totalVideos) * 100).toFixed(1) : '0',
      videosWithLink: count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return topDomains;
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
    tagFrequency,
    avgMetrics,
    techStats,
    externalLinks,
  };
};


