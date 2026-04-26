import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/server/models/Task";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ volunteerId: string }> }
) {
  try {
    await connectDB();
    const { volunteerId } = await params;
    const tasks = await Task.find({ volunteerId })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(
      tasks.map((t: any) => ({
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
        assignedAt: new Date(t.assignedAt).toISOString(),
        startedAt: t.startedAt ? new Date(t.startedAt).toISOString() : null,
        completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : null,
        donorPhone: t.donorPhone || "",
        distance: t.distance || "",
        estimatedTime: t.estimatedTime || "",
      }))
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}