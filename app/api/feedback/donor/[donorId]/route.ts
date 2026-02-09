import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Feedback from "@/server/models/Feedback";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ donorId: string }> }
) {
  try {
    await connectDB();
    const { donorId } = await params;
    const feedbacks = await Feedback.find({ donorId }).sort({ createdAt: -1 });
    return NextResponse.json(
      feedbacks.map((f) => ({
        id: f._id.toString(),
        donorId: f.donorId.toString(),
        donorName: f.donorName,
        volunteerId: f.volunteerId.toString(),
        volunteerName: f.volunteerName,
        taskId: f.taskId.toString(),
        rating: f.rating,
        comment: f.comment,
        createdAt: f.createdAt.toISOString(),
      }))
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
