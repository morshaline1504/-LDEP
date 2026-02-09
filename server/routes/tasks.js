import { Router } from "express";
import Task from "../models/Task.js";
import PhysicalDonation from "../models/PhysicalDonation.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const router = Router();

// POST /api/tasks
router.post("/", async (req, res) => {
  try {
    const { donationId, volunteerId, deadline } = req.body;

    const donation = await PhysicalDonation.findById(donationId);
    const volunteer = await User.findById(volunteerId);

    if (!donation || !volunteer) {
      return res.status(404).json({ error: "Donation or volunteer not found" });
    }

    const task = await Task.create({
      donationId,
      volunteerId,
      volunteerName: volunteer.name,
      donorName: donation.donorName,
      donationType: donation.type,
      location: donation.location,
      deadline: new Date(deadline),
      status: "pending",
      assignedAt: new Date(),
    });

    await Notification.create({
      userId: volunteerId,
      message: `New task assigned: Pickup ${donation.type} from ${donation.location}`,
    });

    return res.status(201).json(formatTask(task));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks
router.get("/", async (_req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    return res.json(tasks.map(formatTask));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/volunteer/:volunteerId
router.get("/volunteer/:volunteerId", async (req, res) => {
  try {
    const tasks = await Task.find({
      volunteerId: req.params.volunteerId,
    }).sort({ createdAt: -1 });
    return res.json(tasks.map(formatTask));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id/status
router.put("/:id/status", async (req, res) => {
  try {
    const { status, proofPhotoUrl } = req.body;
    const updates = { status };

    if (status === "completed") {
      updates.completedAt = new Date();
      if (proofPhotoUrl) updates.proofPhotoUrl = proofPhotoUrl;
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (status === "completed") {
      const admin = await User.findOne({ role: "admin" });
      if (admin) {
        await Notification.create({
          userId: admin._id,
          message: `Task completed by ${task.volunteerName}: ${task.donationType}`,
        });
      }
    }

    return res.json(formatTask(task));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

function formatTask(t) {
  return {
    id: t._id.toString(),
    donationId: t.donationId.toString(),
    volunteerId: t.volunteerId.toString(),
    volunteerName: t.volunteerName,
    donorName: t.donorName,
    donationType: t.donationType,
    location: t.location,
    deadline: t.deadline.toISOString(),
    status: t.status,
    proofPhotoUrl: t.proofPhotoUrl || "",
    assignedAt: t.assignedAt.toISOString(),
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
  };
}

export default router;
