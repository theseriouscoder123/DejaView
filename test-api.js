import { fetchTrendingVideos } from './lib/youtube.js';

fetchTrendingVideos('IN', 5)
  .then(videos => {
    console.log('API Working! Found videos:', videos.length);
    console.log('First video:', videos[0].snippet.title);
  })
  .catch(error => {
    console.error('API Error:', error.message);
  });