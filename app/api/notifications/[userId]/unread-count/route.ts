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
    const count = await Notification.countDocuments({ userId, read: false });
    return NextResponse.json({ count });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
