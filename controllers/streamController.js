import fs from "fs";
import path from "path";
import ytdl from "@distube/ytdl-core";

const CACHE_DIR = path.join(process.cwd(), "cache");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export const streamAudio = async (req, res) => {
  try {
    const { videoId } = req.query;

    if (!videoId) {
      return res.status(400).json({ message: "videoId is required" });
    }

    const filePath = path.join(CACHE_DIR, `${videoId}.mp3`);

    // 1. Check if the file is already cached
    if (fs.existsSync(filePath)) {
      console.log(`[STREAM CACHE HIT] Streaming from local disk: ${videoId}`);
      const stat = fs.statSync(filePath);
      
      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Content-Length": stat.size,
        "Accept-Ranges": "bytes",
      });

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
      return;
    }

    // 2. Not cached: Stream from YouTube and save to disk
    console.log(`[STREAM FETCH] Downloading and streaming: ${videoId}`);
    
    // Set headers for audio streaming
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Ensure we can get video info
    const info = await ytdl.getInfo(videoUrl);
    if (!info) {
       return res.status(404).json({ message: "Video not found" });
    }

    const audioStream = ytdl(videoUrl, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25, // 32MB buffer
    });

    const writeStream = fs.createWriteStream(filePath);

    // Pipe the audio stream to BOTH the user response and the local file cache
    audioStream.pipe(res);
    audioStream.pipe(writeStream);

    audioStream.on("error", (err) => {
      console.error(`[STREAM ERROR] ${videoId}:`, err.message);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error streaming audio" });
      }
      // If error occurs, clean up the corrupted file
      writeStream.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    writeStream.on("finish", () => {
      console.log(`[STREAM CACHED] Successfully saved to disk: ${videoId}`);
    });

  } catch (error) {
    console.error(`[STREAM API ERROR]:`, error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const prefetchSong = async (videoId) => {
  try {
    const filePath = path.join(CACHE_DIR, `${videoId}.mp3`);
    if (fs.existsSync(filePath)) {
      return; // Already cached
    }
    console.log(`[PREFETCH] Starting background download: ${videoId}`);
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(videoUrl).catch(() => null);
    if (!info) return;

    const audioStream = ytdl(videoUrl, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    });
    const writeStream = fs.createWriteStream(filePath);
    audioStream.pipe(writeStream);
    audioStream.on("error", (err) => {
      console.error(`[PREFETCH ERROR] ${videoId}:`, err.message);
      writeStream.close();
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
    writeStream.on("finish", () => {
      console.log(`[PREFETCH CACHED] Successfully saved to disk: ${videoId}`);
    });
  } catch (err) {
    console.error(`[PREFETCH API ERROR]:`, err.message);
  }
};
