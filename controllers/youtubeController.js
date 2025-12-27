import axios from "axios";
import Song from "../models/Song.js";

const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YT_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos";

import NodeCache from "node-cache";
const myCache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

export const searchSongs = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Query is required" });
    }

    // ⚡ CHECK CACHE
    const cachedSongs = myCache.get(q);
    if (cachedSongs) {
      console.log(`[CACHE HIT] Serving ${q} from cache`);
      return res.json(cachedSongs);
    }

    const songs = await fetchAndCacheSongs(q);

    // 💾 SET CACHE
    myCache.set(q, songs);

    res.json(songs);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "YouTube search failed" });
  }
};

/**
 * 🛠 Helper: Fetch from YouTube & Cache
 */
export const fetchAndCacheSongs = async (query) => {
  // 🔍 Step 1: Search videos
  const searchResponse = await axios.get(YT_SEARCH_URL, {
    params: {
      key: process.env.YOUTUBE_API_KEY,
      q: `${query} official audio`,
      part: "snippet",
      type: "video",
      videoCategoryId: "10", // Music category
      maxResults: 5,
    },
  });

  const videoIds = searchResponse.data.items
    .map((item) => item.id.videoId)
    .join(",");

  if (!videoIds) return [];

  // 🎵 Step 2: Get video details (duration)
  const videoResponse = await axios.get(YT_VIDEO_URL, {
    params: {
      key: process.env.YOUTUBE_API_KEY,
      part: "contentDetails,snippet",
      id: videoIds,
    },
  });

  const songs = [];

  for (const video of videoResponse.data.items) {
    const videoId = video.id;

    // ⏱ Convert ISO duration → seconds
    const duration = convertDuration(video.contentDetails.duration);

    // Filter: 2–7 minutes only (Relaxed to 1.5 - 10 mins for better variety)
    if (duration < 90 || duration > 600) continue;

    // Check cache
    let song = await Song.findOne({ videoId });

    if (!song) {
      song = await Song.create({
        videoId,
        title: video.snippet.title,
        artist: video.snippet.channelTitle,
        thumbnail: video.snippet.thumbnails.medium.url,
        duration,
      });
    }

    songs.push(song);
  }

  return songs;
};

// ⏱ Helper: ISO 8601 → seconds
function convertDuration(duration) {
  const match = duration.match(/PT(\d+M)?(\d+S)?/);

  const minutes = match[1] ? parseInt(match[1]) : 0;
  const seconds = match[2] ? parseInt(match[2]) : 0;

  return minutes * 60 + seconds;
}
