import { Router } from "express";
import Notification from "../models/Notification.js";

const router = Router();

// GET /api/notifications/:userId
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });
    return res.json(
      notifications.map((n) => ({
        id: n._id.toString(),
        userId: n.userId.toString(),
        message: n.message,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/:userId/unread-count
router.get("/:userId/unread-count", async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.params.userId,
      read: false,
    });
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:userId/read-all
router.put("/:userId/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId },
      { read: true }
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
