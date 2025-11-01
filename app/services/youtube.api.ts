import { parseISO, differenceInHours } from "date-fns";
import { API_KEY, BASE_URL } from "@/app/config/youtube.config";
import {
  parseISO8601Duration,
  getDurationBucket,
  getRecencyBucket,
  getPerformanceTier,
} from "@/app/utils/youtube.utils";
import { Video } from "@/app/types/youtube.types";

const processVideoData = (video: any): Video => {
  const views = parseInt(video.statistics.viewCount || 0);
  const likes = parseInt(video.statistics.likeCount || 0);
  const comments = parseInt(video.statistics.commentCount || 0);
  const publishedAt = parseISO(video.snippet.publishedAt);
  const tags = video.snippet.tags || [];
  const ageInHours = differenceInHours(new Date(), publishedAt);
  const durationSeconds = parseISO8601Duration(video.contentDetails.duration);
  const description = video.snippet.description || "";

  const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
  const viralVelocity = ageInHours > 0 ? views / ageInHours : 0;
  const velocityScore = Math.min(viralVelocity / 10000, 10);
  const recencyBonus = ageInHours < 24 ? 10 : ageInHours < 168 ? 5 : 0;
  const successScore =
    engagementRate * 0.3 + velocityScore * 0.4 + recencyBonus * 0.3;

  // --- New content-quality metrics ---
  const hasSubtitles = video.contentDetails.caption === "true";
  const isHD = video.contentDetails.definition === "hd";
  const is4k = video.contentDetails.definition === "4k";

  const hasEmojiInTitle = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(video.snippet.title);
  const hasCustomThumbnail =
    !!video.snippet.thumbnails?.standard || !!video.snippet.thumbnails?.maxres;
  const hasTags = Array.isArray(video.snippet.tags) && video.snippet.tags.length > 0;

  // --- Shorts detection logic ---
  const titleHasShorts = video.snippet.title.toLowerCase().includes("shorts");
  const tagHasShorts = Array.isArray(tags) && tags.some((t) => t.toLowerCase().includes("shorts"));
  const durationSuggestsShorts = durationSeconds <= 180; 

  // Apply progressive logic
  const isShorts = (titleHasShorts || tagHasShorts )&& (durationSuggestsShorts);

  return {
    id: video.id,
    title: video.snippet.title,
    channelTitle: video.snippet.channelTitle,
    publishedAt,
    channelId: video.snippet.channelId,
    thumbnail: video.snippet.thumbnails.medium.url,
    categoryId: video.snippet.categoryId,
    viewCount: views,
    likeCount: likes,
    commentCount: comments,
    lang: video.snippet.defaultLanguage,
    engagementRate,
    ageInHours,
    viralVelocity,
    successScore,
    durationSeconds,
    durationBucket: getDurationBucket(durationSeconds),
    recencyBucket: getRecencyBucket(ageInHours),
    performanceTier: getPerformanceTier(views),
    tags,
    description,
    hasSubtitles,
    isHD,
    hasEmojiInTitle,
    hasCustomThumbnail,
    hasTags,
    isShorts, 
    is4k,
  };
};



/**
 * Fetches and processes trending videos from the YouTube API.
 * Now supports filtering by videoCategoryId.
 *
 * @param regionCode - The ISO 3166-1 alpha-2 country code.
 * @param categoryId - The YouTube video category ID, or "all" to fetch all categories.
 * @returns A promise that resolves to an array of Video objects.
 */
export const fetchTrendingVideos = async (
  regionCode: string,
  categoryId: string
): Promise<Video[]> => {
  if (!API_KEY) {
    console.error("YouTube API key is missing.");
    return [];
  } // Use URLSearchParams for a cleaner and safer way to build the query string

  const params = new URLSearchParams({
    part: "snippet,statistics,contentDetails",
    chart: "mostPopular",
    maxResults: "50",
    key: API_KEY,
  });

  if (regionCode !== "global") {
    params.append("regionCode", regionCode);
  } // Only add the videoCategoryId parameter if a specific category is selected

  if (categoryId !== "all") {
    params.append("videoCategoryId", categoryId);
  }

  const url = `${BASE_URL}/videos?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching videos:", errorData);
      throw new Error(
        `Failed to fetch trending videos: ${errorData.error.message}`
      );
    }

    const data = await response.json();

    if (data.items && Array.isArray(data.items)) {
      // Map over the results using our clean helper function
      return data.items.map(processVideoData);
    } // Return an empty array if data.items is not present

    return [];
  } catch (error) {
    console.error("Fetch operation failed:", error); // Re-throw the error so the hook's catch block can handle it
    throw error;
  }
};

/**
 * Defines the shape of a category entry.
 * Note: Icons are not provided by this service and should be mapped in the UI.
 */
export type CategoryInfo = {
  id: string;
  name: string;
};

/**
 * Defines the map structure for categories, keyed by category ID.
 */
export type CategoryMap = Record<string, CategoryInfo>;

/**
 * Fetches video categories from the YouTube API.
 *
 * @param countryCode - The ISO 3166-1 alpha-2 country code, or "all".
 * @returns A promise that resolves to a map of CategoryInfo objects,
 * keyed by their category ID.
 */
export const fetchCategories = async (
  countryCode: string
): Promise<CategoryMap> => {
  if (!API_KEY) {
    console.error("YouTube API key is missing.");
    throw new Error("YouTube API key is missing.");
  }

  const params = new URLSearchParams({
    part: "snippet",
    key: API_KEY,
  });

  if (countryCode !== "global") {
    params.append("regionCode", countryCode);
  }

  const url = `${BASE_URL}/videoCategories?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching categories:", errorData);
      throw new Error(`Failed to fetch categories: ${errorData.error.message}`);
    }

    const data = await response.json();

    // Initialize the map with the 'all' category
    const categories: CategoryMap = {
      all: { id: "all", name: "Overall" },
    };

    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item: any) => {
        // Only include categories that are 'assignable' (i.e., videos can be tagged with them)
        if (
          item.snippet &&
          item.snippet.assignable &&
          ![27].some((excludedId) => excludedId === parseInt(item.id))
        ) {
          categories[item.id] = {
            id: item.id,
            name: item.snippet.title,
          };
        }
      });
    }

    return categories;
  } catch (error) {
    console.error("Fetch operation failed:", error);
    // Re-throw the error so the caller can handle it
    throw error;
  }
};

