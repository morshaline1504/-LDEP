import { Router } from "express";
import Feedback from "../models/Feedback.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const router = Router();

// POST /api/feedback
router.post("/", async (req, res) => {
  try {
    const { donorId, donorName, volunteerId, volunteerName, taskId, rating, comment } =
      req.body;

    const feedback = await Feedback.create({
      donorId,
      donorName,
      volunteerId,
      volunteerName,
      taskId,
      rating,
      comment,
    });

    // Notify admin
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Notification.create({
        userId: admin._id,
        message: `New feedback from ${donorName} for ${volunteerName}`,
      });
    }

    return res.status(201).json(formatFeedback(feedback));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/feedback
router.get("/", async (_req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    return res.json(feedbacks.map(formatFeedback));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/feedback/donor/:donorId
router.get("/donor/:donorId", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      donorId: req.params.donorId,
    }).sort({ createdAt: -1 });
    return res.json(feedbacks.map(formatFeedback));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

function formatFeedback(f) {
  return {
    id: f._id.toString(),
    donorId: f.donorId.toString(),
    donorName: f.donorName,
    volunteerId: f.volunteerId.toString(),
    volunteerName: f.volunteerName,
    taskId: f.taskId.toString(),
    rating: f.rating,
    comment: f.comment,
    createdAt: f.createdAt.toISOString(),
  };
}

export default router;
