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
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b-2 border-border bg-surface">
      <div className="mx-auto flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="flex items-center gap-3 rounded-full border-2 border-border bg-surface-alt px-4 py-2">
            <span aria-hidden="true" className="text-2xl leading-none">
              🇪🇸
            </span>
            <span className="text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--color-muted)]">
              Spanish
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3" aria-label="User stats">
          <div
            className="relative"
            onMouseEnter={() => setStreakOpen(true)}
            onMouseLeave={() => setStreakOpen(false)}
          >
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-full border-2 border-border bg-surface px-3 font-extrabold text-[var(--color-muted)] transition-colors hover:bg-surface-alt"
              aria-label={`Streak ${stats.streak}`}
            >
              <Flame
                aria-hidden="true"
                className="size-5 fill-current text-brand-yellow"
              />
              <span>{stats.streak}</span>
            </button>

            {streakOpen ? (
              <StreakPopover streak={stats.streak} lastActive={stats.last_active} />
            ) : null}
          </div>

          <div className="flex h-12 items-center gap-2 rounded-full border-2 border-border bg-surface px-3 font-extrabold text-[var(--color-muted)]">
            <Hexagon
              aria-hidden="true"
              className="size-5 fill-current text-brand-blue"
            />
            <span>{stats.xp}</span>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setHeartsOpen(true)}
            onMouseLeave={() => setHeartsOpen(false)}
          >
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-full border-2 border-border bg-surface px-3 font-extrabold text-[var(--color-muted)] transition-colors hover:bg-surface-alt"
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
    </header>
  );
}
