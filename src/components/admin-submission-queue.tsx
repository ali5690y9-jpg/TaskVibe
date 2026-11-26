"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Submission = {
  id: string;
  campaignId: string;
  advertiserId: string;
  earnerId: string;
  proofUrl: string;
  note?: string;
  createdAt: string;
};

export default function AdminSubmissionQueue() {
  const router = useRouter();
  const [items, setItems] = useState<Submission[]>([]);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const response = await fetch("/api/admin/submissions", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load review queue.");
      setItems(data.submissions);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load review queue.");
    }
  }

  useEffect(() => { void load(); }, []);

  async function decide(id: string, decision: "approved" | "rejected") {
    setBusy(id);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ submissionId: id, decision, reason: reason[id] || "" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Review could not be saved.");
      setMessage("Review decision saved. No earnings were credited.");
      await load();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Review failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="admin-review-queue">
      <div className="admin-review-toolbar">
        <p>Manual review only. Approval records a decision; it does not credit funds.</p>
        <button type="button" onClick={() => void load()} disabled={busy !== null}>Refresh</button>
      </div>
      {items.length === 0 && !error && <p>No pending submissions.</p>}
      {items.map((item) => (
        <article className="admin-review-item" key={item.id}>
          <div className="admin-review-meta">
            <strong>Submission {item.id.slice(-8)}</strong>
            <small>{new Date(item.createdAt).toLocaleString()}</small>
          </div>
          <p>Campaign: {item.campaignId} · Earner: {item.earnerId}</p>
          <a href={item.proofUrl} target="_blank" rel="noreferrer">Open submitted proof ↗</a>
          {item.note && <p>{item.note}</p>}
          <label>Review note
            <input value={reason[item.id] || ""} maxLength={500} onChange={(event) => setReason((current) => ({ ...current, [item.id]: event.target.value }))} />
          </label>
          <div className="admin-review-actions">
            <button type="button" disabled={busy !== null} onClick={() => void decide(item.id, "approved")}>{busy === item.id ? "Saving…" : "Approve"}</button>
            <button type="button" className="admin-reject" disabled={busy !== null} onClick={() => void decide(item.id, "rejected")}>Reject</button>
          </div>
        </article>
      ))}
      {message && <p role="status">{message}</p>}
      {error && <p role="alert" className="wallet-error">{error}</p>}
    </div>
  );
}
