"use client";

import { HeartCrack } from "lucide-react";
import { useRouter } from "next/navigation";

import { useLesson } from "@/context/LessonContext";

export default function OutOfHeartsModal() {
  const { hearts, status } = useLesson();
  const router = useRouter();

  if (hearts !== 0 || status !== "incorrect") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl bg-surface p-8 text-center shadow-2xl">
        <HeartCrack
          aria-hidden="true"
          className="size-20 fill-brand-red text-brand-red"
        />

        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-extrabold text-gray-800">
            Out of Hearts!
          </h2>
          <p className="font-bold text-gray-500">
            You made too many mistakes. Keep practicing to restore your hearts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            router.push("/");
          }}
          className="btn-tactile w-full rounded-2xl border-2 border-brand-blue border-b-brand-blue-dark bg-brand-blue py-4 font-extrabold text-white"
        >
          End Lesson
        </button>
      </div>
    </div>
  );
}
