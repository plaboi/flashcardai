import OpenAI from "openai";
import type { ImageGenerationProvider } from "./types";

/**
 * OpenAI DALL-E 3 image generation provider.
 *
 * To swap to a different provider:
 *   1. Create a new file (e.g. lib/ai/stability-provider.ts)
 *   2. Implement the ImageGenerationProvider interface
 *   3. Update the import in lib/actions/flashcards.ts
 */
export class OpenAIImageProvider implements ImageGenerationProvider {
  private client: OpenAI;
  private maxRetries = 2;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateImage(prompt: string): Promise<Buffer> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Request image generation from DALL-E 3
        const response = await this.client.images.generate({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url",
        });

        const imageUrl = response.data?.[0]?.url;
        if (!imageUrl) {
          throw new Error("No image URL returned from OpenAI");
        }

        // Fetch the image and convert to Buffer
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(
            `Failed to download image: ${imageResponse.statusText}`
          );
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(
          `[OpenAI Image] Attempt ${attempt + 1}/${this.maxRetries + 1} failed:`,
          lastError.message
        );

        // Wait before retrying (exponential backoff: 1s, 2s)
        if (attempt < this.maxRetries) {
          const delayMs = 1000 * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError ?? new Error("Image generation failed after all retries");
  }
}

// Singleton instance -- reused across requests for connection pooling
let providerInstance: OpenAIImageProvider | null = null;

/**
 * Get the OpenAI image provider singleton.
 * Lazy-initialized so the constructor only runs when actually needed.
 */
export function getImageProvider(): ImageGenerationProvider {
  if (!providerInstance) {
    providerInstance = new OpenAIImageProvider();
  }
  return providerInstance;
}
