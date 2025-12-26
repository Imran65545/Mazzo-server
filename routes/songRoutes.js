import express from "express";
import { toggleLike } from "../controllers/songController.js";
import auth from "../middleware/auth.js";
import { getLikedSongs } from "../controllers/songController.js";

const router = express.Router();

router.post("/like", auth, toggleLike);
router.get("/liked", auth, getLikedSongs);

export default router;
