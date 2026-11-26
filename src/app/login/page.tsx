"use client";
import { useState } from "react";
export default function LoginPage(){
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{const r=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Login failed");location.href=d.user.role==="admin"?"/admin":d.user.role==="advertiser"?"/advertiser":"/earner";}catch(x){setError(x instanceof Error?x.message:"Login failed");}finally{setBusy(false);}}
 return <main className="auth-page"><form onSubmit={submit}><a href="/">← TaskVibe</a><h1>Welcome back</h1><label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p role="alert">{error}</p>}<button disabled={busy}>{busy?"Signing in…":"Sign in"}</button><p>New here? <a href="/register">Create an account</a></p></form></main>;
}
