import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PhysicalDonation",
      required: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    volunteerName: { type: String, required: true },
    donorName: { type: String, required: true },
    donationType: { type: String, required: true },
    location: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    proofPhotoUrl: { type: String, default: "" },
    assignedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
