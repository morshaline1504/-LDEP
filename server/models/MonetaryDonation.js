import mongoose from "mongoose";

const monetaryDonationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    donorName: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["bkash", "nagad"], required: true },
    phone: { type: String, required: true },
    txHash: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MonetaryDonation", monetaryDonationSchema);
