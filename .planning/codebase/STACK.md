# Technology Stack

**Analysis Date:** 2026-01-10

## Languages

**Primary:**
- TypeScript 5.7.3 - All application code (`functions/package.json`)

**Secondary:**
- JavaScript - Compiled output (`functions/lib/`), ESLint config (`functions/.eslintrc.js`)

## Runtime

**Environment:**
- Node.js 24 - Required by `functions/package.json` engines field
- No browser runtime (serverless Cloud Functions only)

**Package Manager:**
- npm (primary package manager)
- Lockfile: `functions/package-lock.json` present (212KB)

## Frameworks

**Core:**
- Firebase Cloud Functions v2 API 7.0.0 - Serverless compute (`functions/package.json`)
- Firebase Admin SDK 13.6.0 - Server-side Firebase access (`functions/package.json`)

**Testing:**
- firebase-functions-test 3.4.1 - Unit testing for Cloud Functions (installed but not configured)

**Build/Dev:**
- TypeScript 5.7.3 - Compilation to ES2017 JavaScript (`functions/tsconfig.json`)
- ESLint 8.9.0 - Code quality and style enforcement (`functions/.eslintrc.js`)

## Key Dependencies

**Critical:**
- firebase-admin 13.6.0 - Firestore access, authentication context (`functions/package.json`)
- firebase-functions 7.0.0 - Cloud Functions SDK with v2 onCall API (`functions/package.json`)

**Infrastructure:**
- Node.js built-ins only - No additional HTTP client installed yet
- Claude API (planned) - Will use node-fetch or similar for API calls (`specs.md`)

**Dev Dependencies:**
- @typescript-eslint/eslint-plugin 5.12.0 - TypeScript ESLint rules
- @typescript-eslint/parser 5.12.0 - TypeScript parser for ESLint
- eslint-config-google 0.14.0 - Google style guide
- eslint-plugin-import 2.25.4 - Import/export linting

## Configuration

**Environment:**
- `.env` files for local development (gitignored)
- `CLAUDE_API_KEY` required for Claude API integration (planned)
- Firebase functions config for production: `firebase functions:config:set`

**Build:**
- `functions/tsconfig.json` - TypeScript compiler options (strict mode, NodeNext modules, ES2017 target)
- `functions/.eslintrc.js` - ESLint with Google style, TypeScript support
- `firebase.json` - Firebase project config with predeploy hooks (lint + build)

## Platform Requirements

**Development:**
- macOS/Linux/Windows (any platform with Node.js 24)
- Firebase CLI for emulator and deployment
- No Docker required

**Production:**
- Firebase Cloud Functions (Google Cloud Platform)
- Firestore database (us-east1 region)
- Firebase Authentication
- Project ID: `piak-a9b47`

---

*Stack analysis: 2026-01-10*
*Update after major dependency changes*
