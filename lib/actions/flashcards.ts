"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { flashcards } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --------------------------------------------------
// Helper: get authenticated user ID or throw
// --------------------------------------------------
async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

// --------------------------------------------------
// Read: Get all flashcards for the current user
// --------------------------------------------------
export async function getFlashcards() {
  const userId = await requireUserId();

  return db
    .select()
    .from(flashcards)
    .where(eq(flashcards.userId, userId))
    .orderBy(desc(flashcards.createdAt));
}

// --------------------------------------------------
// Read: Get flashcard count for the current user
// --------------------------------------------------
export async function getFlashcardCount(): Promise<number> {
  const userId = await requireUserId();

  const result = await db
    .select({ count: count() })
    .from(flashcards)
    .where(eq(flashcards.userId, userId));

  return result[0]?.count ?? 0;
}

// --------------------------------------------------
// Create: Add a new flashcard
// Returns the new card's ID for downstream image generation.
// Image generation is handled separately via POST /api/generate-image.
// --------------------------------------------------
export async function createFlashcard(formData: FormData) {
  const userId = await requireUserId();

  const front = formData.get("front") as string;
  const back = formData.get("back") as string;

  // Validate inputs
  if (!front?.trim()) {
    return { success: false, error: "Front side is required", cardId: null };
  }
  if (!back?.trim()) {
    return { success: false, error: "Back side is required", cardId: null };
  }

  try {
    const [inserted] = await db
      .insert(flashcards)
      .values({
        userId,
        front: front.trim(),
        back: back.trim(),
      })
      .returning({ id: flashcards.id });

    revalidatePath("/build");
    revalidatePath("/play");
    revalidatePath("/dashboard");
    return { success: true, error: null, cardId: inserted.id };
  } catch {
    return { success: false, error: "Failed to create flashcard", cardId: null };
  }
}

// --------------------------------------------------
// Update: Edit an existing flashcard
// --------------------------------------------------
export async function updateFlashcard(formData: FormData) {
  const userId = await requireUserId();

  const id = formData.get("id") as string;
  const front = formData.get("front") as string;
  const back = formData.get("back") as string;

  // Validate inputs
  if (!id) {
    return { success: false, error: "Card ID is required" };
  }
  if (!front?.trim()) {
    return { success: false, error: "Front side is required" };
  }
  if (!back?.trim()) {
    return { success: false, error: "Back side is required" };
  }

  try {
    // Only update if the card belongs to the current user
    const result = await db
      .update(flashcards)
      .set({
        front: front.trim(),
        back: back.trim(),
        updatedAt: new Date(),
      })
      .where(and(eq(flashcards.id, id), eq(flashcards.userId, userId)));

    if (!result) {
      return { success: false, error: "Flashcard not found" };
    }

    revalidatePath("/build");
    revalidatePath("/play");
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to update flashcard" };
  }
}

// --------------------------------------------------
// Delete: Remove a flashcard
// --------------------------------------------------
export async function deleteFlashcard(formData: FormData) {
  const userId = await requireUserId();

  const id = formData.get("id") as string;

  if (!id) {
    return { success: false, error: "Card ID is required" };
  }

  try {
    // Only delete if the card belongs to the current user
    await db
      .delete(flashcards)
      .where(and(eq(flashcards.id, id), eq(flashcards.userId, userId)));

    revalidatePath("/build");
    revalidatePath("/play");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to delete flashcard" };
  }
}
