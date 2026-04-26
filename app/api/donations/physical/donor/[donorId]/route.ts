import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PhysicalDonation from "@/server/models/PhysicalDonation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ donorId: string }> }
) {
  try {
    await connectDB();
    const { donorId } = await params;
    const donations = await PhysicalDonation.find({ donorId }).sort({
      createdAt: -1,
    });
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
        phone: d.phone,
        preferredDate: d.preferredDate ? d.preferredDate.toISOString() : null,
        blockNumber: d.blockNumber || null,
        txHash: d.txHash || null,
        rejectReason: d.rejectReason ?? "",
        createdAt: d.createdAt.toISOString(),
      }))
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
