"use client";

import { useEffect, useState } from "react";

import { useLesson } from "@/context/LessonContext";

function removeOne(words: string[], wordToRemove: string) {
  const index = words.findIndex((word) => word === wordToRemove);

  if (index === -1) {
    return words;
  }

  return words.filter((_, wordIndex) => wordIndex !== index);
}

export default function Translate() {
  const { exercises, currentIndex, submitAnswer, status } = useLesson();
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const exercise = exercises[currentIndex];

  useEffect(() => {
    // Resetting on lesson navigation is intentional for this controlled word bank.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvailableWords(exercise?.options ?? []);
    setSelectedWords([]);
  }, [currentIndex, exercise]);

  if (!exercise) {
    return null;
  }

  const isIdle = status === "idle";

  function handleSelect(word: string) {
    if (!isIdle) {
      return;
    }

    setAvailableWords((words) => removeOne(words, word));
    setSelectedWords((words) => [...words, word]);
  }

  function handleDeselect(word: string) {
    if (!isIdle) {
      return;
    }

    setSelectedWords((words) => removeOne(words, word));
    setAvailableWords((words) => [...words, word]);
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold text-gray-800">
          Translate this sentence
        </h1>
        <p className="rounded-2xl border-2 border-gray-200 p-4 text-lg font-bold text-gray-800">
          {exercise.question}
        </p>
      </div>

      <div className="flex min-h-[60px] flex-wrap gap-2 border-b-2 border-dashed border-gray-300 py-2">
        {selectedWords.map((word, index) => (
          <button
            key={`${word}-${index}`}
            type="button"
            disabled={!isIdle}
            onClick={() => {
              handleDeselect(word);
            }}
            className="btn-tactile rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-bold text-gray-700"
          >
            {word}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {availableWords.map((word, index) => (
          <button
            key={`${word}-${index}`}
            type="button"
            disabled={!isIdle}
            onClick={() => {
              handleSelect(word);
            }}
            className="btn-tactile rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-bold text-gray-700"
          >
            {word}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={selectedWords.length === 0}
        onClick={() => {
          void submitAnswer(selectedWords.join(" "));
        }}
        className="btn-tactile w-full rounded-2xl border-2 border-brand-green border-b-brand-green-dark bg-brand-green py-4 text-center text-lg font-extrabold text-white"
      >
        Check Answer
      </button>
    </section>
  );
}
