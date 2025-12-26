
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";

export const redeemCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        // req.user is expected to be populated by middleware, 
        // but based on previous authController we might need to manually verify if middleware isn't global yet.
        // However, let's assume valid access for now or check headers if needed.
        // Ideally we should use the same auth verification as `me` or a middleware.

        // For now, let's assume the client sends the token and we decode it or use middleware.
        // Existing authRoutes.js doesn't seem to export a verifyToken middleware explicitly used in index.js for all routes.
        // So I will basically do a quick token verification here or assume `req.user` if I add middleware.
        // FOR SAFETY: I'll duplicate the token verification from `me` controller for now to be self-contained 
        // until a proper middleware refactor is done.

        const jwt = (await import("jsonwebtoken")).default;
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        let userId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (e) {
            return res.status(401).json({ message: "Invalid Token" });
        }

        const coupon = await Coupon.findOne({ code });

        if (!coupon) {
            return res.status(404).json({ message: "Invalid coupon code" });
        }

        if (coupon.isUsed) {
            return res.status(400).json({ message: "Coupon already used" });
        }

        // Update User
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Optional: Prevent downgrade or re-use if already on higher plan? 
        // Requirement says "he will be able to listen songs freely means he will be in lite standard plan"
        // We'll just overwrite the plan.

        user.plan = coupon.plan;
        await user.save();

        // Mark Coupon Used
        coupon.isUsed = true;
        coupon.usedBy = user._id;
        await coupon.save();

        res.json({ success: true, message: `Redeemed ${coupon.plan} plan successfully!`, plan: user.plan });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Redemption failed" });
    }
};
