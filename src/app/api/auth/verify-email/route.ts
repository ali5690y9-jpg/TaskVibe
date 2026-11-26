import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { consumeEmailOtp } from "@/lib/otp";
import { setSession,type Role } from "@/lib/auth";
export const runtime="nodejs";
const schema=z.object({email:z.string().email().max(254),code:z.string().regex(/^\d{6}$/)});
export async function POST(request:Request){
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Enter a valid email and six-digit code."},{status:400});
 try{const email=parsed.data.email.toLowerCase(),ok=await consumeEmailOtp(email,parsed.data.code,"verify_email");if(!ok)return NextResponse.json({error:"Code is invalid or expired."},{status:400});
 const db=await getDb();const changed=await db.collection("users").updateOne({email,status:"pending_verification"},{$set:{status:"active",emailVerified:true,updatedAt:new Date()}});
 if(!changed.modifiedCount)return NextResponse.json({error:"No pending account found for this email."},{status:404});
 const user=await db.collection("users").findOne({email,status:"active"});if(!user)return NextResponse.json({error:"Account could not be loaded."},{status:500});
 const role=user.role as Role;await setSession({id:user._id.toString(),name:user.name,email:user.email,role});
 return NextResponse.json({success:true,role});
 }catch(error){console.error("Email verification failed",error);return NextResponse.json({error:"Verification service unavailable."},{status:503});}
}
