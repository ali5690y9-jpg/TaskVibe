import "server-only";
import { getDb } from "@/lib/mongodb";
import { createHash } from "node:crypto";
export async function rateLimit(key:string,limit:number,windowSeconds:number){
 const db=await getDb(),now=new Date(),window=Math.floor(now.getTime()/(windowSeconds*1000)),id=createHash("sha256").update(key).digest("hex")+":"+window;
 const col=db.collection("rate_limits");
 await col.createIndex({expiresAt:1},{expireAfterSeconds:0});
 const result=await col.findOneAndUpdate({_id:id},{$inc:{count:1},$setOnInsert:{expiresAt:new Date((window+1)*windowSeconds*1000)}},{upsert:true,returnDocument:"after"});
 return (result?.count??limit+1)<=limit;
}
