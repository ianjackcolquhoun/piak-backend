# Roadmap: Piak Backend

## Overview

Build an AI-powered contact organizer backend that parses natural language notes into structured contact data. Starting with Claude API integration, then building intent classification, contact extraction, CRUD operations, and finally security hardening. The core challenge is accurate extraction from casual/abbreviated input.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Claude API service and contact data model
- [x] **Phase 2: Intent Classification** - Route user input to add/update/search
- [ ] **Phase 3: Contact Extraction** - Parse natural language to structured data
- [ ] **Phase 4: Contact Operations** - Update and search functions
- [ ] **Phase 5: Security & Polish** - Firestore rules and prompt refinement

## Phase Details

### Phase 1: Foundation
**Goal**: Establish Claude API integration service and contact data model in Firestore
**Depends on**: Nothing (first phase)
**Research**: Likely (new API integration)
**Research topics**: Anthropic TypeScript SDK, Claude API patterns for Firebase Functions, secure API key handling with Firebase secrets
**Plans**: TBD

Plans:
- [x] 01-01: Claude API service with Haiku 4.5
- [x] 01-02: Contact data model and Firestore schema

### Phase 2: Intent Classification
**Goal**: Classify user input as add/update/search operation and route accordingly
**Depends on**: Phase 1
**Research**: Unlikely (uses Phase 1 Claude service)
**Plans**: TBD

Plans:
- [x] 02-01: Intent classification function and routing logic

### Phase 3: Contact Extraction
**Goal**: Parse natural language notes into structured contact data (the core AI feature)
**Depends on**: Phase 2
**Research**: Unlikely (prompt engineering iteration)
**Plans**: TBD

Plans:
- [ ] 03-01: Contact extraction function and system prompts
- [ ] 03-02: Handle both voice-to-text and typed shorthand input styles

### Phase 4: Contact Operations
**Goal**: Implement contact update and search functions
**Depends on**: Phase 3
**Research**: Unlikely (Firestore CRUD patterns)
**Plans**: TBD

Plans:
- [ ] 04-01: Contact update function (modify existing contacts)
- [ ] 04-02: Search function (find by any fragment)

### Phase 5: Security & Polish
**Goal**: Lock down Firestore rules and refine extraction accuracy
**Depends on**: Phase 4
**Research**: Unlikely (internal refinement)
**Plans**: TBD

Plans:
- [ ] 05-01: Firestore security rules (user data isolation)
- [ ] 05-02: System prompt iteration for edge cases

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-01-11 |
| 2. Intent Classification | 1/1 | Complete | 2026-01-12 |
| 3. Contact Extraction | 0/2 | Not started | - |
| 4. Contact Operations | 0/2 | Not started | - |
| 5. Security & Polish | 0/2 | Not started | - |
