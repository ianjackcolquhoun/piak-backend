# Phase 1: Foundation - Research

**Researched:** 2026-01-10
**Domain:** Anthropic TypeScript SDK + Firebase Functions v2 integration
**Confidence:** HIGH

<research_summary>
## Summary

Researched the Anthropic TypeScript SDK integration patterns for Firebase Cloud Functions v2. The standard approach uses `@anthropic-ai/sdk` with Firebase's `defineSecret()` for secure API key management.

Key finding: The SDK has built-in retry logic (2 retries by default) and handles rate limiting automatically. For serverless environments like Firebase Functions, use streaming to avoid timeout issues with long-running requests. The SDK supports Node.js 18+, which aligns with Firebase Functions Node 24 requirement.

Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) is the optimal choice for this use case - it's fast, cost-effective ($1/$5 per MTok), supports 200K context window, and handles text extraction tasks well.

**Primary recommendation:** Use `@anthropic-ai/sdk` v0.71.x with `defineSecret('ANTHROPIC_API_KEY')`, implement streaming for production reliability, and leverage SDK's built-in error handling and retries.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @anthropic-ai/sdk | 0.71.x | Anthropic API client | Official SDK with TypeScript support, built-in retries |
| firebase-functions | 6.x | Cloud Functions framework | v2 API with defineSecret support |
| firebase-admin | 13.x | Firestore client | Server-side Firebase operations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| firebase-functions/params | - | Secret management | Always for API keys (defineSecret) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @anthropic-ai/sdk | Raw fetch | SDK handles retries, errors, types; raw fetch doesn't |
| defineSecret | Environment variables | Secrets are secure and auto-rotated; env vars are not |
| Haiku 4.5 | Sonnet 4.5 | Sonnet is smarter but 3x cost; Haiku is sufficient for extraction |

**Installation:**
```bash
cd functions
npm install @anthropic-ai/sdk
```

**Secret Setup:**
```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
# Paste your API key when prompted
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
functions/src/
├── services/
│   └── claude.ts        # Claude API service (singleton pattern)
├── models/
│   └── contact.ts       # Contact data model/types
├── utils/
│   └── errors.ts        # Error handling utilities
└── index.ts             # Function exports with secret binding
```

### Pattern 1: Claude Service with Secret Binding
**What:** Create a reusable Claude service that receives the API key at invocation
**When to use:** All Claude API calls in Firebase Functions
**Example:**
```typescript
// services/claude.ts
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(systemPrompt: string, userMessage: string): Promise<string> {
    const message = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Extract text from response
    const textBlock = message.content.find(block => block.type === 'text');
    return textBlock?.text ?? '';
  }
}
```

### Pattern 2: Function with Secret Binding
**What:** Bind secrets to functions using defineSecret
**When to use:** Every function that calls Claude API
**Example:**
```typescript
// index.ts
import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { ClaudeService } from './services/claude';

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

export const processContact = onCall(
  { secrets: [anthropicApiKey] },
  async (request) => {
    const claude = new ClaudeService(anthropicApiKey.value());
    // Use claude service...
  }
);
```

### Pattern 3: Streaming for Long Requests (Production)
**What:** Use streaming to avoid serverless timeouts
**When to use:** When max_tokens > 2000 or production workloads
**Example:**
```typescript
async completeWithStream(systemPrompt: string, userMessage: string): Promise<string> {
  const stream = await this.client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    stream: true,
  });

  let result = '';
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      result += event.delta.text;
    }
  }
  return result;
}
```

