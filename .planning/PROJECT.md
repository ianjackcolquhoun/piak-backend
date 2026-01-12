# Piak Backend

## What This Is

AI-powered contact organizer backend that parses natural language notes into structured contact data. Users jot quick notes after meeting someone ("met john at the park, works at fifth third, knows craig") and the AI extracts structured fields for later search. Built on Firebase Cloud Functions with Claude API.

## Core Value

Accurate extraction. The AI must correctly parse casual, abbreviated natural language input into structured contact data. If extraction fails, search fails, and the app is useless.

## Requirements

### Validated

- Claude API integration service (ClaudeService with Haiku 4.5) - v1.0
- Intent classification function (add/update/search routing) - v1.0
- Contact extraction function (natural language to structured data) - v1.0
- Contact update function (modify existing contacts) - v1.0
- Search function (AI-powered semantic/fuzzy matching) - v1.0
- System prompts for accurate extraction (handles voice-to-text and typed shorthand) - v1.0
- Contact data model (captures both raw note and structured fields) - v1.0
- Firestore security rules (user data isolation with owner-based access) - v1.0
- Firebase Cloud Functions v2 infrastructure - existing
- Global cost control (maxInstances: 10) - existing
- TypeScript with strict mode - existing
- Firebase emulator setup for local dev - existing

### Active

(No active requirements - v1.0 shipped)

### Out of Scope

- Social graph visualization - complexity not needed for v1, core is capture/search
- Contact sync from phone/other apps - not needed for MVP, manual entry is fine
- Reminders/follow-ups - out of scope for v1, focus on capture and recall
- Batch entry mode - v1 focuses on quick single capture
- Cross-user features - personal use only

## Context

**Current State:** Shipped v1.0 with 846 LOC TypeScript.

**Tech Stack:** Firebase Cloud Functions v2, TypeScript, Firestore, Claude API (Haiku 4.5)

**Architecture:**
- ClaudeService class for AI completions
- onCall functions: testClaude, classifyIntent, extractContact, updateContact, searchContacts
- System prompts in prompts/ directory (classification, extraction, search)
- Contact types with dual raw+structured storage

**Use Case**: Fuzzy recall. User meets someone, jots a quick note while walking away, later searches by any remembered fragment when they forget the name. "Who's that person I met at the coffee shop who works in finance?"

**Input Patterns**:
- Voice-to-text: "met john at the park he works at fifth third knows craig"
- Typed shorthand: "john - park - fifth third - craig's friend"
- Both work - AI handles conversational and terse styles

**Ambiguity Strategy**: Capture both raw note and structured extraction. Never lose information. Search works against both.

## Constraints

- **Privacy**: No data leaks - Firestore rules isolate user data, secure API key handling
- **Cost**: Claude API costs ~$0.001-0.003 per contact - acceptable for MVP
- **Model**: Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) - fast and cheap for this use case
- **Tech Stack**: Firebase Cloud Functions v2, TypeScript, Firestore - established

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Capture raw + structured | Never lose information, search works on both | Good |
| onCall functions (not HTTP) | Auto-auth, auto-CORS, type-safe with frontend | Good |
| Haiku 4.5 model | Fast, cheap, sufficient for extraction task | Good |
| 256/512 maxTokens split | Classification short, extraction/search longer | Good |
| System prompts in prompts/ | Centralized, version-controlled prompt management | Good |
| Re-extraction on rawNote change | Keep extracted data fresh when source changes | Good |
| Overrides after re-extraction | Manual edits take precedence over AI | Good |
| isOwner() helper function | Reusable auth pattern for Firestore rules | Good |
| userId immutable on update | Prevents ownership transfer attacks | Good |
| Primary contact extraction | First person or main subject when multiple people | Good |
| Partial names valid | Don't invent last names - be conservative | Good |

---
*Last updated: 2026-01-12 after v1.0 milestone*
