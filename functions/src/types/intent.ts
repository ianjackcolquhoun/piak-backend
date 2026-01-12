/**
 * User intent for contact operations.
 * Determines which action the AI should take.
 */
export type Intent = "add" | "update" | "search";

/**
 * Confidence level for intent classification.
 * Low confidence indicates ambiguous input requiring reasoning.
 */
export type Confidence = "high" | "low";

/**
 * Input for intent classification.
 */
export interface ClassifyIntentInput {
  /** The user's natural language input */
  text: string;
}

/**
 * Response from intent classification.
 */
export interface ClassifyIntentResponse {
  /** The classified intent */
  intent: Intent;

  /** Confidence level of the classification */
  confidence: Confidence;

  /** Reasoning for the classification (only when confidence is low) */
  reasoning?: string;
}
