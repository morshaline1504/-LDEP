import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "donor", "volunteer"],
      required: true,
    },
    password: { type: String, required: true },
    address: { type: String, default: "" },
    qualifications: { type: String, default: "" },
    bio: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    volunteerStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
