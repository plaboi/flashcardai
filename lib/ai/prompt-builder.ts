/**
 * Transforms raw flashcard back text into a styled prompt for
 * cartoon/educational illustration generation.
 *
 * Examples:
 *   "Epidermis" →
 *   "A simple, colourful cartoon educational illustration of the epidermis,
 *    clean vector style, friendly learning visual, white background, no text, no labels"
 *
 *   "The mitochondria is the powerhouse of the cell" →
 *   "A simple, colourful cartoon educational illustration of the mitochondria
 *    as the powerhouse of the cell, clean vector style, friendly learning visual,
 *    white background, no text, no labels"
 */
export function buildImagePrompt(backText: string): string {
  // Clean up the text: trim whitespace, collapse multiple spaces
  const cleaned = backText.trim().replace(/\s+/g, " ");

  // Truncate very long text to keep the prompt focused (DALL-E has a 4000 char limit)
  const truncated =
    cleaned.length > 200 ? cleaned.substring(0, 200) + "..." : cleaned;

  return [
    "A simple, colourful cartoon educational illustration of",
    truncated.toLowerCase(),
    "- clean vector style, friendly learning visual,",
    "white background, no text, no labels, no photorealism",
  ].join(" ");
}
