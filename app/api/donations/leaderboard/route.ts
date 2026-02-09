import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MonetaryDonation from "@/server/models/MonetaryDonation";

export async function GET() {
  try {
    await connectDB();
    const result = await MonetaryDonation.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$donorId",
          donorName: { $first: "$donorName" },
          totalAmount: { $sum: "$amount" },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const leaderboard = result.map((r) => ({
      donorId: r._id.toString(),
      donorName: r.donorName,
      totalAmount: r.totalAmount,
      donationCount: r.donationCount,
    }));

    return NextResponse.json(leaderboard);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
