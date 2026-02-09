import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MonetaryDonation from "@/server/models/MonetaryDonation";
import Notification from "@/server/models/Notification";
import User from "@/server/models/User";
import donationBlockchain from "@/server/blockchain/blockchain";

export async function GET() {
  try {
    await connectDB();
    const donations = await MonetaryDonation.find().sort({ createdAt: -1 });
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

export async function POST(request: Request) {
  try {
    await connectDB();
    const { donorId, donorName, amount, method, phone } = await request.json();

    // Record on blockchain
    const block = donationBlockchain.addBlock({
      type: "monetary_donation",
      donorId,
      donorName,
      amount,
      method,
      phone,
      timestamp: new Date().toISOString(),
    });

    const donation = await MonetaryDonation.create({
      donorId,
      donorName,
      amount,
      method,
      phone,
      txHash: `0x${block.hash}`,
      blockNumber: block.index,
      status: "completed",
    });

    // Notify admin
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Notification.create({
        userId: admin._id,
        message: `New donation of ৳${amount} from ${donorName}`,
      });
    }

    // Notify donor
    await Notification.create({
      userId: donorId,
      message: `Your donation of ৳${amount} has been recorded on the blockchain.`,
    });

    return NextResponse.json(
      {
        id: donation._id.toString(),
        donorId: donation.donorId.toString(),
        donorName: donation.donorName,
        amount: donation.amount,
        method: donation.method,
        phone: donation.phone,
        txHash: donation.txHash,
        blockNumber: donation.blockNumber,
        timestamp: donation.createdAt.toISOString(),
        status: donation.status,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
