"use client";

import { useEffect, useState } from "react";

import { useLesson } from "@/context/LessonContext";

export default function MultipleChoice() {
  const { exercises, currentIndex, submitAnswer, status } = useLesson();
  const [selected, setSelected] = useState<string | null>(null);

  const exercise = exercises[currentIndex];

  useEffect(() => {
    // Resetting on lesson navigation is intentional for this controlled choice UI.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(null);
  }, [currentIndex]);

  if (!exercise) {
    return null;
  }

  const isIdle = status === "idle";

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-gray-800">
        {exercise.question}
      </h1>

      <div className="grid grid-cols-1 gap-4">
        {exercise.options.map((option) => {
          const isSelected = selected === option;

          return (
            <button
              key={option}
              type="button"
              disabled={!isIdle}
              onClick={() => {
                setSelected(option);
              }}
              className={[
                "btn-tactile w-full rounded-2xl border-2 p-4 text-left text-lg font-bold transition-colors",
                isSelected
                  ? "border-brand-blue border-b-brand-blue bg-brand-blue-bg text-brand-blue"
                  : "border-gray-200 bg-white text-gray-700",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selected !== null && isIdle ? (
        <button
          type="button"
          onClick={() => {
            void submitAnswer(selected);
          }}
          className="btn-tactile mt-4 w-full rounded-2xl border-2 border-brand-green border-b-brand-green-dark bg-brand-green py-4 text-center text-lg font-extrabold text-white"
        >
          Check Answer
        </button>
      ) : null}
    </section>
  );
}
