import Payment from "../models/Payment.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const verifyPayment = async (req, res) => {
    try {
        const { utr, amount, plan } = req.body;

        // Auth Check (Manual for now as per previous pattern)
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        let userId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (e) {
            return res.status(401).json({ message: "Invalid Token" });
        }

        if (!utr || !amount || !plan) {
            return res.status(400).json({ message: "Missing fields" });
        }

        // 1. Check uniqueness
        const existingPayment = await Payment.findOne({ utr });
        if (existingPayment) {
            return res.status(400).json({ message: "UTR already used" });
        }

        // 2. Validate UTR format (Basic length check)
        if (utr.length < 10 || utr.length > 22) {
            return res.status(400).json({ message: "Invalid UTR format" });
        }

        // 3. Create Record
        const payment = await Payment.create({
            userId,
            utr,
            amount,
            plan,
            status: "verified"
        });

        // 4. Update User
        const user = await User.findById(userId);
        if (user) {
            user.plan = plan;
            await user.save();
        }

        res.status(200).json({ success: true, message: "Payment Verified! Plan Unlocked." });

    } catch (error) {
        console.error(error);
        // Handle duplicate key error explicitly if race condition
        if (error.code === 11000) {
            return res.status(400).json({ message: "UTR already used" });
        }
        res.status(500).json({ message: "Verification failed" });
    }
};
