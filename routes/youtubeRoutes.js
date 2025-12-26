import express from "express";
import { searchSongs } from "../controllers/youtubeController.js";

const router = express.Router();

router.get("/search", searchSongs);

export default router;
