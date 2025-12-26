import UserActivity from "../models/UserActivity.js";

/**
 * 🎧 Log play / skip / listen time
 */
export const logActivity = async (req, res) => {
  try {
    const {
      videoId,
      artist,
      genre,
      listenTime = 0,
      skipped = false,
    } = req.body;

    const activity = await UserActivity.create({
      userId: req.user.id,
      videoId,
      artist,
      genre,
      listenTime,
      skipped,
      liked: false,
    });

    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: "Failed to log activity" });
  }
};

/**
 * ❤️ LIKE / UNLIKE (TOGGLE)
 */
export const toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId, title, artist, genre } = req.body;

    let activity = await UserActivity.findOne({ userId, videoId });

    // If activity exists → toggle like
    if (activity) {
      activity.liked = !activity.liked;
      await activity.save();

      return res.json({ liked: activity.liked });
    }

    // First time like
    activity = await UserActivity.create({
      userId,
      videoId,
      title,
      artist,
      genre,
      liked: true,
      skipped: false,
      listenTime: 0,
    });

    res.json({ liked: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle like" });
  }
};
