"use client";

import { Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

import { useLesson } from "@/context/LessonContext";

export default function CelebrationScreen() {
  const { status, correctCount, exercises } = useLesson();
  const router = useRouter();

  if (status !== "completed") {
    return null;
  }

  const totalExercises = exercises.length;
  const accuracy =
    totalExercises > 0 ? Math.round((correctCount / totalExercises) * 100) : 0;
  const xpEarned = correctCount * 10;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-white p-6">
      <div />

      <section className="flex flex-col items-center">
        <Trophy
          aria-hidden="true"
          className="size-[120px] animate-bounce fill-current text-brand-yellow"
        />
        <h1 className="mt-8 text-center text-3xl font-extrabold text-brand-yellow-dark">
          Lesson Complete!
        </h1>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="flex w-32 flex-col items-center rounded-2xl border-2 border-gray-200 p-4">
            <p className="text-sm font-extrabold text-gray-500">Total XP</p>
            <p className="mt-2 text-xl font-extrabold text-gray-800">
              {xpEarned}
            </p>
          </div>

          <div className="flex w-32 flex-col items-center rounded-2xl border-2 border-gray-200 p-4">
            <p className="text-sm font-extrabold text-gray-500">Accuracy</p>
            <p className="mt-2 text-xl font-extrabold text-gray-800">
              {accuracy}%
            </p>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={() => {
          router.push("/");
        }}
        className="btn-tactile w-full max-w-sm border-brand-green border-b-brand-green-dark bg-brand-green py-4 text-lg font-extrabold text-white"
      >
        Continue
      </button>
    </div>
  );
}
