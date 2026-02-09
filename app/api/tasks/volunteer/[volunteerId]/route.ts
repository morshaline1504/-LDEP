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
    const tasks = await Task.find({ volunteerId }).sort({ createdAt: -1 });
    return NextResponse.json(
      tasks.map((t) => ({
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
      }))
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
