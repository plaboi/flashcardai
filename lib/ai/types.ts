/**
 * Provider-agnostic interface for AI image generation.
 *
 * To swap providers (e.g. Stability AI, Replicate), create a new class
 * that implements this interface and update the import in the server action.
 */
export interface ImageGenerationProvider {
  /**
   * Generate an image from a text prompt.
   * @param prompt - The styled prompt to send to the AI model.
   * @returns A Buffer containing the image data (PNG format preferred).
   */
  generateImage(prompt: string): Promise<Buffer>;
}
