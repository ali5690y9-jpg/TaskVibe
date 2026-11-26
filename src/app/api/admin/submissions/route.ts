import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
export const runtime="nodejs";
const schema=z.object({submissionId:z.string().length(24),decision:z.enum(["approved","rejected"]),reason:z.string().max(500).optional()});
export async function GET(){
 const user=await getCurrentUser();if(!user||user.role!=="admin")return NextResponse.json({error:"Admin access required."},{status:403});
 try{const db=await getDb();const rows=await db.collection("submissions").find({status:"pending"}).sort({createdAt:1}).limit(100).toArray();return NextResponse.json({submissions:rows.map(row=>({id:row._id.toString(),campaignId:row.campaignId,advertiserId:row.advertiserId,earnerId:row.earnerId,proofUrl:row.proofUrl,note:row.note,createdAt:row.createdAt}))});}
 catch{return NextResponse.json({error:"Could not load pending submissions."},{status:503});}
}
export async function POST(request:Request){
 const user=await getCurrentUser();if(!user||user.role!=="admin")return NextResponse.json({error:"Admin access required."},{status:403});
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid review request."},{status:400});
 try{const db=await getDb(),id=new ObjectId(parsed.data.submissionId),now=new Date();const result=await db.collection("submissions").updateOne({_id:id,status:"pending"},{$set:{status:parsed.data.decision,reviewedBy:user.id,reviewedAt:now,reviewReason:parsed.data.reason||"",updatedAt:now}});
 if(!result.modifiedCount)return NextResponse.json({error:"Pending submission not found or already reviewed."},{status:409});
 return NextResponse.json({success:true,status:parsed.data.decision,note:"Review decision saved. Approval does not credit withdrawable funds; settlement is not enabled."});
 }catch{return NextResponse.json({error:"Review service unavailable."},{status:503});}
}
