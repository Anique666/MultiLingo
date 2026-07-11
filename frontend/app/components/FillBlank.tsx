"use client";

import { useEffect, useState } from "react";

import { useLesson } from "@/context/LessonContext";

export default function FillBlank() {
  const { exercises, currentIndex, submitAnswer, status } = useLesson();
  const [text, setText] = useState("");

  const exercise = exercises[currentIndex];
  const isIdle = status === "idle";

  useEffect(() => {
    // Resetting on lesson navigation is intentional for this controlled input.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText("");
  }, [currentIndex]);

  if (!exercise) {
    return null;
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-foreground">
        {exercise.question}
      </h1>

      <input
        type="text"
        value={text}
        disabled={!isIdle}
        onChange={(event) => {
          setText(event.target.value);
        }}
        className="w-full rounded-2xl border-2 border-border p-4 text-xl font-bold text-foreground outline-none transition-colors focus:border-brand-blue disabled:bg-surface-alt disabled:text-muted"
        autoComplete="off"
      />

      <button
        type="button"
        disabled={text.trim().length === 0 || !isIdle}
        onClick={() => {
          void submitAnswer(text);
        }}
        className="btn-tactile w-full rounded-2xl border-2 border-brand-green border-b-brand-green-dark bg-brand-green py-4 text-center text-lg font-extrabold text-white"
      >
        Check Answer
      </button>
    </section>
  );
}
