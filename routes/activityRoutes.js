import express from "express";
import UserActivity from "../models/UserActivity.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
import User from "../models/User.js";

/**
 * 🎵 RECORD SONG PLAY
 */
router.post("/play", protect, async (req, res) => {
  try {
    // Only increment for Lite users (Optimization: could do for all stats)
    // But requirement is strict for Lite.
    await User.findByIdAndUpdate(req.user.id, { $inc: { songsPlayed: 1 } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to record play" });
  }
});

/**
 * ❤️ LIKE / UNLIKE SONG (TOGGLE)
 */
router.post("/like", protect, async (req, res) => {
  try {
    const { videoId, title, artist, genre } = req.body;
    const userId = req.user.id;

    const existing = await UserActivity.findOne({ userId, videoId });

    // 🔁 UNLIKE
    if (existing && existing.liked) {
      existing.liked = false;
      await existing.save();
      return res.json({ liked: false });
    }

    // ❤️ LIKE
    if (existing) {
      existing.liked = true;
      await existing.save();
      return res.json({ liked: true });
    }

    // 🆕 FIRST TIME LIKE
    console.log(`[LIKE] Creating new activity for ${videoId} - ${title}`);
    const activity = await UserActivity.create({
      userId,
      videoId,
      title,
      artist,
      genre,
      liked: true,
    });

    res.json({ liked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Like failed" });
  }
});

/**
 * 📜 GET LIKED SONGS
 */
router.get("/liked", protect, async (req, res) => {
  console.log(`[LIKED_GET] fetching for ${req.user.id}`);
  const songs = await UserActivity.find({
    userId: req.user.id,
    liked: true,
  }).sort({ createdAt: -1 });
  console.log(`[LIKED_GET] Found ${songs.length} songs`);

  res.json(songs);
});

export default router;
