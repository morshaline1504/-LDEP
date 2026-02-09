import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/server/models/User";
import Notification from "@/server/models/Notification";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, email, phone, address, password } = await request.json();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    const user = await User.create({
      name,
      email,
      phone,
      address,
      role: "donor",
      password,
    });

    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Notification.create({
        userId: admin._id,
        message: `New donor registered: ${name}`,
      });
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address || "",
          qualifications: "",
          bio: "",
          profilePicture: "",
          volunteerStatus: null,
          createdAt: user.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
