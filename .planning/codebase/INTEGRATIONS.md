# External Integrations

**Analysis Date:** 2026-01-10

## APIs & External Services

**AI/ML Processing:**
- Anthropic Claude API - AI-powered contact processing (planned)
  - SDK/Client: Direct HTTP calls via node-fetch (to be installed)
  - Model: `claude-haiku-4-5-20251001` (fast and cheap)
  - Auth: API key via `CLAUDE_API_KEY` env var
  - Endpoint: `https://api.anthropic.com/v1/messages`
  - Use cases: Intent classification, contact extraction, contact updates, AI search

**Email/SMS:**
- Not detected

**External APIs:**
- None configured yet

## Data Storage

**Databases:**
- Google Cloud Firestore - Primary data store (`firebase.json`)
  - Connection: Via Firebase Admin SDK (auto-configured)
  - Client: firebase-admin 13.6.0 (`functions/package.json`)
  - Region: us-east1 (`firebase.json`)
  - Collection structure: `contacts/{contactId}` (planned per `specs.md`)

**File Storage:**
- Not detected (no Firebase Storage configured)

**Caching:**
- None configured

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication - User identity management
  - Implementation: Firebase Admin SDK for server-side context
  - Token handling: Automatic via Cloud Functions onCall pattern
  - Session management: Firebase handles JWT tokens

**OAuth Integrations:**
- Not configured yet

## Monitoring & Observability

**Error Tracking:**
- Not configured (consider adding Sentry)

**Analytics:**
- Not configured

**Logs:**
- Firebase Functions logging - via `firebase-functions/logger` (`functions/src/index.ts`)
  - Structured logging available
  - Retention: Firebase console

## CI/CD & Deployment

**Hosting:**
- Firebase Cloud Functions - Serverless function hosting
  - Deployment: `npm run deploy` or `firebase deploy --only functions`
  - Pre-deploy: Runs `npm run lint` and `npm run build` (`firebase.json`)
  - Project ID: `piak-a9b47` (`.firebaserc`)

**CI Pipeline:**
- Not configured (no .github/workflows found)

## Environment Configuration

**Development:**
- Required env vars: `CLAUDE_API_KEY` (for Claude API calls)
- Secrets location: `functions/.env` (gitignored)
- Emulator ports: Functions 5001, Firestore 8080, Auth 9099 (`firebase.json`)
- Missing: `.env.example` template

**Staging:**
- Not configured

**Production:**
- Secrets management: `firebase functions:config:set` for runtime config
- Deployment: Firebase CLI to `piak-a9b47` project

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- None configured

---

*Integration audit: 2026-01-10*
*Update when adding/removing external services*
