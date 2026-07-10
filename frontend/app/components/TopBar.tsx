"use client";

import { useEffect, useState } from "react";
import { Flame, Heart, Hexagon } from "lucide-react";

type UserStats = {
  xp: number;
  streak: number;
  hearts: number;
};

const defaultStats: UserStats = {
  xp: 0,
  streak: 0,
  hearts: 5,
};

export default function TopBar() {
  const [stats, setStats] = useState<UserStats>(defaultStats);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const response = await fetch("http://localhost:8000/users/1/progress");

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as Partial<UserStats>;

        if (isMounted) {
          setStats({
            xp: data.xp ?? defaultStats.xp,
            streak: data.streak ?? defaultStats.streak,
            hearts: data.hearts ?? defaultStats.hearts,
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
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full border-b-2 border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between p-4">
        <div aria-label="Selected course country" className="text-3xl">
          🇪🇸
        </div>

        <div className="flex items-center gap-5" aria-label="User stats">
          <div className="flex items-center gap-1.5">
            <Flame
              aria-hidden="true"
              className="size-6 fill-current text-orange-500"
            />
            <span className="font-extrabold text-gray-500">
              {stats.streak}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Hexagon
              aria-hidden="true"
              className="size-6 fill-current text-brand-blue"
            />
            <span className="font-extrabold text-gray-500">{stats.xp}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Heart
              aria-hidden="true"
              className="size-6 fill-current text-brand-red"
            />
            <span className="font-extrabold text-gray-500">
              {stats.hearts}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
