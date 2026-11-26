import assert from "node:assert/strict";
const base=(process.env.TASKVIBE_BASE_URL||"http://localhost:3000").replace(/\/$/,"");
async function request(path,init){const response=await fetch(base+path,init);let body={};try{body=await response.json();}catch{}return {status:response.status,body};}
const checks=[];
async function check(name,fn){try{await fn();checks.push({name,ok:true});}catch(error){checks.push({name,ok:false,error:String(error)});}}
await check("health endpoint responds",async()=>{const r=await request("/api/health");assert.equal(r.status,200);assert.equal(r.body.service,"taskvibe");});
await check("protected current-user endpoint rejects anonymous",async()=>{const r=await request("/api/me");assert.equal(r.status,401);});
await check("wallet endpoint rejects anonymous",async()=>{const r=await request("/api/wallet");assert.equal(r.status,401);});
await check("admin review rejects anonymous",async()=>{const r=await request("/api/admin/submissions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({submissionId:"000000000000000000000000",decision:"approved"})});assert.equal(r.status,403);});
await check("invalid registration is rejected",async()=>{const r=await request("/api/auth/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"x",email:"not-an-email",password:"x",role:"admin"})});assert.equal(r.status,400);});
await check("invalid login is rejected",async()=>{const r=await request("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:"not-an-email",password:"x"})});assert.equal(r.status,400);});
for(const item of checks) console.log((item.ok?"PASS ":"FAIL ")+item.name+(item.error?" — "+item.error:""));
if(checks.some(x=>!x.ok)) process.exitCode=1;
else console.log("All TaskVibe unauthenticated smoke checks passed. This does not replace full authenticated, database, payment or security testing.");
