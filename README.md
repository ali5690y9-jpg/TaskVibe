# TaskVibe

Independent social-task marketplace for earners, advertisers and administrators.

## Current implementation
- Earner and advertiser self-registration with normalized unique email addresses.
- Password hashing with Node.js scrypt and signed HTTP-only session cookies.
- Separate role-protected earner, advertiser and admin dashboards.
- Advertiser campaign draft form and campaign listing API.
- Earner proof submission form and duplicate submission protection.
- Admin-only submission review endpoint.
- Authenticated read-only wallet ledger endpoint.

## Local setup
1. Use Node.js 20.9 or newer.
2. Install dependencies with npm install.
3. Copy .env.example to .env.local.
4. Configure a dedicated TaskVibe MongoDB database and a random AUTH_SECRET of at least 32 characters.
5. Start with npm run dev.

Never reuse SocialPromo database credentials, secrets, Telegram bot or wallet settings.

## Not production-ready yet
Email OTP and password reset, rate limiting, admin provisioning/audit logs, campaign funding and atomic budget reservation, real settlement, verified USDT BEP-20 deposits, secure withdrawals, social platform OAuth/API verification, end-to-end tests, load tests and an independent security review remain outstanding. Campaign creation currently saves drafts only. Submission approval does not credit withdrawable funds. Deposits and withdrawals are not enabled. Do not deploy for public financial use until these items are implemented and tested.