import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { hashPassword,setSession } from "@/lib/auth";
export const runtime="nodejs";
const schema=z.object({name:z.string().trim().min(2).max(80),email:z.string().trim().email().max(254),password:z.string().min(14).max(128),bootstrapSecret:z.string().min(32)});
export async function POST(request:Request){
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid bootstrap request."},{status:400});
 const configured=process.env.ADMIN_BOOTSTRAP_SECRET;
 if(!configured||configured.length<32||parsed.data.bootstrapSecret!==configured)return NextResponse.json({error:"Admin bootstrap is not authorized."},{status:403});
 try{const db=await getDb(),admins=await db.collection("users").countDocuments({role:"admin"});if(admins>0)return NextResponse.json({error:"An administrator already exists. Bootstrap is permanently closed."},{status:409});
 const email=parsed.data.email.toLowerCase(),now=new Date();await db.collection("users").createIndex({email:1},{unique:true});
 const result=await db.collection("users").insertOne({name:parsed.data.name,email,role:"admin",passwordHash:await hashPassword(parsed.data.password),status:"active",emailVerified:true,createdAt:now,updatedAt:now,provisionedBy:"one_time_bootstrap"});
 await setSession({id:result.insertedId.toString(),name:parsed.data.name,email,role:"admin"});
 return NextResponse.json({success:true,message:"Initial administrator created. Remove ADMIN_BOOTSTRAP_SECRET from deployment settings immediately."},{status:201});
 }catch(error){if(error&&typeof error==="object"&&"code"in error&&error.code===11000)return NextResponse.json({error:"An account with this email already exists."},{status:409});console.error("Admin bootstrap failed",error);return NextResponse.json({error:"Admin bootstrap unavailable."},{status:503});}
}
