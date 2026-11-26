import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import SubmissionForm from "@/components/submission-form";
export default async function EarnerDashboard() {
 const user=await getCurrentUser(); if(!user) redirect("/login"); if(user.role!=="earner") redirect(user.role==="admin"?"/admin":"/advertiser");
 let campaigns:any[]=[]; try { const db=await getDb(); campaigns=await db.collection("campaigns").find({status:"active"}).sort({createdAt:-1}).limit(20).project({title:1,platform:1,taskType:1,rewardPerTask:1,description:1}).toArray(); } catch {}
 return <main className="dashboard"><header><Link href="/">TaskVibe</Link><span>Welcome, {user.name}</span><form action="/api/auth/logout" method="post"><button>Sign out</button></form></header><h1>Earner dashboard</h1><p>Browse available campaigns. Rewards require review and confirmed settlement.</p><section><h2>Available campaigns</h2>{campaigns.length?campaigns.map(c=><article key={c._id.toString()}><h3>{c.title}</h3><p>{c.description}</p><SubmissionForm campaignId={c._id.toString()}/><small>{c.platform} · {c.taskType} · {c.rewardPerTask} USDT per task</small></article>):<p>No published campaigns yet.</p>}</section><Link href="/wallet">Connect BEP-20 wallet · View activity</Link></main>;
}
