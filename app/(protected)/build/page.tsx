import { getFlashcards } from "@/lib/actions/flashcards";
import { FlashcardForm } from "@/components/flashcard-form";
import { FlashcardList } from "@/components/flashcard-list";

export default async function BuildPage() {
  const cards = await getFlashcards();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Build Mode</h1>
        <p className="mt-1 text-slate-600">
          Create and manage your flashcards
        </p>
      </div>

      {/* Create new card form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">
          Add New Card
        </h2>
        <FlashcardForm />
      </div>

      {/* Existing cards */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Your Cards ({cards.length})
        </h2>
        <FlashcardList cards={cards} />
      </div>
    </div>
  );
}
