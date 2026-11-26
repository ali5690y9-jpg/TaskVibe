# TaskVibe

Independent social-task marketplace for earners, advertisers and administrators.

## Implemented in this branch
- Earner/advertiser registration with normalized unique email addresses.
- Scrypt password hashing and signed HTTP-only session cookies.
- Gmail SMTP email verification codes with 10-minute expiry, hashed OTP storage, resend throttling and verification attempt limits.
- Password reset request and OTP-based password reset.
- Role-protected earner, advertiser and admin dashboards.
- Advertiser campaign draft form and campaign API.
- Earner proof submission form and duplicate submission index.
- Admin-only submission review endpoint.
- One-time initial admin bootstrap endpoint with a deployment secret and database lock.
- WalletConnect on BNB Smart Chain (chain ID 56), one-time wallet ownership challenge and server-side signature verification.
- Authenticated read-only wallet ledger API.
- API smoke-test script and MongoDB readiness endpoint.

## Local setup
1. Use Node.js 20.9 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Configure a dedicated TaskVibe MongoDB database.
5. Set unique random `AUTH_SECRET`, `OTP_SECRET` and temporary `ADMIN_BOOTSTRAP_SECRET` values (at least 32 characters each).
6. Configure Gmail SMTP app-password credentials in `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`.
7. Run `npm run dev`; check `/api/health/ready`.
8. Call `POST /api/admin/bootstrap` once with name, email, a 14+ character password and the temporary bootstrap secret. Remove `ADMIN_BOOTSTRAP_SECRET` from the deployment environment immediately after successful creation.

Never reuse SocialPromo database credentials, secrets, Telegram bot credentials or wallet settings.

## Wallet connection setup
1. Create a Reown/WalletConnect project at https://cloud.reown.com.
2. Add its public project ID as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in the TaskVibe Preview environment and local `.env.local`.
3. Sign in and open `/wallet`; connect a wallet using WalletConnect and approve the ownership signature on BNB Smart Chain (chain ID 56).
4. The signature is a message signature only; it does not request token approval or transfer funds. Wallet addresses are unique per TaskVibe account and cannot be changed through the UI.
5. This only links an address. No USDT deposit detection, balance accounting, token transfer, or withdrawal is enabled.

## Smoke tests
With the app running, run `npm run test:smoke`. Optionally set `TASKVIBE_BASE_URL` to a staging URL. This covers basic unauthenticated API behavior only; it is not a full end-to-end or security test.

## Not production-ready
- Campaign funding, atomic budget reservation and safe settlement are not implemented.
- No live USDT BEP-20 deposits, chain scanner, wallet custody or withdrawals are enabled.
- A verified BSC RPC endpoint, confirmed token contract, dedicated receiving wallet and independently secured withdrawal signer are still required before real-money features can be implemented safely.
- Social-platform OAuth/API integrations and reliable task verification are not implemented.
- Full authenticated E2E, concurrency/load tests and independent security review remain required.
- Telegram notifications are configured as placeholders only and are not active.

Campaigns currently save as drafts; proof approval does not credit withdrawable funds. Do not deploy for public financial use until the outstanding work is completed and tested.
