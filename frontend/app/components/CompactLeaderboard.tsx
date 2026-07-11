"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

type LeaderboardEntry = {
  id: number;
  username: string;
  xp: number;
};

export default function CompactLeaderboard() {
  const { user: currentUser } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userXp, setUserXp] = useState<number | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLeaderboard() {
      try {
        let currentXp = 0;
        let currentRank = null;
        try {
          const progressRes = await fetch("http://localhost:8000/users/progress", {
            credentials: "include",
            signal: controller.signal,
          });
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            currentXp = progressData.xp;
            currentRank = progressData.rank;
          }
        } catch {
          // ignore
        }
        setUserXp(currentXp);
        setUserRank(currentRank);

        if (currentXp > 0) {
          const response = await fetch("http://localhost:8000/leaderboard", {
            signal: controller.signal,
          });

          if (response.ok) {
            const data = (await response.json()) as LeaderboardEntry[];
            setEntries(Array.isArray(data) ? data.slice(0, 10) : []);
          }
        } else {
          setEntries([]);
        }
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

  const currentUserTopIndex = entries.findIndex((entry) => entry.id === currentUser?.id);
  const inTopTen = currentUserTopIndex !== -1;
  const shouldAppendUser = userXp !== null && userXp > 0 && !inTopTen && currentUser;
  const finalEntries = [...entries];
  if (shouldAppendUser && currentUser) {
    finalEntries.push({
      id: currentUser.id,
      username: currentUser.username,
      xp: userXp as number,
    });
  }

  return (
    <aside className="w-full rounded-[var(--radius-card)] border-2 border-border bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-extrabold text-foreground">
          Bronze League
        </h2>
        <Link
          href="/leaderboard"
          className="text-[13px] font-black uppercase tracking-wide text-brand-blue hover:brightness-110"
        >
          VIEW LEAGUE
        </Link>
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
        ) : userXp === 0 || userXp === null ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-surface-alt px-4 py-5 text-sm font-bold leading-6 text-[var(--color-muted)]">
            Complete a lesson to join the Bronze League.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 py-2">
              <div className="flex h-14 w-12 items-center justify-center rounded-xl bg-orange-300">
                {/* SVG Feather / Shield fallback */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a35418"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2C12 2 17 6 17 11V15L12 22L7 15V11C7 6 12 2 12 2Z" fill="#ffb46f" />
                  <path d="M15 9.5C15 9.5 13.08 12.03 10.5 12C7.92 11.97 7.5 13.5 7.5 13.5" />
                  <line x1="8" y1="16" x2="16" y2="8" />
                </svg>
              </div>
              <div className="flex flex-col">
                <p className="text-[17px] font-extrabold text-foreground">
                  You&apos;re ranked <span className="text-brand-green">#{userRank || "-"}</span>
                </p>
                <p className="text-[15px] font-medium text-[var(--color-muted)]">
                  Keep it up to stay in the top 3!
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}