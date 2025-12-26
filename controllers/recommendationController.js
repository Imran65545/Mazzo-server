import Song from "../models/Song.js";
import UserActivity from "../models/UserActivity.js";

/**
 * 🧠 Build User Taste Profile
 */
export const getTasteProfile = async (userId) => {
  const activities = await UserActivity.find({ userId });

  const artists = {};
  const genres = {};

  activities.forEach((a) => {
    let score = 0;

    if (a.liked) score += 3;
    if (a.listenTime >= 60) score += 2;
    if (a.skipped) score -= 2;

    if (a.artist) {
      artists[a.artist] = (artists[a.artist] || 0) + score;
    }

    if (a.genre) {
      genres[a.genre] = (genres[a.genre] || 0) + score;
    }
  });

  return { artists, genres };
};

/**
 * 🎧 Get Next Recommended Song
 */
import { fetchAndCacheSongs } from "./youtubeController.js";

/**
 * 🎧 Get Next Recommended Song
 */
export const getNextSong = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 1; // Support batch size

    // 1️⃣ Get recent liked songs to determine taste
    const likedSongs = await UserActivity.find({ userId, liked: true })
      .sort({ createdAt: -1 })
      .limit(10);

    let query = "trending music official audio"; // Default fallback

    if (likedSongs.length > 0) {
      // 🎲 Pick a random liked song as a seed
      const randomSeed = likedSongs[Math.floor(Math.random() * likedSongs.length)];

      // Strategies:
      // 1. "Artist Mix"
      // 2. "Similar to [Song Title]"
      const strategies = [
        `${randomSeed.artist} best songs`,
        `${randomSeed.title} ${randomSeed.artist} similar songs`,
        `${randomSeed.artist} mix`,
        `${randomSeed.genre || ""} music mix`
      ];

      query = strategies[Math.floor(Math.random() * strategies.length)];
    }

    console.log(`[RECOMMEND] generating for user based on query: "${query}"`);

    // 2️⃣ Fetch fresh results from YouTube
    const recommendations = await fetchAndCacheSongs(query);

    // 3️⃣ Filter out recently played (simple check)
    if (!recommendations || recommendations.length === 0) {
      return res.status(404).json({ message: "No recommendations found" });
    }

    // 4️⃣ Return batch or single song
    if (limit > 1) {
      // Shuffle and return 'limit' amount
      const shuffled = recommendations.sort(() => 0.5 - Math.random());
      return res.json(shuffled.slice(0, limit));
    }

    const randomSong = recommendations[Math.floor(Math.random() * recommendations.length)];
    res.json(randomSong);

  } catch (err) {
    console.error("Recommendation Error:", err);
    res.status(500).json({ message: "Recommendation failed" });
  }
};
