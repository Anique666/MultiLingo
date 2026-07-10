"use client";

import { Heart, X } from "lucide-react";

import { useLesson } from "@/context/LessonContext";

export default function ProgressBar() {
  const { currentIndex, exercises, hearts } = useLesson();

  const progressPercentage =
    exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;

  return (
    <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 p-4 pt-8">
      <button
        type="button"
        aria-label="Close lesson"
        className="text-gray-400 transition-colors hover:text-gray-600"
      >
        <X aria-hidden="true" className="size-7" />
      </button>

      <div className="flex-1">
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-brand-green transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Heart
          aria-hidden="true"
          className="size-7 fill-current text-brand-red"
        />
        <span className="text-lg font-extrabold text-brand-red">{hearts}</span>
      </div>
    </div>
  );
}
