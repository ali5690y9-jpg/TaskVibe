import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { hashPassword, setSession, type Role } from "@/lib/auth";
export const runtime = "nodejs";
const schema = z.object({ name:z.string().trim().min(2).max(80), email:z.string().trim().email().max(254), password:z.string().min(10).max(128), role:z.enum(["earner","advertiser"]).default("earner") });
export async function POST(request:Request) {
  try {
    const parsed=schema.safeParse(await request.json());
    if(!parsed.success) return NextResponse.json({error:"Enter a valid name, email and password of at least 10 characters."},{status:400});
    const data=parsed.data, email=data.email.toLowerCase(), db=await getDb();
    await db.collection("users").createIndex({email:1},{unique:true});
    const now=new Date();
    const result=await db.collection("users").insertOne({name:data.name,email,role:data.role as Role,passwordHash:await hashPassword(data.password),status:"active",createdAt:now,updatedAt:now});
    await setSession({id:result.insertedId.toString(),name:data.name,email,role:data.role as Role});
    return NextResponse.json({user:{id:result.insertedId.toString(),name:data.name,email,role:data.role}},{status:201});
  } catch(error) {
    if(error && typeof error==="object" && "code" in error && error.code===11000) return NextResponse.json({error:"An account with this email already exists."},{status:409});
    console.error("TaskVibe registration failed",error);
    return NextResponse.json({error:"Registration unavailable. Check TaskVibe server configuration."},{status:503});
  }
}
