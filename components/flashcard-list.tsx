"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFlashcard } from "@/lib/actions/flashcards";
import { FlashcardForm } from "@/components/flashcard-form";
import type { Flashcard } from "@/lib/db/schema";

interface FlashcardListProps {
  cards: Flashcard[];
}

export function FlashcardList({ cards }: FlashcardListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Check if any cards are still waiting for image generation
  const hasPendingImages = cards.some((card) => !card.imageUrl);

  // Poll for updates while any card is missing its image.
  // router.refresh() triggers the server component to re-fetch data,
  // so images appear as soon as generation completes.
  useEffect(() => {
    if (!hasPendingImages) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [hasPendingImages, router]);

  function handleDelete(id: string) {
    const formData = new FormData();
    formData.set("id", id);

    startTransition(async () => {
      await deleteFlashcard(formData);
      setDeletingId(null);
    });
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
        <p className="text-slate-500">No flashcards yet.</p>
        <p className="mt-1 text-sm text-slate-400">
          Use the form above to create your first card!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <div
          key={card.id}
          className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
        >
          {editingId === card.id ? (
            /* Edit mode */
            <FlashcardForm
              card={card}
              onDone={() => setEditingId(null)}
            />
          ) : (
            /* Display mode */
            <div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Front
                  </p>
                  <p className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">
                    {card.front}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Back
                  </p>
                  <p className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">
                    {card.back}
                  </p>
                  {/* AI-generated illustration or pending indicator */}
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={`Illustration for: ${card.back}`}
                      className="mt-3 max-h-40 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="mt-3 flex items-center gap-1.5">
                      <svg
                        className="h-3.5 w-3.5 animate-spin text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="text-xs text-blue-600">
                        Generating illustration...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card actions */}
              <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => setEditingId(card.id)}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Edit
                </button>

                {deletingId === card.id ? (
                  /* Confirm delete */
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600">Delete this card?</span>
                    <button
                      onClick={() => handleDelete(card.id)}
                      disabled={isPending}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {isPending ? "Deleting..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(card.id)}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
