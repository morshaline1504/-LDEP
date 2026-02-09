import mongoose from "mongoose";

const physicalDonationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    donorName: { type: String, required: true },
    type: { type: String, required: true },
    quantity: { type: Number, required: true },
    location: { type: String, required: true },
    photoUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PhysicalDonation", physicalDonationSchema);
