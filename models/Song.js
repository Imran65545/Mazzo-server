import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true, unique: true }, // KEEP THIS
    title: { type: String, required: true },
    artist: { type: String },
    genre: { type: String },
    duration: { type: Number },
    thumbnail: { type: String },
  },
  { timestamps: true }
);

// ❌ REMOVE this line
// songSchema.index({ videoId: 1 });

// ✅ Keep these (optional but good)
songSchema.index({ artist: 1 });
songSchema.index({ genre: 1 });

export default mongoose.model("Song", songSchema);
