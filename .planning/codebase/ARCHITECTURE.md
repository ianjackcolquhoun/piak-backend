# Architecture

**Analysis Date:** 2026-01-10

## Pattern Overview

**Overall:** Serverless Microservices with Firebase BaaS

**Key Characteristics:**
- Serverless Cloud Functions (v2 API) as compute layer
- AI-powered processing layer (NOT traditional REST API)
- Frontend talks directly to Firestore for data operations
- Backend handles only AI processing (Claude API integration)
- No CRUD APIs needed (Firebase SDK pattern)

## Layers

**Entry Point Layer:**
- Purpose: Export all Cloud Functions and configure global options
- Contains: `functions/src/index.ts` with global settings (maxInstances: 10)
- Depends on: Firebase Functions SDK
- Used by: Firebase runtime for function discovery

**Function Layer (AI Processing):**
- Purpose: AI-powered operations on contact data
- Contains: Four callable Cloud Functions (planned):
  - `intentClassifier` - Classify user intent (add/update/search)
  - `addContact` - Extract contact from natural language
  - `updateContact` - Modify existing contact
  - `searchContacts` - AI-powered fuzzy search
- Location: `functions/src/functions/` (planned)
- Depends on: Service layer (Claude API), Types
- Used by: Frontend via Firebase SDK `httpsCallable`

**Service Layer:**
- Purpose: External API communication
- Contains: Claude API wrapper (planned)
- Location: `functions/src/services/claudeService.ts` (planned)
- Depends on: Config layer for API keys
- Used by: Function layer

**Config Layer:**
- Purpose: API configuration and credentials
- Contains: Claude API endpoint, model selection, authentication
- Location: `functions/src/config/claude.ts` (planned)
- Depends on: Environment variables
- Used by: Service layer

**Prompt Layer:**
- Purpose: System prompts for Claude API (critical for accuracy)
- Contains: Intent, extraction, update, and search prompts
- Location: `functions/src/prompts/` (planned)
- Depends on: None (pure data)
- Used by: Service layer

**Type Layer:**
- Purpose: TypeScript type definitions
- Contains: Contact domain types (planned)
- Location: `functions/src/types/contact.ts` (planned)
- Depends on: None
- Used by: All layers

## Data Flow

**Cloud Function Call (e.g., addContact):**

1. Frontend calls `httpsCallable(functions, "addContact")` with user text
2. Firebase routes to Cloud Function via onCall pattern
3. Function receives request with automatic auth context (`request.auth.uid`)
4. Function calls claudeService with user input and system prompt
5. claudeService makes HTTP request to Claude API
6. Claude API returns structured JSON (contact data)
7. Function returns parsed response to frontend
8. Frontend saves contact to Firestore directly (not via backend)

**State Management:**
- Stateless Cloud Functions - no persistent in-memory state
- All data persisted in Firestore by frontend
- User isolation enforced by Firestore security rules

## Key Abstractions

**Cloud Function (onCall):**
- Purpose: Handle authenticated client requests
- Examples: `intentClassifier`, `addContact`, `updateContact`, `searchContacts`
- Pattern: Firebase onCall v2 API (auto-auth, auto-CORS, type-safe)

**Claude Service:**
- Purpose: Wrapper for Anthropic Claude API calls
- Examples: `functions/src/services/claudeService.ts` (planned)
- Pattern: Single service for all AI operations

**System Prompt:**
- Purpose: Define Claude's behavior and output format
- Examples: `intentPrompt.ts`, `addContactPrompt.ts` (planned)
- Pattern: Separate files, JSON-only output, iterated frequently

**Contact Type:**
- Purpose: TypeScript interface for contact data
- Examples: `Contact` interface with name, tags, company, connections
- Pattern: Shared between backend and frontend (copy for MVP)

## Entry Points

**Cloud Functions Entry:**
- Location: `functions/src/index.ts`
- Triggers: Firebase onCall invocation from frontend SDK
- Responsibilities: Export functions, set global options (maxInstances: 10)

**Development Entry:**
- Command: `npm run serve` from `functions/` directory
- Starts Firebase emulator on port 5001

**Deployment Entry:**
- Command: `npm run deploy` from `functions/` directory
- Pre-deploy hooks run lint and build automatically

## Error Handling

**Strategy:** Not yet implemented (early-stage codebase)

**Planned Patterns:**
- Try/catch in function handlers
- Error logging via Firebase logger
- User-friendly error responses to frontend
- Claude API error handling (rate limits, timeouts)

## Cross-Cutting Concerns

**Logging:**
- Framework: `firebase-functions/logger` (imported but not used yet)
- Pattern: Structured logging for debugging and monitoring

**Validation:**
- Not implemented yet
- Recommended: Validate user input before Claude API calls

**Authentication:**
- Automatic via Firebase onCall pattern
- `request.auth.uid` provides authenticated user ID
- Frontend must be authenticated to call functions

**Cost Control:**
- Global maxInstances: 10 (`functions/src/index.ts:27`)
- Prevents runaway function scaling

---

*Architecture analysis: 2026-01-10*
*Update when major patterns change*
