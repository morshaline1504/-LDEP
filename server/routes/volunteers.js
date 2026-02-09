import { Router } from "express";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const router = Router();

// GET /api/volunteers/pending
router.get("/pending", async (_req, res) => {
  try {
    const volunteers = await User.find({
      role: "volunteer",
      volunteerStatus: "pending",
    }).sort({ createdAt: -1 });
    return res.json(volunteers.map(formatUser));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/volunteers/approved
router.get("/approved", async (_req, res) => {
  try {
    const volunteers = await User.find({
      role: "volunteer",
      volunteerStatus: "approved",
    }).sort({ createdAt: -1 });
    return res.json(volunteers.map(formatUser));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/volunteers/:id/approve
router.put("/:id/approve", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { volunteerStatus: "approved" },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "Volunteer not found" });

    await Notification.create({
      userId: user._id,
      message:
        "Your volunteer registration has been approved! You can now log in.",
    });

    return res.json(formatUser(user));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/volunteers/:id/reject
router.put("/:id/reject", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { volunteerStatus: "rejected" },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "Volunteer not found" });

    await Notification.create({
      userId: user._id,
      message:
        "Your volunteer registration has been rejected. You may re-register.",
    });

    return res.json(formatUser(user));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

function formatUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    address: user.address || "",
    qualifications: user.qualifications || "",
    volunteerStatus: user.volunteerStatus || null,
    createdAt: user.createdAt.toISOString(),
  };
}

export default router;
