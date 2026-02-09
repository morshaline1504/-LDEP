import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PhysicalDonation from "@/server/models/PhysicalDonation";
import Notification from "@/server/models/Notification";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const donation = await PhysicalDonation.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    if (!donation)
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );

    await Notification.create({
      userId: donation.donorId,
      message: `Your physical donation "${donation.type}" has been approved.`,
    });

    return NextResponse.json({
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
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
