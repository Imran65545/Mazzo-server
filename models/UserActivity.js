import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    videoId: { type: String, required: true },
    title: { type: String }, // Added title

    artist: { type: String },
    genre: { type: String },

    listenTime: { type: Number, default: 0 }, // seconds
    liked: { type: Boolean, default: false },
    skipped: { type: Boolean, default: false },

    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Important indexes for analytics
userActivitySchema.index({ userId: 1 });
userActivitySchema.index({ artist: 1 });
userActivitySchema.index({ genre: 1 });

export default mongoose.model("UserActivity", userActivitySchema);
