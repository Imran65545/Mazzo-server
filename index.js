
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import youtubeRoutes from "./routes/youtubeRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";



dotenv.config();

const app = express();
app.use(cors({
  origin: [
    "http://localhost:3000",       // Local frontend
    "https://mazzo-bay.vercel.app", // Future deployed frontend
    "capacitor://localhost",       // Mobile app (future)
    "http://10.0.2.2:3000",        // Android Emulator Frontend
    "http://10.0.2.2:5000"         // Android Emulator Backend
  ],
  credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use("/api/youtube", youtubeRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/recommend", recommendationRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payment", paymentRoutes);




app.get("/", (req, res) => {
  res.send("API running 🚀");
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => console.error(err));
