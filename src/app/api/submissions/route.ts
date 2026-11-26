import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
export const runtime="nodejs";
const schema=z.object({campaignId:z.string().length(24),proofUrl:z.string().url().max(2048).refine(value=>new URL(value).protocol==="https:"),note:z.string().max(1000).optional()});
export async function POST(request:Request){
 const user=await getCurrentUser();if(!user||user.role!=="earner")return NextResponse.json({error:"Earner access required."},{status:403});
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Valid campaign ID and proof URL required."},{status:400});
 try{const db=await getDb();await db.collection("submissions").createIndex({campaignId:1,earnerId:1},{unique:true});const campaign=await db.collection("campaigns").findOne({_id:new ObjectId(parsed.data.campaignId),status:"active"});if(!campaign)return NextResponse.json({error:"Campaign unavailable."},{status:404});
 const duplicate=await db.collection("submissions").findOne({campaignId:parsed.data.campaignId,earnerId:user.id});if(duplicate)return NextResponse.json({error:"Already submitted this campaign."},{status:409});
 const now=new Date(),result=await db.collection("submissions").insertOne({campaignId:parsed.data.campaignId,advertiserId:campaign.advertiserId,earnerId:user.id,proofUrl:parsed.data.proofUrl,note:parsed.data.note||"",status:"pending",createdAt:now,updatedAt:now});
 return NextResponse.json({id:result.insertedId.toString(),status:"pending",message:"Proof submitted for manual review. No funds are credited yet."},{status:201});
 }catch{return NextResponse.json({error:"Submission service unavailable."},{status:503});}
}
