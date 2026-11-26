import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  try {
    const db = await getDb();
    const [entries, account] = await Promise.all([
      db.collection("ledger").find({ userId: user.id }).sort({ createdAt: -1 }).limit(100).toArray(),
      db.collection("users").findOne(
        { _id: new ObjectId(user.id) },
        { projection: { walletAddress: 1, walletConnectedAt: 1 } },
      ),
    ]);

    return NextResponse.json({
      currency: "USDT",
      network: "BEP-20",
      chainId: 56,
      walletAddress: account?.walletAddress ?? null,
      walletConnectedAt: account?.walletConnectedAt ?? null,
      entries: entries.map((entry) => ({
        id: entry._id.toString(),
        type: entry.type,
        amount: entry.amount,
        status: entry.status,
        reference: entry.reference,
        createdAt: entry.createdAt,
      })),
      note: "Wallet linking proves address ownership only. Deposits and payouts remain disabled until on-chain verification and a secure payout signer are configured.",
    });
  } catch {
    return NextResponse.json({ error: "Wallet service unavailable." }, { status: 503 });
  }
}
