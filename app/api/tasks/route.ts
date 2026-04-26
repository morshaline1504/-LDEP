import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/server/models/Task";
import PhysicalDonation from "@/server/models/PhysicalDonation";
import User from "@/server/models/User";
import Notification from "@/server/models/Notification";
import { notifyVolunteerAssigned } from "@/lib/email-service";

export async function GET() {
  try {
    await connectDB();
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .select("donationId volunteerId volunteerName donorName donationType location deadline status proofPhotoUrl pickupPhotoUrl deliveryPhotoUrl donorPhone distance estimatedTime donorLatitude donorLongitude assignedAt completedAt startedAt")
      .lean();
    return NextResponse.json(tasks.map(formatLeanTask));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { donationId, volunteerId, deadline, distance, estimatedTime } = await request.json();

    const [donation, volunteer, existingTask] = await Promise.all([
      PhysicalDonation.findById(donationId).lean(),
      User.findById(volunteerId).lean(),
      Task.findOne({ donationId }).lean(),
    ]);

    if (!donation || !volunteer) {
      return NextResponse.json({ error: "Donation or volunteer not found." }, { status: 404 });
    }

    if (existingTask) {
      return NextResponse.json(
        { error: "This donation has already been assigned to a volunteer." },
        { status: 400 }
      );
    }

    if (!(volunteer as any).isAvailable || (volunteer as any).activeTaskCount > 0) {
      return NextResponse.json(
        { error: "This volunteer is currently busy with another task." },
        { status: 400 }
      );
    }

    const task = await Task.create({
      donationId,
      volunteerId,
      volunteerName: (volunteer as any).name,
      donorName: (donation as any).donorName,
      donationType: (donation as any).type,
      location: (donation as any).location,
      deadline: new Date(deadline),
      status: "pending",
      assignedAt: new Date(),
      donorLatitude: (donation as any).latitude || null,
      donorLongitude: (donation as any).longitude || null,
      donorPhone: (donation as any).phone || "",
      distance: distance || "",
      estimatedTime: estimatedTime || "",
    });

    await Promise.all([
      User.findByIdAndUpdate(volunteerId, {
        isAvailable: false,
        activeTaskCount: 1,
        currentTaskId: task._id,
      }),
      Notification.create({
        userId: volunteerId,
        message: `A new task has been assigned. Please pick up ${(donation as any).type} from ${(donation as any).location} and begin the task promptly.`,
      }),
    ]);

    if ((volunteer as any).email) {
      notifyVolunteerAssigned(
        (volunteer as any).email,
        (volunteer as any).name,
        (donation as any).type,
        (donation as any).location
      ).catch(console.error);
    }

    return NextResponse.json(formatLeanTask(task), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatLeanTask(t: any) {
  return {
    id: t._id.toString(),
    donationId: t.donationId.toString(),
    volunteerId: t.volunteerId.toString(),
    volunteerName: t.volunteerName,
    donorName: t.donorName,
    donationType: t.donationType,
    location: t.location,
    deadline: new Date(t.deadline).toISOString(),
    status: t.status,
    proofPhotoUrl: t.proofPhotoUrl || "",
    pickupPhotoUrl: t.pickupPhotoUrl || "",
    deliveryPhotoUrl: t.deliveryPhotoUrl || "",
    donorLatitude: t.donorLatitude || null,
    donorLongitude: t.donorLongitude || null,
    deliveryLatitude: t.deliveryLatitude || null,
    deliveryLongitude: t.deliveryLongitude || null,
    volunteerLatitude: t.volunteerLatitude || null,
    volunteerLongitude: t.volunteerLongitude || null,
    donorPhone: t.donorPhone || "",
    distance: t.distance || "",
    estimatedTime: t.estimatedTime || "",
    assignedAt: new Date(t.assignedAt).toISOString(),
    completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : null,
    startedAt: t.startedAt ? new Date(t.startedAt).toISOString() : null,
  };
}