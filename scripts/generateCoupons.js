
import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import Coupon from "../models/Coupon.js";

dotenv.config();

const [, , plan, countArg] = process.argv;

const PLAN = plan || "lite"; // default lite
const COUNT = parseInt(countArg) || 1; // default 1

const generateCoupons = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const coupons = [];
        for (let i = 0; i < COUNT; i++) {
            // Generate a long random string
            const code = crypto.randomBytes(16).toString("hex").toUpperCase();
            coupons.push({ code, plan: PLAN });
        }

        await Coupon.insertMany(coupons);

        console.log(`✅ Generated ${COUNT} ${PLAN} coupons:`);
        coupons.forEach(c => console.log(c.code));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

generateCoupons();
