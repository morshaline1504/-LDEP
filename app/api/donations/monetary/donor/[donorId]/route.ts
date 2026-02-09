import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MonetaryDonation from "@/server/models/MonetaryDonation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ donorId: string }> }
) {
  try {
    await connectDB();
    const { donorId } = await params;
    const donations = await MonetaryDonation.find({ donorId }).sort({
      createdAt: -1,
    });
    return NextResponse.json(
      donations.map((d) => ({
        id: d._id.toString(),
        donorId: d.donorId.toString(),
        donorName: d.donorName,
        amount: d.amount,
        method: d.method,
        phone: d.phone,
        txHash: d.txHash,
        blockNumber: d.blockNumber,
        timestamp: d.createdAt.toISOString(),
        status: d.status,
      }))
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
