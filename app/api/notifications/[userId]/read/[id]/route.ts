import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/server/models/Notification";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Notification.findByIdAndUpdate(id, { read: true });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
