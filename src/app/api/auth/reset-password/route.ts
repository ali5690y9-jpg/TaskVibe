import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { consumeEmailOtp } from "@/lib/otp";
import { hashPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
export const runtime="nodejs";
const schema=z.object({email:z.string().email().max(254),code:z.string().regex(/^\d{6}$/),password:z.string().min(10).max(128)});
export async function POST(request:Request){
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Enter a valid email, six-digit code and new password."},{status:400});
 try{const email=parsed.data.email.toLowerCase();if(!await rateLimit("password-reset-verify:"+email,10,900))return NextResponse.json({error:"Too many reset attempts. Try later."},{status:429});const db=await getDb();if(!await consumeEmailOtp(email,parsed.data.code,"reset_password"))return NextResponse.json({error:"Code is invalid or expired."},{status:400});
 const result=await db.collection("users").updateOne({email,status:"active"},{$set:{passwordHash:await hashPassword(parsed.data.password),updatedAt:new Date(),passwordChangedAt:new Date()}});
 if(!result.modifiedCount)return NextResponse.json({error:"Account not found."},{status:404});
 return NextResponse.json({success:true,message:"Password updated. Sign in using your new password."});
 }catch(error){console.error("Password reset failed",error);return NextResponse.json({error:"Password reset unavailable."},{status:503});}
}