// Separate API fetching functions
export const fetchYouTubeChannel = async (
  channelId: string,
  apiKey: string
) => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings,contentDetails&id=${channelId}&key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch channel data");
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Channel not found");
  }

  return data.items[0];
};

export const fetchChannelVideos = async (
  channelId: string,
  apiKey: string,
  maxResults = 10
) => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch channel videos");
  }

  const data = await response.json();
  return data.items || [];
};
// API Fetching Function
export const fetchYouTubeVideo = async (videoId: any) => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch video data");
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found");
  }

  return data.items[0];
};
/**
 * Extracts video ID from various YouTube video URL formats
 */
const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^[a-zA-Z0-9_-]{11}$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1] || match[0];
  }

  return null;
};

/**
 * Extracts channel ID from various YouTube channel URL formats
 */
const extractChannelId = (url: string): string | null => {
  const patterns = [
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    /^UC[a-zA-Z0-9_-]{22}$/, // Direct channel ID (starts with UC)
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1] || match[0];
  }

  return null;
};

/**
 * Extracts custom channel handle/username from URL
 */
const extractChannelHandle = (url: string): string | null => {
  const patterns = [
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

/**
 * Resolves channel handle to channel ID using YouTube API
 */
const resolveChannelHandle = async (handle: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${handle}&type=channel&maxResults=1&key=${API_KEY}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.channelId;
    }

    // Alternative method using channels endpoint with forHandle parameter
    const handleResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${API_KEY}`
    );

    if (handleResponse.ok) {
      const handleData = await handleResponse.json();
      if (handleData.items && handleData.items.length > 0) {
        return handleData.items[0].id;
      }
    }

    return null;
  } catch (error) {
    console.error("Error resolving channel handle:", error);
    return null;
  }
};

/**
 * Main router function - detects URL type and redirects accordingly
 * @param input - YouTube URL, video ID, channel ID, or channel handle
 * @param router - Next.js router instance (from useRouter hook)
 */
export const routeYouTubeUrl = async (
  input: string,
  router: any
): Promise<void> => {
  const trimmedInput = input.trim();

  // Try to extract video ID first
  const videoId = extractVideoId(trimmedInput);
  if (videoId) {
    router.push(`/video/${videoId}`);
    return;
  }

  // Try to extract channel ID
  const channelId = extractChannelId(trimmedInput);
  if (channelId) {
    router.push(`/channel/${channelId}`);
    return;
  }

  // Try to extract and resolve channel handle
  const channelHandle = extractChannelHandle(trimmedInput);
  if (channelHandle) {
    const resolvedChannelId = await resolveChannelHandle(channelHandle);
    if (resolvedChannelId) {
      router.push(`/channel/${resolvedChannelId}`);
      return;
    }
  }

  // If input looks like a handle without URL (starts with @)
  if (trimmedInput.startsWith("@")) {
    const handle = trimmedInput.substring(1);
    const resolvedChannelId = await resolveChannelHandle(handle);
    if (resolvedChannelId) {
      router.push(`/channel/${resolvedChannelId}`);
      return;
    }
  }

  throw new Error("Invalid YouTube URL or ID");
};

/**
 * Synchronous version that returns the route info without redirecting
 * Useful for validation or getting route info before navigation
 */
export const parseYouTubeUrl = async (
  input: string
): Promise<{ type: "video" | "channel"; id: string } | null> => {
  const trimmedInput = input.trim();

  // Check for video
  const videoId = extractVideoId(trimmedInput);
  if (videoId) {
    return { type: "video", id: videoId };
  }

  // Check for channel ID
  const channelId = extractChannelId(trimmedInput);
  if (channelId) {
    return { type: "channel", id: channelId };
  }

  // Check for channel handle
  const channelHandle = extractChannelHandle(trimmedInput);
  if (channelHandle) {
    const resolvedChannelId = await resolveChannelHandle(channelHandle);
    if (resolvedChannelId) {
      return { type: "channel", id: resolvedChannelId };
    }
  }

  // Check if input is a plain handle
  if (trimmedInput.startsWith("@")) {
    const handle = trimmedInput.substring(1);
    const resolvedChannelId = await resolveChannelHandle(handle);
    if (resolvedChannelId) {
      return { type: "channel", id: resolvedChannelId };
    }
  }

  return null;
};
