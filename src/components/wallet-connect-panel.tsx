"use client";

import { useEffect, useState } from "react";

type WalletProvider = Awaited<ReturnType<typeof import("@walletconnect/ethereum-provider").EthereumProvider.init>>;
type RequestProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  session?: unknown;
  connect?: () => Promise<void>;
};
declare global {
  interface Window { ethereum?: RequestProvider }
}
let sharedProvider: WalletProvider | null = null;

type WalletStatus = { walletAddress: string | null; note?: string };

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function WalletConnectPanel() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/wallet", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<WalletStatus> : null)
      .then((data) => { if (active && data) setWallet(data.walletAddress); })
      .catch(() => { if (active) setError("Wallet status could not be loaded."); });
    return () => { active = false; };
  }, []);

  async function connect() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let provider: RequestProvider;
      if (window.ethereum) {
        provider = window.ethereum;
      } else {
        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
        if (!projectId) throw new Error("No browser wallet detected. Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to enable WalletConnect QR pairing.");
        if (!sharedProvider) {
          const { EthereumProvider } = await import("@walletconnect/ethereum-provider");
          sharedProvider = await EthereumProvider.init({
            projectId,
            optionalChains: [56],
            showQrModal: true,
            metadata: {
              name: "TaskVibe",
              description: "Connect your wallet to your TaskVibe account.",
              url: window.location.origin,
              icons: [],
            },
          });
        }
        provider = sharedProvider as unknown as RequestProvider;
        if (!provider.session) await provider.connect?.();
      }
      let chainId = await provider.request({ method: "eth_chainId" }) as string;
      if (Number(BigInt(chainId)) !== 56) {
        await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x38" }] });
        chainId = await provider.request({ method: "eth_chainId" }) as string;
      }
      if (Number(BigInt(chainId)) !== 56) throw new Error("Please switch your wallet to BNB Smart Chain.");

      const accounts = await provider.request({ method: "eth_requestAccounts" }) as string[];
      const address = accounts?.[0];
      if (!address) throw new Error("No wallet account was shared.");

      const challengeResponse = await fetch("/api/wallet/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, chainId: 56 }),
      });
      const challenge = await challengeResponse.json();
      if (!challengeResponse.ok) throw new Error(challenge.error || "Could not start wallet verification.");

      setMessage("Please approve the signature request in your wallet. It does not transfer funds.");
      const signature = await provider.request({
        method: "personal_sign",
        params: [challenge.message, address],
      }) as string;

      const verifyResponse = await fetch("/api/wallet/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, chainId: 56, nonce: challenge.nonce, signature }),
      });
      const result = await verifyResponse.json();
      if (!verifyResponse.ok) throw new Error(result.error || "Wallet verification failed.");

      setWallet(result.address);
      setMessage("Wallet ownership verified and linked to your TaskVibe account.");
    } catch (cause) {
      const text = cause instanceof Error ? cause.message : "Wallet connection failed.";
      setError(text);
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="wallet-panel">
      <div className="wallet-panel-heading">
        <div>
          <span className="eyebrow">BEP-20 WALLET</span>
          <h2>{wallet ? "Wallet linked" : "Connect your wallet"}</h2>
          <p>Link your own wallet using WalletConnect on BNB Smart Chain.</p>
        </div>
        <span className="wallet-network">BNB Chain · 56</span>
      </div>
      {wallet ? (
        <div className="wallet-linked">
          <span className="wallet-check">✓</span>
          <div><strong>{shortAddress(wallet)}</strong><small>{wallet}</small></div>
          <span className="wallet-status">Verified</span>
        </div>
      ) : (
        <button className="wallet-connect-button" onClick={connect} disabled={busy}>
          {busy ? "Connecting…" : "Connect with WalletConnect"}
        </button>
      )}
      {message && <p className="wallet-message" role="status">{message}</p>}
      {error && <p className="wallet-error" role="alert">{error}</p>}
      <p className="wallet-disclaimer">Connecting and signing only proves wallet ownership. TaskVibe will never ask for your seed phrase or private key. No token transfer is requested. Deposits and withdrawals are not enabled yet.</p>
    </section>
  );
}
