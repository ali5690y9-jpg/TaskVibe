import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { issueEmailOtp } from "@/lib/otp";
import { rateLimit } from "@/lib/rate-limit";
export const runtime="nodejs";
const schema=z.object({name:z.string().trim().min(2).max(80),email:z.string().trim().email().max(254),password:z.string().min(10).max(128),role:z.enum(["earner","advertiser"]).default("earner")});
export async function POST(request:Request){
 try{
  const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Enter a valid name, email and password of at least 10 characters."},{status:400});
  const data=parsed.data,email=data.email.toLowerCase();if(!await rateLimit("register:"+email,5,3600))return NextResponse.json({error:"Too many registration attempts. Try later."},{status:429});
  const db=await getDb();await db.collection("users").createIndex({email:1},{unique:true});
  const existing=await db.collection("users").findOne({email},{projection:{_id:1,status:1}});
  if(existing)return NextResponse.json({error:"An account with this email already exists."},{status:409});
  const now=new Date(),result=await db.collection("users").insertOne({name:data.name,email,role:data.role,passwordHash:await hashPassword(data.password),status:"pending_verification",emailVerified:false,sessionVersion:0,createdAt:now,updatedAt:now});
  try{await issueEmailOtp(email,"verify_email");}catch(error){await db.collection("users").deleteOne({_id:result.insertedId,status:"pending_verification"});throw error;}
  return NextResponse.json({verificationRequired:true,email,message:"A verification code has been sent to your email."},{status:201});
 }catch(error){if(error&&typeof error==="object"&&"code"in error&&error.code===11000)return NextResponse.json({error:"An account with this email already exists."},{status:409});console.error("TaskVibe registration failed",error);return NextResponse.json({error:"Registration or email delivery unavailable. Check SMTP configuration."},{status:503});}
}
