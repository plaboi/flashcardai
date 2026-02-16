import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { processCardImageGeneration } from "@/lib/ai/generate-card-image";

/**
 * POST /api/generate-image
 *
 * Fire-and-forget endpoint for background image generation.
 * Called by the client after card creation -- each request runs
 * independently (not subject to React's server action serialization),
 * so multiple cards can generate images in parallel.
 */
export async function POST(request: Request) {
  // Authenticate
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse the card ID from the request body
  let cardId: string;
  try {
    const body = await request.json();
    cardId = body.cardId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!cardId || typeof cardId !== "string") {
    return NextResponse.json({ error: "cardId is required" }, { status: 400 });
  }

  // Run the generation logic
  const result = await processCardImageGeneration(cardId, userId);

  if (result.success) {
    // Revalidate so the next page load picks up the new image
    revalidatePath("/build");
    revalidatePath("/play");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, error: result.error },
    { status: 500 }
  );
}
