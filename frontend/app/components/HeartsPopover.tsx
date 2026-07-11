"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";

type HeartsPopoverProps = {
  heartsRemaining: number;
  nextHeartInSeconds?: number | null;
};

export default function HeartsPopover({ heartsRemaining, nextHeartInSeconds: initialNextHeartInSeconds }: HeartsPopoverProps) {
  const hearts = Array.from({ length: 5 }, (_, index) => index < heartsRemaining);
  const [nextHeartInSeconds, setNextHeartInSeconds] = useState(initialNextHeartInSeconds);

  useEffect(() => {
    setNextHeartInSeconds(initialNextHeartInSeconds);
  }, [initialNextHeartInSeconds]);

  useEffect(() => {
    if (nextHeartInSeconds == null || nextHeartInSeconds <= 0) return;
    const interval = setInterval(() => {
      setNextHeartInSeconds((prev) => (prev ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextHeartInSeconds]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs} hour${hrs !== 1 ? "s" : ""}`;
    if (mins > 0) return `${mins} minute${mins !== 1 ? "s" : ""}`;
    return `${Math.max(0, seconds)} second${Math.max(0, seconds) !== 1 ? "s" : ""}`;
  };

  return (
    <div className="absolute right-0 top-full z-50 pt-3">
      <div className="w-[360px] rounded-[var(--radius-card)] border-2 border-border bg-surface p-6 shadow-modal">
        <h3 className="mb-6 text-center text-2xl font-extrabold text-[#4b4b4b]">
          Hearts
        </h3>

        <div className="flex items-center justify-center gap-3">
          {hearts.map((filled, index) => (
            <Heart
              key={`${index}`}
              aria-hidden="true"
              className={[
                "size-8",
                filled ? "fill-current text-[#ff4b4b]" : "fill-transparent text-[#e5e5e5] border-[#e5e5e5]",
              ].join(" ")}
              strokeWidth={filled ? 0 : 3}
            />
          ))}
        </div>

        {heartsRemaining < 5 && nextHeartInSeconds != null ? (
          <div className="mt-6 text-center">
            <p className="text-lg font-bold text-[#4b4b4b]">
              Next heart in <span className="text-[#ff4b4b]">{formatTime(nextHeartInSeconds)}</span>
            </p>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <p className="text-lg font-bold text-[#4b4b4b]">
              You have full hearts
            </p>
          </div>
        )}

        {heartsRemaining > 0 && heartsRemaining < 5 && (
          <p className="mt-2 text-center text-[15px] font-semibold text-[#777]">
            You still have hearts left! Keep on learning
          </p>
        )}

        <div className="mt-6">
          <Link
            href="/practice"
            className="flex flex-row items-center justify-between w-full rounded-2xl border-2 border-border border-b-4 bg-transparent px-4 py-4 font-extrabold tracking-[0.08em] text-[#4b4b4b] transition-all hover:bg-surface-alt active:border-b-2 active:translate-y-[2px]"
          >
            <div className="flex items-center gap-4">
              <Heart aria-hidden="true" className="size-6 fill-current text-[#ff4b4b]" strokeWidth={0} />
              <span className="text-sm">PRACTICE TO EARN HEARTS</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}