import { Router } from "express";
import MonetaryDonation from "../models/MonetaryDonation.js";
import PhysicalDonation from "../models/PhysicalDonation.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import donationBlockchain from "../blockchain/blockchain.js";

const router = Router();

// ── Monetary Donations ────────────────────────────────────────────

// POST /api/donations/monetary
router.post("/monetary", async (req, res) => {
  try {
    const { donorId, donorName, amount, method, phone } = req.body;

    // Record on blockchain
    const block = donationBlockchain.addBlock({
      type: "monetary_donation",
      donorId,
      donorName,
      amount,
      method,
      phone,
      timestamp: new Date().toISOString(),
    });

    const donation = await MonetaryDonation.create({
      donorId,
      donorName,
      amount,
      method,
      phone,
      txHash: `0x${block.hash}`,
      blockNumber: block.index,
      status: "completed",
    });

    // Notify admin
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Notification.create({
        userId: admin._id,
        message: `New donation of ৳${amount} from ${donorName}`,
      });
    }

    // Notify donor
    await Notification.create({
      userId: donorId,
      message: `Your donation of ৳${amount} has been recorded on the blockchain.`,
    });

    return res.status(201).json(formatMonetaryDonation(donation));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/donations/monetary
router.get("/monetary", async (req, res) => {
  try {
    const donations = await MonetaryDonation.find().sort({ createdAt: -1 });
    return res.json(donations.map(formatMonetaryDonation));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/donations/monetary/donor/:donorId
router.get("/monetary/donor/:donorId", async (req, res) => {
  try {
    const donations = await MonetaryDonation.find({
      donorId: req.params.donorId,
    }).sort({ createdAt: -1 });
    return res.json(donations.map(formatMonetaryDonation));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Physical Donations ────────────────────────────────────────────

// POST /api/donations/physical
router.post("/physical", async (req, res) => {
  try {
    const { donorId, donorName, type, quantity, location, description, photoUrl } =
      req.body;

    const donation = await PhysicalDonation.create({
      donorId,
      donorName,
      type,
      quantity,
      location,
      description,
      photoUrl: photoUrl || "",
      status: "pending",
    });

    // Notify admin
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Notification.create({
        userId: admin._id,
        message: `New physical donation submitted: ${type} by ${donorName}`,
      });
    }

    return res.status(201).json(formatPhysicalDonation(donation));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/donations/physical
router.get("/physical", async (req, res) => {
  try {
    const donations = await PhysicalDonation.find().sort({ createdAt: -1 });
    return res.json(donations.map(formatPhysicalDonation));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/donations/physical/donor/:donorId
router.get("/physical/donor/:donorId", async (req, res) => {
  try {
    const donations = await PhysicalDonation.find({
      donorId: req.params.donorId,
    }).sort({ createdAt: -1 });
    return res.json(donations.map(formatPhysicalDonation));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/donations/physical/:id/approve
router.put("/physical/:id/approve", async (req, res) => {
  try {
    const donation = await PhysicalDonation.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!donation) return res.status(404).json({ error: "Donation not found" });

    await Notification.create({
      userId: donation.donorId,
      message: `Your physical donation "${donation.type}" has been approved.`,
    });

    return res.json(formatPhysicalDonation(donation));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/donations/physical/:id/reject
router.put("/physical/:id/reject", async (req, res) => {
  try {
    const donation = await PhysicalDonation.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!donation) return res.status(404).json({ error: "Donation not found" });

    await Notification.create({
      userId: donation.donorId,
      message: `Your physical donation "${donation.type}" has been rejected.`,
    });

    return res.json(formatPhysicalDonation(donation));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Blockchain Ledger ─────────────────────────────────────────────

// GET /api/donations/blockchain
router.get("/blockchain", async (_req, res) => {
  try {
    const chain = donationBlockchain.getAllBlocks();
    const isValid = donationBlockchain.isChainValid();
    return res.json({
      chainLength: chain.length,
      isValid,
      blocks: chain.map((b) => ({
        index: b.index,
        timestamp: b.timestamp,
        data: b.data,
        hash: b.hash,
        previousHash: b.previousHash,
        nonce: b.nonce,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Leaderboard ───────────────────────────────────────────────────

// GET /api/donations/leaderboard
router.get("/leaderboard", async (_req, res) => {
  try {
    const result = await MonetaryDonation.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$donorId",
          donorName: { $first: "$donorName" },
          totalAmount: { $sum: "$amount" },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const leaderboard = result.map((r) => ({
      donorId: r._id.toString(),
      donorName: r.donorName,
      totalAmount: r.totalAmount,
      donationCount: r.donationCount,
    }));

    return res.json(leaderboard);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Formatting helpers ────────────────────────────────────────────

function formatMonetaryDonation(d) {
  return {
    id: d._id.toString(),
    donorId: d.donorId.toString(),
    donorName: d.donorName,
    amount: d.amount,
    method: d.method,
    phone: d.phone,
    txHash: d.txHash,
    blockNumber: d.blockNumber,
    timestamp: d.createdAt.toISOString(),
    status: d.status,
  };
}

function formatPhysicalDonation(d) {
  return {
    id: d._id.toString(),
    donorId: d.donorId.toString(),
    donorName: d.donorName,
    type: d.type,
    quantity: d.quantity,
    location: d.location,
    photoUrl: d.photoUrl,
    description: d.description,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
  };
}

export default router;
