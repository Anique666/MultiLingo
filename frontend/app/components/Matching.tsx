"use client";

import { useEffect, useMemo, useState } from "react";

import { useLesson } from "@/context/LessonContext";

interface Pair {
  left: string;
  right: string;
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function parsePair(rawPair: string): Pair | null {
  try {
    const parsed = JSON.parse(rawPair) as Record<string, unknown>;
    const values = Object.values(parsed).filter(
      (value): value is string => typeof value === "string",
    );

    if (values.length < 2) {
      return null;
    }

    return {
      left: values[0],
      right: values[1],
    };
  } catch {
    return null;
  }
}

function formatPairs(pairs: Pair[]) {
  return [...pairs]
    .sort((first, second) => first.left.localeCompare(second.left))
    .map((pair) => `${pair.left}:${pair.right}`)
    .join(",");
}

export default function Matching() {
  const { exercises, currentIndex, submitAnswer, status } = useLesson();
  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedLeftItems, setMatchedLeftItems] = useState<string[]>([]);

  const exercise = exercises[currentIndex];
  const isIdle = status === "idle";

  const pairs = useMemo(() => {
    return exercise?.options
      .map(parsePair)
      .filter((pair): pair is Pair => pair !== null) ?? [];
  }, [exercise]);

  useEffect(() => {
    // Resetting on lesson navigation is intentional for this controlled matcher.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeftItems(shuffle(pairs.map((pair) => pair.left)));
    setRightItems(shuffle(pairs.map((pair) => pair.right)));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedLeftItems([]);
  }, [currentIndex, pairs]);

  useEffect(() => {
    if (pairs.length === 0 || matchedLeftItems.length !== pairs.length) {
      return;
    }

    void submitAnswer(formatPairs(pairs));
  }, [matchedLeftItems, pairs, submitAnswer]);

  if (!exercise) {
    return null;
  }

  function isMatched(value: string, side: "left" | "right") {
    if (side === "left") {
      return matchedLeftItems.includes(value);
    }

    return pairs.some(
      (pair) => pair.right === value && matchedLeftItems.includes(pair.left),
    );
  }

  function handleMatch(left: string, right: string) {
    const pair = pairs.find((item) => item.left === left);

    if (pair?.right === right) {
      setMatchedLeftItems((items) => [...items, left]);
    }

    setSelectedLeft(null);
    setSelectedRight(null);
  }

  function handleLeftSelect(item: string) {
    if (selectedRight !== null) {
      handleMatch(item, selectedRight);
      return;
    }

    setSelectedLeft(item);
  }

  function handleRightSelect(item: string) {
    if (selectedLeft !== null) {
      handleMatch(selectedLeft, item);
      return;
    }

    setSelectedRight(item);
  }

  function getButtonClass({
    isSelected,
    isMatchedItem,
  }: {
    isSelected: boolean;
    isMatchedItem: boolean;
  }) {
    return [
      "btn-tactile min-h-16 w-full rounded-2xl border-2 p-4 text-center text-lg font-bold",
      isMatchedItem
        ? "border-gray-200 bg-gray-100 text-gray-400"
        : isSelected
          ? "border-brand-blue border-b-brand-blue bg-brand-blue-bg text-brand-blue"
          : "border-gray-200 bg-white text-gray-700",
    ].join(" ");
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-gray-800">
        {exercise.question}
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          {leftItems.map((item) => {
            const isMatchedItem = isMatched(item, "left");

            return (
              <button
                key={item}
                type="button"
                disabled={!isIdle || isMatchedItem}
                onClick={() => {
                  handleLeftSelect(item);
                }}
                className={getButtonClass({
                  isSelected: selectedLeft === item,
                  isMatchedItem,
                })}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          {rightItems.map((item) => {
            const isMatchedItem = isMatched(item, "right");

            return (
              <button
                key={item}
                type="button"
                disabled={!isIdle || isMatchedItem}
                onClick={() => {
                  handleRightSelect(item);
                }}
                className={getButtonClass({
                  isSelected: selectedRight === item,
                  isMatchedItem,
                })}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
