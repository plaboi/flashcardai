import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { getFlashcardCount } from "@/lib/actions/flashcards";

export default async function DashboardPage() {
  const [user, cardCount] = await Promise.all([
    currentUser(),
    getFlashcardCount(),
  ]);

  const firstName = user?.firstName || "there";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-1 text-slate-600">
          Ready to build and study your flashcards?
        </p>
      </div>

      {/* Stats */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium text-slate-500">Total Flashcards</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{cardCount}</p>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Build Mode Card */}
        <Link
          href="/build"
          className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-blue-700">
            Build Mode
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Create, edit, and manage your flashcards
          </p>
        </Link>

        {/* Play Mode Card */}
        <Link
          href="/play"
          className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-green-300 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-green-700">
            Play Mode
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Study and review your flashcards
          </p>
        </Link>
      </div>
    </div>
  );
}
