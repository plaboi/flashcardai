"use client";

import { useState, useCallback, useEffect } from "react";
import type { Flashcard } from "@/lib/db/schema";

interface FlashcardPlayerProps {
  cards: Flashcard[];
}

/**
 * Fisher-Yates shuffle algorithm - returns a new shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function FlashcardPlayer({ cards }: FlashcardPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [displayCards, setDisplayCards] = useState(cards);

  // Reset reveal state when navigating
  const goToCard = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsRevealed(false);
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < displayCards.length - 1) {
      goToCard(currentIndex + 1);
    }
  }, [currentIndex, displayCards.length, goToCard]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      goToCard(currentIndex - 1);
    }
  }, [currentIndex, goToCard]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case " ":
          e.preventDefault();
          setIsRevealed((prev) => !prev);
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  // Toggle shuffle mode
  function toggleShuffle() {
    if (isShuffled) {
      setDisplayCards(cards);
    } else {
      setDisplayCards(shuffleArray(cards));
    }
    setIsShuffled(!isShuffled);
    setCurrentIndex(0);
    setIsRevealed(false);
  }

  const currentCard = displayCards[currentIndex];

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Card counter and controls */}
      <div className="flex w-full items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          Card {currentIndex + 1} of {displayCards.length}
        </p>
        <button
          onClick={toggleShuffle}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            isShuffled
              ? "bg-blue-100 text-blue-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isShuffled ? "Shuffled" : "Shuffle"}
        </button>
      </div>

      {/* Flashcard */}
      <div className="w-full">
        <div
          className="relative min-h-[280px] w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:min-h-[320px] sm:p-8"
          onClick={() => setIsRevealed(!isRevealed)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") setIsRevealed(!isRevealed);
          }}
          aria-label={isRevealed ? "Hide answer" : "Reveal answer"}
        >
          <div className="flex h-full min-h-[230px] flex-col items-center justify-center text-center sm:min-h-[270px]">
            {/* Label */}
            <span
              className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                isRevealed
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {isRevealed ? "Answer" : "Question"}
            </span>

            {/* Card content */}
            <p className="text-lg font-medium text-slate-900 whitespace-pre-wrap sm:text-xl">
              {isRevealed ? currentCard.back : currentCard.front}
            </p>

            {/* AI-generated illustration (shown only when answer is revealed) */}
            {isRevealed && currentCard.imageUrl && (
              <img
                src={currentCard.imageUrl}
                alt={`Illustration for: ${currentCard.back}`}
                className="mt-4 max-h-48 rounded-lg object-contain"
              />
            )}
          </div>

          {/* Tap hint */}
          {!isRevealed && (
            <p className="absolute bottom-4 left-0 w-full text-center text-xs text-slate-400">
              Tap to reveal answer
            </p>
          )}
        </div>
      </div>

      {/* Reveal button */}
      <button
        onClick={() => setIsRevealed(!isRevealed)}
        className={`w-full rounded-xl px-6 py-3 text-sm font-medium transition-colors sm:w-auto ${
          isRevealed
            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isRevealed ? "Hide Answer" : "Reveal Answer"}
      </button>

      {/* Navigation */}
      <div className="flex w-full items-center justify-between gap-4">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex === displayCards.length - 1}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Keyboard hint (desktop only) */}
      <p className="hidden text-xs text-slate-400 sm:block">
        Use arrow keys to navigate, spacebar to reveal
      </p>
    </div>
  );
}
