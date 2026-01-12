// functions/src/services/claude.ts
import Anthropic from "@anthropic-ai/sdk";

export interface ClaudeResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export class ClaudeService {
  private client: Anthropic;
  private model = "claude-haiku-4-5-20251001";

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
      maxRetries: 2, // SDK default, handles transient errors
      timeout: 60_000, // 60s for Firebase Functions timeout
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
