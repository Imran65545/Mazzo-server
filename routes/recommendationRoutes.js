import express from "express";
import { getNextSong } from "../controllers/recommendationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/next", protect, getNextSong);

export default router;
