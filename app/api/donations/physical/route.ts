import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PhysicalDonation from "@/server/models/PhysicalDonation";
import Notification from "@/server/models/Notification";
import User from "@/server/models/User";

export async function GET() {
  try {
    await connectDB();
    const donations = await PhysicalDonation.find().sort({ createdAt: -1 });
    return NextResponse.json(
      donations.map((d) => ({
        id: d._id.toString(),
        donorId: d.donorId.toString(),
        donorName: d.donorName,
        type: d.type,
        quantity: d.quantity,
        location: d.location,
        photoUrl: d.photoUrl,
        description: d.description,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
      }))
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { donorId, donorName, type, quantity, location, description, photoUrl } =
      await request.json();

    const donation = await PhysicalDonation.create({
      donorId,
      donorName,
      type,
      quantity,
      location,
      description,
      photoUrl: photoUrl || "",
      status: "pending",
    });

    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Notification.create({
        userId: admin._id,
        message: `New physical donation submitted: ${type} by ${donorName}`,
      });
    }

    return NextResponse.json(
      {
        id: donation._id.toString(),
        donorId: donation.donorId.toString(),
        donorName: donation.donorName,
        type: donation.type,
        quantity: donation.quantity,
        location: donation.location,
        photoUrl: donation.photoUrl,
        description: donation.description,
        status: donation.status,
        createdAt: donation.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
