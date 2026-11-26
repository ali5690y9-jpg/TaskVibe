import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
export const runtime="nodejs";
export async function GET(){
 try{const db=await getDb();await db.command({ping:1});return NextResponse.json({status:"ready",service:"taskvibe",database:"connected",timestamp:new Date().toISOString()});}
 catch{return NextResponse.json({status:"not_ready",service:"taskvibe",database:"unavailable",timestamp:new Date().toISOString()},{status:503});}
}