### Anti-Patterns to Avoid
- **Hardcoding API keys:** Use defineSecret, never put keys in code or .env files checked into git
- **Not binding secrets to functions:** Functions without `{ secrets: [key] }` can't access the secret
- **Non-streaming with large max_tokens:** Can timeout in serverless; use streaming instead
- **Creating Anthropic client per request:** Create once per function invocation, not per API call
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| API retry logic | Custom exponential backoff | SDK built-in retries | SDK handles 429, 5xx, connection errors automatically |
| Rate limit handling | Manual token bucket | SDK + 429 response headers | SDK retries with backoff; check headers for monitoring |
| Secret management | Custom encryption | Firebase defineSecret | Integrates with Secret Manager, auto-rotates |
| Error classification | Custom error parsing | SDK error types | BadRequestError, RateLimitError, etc. are typed |
| Request timeouts | Custom timeout wrapper | SDK timeout option | `timeout: 30000` in client config |

**Key insight:** The Anthropic SDK is well-designed with production concerns built-in. The SDK already implements:
- Automatic retries (2x by default) for transient errors
- Proper error types with HTTP status codes
- Timeout handling (10 min default, scales with max_tokens)
- Token bucket-aware rate limiting

Don't rebuild what the SDK provides.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Secret Not Available at Runtime
**What goes wrong:** `anthropicApiKey.value()` returns undefined
**Why it happens:** Secret not bound to function with `{ secrets: [key] }`
**How to avoid:** Always include secret in function options: `onCall({ secrets: [anthropicApiKey] }, ...)`
**Warning signs:** "undefined" errors when calling API, auth failures

### Pitfall 2: Function Timeout on Long Responses
**What goes wrong:** Function times out before Claude responds
**Why it happens:** Non-streaming requests with large max_tokens can take minutes
**How to avoid:** Use streaming for production; set appropriate function timeout
**Warning signs:** Functions hitting 60s/540s timeout limits

### Pitfall 3: Rate Limit Errors in Burst Traffic
**What goes wrong:** 429 errors during traffic spikes
**Why it happens:** Exceeding RPM/ITPM limits (Tier 1: 50 RPM, 50K ITPM for Haiku)
**How to avoid:** Implement request queuing; check rate limit headers; consider tier upgrade
**Warning signs:** Sporadic 429 errors, especially during peak usage

### Pitfall 4: Local Development Secret Access
**What goes wrong:** Can't run locally without production secrets
**Why it happens:** defineSecret requires Secret Manager access
**How to avoid:** Create `.secret.local` file in functions directory with `ANTHROPIC_API_KEY=sk-...`
**Warning signs:** Emulator fails to start, permission denied errors
</common_pitfalls>

<code_examples>
## Code Examples

### Complete Claude Service
```typescript
// Source: Anthropic SDK docs + Firebase Functions v2 docs
import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export class ClaudeService {
  private client: Anthropic;
  private model = 'claude-haiku-4-5-20251001';

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
      maxRetries: 2,      // Default, can increase for reliability
      timeout: 60_000,    // 60s timeout for Firebase Functions
    });
  }

  async complete(
    systemPrompt: string,
    userMessage: string,
    maxTokens = 1024
  ): Promise<ClaudeResponse> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlock = message.content.find(block => block.type === 'text');

    return {
      text: textBlock?.text ?? '',
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    };
  }
}
```

### Function with Secret Binding
```typescript
// Source: Firebase Functions v2 docs
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { ClaudeService } from './services/claude';

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

export const analyzeText = onCall(
  {
    secrets: [anthropicApiKey],
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { text } = request.data;
    if (!text || typeof text !== 'string') {
      throw new HttpsError('invalid-argument', 'Text is required');
    }

    try {
      const claude = new ClaudeService(anthropicApiKey.value());
      const response = await claude.complete(
        'You are a helpful assistant.',
        text
      );
      return { result: response.text };
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
      }
      throw new HttpsError('internal', 'Failed to process request');
    }
  }
);
```

