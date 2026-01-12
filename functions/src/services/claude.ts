// functions/src/services/claude.ts
import Anthropic from "@anthropic-ai/sdk";

/** Response from a Claude API call */
export interface ClaudeResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Service class for interacting with the Claude API.
 * Uses Anthropic SDK with Claude Haiku 4.5 model.
 */
export class ClaudeService {
  private client: Anthropic;
  private model = "claude-haiku-4-5-20251001";

  /**
   * Creates a new ClaudeService instance.
   * @param {string} apiKey - The Anthropic API key
   */
  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
      maxRetries: 2, // SDK default, handles transient errors
      timeout: 60_000, // 60s for Firebase Functions timeout
    });
  }

  /**
   * Sends a completion request to Claude.
   * @param {string} systemPrompt - The system prompt to set context
   * @param {string} userMessage - The user message to respond to
   * @param {number} maxTokens - Maximum tokens in response (default: 1024)
   * @return {Promise<ClaudeResponse>} The completion response
   */
  async complete(
    systemPrompt: string,
    userMessage: string,
    maxTokens = 1024
  ): Promise<ClaudeResponse> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{role: "user", content: userMessage}],
    });

    const textBlock = message.content.find((block) => block.type === "text");

    return {
      text: textBlock?.text ?? "",
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    };
  }
}
