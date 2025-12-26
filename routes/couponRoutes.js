
import express from "express";
import { redeemCoupon } from "../controllers/couponController.js";

const router = express.Router();

router.post("/redeem", redeemCoupon);

export default router;
