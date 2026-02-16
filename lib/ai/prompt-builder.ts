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
    "in the style of a children's educational textbook.",
    "Use a consistent pastel color palette with soft blues, greens, pinks, and yellows.",
    "Thick black outlines, rounded shapes, minimal detail,",
    "centered composition on a pure white background.",
    "No text, no labels, no shadows, no gradients, no 3D effects.",
    "No complicated illustrations, just simple, clean, and educational."
  ].join(" ");
}
