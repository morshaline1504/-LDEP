import { NextResponse } from "next/server";
import donationBlockchain from "@/server/blockchain/blockchain";

export async function GET() {
  try {
    const chain = donationBlockchain.getAllBlocks();
    const isValid = donationBlockchain.isChainValid();
    return NextResponse.json({
      chainLength: chain.length,
      isValid,
      blocks: chain.map((b: { index: number; timestamp: string; data: unknown; hash: string; previousHash: string; nonce: number }) => ({
        index: b.index,
        timestamp: b.timestamp,
        data: b.data,
        hash: b.hash,
        previousHash: b.previousHash,
        nonce: b.nonce,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
