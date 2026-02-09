import { Router } from "express";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    if (user.role === "volunteer" && user.volunteerStatus === "pending") {
      return res.status(403).json({
        error: "Your account is pending admin approval.",
        user: formatUser(user),
      });
    }
    if (user.role === "volunteer" && user.volunteerStatus === "rejected") {
      return res.status(403).json({
        error: "Your registration was rejected. Please re-register.",
        user: formatUser(user),
      });
    }
    return res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register/donor
router.post("/register/donor", async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }
    const user = await User.create({
      name,
      email,
      phone,
      address,
      role: "donor",
      password,
    });

    // Notify admin
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Notification.create({
        userId: admin._id,
        message: `New donor registered: ${name}`,
      });
    }

    return res.status(201).json({ success: true, user: formatUser(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register/volunteer
router.post("/register/volunteer", async (req, res) => {
  try {
    const { name, email, phone, qualifications, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }
    const user = await User.create({
      name,
      email,
      phone,
      qualifications,
      role: "volunteer",
      volunteerStatus: "pending",
      password,
    });

    // Notify admin
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Notification.create({
        userId: admin._id,
        message: `New volunteer registration request: ${name}`,
      });
    }

    return res.status(201).json({ success: true, user: formatUser(user) });
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
