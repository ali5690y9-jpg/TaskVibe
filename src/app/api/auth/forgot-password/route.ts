import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { issueEmailOtp } from "@/lib/otp";
import { rateLimit } from "@/lib/rate-limit";
export const runtime="nodejs";
const schema=z.object({email:z.string().email().max(254)});
export async function POST(request:Request){
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Enter a valid email."},{status:400});
 try{const email=parsed.data.email.toLowerCase();if(!await rateLimit("password-reset:"+email,3,3600))return NextResponse.json({error:"Too many requests. Try later."},{status:429});
 const db=await getDb(),user=await db.collection("users").findOne({email,status:"active"},{projection:{_id:1}});
 if(user)await issueEmailOtp(email,"reset_password");
 return NextResponse.json({message:"If the account exists, a reset code has been sent."});
 }catch(error){console.error("Password reset request failed",error);return NextResponse.json({error:"Password reset service unavailable."},{status:503});}
}
