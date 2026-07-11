"use client";

import { useEffect, useState } from "react";
import { Flame, Heart, Hexagon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import HeartsPopover from "./HeartsPopover";
import StreakPopover from "./StreakPopover";

type UserStats = {
  xp: number;
  streak: number;
  hearts: number;
  last_active?: string | null;
};

const defaultStats: UserStats = {
  xp: 0,
  streak: 0,
  hearts: 5,
};

export default function TopBar() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [streakOpen, setStreakOpen] = useState(false);
  const [heartsOpen, setHeartsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        if (!user) return;
        const response = await fetch(`http://localhost:8000/users/progress`, {
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as Partial<UserStats>;

        if (isMounted) {
          setStats({
            xp: data.xp ?? defaultStats.xp,
            streak: data.streak ?? defaultStats.streak,
            hearts: data.hearts ?? defaultStats.hearts,
            last_active: data.last_active ?? null,
          });
        }
      } catch {
        // Keep the default stats if the local API is unavailable.
      }
    }

    void fetchStats();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-20 text-foreground pointer-events-none lg:pl-[16rem]">
      {/* Mobile view */}
      <div className="flex h-full w-full items-center justify-between bg-white px-4 sm:px-6 pointer-events-auto lg:hidden">
        <div className="flex items-center"></div>
        <div className="flex items-center gap-2 sm:gap-3" aria-label="User stats">
          <div className="flex items-center gap-2 rounded-full bg-transparent px-2 py-1.5 hover:bg-surface-alt transition-colors cursor-pointer mr-2">
            <span aria-hidden="true" className="text-sm font-black text-[#1cb0f6] uppercase">
              ES
            </span>
            <span className="text-sm font-extrabold uppercase tracking-[0.08em] text-muted hidden sm:inline-block">
              Spanish
            </span>
          </div>
          <div
            className="relative"
            onMouseEnter={() => setStreakOpen(true)}
            onMouseLeave={() => setStreakOpen(false)}
          >
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-full bg-transparent px-3 font-extrabold text-[var(--color-muted)] transition-colors hover:bg-surface-alt"
              aria-label={`Streak ${stats.streak}`}
            >
              <Flame
                aria-hidden="true"
                className="size-5 fill-current text-brand-orange"
              />
              <span>{stats.streak}</span>
            </button>
            {streakOpen ? (
              <StreakPopover streak={stats.streak} lastActive={stats.last_active} />
            ) : null}
          </div>
          <div className="group flex h-12 cursor-default items-center gap-2 rounded-full bg-transparent px-3 font-extrabold text-[var(--color-muted)] transition-colors hover:bg-surface-alt">
            <Hexagon
              aria-hidden="true"
              className="size-5 fill-current text-brand-blue"
            />
            <span className="inline-block group-hover:hidden">200</span>
            <span className="hidden group-hover:inline-block">Gems</span>
          </div>
          <div
            className="relative"
            onMouseEnter={() => setHeartsOpen(true)}
            onMouseLeave={() => setHeartsOpen(false)}
          >
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-full bg-transparent px-3 font-extrabold text-[var(--color-muted)] transition-colors hover:bg-surface-alt"
              aria-label={`Hearts ${stats.hearts}`}
            >
              <Heart
                aria-hidden="true"
                className="size-5 fill-current text-brand-red"
              />
              <span>{stats.hearts}</span>
            </button>
            {heartsOpen ? <HeartsPopover heartsRemaining={stats.hearts} /> : null}
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="mx-auto hidden h-full w-full lg:max-w-5xl lg:px-8 lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
        <div className="h-full w-full"></div>
        <div className="flex w-full items-center justify-end bg-white xl:pr-2 pointer-events-auto">
          <div className="flex items-center gap-2 lg:gap-3" aria-label="User stats">
            <div className="flex items-center gap-2 rounded-full bg-transparent px-2 py-1.5 hover:bg-surface-alt transition-colors cursor-pointer mr-2">
              <span aria-hidden="true" className="text-sm font-black text-[#1cb0f6] uppercase">
                ES
              </span>
              <span className="text-sm font-extrabold uppercase tracking-[0.08em] text-muted">
                Spanish
              </span>
            </div>
            <div
              className="relative"
              onMouseEnter={() => setStreakOpen(true)}
              onMouseLeave={() => setStreakOpen(false)}
            >
              <button
                type="button"
                className="flex h-12 items-center gap-2 rounded-full bg-transparent px-3 font-extrabold text-[var(--color-muted)] transition-colors hover:bg-surface-alt"
                aria-label={`Streak ${stats.streak}`}
              >
                <Flame
                  aria-hidden="true"
                  className="size-5 fill-current text-brand-orange"
                />
                <span>{stats.streak}</span>
              </button>
              {streakOpen ? (
                <StreakPopover streak={stats.streak} lastActive={stats.last_active} />
              ) : null}
            </div>
            <div className="group flex h-12 cursor-default items-center gap-2 rounded-full bg-transparent px-3 font-extrabold text-[var(--color-muted)] transition-colors hover:bg-surface-alt">
              <Hexagon
                aria-hidden="true"
                className="size-5 fill-current text-brand-blue"
              />
              <span className="inline-block group-hover:hidden">200</span>
              <span className="hidden group-hover:inline-block">Gems</span>
            </div>
            <div
              className="relative"
              onMouseEnter={() => setHeartsOpen(true)}
              onMouseLeave={() => setHeartsOpen(false)}
            >
              <button
                type="button"
                className="flex h-12 items-center gap-2 rounded-full bg-transparent px-3 font-extrabold text-[var(--color-muted)] transition-colors hover:bg-surface-alt"
                aria-label={`Hearts ${stats.hearts}`}
              >
                <Heart
                  aria-hidden="true"
                  className="size-5 fill-current text-brand-red"
                />
                <span>{stats.hearts}</span>
              </button>
              {heartsOpen ? <HeartsPopover heartsRemaining={stats.hearts} /> : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
