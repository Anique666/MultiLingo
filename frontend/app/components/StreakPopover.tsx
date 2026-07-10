"use client";

import { Flame } from "lucide-react";

type StreakPopoverProps = {
  streak: number;
  lastActive?: string | null;
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getWeekdayCells(streak: number) {
  const todayIndex = new Date().getDay();
  const filledCount = Math.min(streak, 7);

  return DAY_LABELS.map((label, index) => {
    const distanceFromToday = (todayIndex - index + 7) % 7;

    return {
      label,
      filled: filledCount > 0 && distanceFromToday < filledCount,
      today: index === todayIndex,
    };
  });
}

export default function StreakPopover({ streak, lastActive }: StreakPopoverProps) {
  const cells = getWeekdayCells(streak);

  return (
    <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-[var(--radius-card)] border-2 border-border bg-surface p-4 shadow-modal">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-brand-yellow/20">
          <Flame aria-hidden="true" className="size-5 fill-current text-brand-yellow" />
        </div>
        <div>
          <p className="text-display font-extrabold leading-none text-foreground">
            {streak}
          </p>
          <p className="text-sm font-extrabold text-[var(--color-muted)]">
            day streak
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center">
        {cells.map((cell, index) => (
          <div key={`${cell.label}-${index}`} className="flex flex-col items-center gap-2">
            <span
              className={[
                "text-[0.7rem] font-extrabold uppercase leading-none",
                cell.today ? "text-brand-blue" : "text-[var(--color-muted)]",
              ].join(" ")}
            >
              {cell.label}
            </span>
            <span
              className={[
                "flex size-8 items-center justify-center rounded-full border-2",
                cell.filled
                  ? "border-brand-green bg-brand-green"
                  : cell.today
                    ? "border-brand-blue bg-brand-blue-bg"
                    : "border-border bg-surface",
              ].join(" ")}
            >
              <span
                className={[
                  "size-2.5 rounded-full",
                  cell.filled
                    ? "bg-surface"
                    : cell.today
                      ? "bg-brand-blue"
                      : "bg-[var(--color-disabled)]",
                ].join(" ")}
              />
            </span>
          </div>
        ))}
      </div>

      {streak === 0 ? (
        <p className="mt-4 text-sm font-bold leading-5 text-[var(--color-muted)]">
          Do a lesson today to start a new streak!
        </p>
      ) : (
        <p className="mt-4 text-sm font-bold leading-5 text-[var(--color-muted)]">
          {lastActive ? `Last active ${lastActive}. ` : ""}
          Keep it going today.
        </p>
      )}
    </div>
  );
}