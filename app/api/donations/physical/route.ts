import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PhysicalDonation from "@/server/models/PhysicalDonation";
import Notification from "@/server/models/Notification";
import User from "@/server/models/User";
import { getAreaCoordinates } from "@/lib/areaCoordinates";

export async function GET() {
  try {
    await connectDB();
    const donations = await PhysicalDonation.find()
      .sort({ createdAt: -1 })
      .select("donorId donorName type quantity condition foodType expiryDate location preferredDate timeSlot phone email photoUrl description specialInstructions status latitude longitude blockNumber txHash createdAt")
      .lean();
    return NextResponse.json(
      donations.map((d: any) => ({
        id: d._id.toString(),
        donorId: d.donorId.toString(),
        donorName: d.donorName,
        type: d.type,
        quantity: d.quantity,
        condition: d.condition,
        foodType: d.foodType,
        expiryDate: d.expiryDate ? new Date(d.expiryDate).toISOString() : null,
        location: d.location,
        preferredDate: d.preferredDate ? new Date(d.preferredDate).toISOString() : null,
        timeSlot: d.timeSlot,
        phone: d.phone,
        email: d.email,
        photoUrl: d.photoUrl,
        description: d.description,
        specialInstructions: d.specialInstructions,
        status: d.status,
        latitude: d.latitude,
        longitude: d.longitude,
        blockNumber: d.blockNumber ?? null,
        txHash: d.txHash ?? null,
        createdAt: new Date(d.createdAt).toISOString(),
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
    const {
      donorId,
      donorName,
      type,
      quantity,
      condition,
      foodType,
      expiryDate,
      location,
      preferredDate,
      timeSlot,
      phone,
      email,
      description,
      photoUrl,
      specialInstructions,
    } = await request.json();

    const areaCoords = getAreaCoordinates(location);
    const latitude = areaCoords?.latitude || null;
    const longitude = areaCoords?.longitude || null;

    const [donation, admin] = await Promise.all([
      PhysicalDonation.create({
        donorId,
        donorName,
        type,
        quantity,
        condition: condition || "",
        foodType: foodType || "",
        expiryDate: expiryDate || null,
        location,
        preferredDate: preferredDate || null,
        timeSlot: timeSlot || "",
        phone: phone || "",
        email: email || "",
        description,
        photoUrl: photoUrl || "",
        specialInstructions: specialInstructions || "",
        status: "pending",
        latitude,
        longitude,
      }),
      User.findOne({ role: "admin" }).select("_id").lean(),
    ]);

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
        condition: donation.condition,
        foodType: donation.foodType,
        expiryDate: donation.expiryDate ? donation.expiryDate.toISOString() : null,
        location: donation.location,
        preferredDate: donation.preferredDate ? donation.preferredDate.toISOString() : null,
        timeSlot: donation.timeSlot,
        phone: donation.phone,
        email: donation.email,
        photoUrl: donation.photoUrl,
        description: donation.description,
        specialInstructions: donation.specialInstructions,
        status: donation.status,
        latitude: donation.latitude,
        longitude: donation.longitude,
        createdAt: donation.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}