import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { isAddress } from "viem";
import { rateLimit } from "@/lib/rate-limit";
import { hasSameOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
const BSC_CHAIN_ID = 56;

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  try {
    if (!await rateLimit("wallet-nonce:" + user.id, 10, 3600)) {
      return NextResponse.json({ error: "Too many wallet verification requests. Try again later." }, { status: 429 });
    }
    const body = await request.json();
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const chainId = Number(body.chainId);
    if (!isAddress(address) || chainId !== BSC_CHAIN_ID) {
      return NextResponse.json({ error: "Connect a valid wallet on BNB Smart Chain." }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    const nonce = randomBytes(24).toString("hex");
    const origin = new URL(request.url).origin;
    const message = [
      "TaskVibe wallet ownership verification",
      `Domain: ${new URL(origin).host}`,
      `URI: ${origin}/wallet`,
      "Version: 1",
      "Chain ID: 56",
      "",
      "This signature links your wallet to your TaskVibe account. It does not authorize token transfers.",
      "",
      `Account: ${user.id}`,
      `Wallet: ${address}`,
      "Network: BNB Smart Chain (56)",
      `Nonce: ${nonce}`,
      `Issued At: ${now.toISOString()}`,
      `Expires At: ${expiresAt.toISOString()}`,
    ].join("\n");

    const db = await getDb();
    const challenges = db.collection("wallet_challenges");
    await challenges.createIndex({ nonce: 1 }, { unique: true });
    await challenges.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await challenges.insertOne({
      nonce,
      userId: user.id,
      address: address.toLowerCase(),
      chainId: BSC_CHAIN_ID,
      message,
      createdAt: now,
      expiresAt,
    });

    return NextResponse.json({ nonce, message, expiresAt: expiresAt.toISOString() });
  } catch {
    return NextResponse.json({ error: "Could not create a wallet verification challenge." }, { status: 503 });
  }
}
