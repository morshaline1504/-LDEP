import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/server/models/Task";
import User from "@/server/models/User";
import Notification from "@/server/models/Notification";
import PhysicalDonation from "@/server/models/PhysicalDonation";
import { notifyDeliveryCompleted } from "@/lib/email-service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { status, proofPhotoUrl, pickupPhotoUrl, deliveryPhotoUrl } = await request.json();
    const updates: Record<string, unknown> = { status };

    if (proofPhotoUrl) updates.proofPhotoUrl = proofPhotoUrl;
    if (pickupPhotoUrl) updates.pickupPhotoUrl = pickupPhotoUrl;
    if (deliveryPhotoUrl) updates.deliveryPhotoUrl = deliveryPhotoUrl;
    if (status === "in-progress") updates.startedAt = new Date();
    if (status === "completed") updates.completedAt = new Date();

    const task = await Task.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!task)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });

    if (status === "completed") {
      // Run all completed operations in parallel
      const [admin, donation] = await Promise.all([
        User.findOne({ role: "admin" }).select("_id").lean(),
        PhysicalDonation.findById(task.donationId).select("donorId status").lean(),
        User.findByIdAndUpdate(task.volunteerId, {
          isAvailable: true,
          activeTaskCount: 0,
          currentTaskId: null,
        }),
      ]);

      const notificationPromises = [];

      if (admin) {
        notificationPromises.push(
          Notification.create({
            userId: admin._id,
            message: `Task completed by ${task.volunteerName}: ${task.donationType}`,
          })
        );
      }

      if (donation) {
        notificationPromises.push(
          PhysicalDonation.findByIdAndUpdate(task.donationId, { status: "completed" }),
          Notification.create({
            userId: donation.donorId,
            message: `Your donation (${task.donationType}) has been delivered by ${task.volunteerName}!`,
          })
        );

        // Email async — non-blocking
        User.findById(donation.donorId).select("email").lean().then((donor: any) => {
          if (donor?.email) {
            notifyDeliveryCompleted(donor.email, task.donorName, task.volunteerName, task.donationType).catch(console.error);
          }
        });
      }

      await Promise.all(notificationPromises);
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
      pickupPhotoUrl: task.pickupPhotoUrl || "",
      deliveryPhotoUrl: task.deliveryPhotoUrl || "",
      assignedAt: task.assignedAt.toISOString(),
      startedAt: task.startedAt ? task.startedAt.toISOString() : null,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}