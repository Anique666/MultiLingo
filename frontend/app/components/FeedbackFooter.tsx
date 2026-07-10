"use client";

import { Check, X } from "lucide-react";

import { useLesson } from "@/context/LessonContext";

export default function FeedbackFooter() {
  const { status, correctAnswerText, handleContinue } = useLesson();

  const isCorrect = status === "correct";
  const isIncorrect = status === "incorrect";
  const isVisible = isCorrect || isIncorrect;

  return (
    <footer
      aria-hidden={!isVisible}
      aria-live="polite"
      className={[
        "fixed bottom-0 left-0 z-50 w-full border-t border-black/5 px-4 py-5 shadow-[0_-8px_24px_rgb(0_0_0/0.08)] transition-transform duration-300 ease-[var(--ease-bounce)]",
        isVisible
          ? "pointer-events-auto translate-y-0"
          : "pointer-events-none translate-y-full",
        isCorrect && "bg-green-100",
        isIncorrect && "bg-red-100",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isVisible ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-green text-white">
                <Check aria-hidden="true" className="size-7 stroke-[3]" />
              </span>
            ) : (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-red text-white">
                <X aria-hidden="true" className="size-7 stroke-[3]" />
              </span>
            )}

            <div className="min-w-0">
              {isCorrect ? (
                <p className="text-xl font-extrabold text-brand-green-dark">
                  Excellent!
                </p>
              ) : (
                <>
                  <p className="text-base font-extrabold text-brand-red-dark">
                    Correct solution:
                  </p>
                  <p className="mt-1 break-words text-lg font-extrabold text-brand-red-dark">
                    {correctAnswerText}
                  </p>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void handleContinue();
            }}
            className={[
              "btn-tactile h-12 w-full px-6 text-base font-extrabold sm:w-auto sm:min-w-40",
              isCorrect && "border-brand-green-dark bg-brand-green text-white",
              isIncorrect && "border-brand-red-dark bg-brand-red text-white",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {isCorrect ? "Continue" : "Got it"}
          </button>
        </div>
      ) : null}
    </footer>
  );
}
