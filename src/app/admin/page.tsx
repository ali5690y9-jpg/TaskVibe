import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import AdminSubmissionQueue from "@/components/admin-submission-queue";
export default async function AdminDashboard() {
 const user=await getCurrentUser(); if(!user) redirect("/login"); if(user.role!=="admin") redirect(user.role==="earner"?"/earner":"/advertiser");
 let stats={users:0,campaigns:0,pending:0}; try { const db=await getDb(); [stats.users,stats.campaigns,stats.pending]=await Promise.all([db.collection("users").countDocuments(),db.collection("campaigns").countDocuments(),db.collection("submissions").countDocuments({status:"pending"})]); } catch {}
 return <main className="dashboard"><header><Link href="/">TaskVibe</Link><span>Admin: {user.email}</span><Link href="/wallet">Wallet</Link><form action="/api/auth/logout" method="post"><button>Sign out</button></form></header><h1>Admin overview</h1><p>Admin access is not self-service. Provision administrator accounts through a trusted, audited operator process.</p><section className="stats"><article><h2>{stats.users}</h2><p>Users</p></article><article><h2>{stats.campaigns}</h2><p>Campaigns</p></article><article><h2>{stats.pending}</h2><p>Pending submissions</p></article></section><section><h2>Submission review queue</h2><AdminSubmissionQueue /></section><p>Deposits and withdrawals are disabled until chain verification and a secure payout signer are implemented.</p></main>;
}
