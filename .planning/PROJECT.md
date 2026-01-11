# Piak Backend

## What This Is

AI-powered contact organizer backend that parses natural language notes into structured contact data. Users jot quick notes after meeting someone ("met john at the park, works at fifth third, knows craig") and the AI extracts structured fields for later search. Built on Firebase Cloud Functions with Claude API.

## Core Value

Accurate extraction. The AI must correctly parse casual, abbreviated natural language input into structured contact data. If extraction fails, search fails, and the app is useless.

## Requirements

### Validated

- ✓ Firebase Cloud Functions v2 infrastructure — existing
- ✓ Global cost control (maxInstances: 10) — existing
- ✓ TypeScript with strict mode — existing
- ✓ Firebase emulator setup for local dev — existing

### Active

- [ ] Claude API integration service
- [ ] Intent classification function (add/update/search routing)
- [ ] Contact extraction function (natural language → structured data)
- [ ] Contact update function (modify existing contacts)
- [ ] Search function (find contacts by any fragment)
- [ ] System prompts for accurate extraction (handles voice-to-text and typed shorthand)
- [ ] Contact data model (captures both raw note and structured fields)
- [ ] Firestore security rules (user data isolation)

### Out of Scope

- Social graph visualization — complexity not needed for v1, core is capture/search
- Contact sync from phone/other apps — not needed for MVP, manual entry is fine
- Reminders/follow-ups — out of scope for v1, focus on capture and recall
- Batch entry mode — v1 focuses on quick single capture
- Cross-user features — personal use only

## Context

**Use Case**: Fuzzy recall. User meets someone, jots a quick note while walking away, later searches by any remembered fragment when they forget the name. "Who's that person I met at the coffee shop who works in finance?"

**Input Patterns**:
- Voice-to-text: "met john at the park he works at fifth third knows craig"
- Typed shorthand: "john - park - fifth third - craig's friend"
- Both need to work — AI must handle conversational and terse styles

**Ambiguity Strategy**: Capture both raw note and structured extraction. Never lose information. Search works against both — if structured extraction missed something, raw note is still searchable.

**Data Priorities**: Grouping/organization matters most — tags, companies, locations, meeting context. Connections (who knows who) are secondary. Time-based history is tertiary.

**System Prompts**: Most critical piece. Expect 10-20 iterations to get extraction accuracy right. Prompts must:
- Handle both voice and typed input styles
- Normalize data (lowercase tags, standardize company names)
- Be conservative on ambiguous inference
- Return clean JSON without markdown/explanation

## Constraints

- **Privacy**: No data leaks — Firestore rules must isolate user data, secure API key handling
- **Cost**: Claude API costs ~$0.001-0.003 per contact — acceptable for MVP
- **Model**: Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) — fast and cheap for this use case
- **Tech Stack**: Firebase Cloud Functions v2, TypeScript, Firestore — already established

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Capture raw + structured | Never lose information, search works on both | — Pending |
| onCall functions (not HTTP) | Auto-auth, auto-CORS, type-safe with frontend | — Pending |
| Haiku 4.5 model | Fast, cheap, sufficient for extraction task | — Pending |
| Frontend writes to Firestore directly | Standard Firebase pattern, backend only for AI | — Pending |

---
*Last updated: 2026-01-10 after initialization*
