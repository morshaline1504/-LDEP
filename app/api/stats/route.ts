import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/server/models/User";
import MonetaryDonation from "@/server/models/MonetaryDonation";
import PhysicalDonation from "@/server/models/PhysicalDonation";
import Task from "@/server/models/Task";

export async function GET() {
  try {
    await connectDB();
    const [
      totalDonors,
      totalVolunteers,
      pendingVolunteers,
      monetaryAgg,
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

    return NextResponse.json({
      totalDonors,
      totalVolunteers,
      pendingVolunteers,
      totalMonetary: monetaryAgg.length > 0 ? monetaryAgg[0].total : 0,
      totalPhysicalDonations,
      pendingPhysicalDonations,
      totalTasks,
      completedTasks,
      pendingTasks,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
