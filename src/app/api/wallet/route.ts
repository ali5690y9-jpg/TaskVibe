import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
export const runtime="nodejs";
export async function GET(){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 try{const db=await getDb(),entries=await db.collection("ledger").find({userId:user.id}).sort({createdAt:-1}).limit(100).toArray();return NextResponse.json({currency:"USDT",network:"BEP-20",entries:entries.map(e=>({id:e._id.toString(),type:e.type,amount:e.amount,status:e.status,reference:e.reference,createdAt:e.createdAt})),note:"Deposits and payouts are disabled until on-chain verification and a secure payout signer are configured."});}
 catch{return NextResponse.json({error:"Wallet service unavailable."},{status:503});}
}
