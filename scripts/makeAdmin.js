import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config({ path: "../.env" });

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        const email = "cimran1307@gmail.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} NOT FOUND.`);
            console.log("Please register this user first.");
        } else {
            user.isAdmin = true;
            user.plan = "standard"; // Also give standard plan to admin
            await user.save();
            console.log(`SUCCESS: User ${user.name} (${email}) is now an ADMIN.`);
        }

        mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

makeAdmin();
