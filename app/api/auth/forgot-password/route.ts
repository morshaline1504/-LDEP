import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/server/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Return success with user info for the client-side flow
    return NextResponse.json({
      success: true,
      message: "Email verified. You can now reset your password.",
      userId: user._id.toString(),
      userName: user.name,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
