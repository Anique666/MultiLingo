"use client";

import { Heart } from "lucide-react";

type HeartsPopoverProps = {
  heartsRemaining: number;
};

export default function HeartsPopover({ heartsRemaining }: HeartsPopoverProps) {
  const hearts = Array.from({ length: 5 }, (_, index) => index < heartsRemaining);

  return (
    <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-[var(--radius-card)] border-2 border-border bg-surface p-4 shadow-modal">
      <div className="flex items-center gap-2">
        {hearts.map((filled, index) => (
          <Heart
            key={`${index}`}
            aria-hidden="true"
            className={[
              "size-6",
              filled ? "fill-current text-brand-red" : "text-[var(--color-disabled)]",
            ].join(" ")}
          />
        ))}
      </div>

      <p className="mt-4 text-lg font-extrabold text-foreground">
        {heartsRemaining >= 5
          ? "You have full hearts"
          : `${heartsRemaining} hearts remaining`}
      </p>

      <p className="mt-1 text-sm font-bold text-[var(--color-muted)]">
        Keep on learning
      </p>
    </div>
  );
}