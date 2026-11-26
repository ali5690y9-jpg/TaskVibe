"use client";
import { useState } from "react";
export default function SubmissionForm({campaignId}:{campaignId:string}){
 const [proofUrl,setProofUrl]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const r=await fetch("/api/submissions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({campaignId,proofUrl})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Submission failed");setMessage("Proof submitted for manual review.");}catch(x){setMessage(x instanceof Error?x.message:"Submission failed");}finally{setBusy(false);}}
 return <form className="proof-form" onSubmit={submit}><label>Proof URL<input type="url" required value={proofUrl} onChange={e=>setProofUrl(e.target.value)} placeholder="https://…"/></label><button disabled={busy}>{busy?"Submitting…":"Submit proof"}</button>{message&&<small role="status">{message}</small>}</form>;
}
