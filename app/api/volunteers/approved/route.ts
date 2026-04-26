import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/server/models/User";

export async function GET() {
  try {
    await connectDB();
    const volunteers = await User.find({
  role: "volunteer",
  volunteerStatus: "approved",
})
  .sort({ createdAt: -1 })
  .select("name email phone role qualifications address serviceArea volunteerStatus createdAt")
  .lean();
    return NextResponse.json(
      volunteers.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        qualifications: u.qualifications || "",
        address: u.address || "",
serviceArea: u.serviceArea || "",
        volunteerStatus: u.volunteerStatus,
        createdAt: u.createdAt.toISOString(),
      }))
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
