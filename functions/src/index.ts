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
import * as admin from "firebase-admin";
import {ClaudeService} from "./services/claude";
import {INTENT_CLASSIFICATION_PROMPT} from "./prompts/intentClassification";
import {CONTACT_EXTRACTION_PROMPT} from "./prompts/contactExtraction";
import {CONTACT_SEARCH_PROMPT} from "./prompts/contactSearch";
import {
  ClassifyIntentResponse,
  ExtractContactResponse,
  UpdateContactResponse,
  SearchContactResponse,
  SearchMatch,
  ContactData,
  Contact,
} from "./types";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

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
setGlobalOptions({maxInstances: 10, region: "us-east1"});

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

/**
 * Extracts structured contact data from natural language input.
 * Core AI feature - parses voice-to-text or typed shorthand into ContactData.
 */
export const extractContact = onCall(
  {
    secrets: [anthropicApiKey],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request): Promise<ExtractContactResponse> => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated");
    }

    // Validate input
    const rawNote = request.data?.rawNote;
    if (!rawNote || typeof rawNote !== "string") {
      throw new HttpsError("invalid-argument", "rawNote is required");
    }

    const claude = new ClaudeService(anthropicApiKey.value());

    try {
      const response = await claude.complete(
        CONTACT_EXTRACTION_PROMPT,
        rawNote,
        512 // Extraction responses are longer than classification
      );

      // Parse JSON response
      try {
        const extracted = JSON.parse(response.text) as ContactData;

        return {
          extracted,
          usage: {
            inputTokens: response.inputTokens,
            outputTokens: response.outputTokens,
          },
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
      throw new HttpsError("internal", "Extraction failed");
    }
  }
);

/**
 * Updates an existing contact with optional re-extraction and manual overrides.
 * Re-extracts data when rawNote changes, then applies manual overrides on top.
 */
export const updateContact = onCall(
  {
    secrets: [anthropicApiKey],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request): Promise<UpdateContactResponse> => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated");
    }

    // Validate input
    const {id, rawNote, overrides} = request.data || {};
    if (!id || typeof id !== "string") {
      throw new HttpsError("invalid-argument", "Contact ID is required");
    }
    if (rawNote !== undefined && typeof rawNote !== "string") {
      throw new HttpsError("invalid-argument", "rawNote must be a string");
    }
    if (overrides !== undefined && typeof overrides !== "object") {
      throw new HttpsError("invalid-argument", "overrides must be an object");
    }

    // Get existing contact
    const contactRef = db.collection("contacts").doc(id);
    const contactDoc = await contactRef.get();

    if (!contactDoc.exists) {
      throw new HttpsError("not-found", "Contact not found");
    }

    const existingContact = contactDoc.data() as Omit<Contact, "id">;

    // Verify ownership
    if (existingContact.userId !== request.auth.uid) {
      throw new HttpsError("permission-denied", "Not authorized to update");
    }

    let reExtracted = false;
    let extractedData: ContactData = {...existingContact.extracted};
    let usage: {inputTokens: number; outputTokens: number} | undefined;

    // Re-extract if rawNote changed
    if (rawNote && rawNote !== existingContact.rawNote) {
      const claude = new ClaudeService(anthropicApiKey.value());

      try {
        const response = await claude.complete(
          CONTACT_EXTRACTION_PROMPT,
          rawNote,
          512
        );

        try {
          extractedData = JSON.parse(response.text) as ContactData;
          reExtracted = true;
          usage = {
            inputTokens: response.inputTokens,
            outputTokens: response.outputTokens,
          };
        } catch (parseError) {
          console.error("JSON parse error:", response.text);
          throw new HttpsError("internal", "Invalid response format");
        }
      } catch (error) {
        if (error instanceof HttpsError) {
          throw error;
        }
        console.error("Claude API error:", error);
        throw new HttpsError("internal", "Re-extraction failed");
      }
    }

    // Apply manual overrides on top of extracted data
    if (overrides) {
      extractedData = {...extractedData, ...overrides};
    }

    // Build updated contact
    const updatedContact: Omit<Contact, "id"> = {
      ...existingContact,
      rawNote: rawNote || existingContact.rawNote,
      extracted: extractedData,
      updatedAt: new Date(),
    };

    // Save to Firestore
    await contactRef.update(updatedContact);

    const result: UpdateContactResponse = {
      contact: {id, ...updatedContact},
      reExtracted,
    };

    if (usage) {
      result.usage = usage;
    }

    return result;
  }
);

/**
 * Searches contacts using AI-powered fuzzy matching.
 * Finds contacts by any remembered fragment against all fields.
 */
export const searchContacts = onCall(
  {
    secrets: [anthropicApiKey],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request): Promise<SearchContactResponse> => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated");
    }

    // Validate input
    const query = request.data?.query;
    if (!query || typeof query !== "string") {
      throw new HttpsError("invalid-argument", "Query is required");
    }

    // Fetch user's contacts
    const contactsSnapshot = await db
      .collection("contacts")
      .where("userId", "==", request.auth.uid)
      .get();

    // Return empty results if no contacts
    if (contactsSnapshot.empty) {
      return {
        results: [],
        usage: {inputTokens: 0, outputTokens: 0},
      };
    }

    // Format contacts for prompt
    const contacts = contactsSnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Contact, "id">;
      return {
        id: doc.id,
        rawNote: data.rawNote,
        ...data.extracted,
      };
    });

    const claude = new ClaudeService(anthropicApiKey.value());

    try {
      const input = JSON.stringify({query, contacts});
      const response = await claude.complete(
        CONTACT_SEARCH_PROMPT,
        input,
        512 // Search results can be longer than classification
      );

      // Parse JSON response
      try {
        const results = JSON.parse(response.text) as SearchMatch[];

        // Validate response is an array
        if (!Array.isArray(results)) {
          console.error("Invalid response - not an array:", response.text);
          throw new HttpsError("internal", "Invalid response format");
        }

        return {
          results,
          usage: {
            inputTokens: response.inputTokens,
            outputTokens: response.outputTokens,
          },
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
      throw new HttpsError("internal", "Search failed");
    }
  }
);
