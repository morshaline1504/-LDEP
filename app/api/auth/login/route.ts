import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/server/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();
    const user = await User.findOne({ email, password });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }
    if (user.role === "volunteer" && user.volunteerStatus === "pending") {
      return NextResponse.json(
        {
          error: "Your account is pending admin approval.",
          user: formatUser(user),
        },
        { status: 403 }
      );
    }
    if (user.role === "volunteer" && user.volunteerStatus === "rejected") {
      return NextResponse.json(
        {
          error: "Your registration was rejected. Please re-register.",
          user: formatUser(user),
        },
        { status: 403 }
      );
    }
    return NextResponse.json({ success: true, user: formatUser(user) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    address: user.address || "",
    qualifications: user.qualifications || "",
    bio: user.bio || "",
    profilePicture: user.profilePicture || "",
    volunteerStatus: user.volunteerStatus || null,
    createdAt: user.createdAt.toISOString(),
  };
}
