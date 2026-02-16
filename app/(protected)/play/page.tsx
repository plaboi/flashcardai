import Link from "next/link";
import { getFlashcards } from "@/lib/actions/flashcards";
import { FlashcardPlayer } from "@/components/flashcard-player";

export default async function PlayPage() {
  const cards = await getFlashcards();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Play Mode</h1>
        <p className="mt-1 text-slate-600">
          Study your flashcards one at a time
        </p>
      </div>

      {/* Empty state */}
      {cards.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-lg font-medium text-slate-500">
            No flashcards to study
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Create some cards first to start studying
          </p>
          <Link
            href="/build"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Go to Build Mode
          </Link>
        </div>
      ) : (
        <FlashcardPlayer cards={cards} />
      )}
    </div>
  );
}
