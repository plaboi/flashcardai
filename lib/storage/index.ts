import { put } from "@vercel/blob";

/**
 * Upload a card image to Vercel Blob storage.
 *
 * @param cardId - The flashcard UUID, used as the filename.
 * @param imageBuffer - The image data as a Buffer (PNG).
 * @returns The permanent public URL of the stored image.
 */
export async function storeCardImage(
  cardId: string,
  imageBuffer: Buffer
): Promise<string> {
  const filename = `flashcards/${cardId}.png`;

  const blob = await put(filename, imageBuffer, {
    access: "public",
    contentType: "image/png",
    // addRandomSuffix prevents filename collisions if regenerated later
    addRandomSuffix: false,
  });

  return blob.url;
}
