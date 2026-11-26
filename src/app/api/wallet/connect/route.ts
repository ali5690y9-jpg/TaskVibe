import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { isAddress, verifyMessage } from "viem";
import { rateLimit } from "@/lib/rate-limit";
import { hasSameOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
const BSC_CHAIN_ID = 56;

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  try {
    if (!await rateLimit("wallet-connect:" + user.id, 10, 3600)) {
      return NextResponse.json({ error: "Too many wallet verification attempts. Try again later." }, { status: 429 });
    }
    const body = await request.json();
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const nonce = typeof body.nonce === "string" ? body.nonce : "";
    const signature = typeof body.signature === "string" ? body.signature : "";
    const chainId = Number(body.chainId);
    if (!isAddress(address) || chainId !== BSC_CHAIN_ID || !/^0x[0-9a-fA-F]{130}$/.test(signature)) {
      return NextResponse.json({ error: "Invalid wallet verification data." }, { status: 400 });
    }

    const db = await getDb();
    const challenge = await db.collection("wallet_challenges").findOneAndDelete({
      nonce,
      userId: user.id,
      address: address.toLowerCase(),
      chainId: BSC_CHAIN_ID,
      expiresAt: { $gt: new Date() },
    });
    if (!challenge) return NextResponse.json({ error: "Verification expired or already used. Please reconnect." }, { status: 400 });

    const valid = await verifyMessage({
      address: address as `0x${string}`,
      message: challenge.message,
      signature: signature as `0x${string}`,
    });
    if (!valid) return NextResponse.json({ error: "Wallet signature could not be verified." }, { status: 401 });

    const users = db.collection("users");
    await users.createIndex(
      { walletAddress: 1 },
      { unique: true, partialFilterExpression: { walletAddress: { $type: "string" } } },
    );
    const normalizedAddress = address.toLowerCase();
    const owner = await users.findOne({ walletAddress: normalizedAddress, _id: { $ne: new ObjectId(user.id) } }, { projection: { _id: 1 } });
    if (owner) return NextResponse.json({ error: "This wallet is already linked to another TaskVibe account." }, { status: 409 });

    await users.updateOne(
      { _id: new ObjectId(user.id), $or: [{ walletAddress: { $exists: false } }, { walletAddress: normalizedAddress }] },
      { $set: { walletAddress: normalizedAddress, walletConnectedAt: new Date() } },
    );
    const saved = await users.findOne({ _id: new ObjectId(user.id) }, { projection: { walletAddress: 1 } });
    if (saved?.walletAddress !== normalizedAddress) {
      return NextResponse.json({ error: "This account already has a different wallet linked. Contact support to change it securely." }, { status: 409 });
    }

    return NextResponse.json({ connected: true, address: normalizedAddress, network: "BNB Smart Chain", chainId: BSC_CHAIN_ID });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "This wallet is already linked to another TaskVibe account." }, { status: 409 });
    }
    return NextResponse.json({ error: "Wallet verification service unavailable." }, { status: 503 });
  }
}