### Error Handling Pattern
```typescript
// Source: Anthropic SDK error types
import Anthropic from '@anthropic-ai/sdk';
import { HttpsError } from 'firebase-functions/v2/https';

function handleClaudeError(error: unknown): never {
  if (error instanceof Anthropic.APIError) {
    switch (error.status) {
      case 400:
        throw new HttpsError('invalid-argument', error.message);
      case 401:
        throw new HttpsError('unauthenticated', 'Invalid API key');
      case 429:
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
      case 500:
      case 529:
        throw new HttpsError('unavailable', 'Claude API unavailable');
      default:
        throw new HttpsError('internal', `Claude API error: ${error.message}`);
    }
  }
  throw new HttpsError('internal', 'Unknown error');
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Claude Haiku 3 | Claude Haiku 4.5 | Oct 2025 | 4.5 matches Sonnet 4 on many tasks, supports extended thinking |
| functions.config() | defineSecret() | 2022 | config() deprecated; defineSecret is secure |
| Node 18 | Node 24 | 2025 | Better performance, required for latest features |
| Manual retries | SDK built-in retries | Always | SDK handles this properly |

**New tools/patterns to consider:**
- **Extended thinking:** Haiku 4.5 supports extended thinking for complex reasoning
- **Prompt caching:** Cache repeated prompts to reduce costs and improve rate limits
- **Message Batches API:** For high-volume batch processing

**Deprecated/outdated:**
- **functions.config():** Replaced by defineSecret for secrets, defineString for config
- **Claude 3 models:** Haiku 3, Sonnet 3.5 deprecated; use 4.x versions
- **v1 Functions API:** Always use v2 API (firebase-functions/v2)
</sota_updates>

<open_questions>
## Open Questions

1. **Prompt caching for repeated system prompts**
   - What we know: Caching reduces cost (90% discount) and doesn't count toward rate limits
   - What's unclear: Minimum token threshold for caching (appears to be 1024+ tokens)
   - Recommendation: Implement in Phase 3 if system prompts are large; not needed for Phase 1

2. **Tier upgrade timing**
   - What we know: Tier 1 is 50 RPM, upgrade to Tier 2 at $40 cumulative spend
   - What's unclear: Expected usage patterns for this app
   - Recommendation: Start at Tier 1, monitor rate limit headers, upgrade if needed
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Anthropic SDK GitHub](https://github.com/anthropics/anthropic-sdk-typescript) - SDK documentation, error handling, retry behavior
- [Anthropic SDK npm](https://www.npmjs.com/package/@anthropic-ai/sdk) - Version 0.71.2 confirmed
- [Claude API Rate Limits](https://platform.claude.com/docs/en/api/rate-limits) - Tier limits, token bucket algorithm
- [Claude Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview) - Model IDs, pricing, context windows
- [Firebase Functions Config](https://firebase.google.com/docs/functions/config-env) - defineSecret usage, local development

### Secondary (MEDIUM confidence)
- [Code With Andrea - Firebase Secrets](https://codewithandrea.com/articles/api-keys-2ndgen-cloud-functions-firebase/) - Practical patterns verified against official docs
- [Claude Integration Best Practices](https://skywork.ai/blog/claude-4-5-integration-best-practices-developers-2025/) - Circuit breaker patterns, error handling

### Tertiary (LOW confidence - needs validation)
- None - all critical findings verified with official documentation
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: @anthropic-ai/sdk TypeScript SDK
- Ecosystem: Firebase Functions v2, Secret Manager, Firestore
- Patterns: Service class, secret binding, error handling, streaming
- Pitfalls: Secret binding, timeouts, rate limits, local development

**Confidence breakdown:**
- Standard stack: HIGH - verified with npm, GitHub, official docs
- Architecture: HIGH - patterns from official SDK and Firebase docs
- Pitfalls: HIGH - documented in official troubleshooting guides
- Code examples: HIGH - adapted from official documentation

**Research date:** 2026-01-10
**Valid until:** 2026-02-10 (30 days - SDK ecosystem stable)
</metadata>

---

*Phase: 01-foundation*
*Research completed: 2026-01-10*
*Ready for planning: yes*
