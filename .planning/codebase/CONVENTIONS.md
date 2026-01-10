# Coding Conventions

**Analysis Date:** 2026-01-10

## Naming Patterns

**Files:**
- camelCase for TypeScript modules (e.g., `intentClassifier.ts`, `claudeService.ts`)
- .test.ts suffix for test files (planned)
- index.ts for barrel exports

**Functions:**
- camelCase for all functions (e.g., `addContact`, `searchContacts`)
- No special prefix for async functions
- Verb-noun pattern for Cloud Functions (e.g., `updateContact`)

**Variables:**
- camelCase for variables
- UPPER_SNAKE_CASE for module-level constants
- No underscore prefix for private members

**Types:**
- PascalCase for interfaces (e.g., `Contact`)
- PascalCase for type aliases
- No I prefix for interfaces

## Code Style

**Formatting:**
- ESLint with Google style guide (`functions/.eslintrc.js`)
- 2-space indentation (enforced via `"indent": ["error", 2]`)
- Double quotes for strings (enforced via `"quotes": ["error", "double"]`)
- Semicolons required (Google style)
- No Prettier configured (ESLint-only)

**Linting:**
- ESLint 8.9.0 with `functions/.eslintrc.js`
- Extends: `eslint:recommended`, `plugin:import/errors`, `plugin:import/warnings`, `plugin:import/typescript`, `google`, `plugin:@typescript-eslint/recommended`
- Parser: `@typescript-eslint/parser`
- Run: `npm run lint` from `functions/` directory

## Import Organization

**Order:**
1. External packages (firebase-functions, firebase-admin)
2. Internal modules (./config, ./services)
3. Relative imports (./utils)
4. Type imports (import type { })

**Grouping:**
- Namespace imports for Firebase logger: `import * as logger from "firebase-functions/logger"`
- Named imports for specific exports: `import { onRequest } from "firebase-functions/v2/https"`

**Path Aliases:**
- None configured (use relative paths)

## Error Handling

**Patterns:**
- Not yet established (early-stage codebase)
- Planned: Try/catch in function handlers
- Planned: Log errors before returning user-friendly messages

**Error Types:**
- Planned: Throw on Claude API failures
- Planned: Return structured error responses to frontend

## Logging

**Framework:**
- firebase-functions/logger (imported in `functions/src/index.ts`)
- Provides: logger.info(), logger.warn(), logger.error()

**Patterns:**
- Not yet established
- Recommended: Structured logging with context objects
- Recommended: Log at function entry/exit and errors

## Comments

**When to Comment:**
- Explain non-obvious configurations (see `functions/src/index.ts:14-26`)
- Document why, not what
- Use multiline comments for explanations

**JSDoc/TSDoc:**
- Firebase template uses JSDoc for function documentation
- Example: `functions/src/index.ts:1-8` (block comment for function)

**TODO Comments:**
- No specific format required
- Link to issue if available

## Function Design

**Size:**
- Keep functions focused on single responsibility
- Extract Claude API calls to service layer

**Parameters:**
- Use Firebase onCall request object
- Destructure data from `request.data`
- Access auth from `request.auth`

**Return Values:**
- Return structured JSON for frontend consumption
- Use TypeScript types for return values

## Module Design

**Exports:**
- Named exports preferred
- Export Cloud Functions from `index.ts`
- One function per file in `functions/` directory

**Barrel Files:**
- `index.ts` for function exports
- Planned: Service and type exports via index files

## TypeScript Configuration

**Compiler Options** (`functions/tsconfig.json`):
- Target: ES2017
- Module: NodeNext
- Module resolution: nodenext
- Strict: true (all strict checks enabled)
- Source maps: enabled
- No unused locals: true
- No implicit returns: true

**Strict Mode:**
- Enforces null checks
- Enforces strict function types
- Reports unused variables

---

*Convention analysis: 2026-01-10*
*Update when patterns change*
