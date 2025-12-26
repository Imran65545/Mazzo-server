import UserActivity from "../models/UserActivity.js";
import Song from "../models/Song.js";

// ❤️ Toggle Like: Handles saving song details + toggling activity
export const toggleLike = async (req, res) => {
  const userId = req.user.id;
  const { videoId, title, artist, thumbnail } = req.body;

  try {
    // 1. Ensure the song exists in our 'Songs' collection first
    // This allows getLikedSongs to find the details later
    let song = await Song.findOne({ videoId });
    if (!song) {
      song = await Song.create({ videoId, title, artist, thumbnail });
    }

    // 2. Check if the user has already liked this video
    const existingLike = await UserActivity.findOne({
      userId,
      videoId,
      liked: true,
    });

    if (existingLike) {
      // ❌ Unlike: Remove the activity record
      await UserActivity.deleteOne({ _id: existingLike._id });
      return res.json({ liked: false, message: "Unliked" });
    }

    // ❤️ Like: Create a new activity record
    await UserActivity.create({
      userId,
      videoId,
      liked: true,
      timestamp: new Date(),
    });

    res.json({ liked: true, message: "Liked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Like toggle failed" });
  }
};

// 🎵 Get Liked Songs: Optimized to return full song objects
export const getLikedSongs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all "liked" activities for this user
    const likes = await UserActivity.find({ userId, liked: true });

    // Extract just the videoIds
    const videoIds = likes.map((l) => l.videoId);

    // Fetch full song details from the Song collection for those IDs
    const songs = await Song.find({
      videoId: { $in: videoIds },
    });

    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch liked songs" });
  }
};