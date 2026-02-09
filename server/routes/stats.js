import { Router } from "express";
import User from "../models/User.js";
import MonetaryDonation from "../models/MonetaryDonation.js";
import PhysicalDonation from "../models/PhysicalDonation.js";
import Task from "../models/Task.js";

const router = Router();

// GET /api/stats
router.get("/", async (_req, res) => {
  try {
    const [
      totalDonors,
      totalVolunteers,
      pendingVolunteers,
      monetaryDonations,
      totalPhysicalDonations,
      pendingPhysicalDonations,
      totalTasks,
      completedTasks,
      pendingTasks,
    ] = await Promise.all([
      User.countDocuments({ role: "donor" }),
      User.countDocuments({ role: "volunteer", volunteerStatus: "approved" }),
      User.countDocuments({ role: "volunteer", volunteerStatus: "pending" }),
      MonetaryDonation.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      PhysicalDonation.countDocuments(),
      PhysicalDonation.countDocuments({ status: "pending" }),
      Task.countDocuments(),
      Task.countDocuments({ status: "completed" }),
      Task.countDocuments({ status: "pending" }),
    ]);

    return res.json({
      totalDonors,
      totalVolunteers,
      pendingVolunteers,
      totalMonetary:
        monetaryDonations.length > 0 ? monetaryDonations[0].total : 0,
      totalPhysicalDonations,
      pendingPhysicalDonations,
      totalTasks,
      completedTasks,
      pendingTasks,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
