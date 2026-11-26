import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { setSession, verifyPassword, type Role } from "@/lib/auth";
export const runtime = "nodejs";
const schema=z.object({email:z.string().email().max(254),password:z.string().min(1).max(128)});
export async function POST(request:Request) {
  try {
    const parsed=schema.safeParse(await request.json());
    if(!parsed.success) return NextResponse.json({error:"Invalid email or password."},{status:400});
    const email=parsed.data.email.toLowerCase(), db=await getDb();
    const user=await db.collection("users").findOne({email,status:"active"});
    if(!user || typeof user.passwordHash!=="string" || !(await verifyPassword(parsed.data.password,user.passwordHash))) return NextResponse.json({error:"Invalid email or password."},{status:401});
    const role=user.role as Role;
    if(!["earner","advertiser","admin"].includes(role)) return NextResponse.json({error:"Account role is invalid."},{status:403});
    await setSession({id:user._id.toString(),name:user.name,email:user.email,role});
    return NextResponse.json({user:{id:user._id.toString(),name:user.name,email:user.email,role}});
  } catch(error) { console.error("TaskVibe login failed",error); return NextResponse.json({error:"Login unavailable. Check server configuration."},{status:503}); }
}
