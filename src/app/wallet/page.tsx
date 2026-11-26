import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import WalletConnectPanel from "@/components/wallet-connect-panel";

export default async function WalletPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="dashboard wallet-page">
      <header>
        <Link href="/">TaskVibe</Link>
        <span>{user.name}</span>
        <Link href={user.role === "admin" ? "/admin" : user.role === "advertiser" ? "/advertiser" : "/earner"}>Dashboard</Link>
      </header>
      <h1>Your wallet</h1>
      <p>Connect and verify your own wallet. This does not deposit funds or enable payouts.</p>
      <WalletConnectPanel />
      <section>
        <h2>Supported network</h2>
        <article><strong>BNB Smart Chain</strong><p>Network ID: 56 · Asset planned: USDT (BEP-20)</p></article>
      </section>
      <Link href="/api/wallet">View wallet ledger API</Link>
    </main>
  );
}
