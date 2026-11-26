import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/mongodb";
import { sendVerificationCode } from "@/lib/email";
function otpSecret(){const s=process.env.OTP_SECRET;if(!s||s.length<32)throw new Error("OTP_SECRET must be a random value of at least 32 characters.");return s;}
function digest(email:string,code:string){return createHmac("sha256",otpSecret()).update(email+":"+code).digest("hex");}
export async function issueEmailOtp(email:string,purpose:"verify_email"|"reset_password"){
 const db=await getDb(),now=new Date(),code=String(randomInt(0,1000000)).padStart(6,"0");
 const collection=db.collection("email_otps");
 await collection.createIndex({expiresAt:1},{expireAfterSeconds:0});
 await collection.deleteMany({email,purpose,expiresAt:{$lte:now}});
 const recent=await collection.countDocuments({email,purpose,createdAt:{$gt:new Date(now.getTime()-15*60*1000)}});
 if(recent>=3)throw new Error("Too many codes requested. Please try again later.");
 await collection.deleteMany({email,purpose});
 await collection.insertOne({email,purpose,codeHash:digest(email,code),attempts:0,createdAt:now,expiresAt:new Date(now.getTime()+10*60*1000)});
 await sendVerificationCode(email,code);
}
export async function consumeEmailOtp(email:string,code:string,purpose:"verify_email"|"reset_password"){
 const db=await getDb(),collection=db.collection("email_otps"),doc=await collection.findOne({email,purpose});
 if(!doc||doc.expiresAt<=new Date()||doc.attempts>=5)return false;
 const actual=Buffer.from(digest(email,code)),expected=Buffer.from(doc.codeHash);
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected)){
  await collection.updateOne({_id:doc._id},{$inc:{attempts:1}});
  return false;
 }
 await collection.deleteOne({_id:doc._id});
 return true;
}
