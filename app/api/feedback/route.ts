import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Feedback from "@/server/models/Feedback";
import Notification from "@/server/models/Notification";
import User from "@/server/models/User";

export async function GET() {
  try {
    await connectDB();
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    return NextResponse.json(feedbacks.map(formatFeedback));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { donorId, donorName, volunteerId, volunteerName, taskId, rating, comment } =
      await request.json();

    const feedback = await Feedback.create({
      donorId,
      donorName,
      volunteerId,
      volunteerName,
      taskId,
      rating,
      comment,
    });

    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Notification.create({
        userId: admin._id,
        message: `New feedback from ${donorName} for ${volunteerName}`,
      });
    }

    return NextResponse.json(formatFeedback(feedback), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatFeedback(f: InstanceType<typeof Feedback>) {
  return {
    id: f._id.toString(),
    donorId: f.donorId.toString(),
    donorName: f.donorName,
    volunteerId: f.volunteerId.toString(),
    volunteerName: f.volunteerName,
    taskId: f.taskId.toString(),
    rating: f.rating,
    comment: f.comment,
    createdAt: f.createdAt.toISOString(),
  };
}
