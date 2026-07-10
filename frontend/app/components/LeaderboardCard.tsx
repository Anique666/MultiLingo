"use client";

import { useEffect, useState } from "react";

type LeaderboardEntry = {
  id: number;
  username: string;
  xp: number;
};

const CURRENT_USER_ID = 1;

export default function LeaderboardCard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLeaderboard() {
      try {
        const response = await fetch("http://localhost:8000/leaderboard", {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as LeaderboardEntry[];
        setEntries(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch {
        // Keep the card empty if the backend is unavailable.
      } finally {
        setLoading(false);
      }
    }

    void fetchLeaderboard();

    return () => {
      controller.abort();
    };
  }, []);

  const currentUserRank = entries.findIndex((entry) => entry.id === CURRENT_USER_ID);

  return (
    <aside className="w-full rounded-[var(--radius-card)] border-2 border-border bg-surface p-4 shadow-card">
      <div>
        <p className="text-caption font-extrabold uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Bronze League
        </p>
        <h2 className="mt-1 text-2xl font-extrabold leading-tight text-foreground">
          Leaderboard
        </h2>
      </div>

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-12 rounded-2xl border-2 border-border bg-surface-alt"
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-surface-alt px-4 py-5 text-sm font-bold leading-6 text-[var(--color-muted)]">
            Complete a lesson to join the Bronze League.
          </div>
        ) : (
          entries.map((entry, index) => {
            const isCurrentUser = entry.id === CURRENT_USER_ID;

            return (
              <div
                key={entry.id}
                className={[
                  "flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-sm font-extrabold transition-colors",
                  isCurrentUser
                    ? "border-brand-blue bg-brand-blue-bg text-brand-blue"
                    : "border-border bg-surface",
                ].join(" ")}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-alt text-xs font-extrabold text-[var(--color-muted)]">
                    {index + 1}
                  </span>
                  <span className="truncate">{entry.username}</span>
                </div>
                <span className={isCurrentUser ? "text-brand-blue" : "text-[var(--color-muted)]"}>
                  {entry.xp} XP
                </span>
              </div>
            );
          })
        )}
      </div>

      {!loading && entries.length > 0 && currentUserRank === -1 ? (
        <div className="mt-4 rounded-2xl bg-brand-blue-bg px-4 py-3 text-sm font-bold leading-6 text-brand-blue">
          Complete a lesson to join the Bronze League.
        </div>
      ) : null}
    </aside>
  );
}