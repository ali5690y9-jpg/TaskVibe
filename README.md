# TaskVibe

A standalone social-task marketplace connecting advertisers with earners.

## Product areas
- **Earner**: discover tasks, submit proof, track wallet balance and payouts.
- **Advertiser**: create campaigns, fund campaign budgets, review submissions.
- **Admin**: moderate users, tasks, disputes, deposits and withdrawals.

## Planned stack
- Next.js App Router + TypeScript
- Tailwind CSS
- MongoDB with server-only access
- Gmail SMTP for transactional email (no Resend dependency)
- Telegram notifications via a separately configured bot/webhook
- USDT on BNB Smart Chain (BEP-20), with server-side transaction verification

## Important safety boundaries
- This repository is independent of SocialPromo. It must use its own database, secrets, bot, and wallet configuration.
- Never commit secrets, private keys, seed phrases, or real credentials.
- Wallet deposits must be credited only after on-chain verification, required confirmations, and idempotent transaction processing.
- Withdrawals require an auditable approval and signing process. Never store signing keys in client code.
- Social-platform actions must comply with each platform's terms and use supported APIs where available.

## Local development
1. Install Node.js 20.9+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill only development credentials.
4. Run `npm run dev`.

The first scaffold establishes the app shell and secure server-side integration boundaries. Production payment processing, identity verification, and social-platform verification require separate implementation and testing before launch.
