# Testing Patterns

**Analysis Date:** 2026-01-10

## Test Framework

**Runner:**
- firebase-functions-test 3.4.1 - Installed but not configured (`functions/package.json`)
- No Jest, Vitest, or Mocha runner configured yet

**Assertion Library:**
- Not configured (firebase-functions-test includes basic assertions)

**Run Commands:**
```bash
npm run lint              # Run ESLint (code quality check)
npm run serve             # Run Firebase emulator for manual testing
# No npm test command configured yet
```

## Test File Organization

**Location:**
- No test files exist yet
- Recommended: Co-located tests (`*.test.ts` alongside source files)

**Naming:**
- Recommended: `{module-name}.test.ts` for unit tests
- Recommended: `{feature}.integration.test.ts` for integration tests

**Structure:**
```
functions/src/
  functions/
    intentClassifier.ts
    intentClassifier.test.ts    # (planned)
  services/
    claudeService.ts
    claudeService.test.ts       # (planned)
```

## Test Structure

**Suite Organization:**
```typescript
// Recommended pattern (not yet implemented):
import { describe, it, expect } from 'vitest';  // or jest

describe('intentClassifier', () => {
  describe('classify', () => {
    it('should classify "met john at starbucks" as add intent', () => {
      // arrange
      const input = "met john at starbucks";

      // act
      const result = classify(input);

      // assert
      expect(result.intent).toBe('add');
    });
  });
});
```

**Patterns:**
- Arrange/Act/Assert structure recommended
- One responsibility per test
- Descriptive test names

## Mocking

**Framework:**
- firebase-functions-test provides Firebase mocking utilities
- No additional mocking library installed

**Patterns:**
```typescript
// firebase-functions-test example (not yet implemented):
import { wrap } from 'firebase-functions-test';
import { addContact } from './addContact';

const wrapped = wrap(addContact);
const result = await wrapped({ noteText: "met john" });
```

**What to Mock:**
- Claude API responses (critical for testing AI functions)
- Firebase Auth context
- Firestore operations

**What NOT to Mock:**
- Internal pure functions
- Type definitions

## Fixtures and Factories

**Test Data:**
- Not yet established
- Recommended: Create factory functions for contact test data

**Location:**
- Recommended: `functions/src/__fixtures__/` for shared fixtures
- Or inline factories in test files

## Coverage

**Requirements:**
- No coverage target configured
- Recommended: Focus on critical paths (AI functions, prompts)

**Configuration:**
- Coverage directory in `.gitignore` (ready for setup)
- `.nyc_output/` in `.gitignore` (Istanbul/NYC ready)

**View Coverage:**
```bash
# Not yet configured
# Recommended: npm run test:coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions, services, prompts
- Mocking: Mock external APIs (Claude)
- Speed: Fast (<100ms per test)
- Not yet implemented

**Integration Tests:**
- Scope: Cloud Function → Claude API flow
- Mocking: Use test fixtures for Claude responses
- Not yet implemented

**E2E Tests:**
- Framework: Firebase Emulator Suite
- Scope: Full function calls with emulator
- Available via: `npm run serve`

## Common Patterns

**Manual Testing Strategy (per specs.md):**
```bash
# Start emulator
cd functions && npm run serve

# Test cases to try:
# - Simple: "met john at starbucks"
# - Complex: "met sarah, she knows mike and works at google in SF"
# - Edge cases: vague notes, multiple people, nicknames
```

**Firebase Emulator Ports:**
- Functions: 5001
- Firestore: 8080
- Auth: 9099
- UI: Enabled (default port)

**Testing AI Functions:**
- Accuracy testing: Intent classification should be 95%+ accurate (`specs.md:378`)
- Response time: Functions should respond in <2 seconds (`specs.md:380`)
- Cost tracking: Monitor Claude API usage

## Recommended Setup

**To configure testing:**

1. Install test runner:
```bash
cd functions && npm install --save-dev vitest
```

2. Add test script to `package.json`:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

3. Create test file structure following co-located pattern

4. Mock Claude API responses for consistent testing

---

*Testing analysis: 2026-01-10*
*Update when test patterns change*
