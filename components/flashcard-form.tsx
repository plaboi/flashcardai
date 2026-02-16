"use client";

import { useRef, useState, useTransition } from "react";
import { createFlashcard, updateFlashcard } from "@/lib/actions/flashcards";
import type { Flashcard } from "@/lib/db/schema";

interface FlashcardFormProps {
  /** If provided, the form is in edit mode */
  card?: Flashcard;
  /** Called after a successful save or when cancelling edit */
  onDone?: () => void;
}

export function FlashcardForm({ card, onDone }: FlashcardFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditing = !!card;

  function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      if (isEditing) {
        const result = await updateFlashcard(formData);
        if (result.success) {
          formRef.current?.reset();
          onDone?.();
        } else {
          setError(result.error);
        }
      } else {
        const result = await createFlashcard(formData);

        if (result.success && result.cardId) {
          formRef.current?.reset();
          onDone?.();

          // Fire-and-forget: kick off image generation via API route.
          // This runs as an independent HTTP request -- NOT a server action --
          // so it doesn't block the form or serialize with future submissions.
          fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cardId: result.cardId }),
          }).catch(() => {
            // Silently ignore -- card was already saved successfully
          });
        } else {
          setError(result.error);
        }
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {/* Hidden ID field for editing */}
      {isEditing && <input type="hidden" name="id" value={card.id} />}

      <div>
        <label
          htmlFor={isEditing ? `front-${card.id}` : "front"}
          className="block text-sm font-medium text-slate-700"
        >
          Front
        </label>
        <textarea
          id={isEditing ? `front-${card.id}` : "front"}
          name="front"
          required
          rows={2}
          defaultValue={card?.front ?? ""}
          placeholder="Question or term..."
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor={isEditing ? `back-${card.id}` : "back"}
          className="block text-sm font-medium text-slate-700"
        >
          Back
        </label>
        <textarea
          id={isEditing ? `back-${card.id}` : "back"}
          name="back"
          required
          rows={2}
          defaultValue={card?.back ?? ""}
          placeholder="Answer or definition..."
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? isEditing
              ? "Saving..."
              : "Adding..."
            : isEditing
              ? "Save Changes"
              : "Add Card"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
