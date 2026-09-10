import express from "express";
import { streamAudio } from "../controllers/streamController.js";

const router = express.Router();

// Route expects ?videoId=...
router.get("/", streamAudio);

export default router;
