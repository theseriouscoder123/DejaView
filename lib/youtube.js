import axios from 'axios';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const fetchTrendingVideos = async (regionCode = 'IN', maxResults = 50) => {
  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        regionCode: regionCode,
        maxResults: maxResults,
        key: process.env.YOUTUBE_API_KEY || API_KEY,
      },
    });
    
    return response.data.items;
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    throw error;
  }
};

export const parseISO8601Duration = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  return hours * 3600 + minutes * 60 + seconds;
};
