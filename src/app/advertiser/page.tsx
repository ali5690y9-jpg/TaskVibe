import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import CampaignForm from "@/components/campaign-form";
export default async function AdvertiserDashboard() {
 const user=await getCurrentUser(); if(!user) redirect("/login"); if(user.role!=="advertiser") redirect(user.role==="admin"?"/admin":"/earner");
 let campaigns:any[]=[]; try { const db=await getDb(); campaigns=await db.collection("campaigns").find({advertiserId:user.id}).sort({createdAt:-1}).limit(50).toArray(); } catch {}
 return <main className="dashboard"><header><Link href="/">TaskVibe</Link><span>Welcome, {user.name}</span><form action="/api/auth/logout" method="post"><button>Sign out</button></form></header><h1>Advertiser dashboard</h1><p>Manage your campaigns. New campaigns remain drafts until funding and review are enabled.</p><CampaignForm/><section><h2>Your campaigns</h2>{campaigns.length?campaigns.map(c=><article key={c._id.toString()}><h3>{c.title}</h3><p>{c.description}</p><small>{c.platform} · {c.status} · {c.rewardPerTask} USDT per task</small></article>):<p>No campaigns created yet.</p>}</section></main>;
}
