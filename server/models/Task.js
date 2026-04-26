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
    donorPhone: { type: String, default: "" },
    distance: { type: String, default: "" },
    estimatedTime: { type: String, default: "" },
    proofPhotoUrl: { type: String, default: "" },
    donorLatitude: { type: Number, default: null },
    donorLongitude: { type: Number, default: null },
    deliveryLatitude: { type: Number, default: null },
    deliveryLongitude: { type: Number, default: null },
    volunteerLatitude: { type: Number, default: null },
    volunteerLongitude: { type: Number, default: null },
    pickupPhotoUrl: { type: String, default: "" },
    deliveryPhotoUrl: { type: String, default: "" },
    assignedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ createdAt: -1 });
taskSchema.index({ volunteerId: 1 });
taskSchema.index({ donationId: 1 });


const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;