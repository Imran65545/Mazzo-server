import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        utr: { type: String, required: true, unique: true },
        amount: { type: Number, required: true },
        plan: { type: String, enum: ["lite", "standard"], required: true },
        status: { type: String, enum: ["verified", "failed"], default: "verified" },
    },
    { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
