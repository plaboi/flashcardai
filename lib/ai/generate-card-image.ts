import { db } from "@/lib/db";
import { flashcards } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { buildImagePrompt } from "@/lib/ai/prompt-builder";
import { getImageProvider } from "@/lib/ai/openai-provider";
import { storeCardImage } from "@/lib/storage";

/**
 * Core image generation logic, extracted as a plain async function
 * so it can be called from both API routes and server actions
 * without being subject to React's server action serialization.
 *
 * This function:
 *   1. Fetches the card (scoped by userId)
 *   2. Skips if the card already has an image
 *   3. Builds a styled prompt from the back text
 *   4. Generates an image via the AI provider
 *   5. Uploads to Vercel Blob storage
 *   6. Saves the permanent URL to the database
 *
 * Failures are caught and returned -- never thrown.
 */
export async function processCardImageGeneration(
  cardId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Fetch the card, scoped to the authenticated user
    const [card] = await db
      .select()
      .from(flashcards)
      .where(and(eq(flashcards.id, cardId), eq(flashcards.userId, userId)))
      .limit(1);

    if (!card) {
      return { success: false, error: "Card not found" };
    }

    // Skip if image already exists (prevents regeneration / wasted API calls)
    if (card.imageUrl) {
      return { success: true, error: null };
    }

    // Build a styled prompt from the back text
    const prompt = buildImagePrompt(card.back);

    // Generate the image via the AI provider
    // (swap providers by changing the import above)
    const provider = getImageProvider();
    const imageBuffer = await provider.generateImage(prompt);

    // Upload to Vercel Blob storage
    const imageUrl = await storeCardImage(cardId, imageBuffer);

    // Save the permanent URL to the database
    await db
      .update(flashcards)
      .set({ imageUrl })
      .where(and(eq(flashcards.id, cardId), eq(flashcards.userId, userId)));

    return { success: true, error: null };
  } catch (error) {
    console.error(
      `[processCardImageGeneration] Failed for card ${cardId}:`,
      error instanceof Error ? error.message : error
    );
    return { success: false, error: "Image generation failed" };
  }
}
