import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
export const runtime="nodejs";
const schema=z.object({title:z.string().trim().min(5).max(120),description:z.string().trim().min(20).max(2000),platform:z.enum(["instagram","youtube","tiktok","facebook","x","telegram","other"]),taskType:z.enum(["follow","like","comment","subscribe","join","share","view","other"]),targetUrl:z.string().url().max(2048).refine(value=>new URL(value).protocol==="https:"),rewardPerTask:z.number().positive().max(100),quantity:z.number().int().min(1).max(100000)});
export async function GET(){
 try{const db=await getDb();const rows=await db.collection("campaigns").find({status:"active"}).sort({createdAt:-1}).limit(50).project({title:1,description:1,platform:1,taskType:1,rewardPerTask:1,quantity:1,createdAt:1}).toArray();return NextResponse.json({campaigns:rows.map(x=>({...x,id:x._id.toString()}))});}
 catch{return NextResponse.json({error:"Campaign service unavailable."},{status:503});}
}
export async function POST(request:Request){
 const user=await getCurrentUser();if(!user||user.role!=="advertiser")return NextResponse.json({error:"Advertiser access required."},{status:403});
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Campaign details are invalid."},{status:400});
 try{const db=await getDb(),now=new Date();const result=await db.collection("campaigns").insertOne({...parsed.data,advertiserId:user.id,status:"draft",completed:0,createdAt:now,updatedAt:now});return NextResponse.json({id:result.insertedId.toString(),status:"draft",message:"Saved as draft. Funding and review are required before publication."},{status:201});}
 catch{return NextResponse.json({error:"Could not save campaign."},{status:503});}
}
