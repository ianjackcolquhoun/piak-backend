# Codebase Concerns

**Analysis Date:** 2026-01-10

## Tech Debt

**Outdated ESLint TypeScript plugins:**
- Issue: ESLint TypeScript plugins are pinned to v5.12.0 (from Feb 2022)
- Files: `functions/package.json:22-23`
- Why: Firebase template uses older versions
- Impact: Missing 3+ years of bug fixes, security patches, TypeScript improvements
- Fix approach: Update to v7.x+: `npm install --save-dev @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest`

**Outdated ESLint version:**
- Issue: ESLint 8.9.0 (from Feb 2022), current is v9.x
- Files: `functions/package.json:24`
- Why: Firebase template uses older version
- Impact: Missing improvements and security fixes
- Fix approach: Update to v9.x: `npm install --save-dev eslint@latest`

**Missing .env.example template:**
- Issue: No documentation of required environment variables
- Files: Missing `functions/.env.example`
- Why: Project just initialized
- Impact: Developers don't know which env vars are needed (CLAUDE_API_KEY)
- Fix approach: Create `functions/.env.example` with `CLAUDE_API_KEY=your-key-here`

## Known Bugs

- None detected (codebase is minimal, just initialized)

## Security Considerations

**Unrestricted Firestore rules (CRITICAL):**
- Risk: Any unauthenticated user can read/write all database data
- Files: `firestore.rules:15`
- Current mitigation: Time-limited expiry (2026-02-07)
- Recommendations: Implement proper security rules before production:
  - Require authentication: `request.auth != null`
  - User isolation: `request.auth.uid == resource.data.userId`
  - Validate writes: Check required fields

**API key handling not implemented:**
- Risk: Risk of hardcoding API keys when implementing Claude integration
- Files: `functions/src/config/` (planned, not created)
- Current mitigation: None
- Recommendations:
  - Use environment variables for local dev
  - Use Firebase functions config for production
  - Never commit API keys

## Performance Bottlenecks

- None detected (no implementation yet)
- Claude API response time (<2 seconds target per `specs.md:380`)

## Fragile Areas

**System prompts (future concern):**
- Files: `functions/src/prompts/` (planned)
- Why fragile: Per `specs.md:239`, prompts need 10-20 iterations to get right
- Common failures: Inconsistent output format, poor accuracy
- Safe modification: Version control prompts, test with diverse inputs
- Test coverage: Critical to test prompt accuracy

## Scaling Limits

**Cloud Functions maxInstances:**
- Current capacity: 10 concurrent instances (`functions/src/index.ts:27`)
- Limit: Prevents runaway costs (intentional)
- Symptoms at limit: Request queuing or throttling
- Scaling path: Increase maxInstances if needed

**Firebase Free Tier:**
- Current capacity: 2M function invocations/month, 50K Firestore reads/day
- Limit: Free tier limits
- Symptoms at limit: 429 rate limit errors
- Scaling path: Upgrade to Blaze plan (pay-as-you-go)

## Dependencies at Risk

**Node.js 24 strict requirement:**
- Risk: Node 24 is bleeding edge (not LTS), may not be fully supported
- Files: `functions/package.json:14`
- Impact: CI/CD pipelines may not support v24, Firebase runtime compatibility unclear
- Migration plan: Change to `^20` or `^22` (LTS versions)

## Missing Critical Features

**Claude API integration:**
- Problem: Core AI functionality not implemented
- Files: `functions/src/services/claudeService.ts` (planned, missing)
- Current workaround: None (MVP can't function)
- Blocks: All AI-powered features
- Implementation complexity: Medium

**Type definitions:**
- Problem: Contact types not defined
- Files: `functions/src/types/contact.ts` (planned, missing)
- Current workaround: None
- Blocks: Type-safe development
- Implementation complexity: Low

**Function implementations:**
- Problem: No Cloud Functions implemented
- Files: `functions/src/functions/` (planned, missing)
- Current workaround: None
- Blocks: All backend functionality
- Implementation complexity: Medium-High

## Test Coverage Gaps

**No tests exist:**
- What's not tested: Everything (no test files)
- Risk: All functionality could break unnoticed
- Priority: High (especially for AI functions)
- Difficulty to test: Medium (need to mock Claude API responses)

**AI accuracy testing:**
- What's not tested: Intent classification accuracy, contact extraction quality
- Risk: Poor user experience, incorrect data extraction
- Priority: High
- Difficulty to test: High (need diverse test cases, accuracy metrics)

---

*Concerns audit: 2026-01-10*
*Update as issues are fixed or new ones discovered*
