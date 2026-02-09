import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/server/models/Task";
import User from "@/server/models/User";
import Notification from "@/server/models/Notification";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { status, proofPhotoUrl } = await request.json();
    const updates: Record<string, unknown> = { status };

    if (status === "completed") {
      updates.completedAt = new Date();
      if (proofPhotoUrl) updates.proofPhotoUrl = proofPhotoUrl;
    }

    const task = await Task.findByIdAndUpdate(id, updates, { new: true });
    if (!task)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });

    if (status === "completed") {
      const admin = await User.findOne({ role: "admin" });
      if (admin) {
        await Notification.create({
          userId: admin._id,
          message: `Task completed by ${task.volunteerName}: ${task.donationType}`,
        });
      }
    }

    return NextResponse.json({
      id: task._id.toString(),
      donationId: task.donationId.toString(),
      volunteerId: task.volunteerId.toString(),
      volunteerName: task.volunteerName,
      donorName: task.donorName,
      donationType: task.donationType,
      location: task.location,
      deadline: task.deadline.toISOString(),
      status: task.status,
      proofPhotoUrl: task.proofPhotoUrl || "",
      assignedAt: task.assignedAt.toISOString(),
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
