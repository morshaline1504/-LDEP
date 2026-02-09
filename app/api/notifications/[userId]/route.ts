import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/server/models/Notification";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await params;
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    return NextResponse.json(
      notifications.map((n) => ({
        id: n._id.toString(),
        userId: n.userId.toString(),
        message: n.message,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      }))
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
