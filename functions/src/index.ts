/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {ClaudeService} from "./services/claude";
import {INTENT_CLASSIFICATION_PROMPT} from "./prompts/intentClassification";
import {ClassifyIntentResponse} from "./types";

const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/**
 * Test function to verify Claude API integration.
 * Temporary function for verification - can be removed after testing.
 */
export const testClaude = onCall(
  {
    secrets: [anthropicApiKey],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request) => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated");
    }

    const claude = new ClaudeService(anthropicApiKey.value());

    try {
      const response = await claude.complete(
        "You are a helpful assistant. Respond briefly.",
        "Say hello and confirm you are Claude Haiku 4.5."
      );

      return {
        success: true,
        response: response.text,
        usage: {
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
        },
      };
    } catch (error) {
      // Log for debugging
      console.error("Claude API error:", error);
      throw new HttpsError("internal", "Claude API call failed");
    }
  }
);

/**
 * Classifies user intent for contact operations.
 * Routes input to add, update, or search actions.
 */
export const classifyIntent = onCall(
  {
    secrets: [anthropicApiKey],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request): Promise<ClassifyIntentResponse> => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated");
    }

    // Validate input
    const text = request.data?.text;
    if (!text || typeof text !== "string") {
      throw new HttpsError("invalid-argument", "Text is required");
    }

    const claude = new ClaudeService(anthropicApiKey.value());

    try {
      const response = await claude.complete(
        INTENT_CLASSIFICATION_PROMPT,
        text,
        256 // Short response for classification
      );

      // Parse JSON response
      try {
        const parsed = JSON.parse(response.text) as ClassifyIntentResponse;

        // Validate response structure
        if (!parsed.intent || !parsed.confidence) {
          console.error("Invalid response structure:", response.text);
          throw new HttpsError("internal", "Invalid response format");
        }

        return {
          intent: parsed.intent,
          confidence: parsed.confidence,
          reasoning: parsed.reasoning,
        };
      } catch (parseError) {
        console.error("JSON parse error:", response.text);
        throw new HttpsError("internal", "Invalid response format");
      }
    } catch (error) {
      // Re-throw HttpsErrors
      if (error instanceof HttpsError) {
        throw error;
      }
      console.error("Claude API error:", error);
      throw new HttpsError("internal", "Classification failed");
    }
  }
);
