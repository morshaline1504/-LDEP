import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/server/models/Task";
import PhysicalDonation from "@/server/models/PhysicalDonation";
import User from "@/server/models/User";
import Notification from "@/server/models/Notification";

export async function GET() {
  try {
    await connectDB();
    const tasks = await Task.find().sort({ createdAt: -1 });
    return NextResponse.json(tasks.map(formatTask));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { donationId, volunteerId, deadline } = await request.json();

    const donation = await PhysicalDonation.findById(donationId);
    const volunteer = await User.findById(volunteerId);

    if (!donation || !volunteer) {
      return NextResponse.json(
        { error: "Donation or volunteer not found" },
        { status: 404 }
      );
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

    return NextResponse.json(formatTask(task), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatTask(t: InstanceType<typeof Task>) {
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
