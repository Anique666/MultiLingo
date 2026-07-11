"use client";

import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";
import LeaderboardCard from "../components/LeaderboardCard";
import ProtectedRoute from "../components/ProtectedRoute";
import { Gem } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { API_BASE } from "@/app/lib/api";

type LeaderboardEntry = {
    id: number;
    username: string;
    xp: number;
};

export default function LeaderboardPage() {
    const { user: currentUser } = useAuth();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [userXp, setUserXp] = useState<number | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchLeaderboard() {
            try {
                let currentXp = 0;
                try {
                    const progressRes = await fetch(`${API_BASE}/users/progress`, {
                        credentials: "include",
                        signal: controller.signal,
                    });
                    if (progressRes.ok) {
                        const progressData = await progressRes.json();
                        currentXp = progressData.xp;
                    }
                } catch {
                    // ignore
                }
                setUserXp(currentXp);

                if (currentXp > 0) {
                    const response = await fetch(`${API_BASE}/leaderboard`, {
                        signal: controller.signal,
                    });

                    if (response.ok) {
                        const data = (await response.json()) as LeaderboardEntry[];
                        setEntries(Array.isArray(data) ? data.slice(0, 20) : []);
                    }
                } else {
                    setEntries([]);
                }
            } catch {
                // Handle failure
            } finally {
                setLoading(false);
            }
        }

        void fetchLeaderboard();

        return () => {
            controller.abort();
        };
    }, []);

    const currentUserRank = entries.findIndex((entry) => entry.id === currentUser?.id);
    const shouldAppendUser = userXp !== null && userXp > 0 && currentUserRank === -1 && currentUser;
    const finalEntries = [...entries];
    if (shouldAppendUser && currentUser) {
        finalEntries.push({
            id: currentUser.id,
            username: currentUser.username,
            xp: userXp as number,
        });
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                <TopBar />
                <Sidebar />
                <main className="w-full pb-10 pt-24 lg:pl-[16rem]">
                    <div className="mx-auto flex w-full max-w-5xl gap-8 px-4 sm:px-6 lg:px-8 items-start">
                        <div className="min-w-0 flex-1 space-y-6">
                            {/* League Header Block */}
                            <div className="flex flex-col items-center border-b-2 border-border pb-6 pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex size-20 items-center justify-center rounded-2xl ring-4 ring-orange-800 ring-offset-4 ring-offset-surface-alt">
                                        <Gem className="size-12 animate-bounce text-orange-800" />
                                    </div>
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-alt">
                                        <Gem className="size-8 text-slate-400 opacity-50" />
                                    </div>
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-alt">
                                        <Gem className="size-8 text-brand-yellow opacity-50" />
                                    </div>
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-alt">
                                        <Gem className="size-8 text-brand-blue opacity-50" />
                                    </div>
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-alt">
                                        <Gem className="size-8 text-brand-red opacity-50" />
                                    </div>
                                </div>

                                <h1 className="mt-8 text-2xl font-extrabold text-foreground">
                                    Bronze League
                                </h1>
                                <p className="mt-2 font-bold text-brand-yellow">
                                    5 days
                                </p>
                            </div>

                            {/* Leaderboard List */}
                            <div className="mt-6 flex flex-col gap-2">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-16 w-full animate-pulse rounded-2xl bg-surface-alt"
                                        />
                                    ))
                                ) : userXp === 0 || userXp === null ? (
                                    <div className="rounded-2xl border-2 border-dashed border-border bg-surface-alt px-4 py-8 text-center font-bold text-[var(--color-muted)]">
                                        Complete a lesson to join this week's leaderboard.
                                    </div>
                                ) : (
                                    finalEntries.map((entry, index) => {
                                        const isCurrentUser = currentUser ? entry.id === currentUser.id : false;
                                        const initials = entry.username.substring(0, 2).toUpperCase();
                                        const rankDisplay = shouldAppendUser && isCurrentUser && index === finalEntries.length - 1 ? "-" : index + 1;

                                        return (
                                            <div
                                                key={entry.id}
                                                className={[
                                                    "flex h-[88px] items-center justify-between gap-4 rounded-[var(--radius-card)] border-2 p-[var(--spacing-card)]",
                                                    isCurrentUser
                                                        ? "border-brand-blue bg-brand-blue-bg"
                                                        : "border-border bg-surface hover:bg-surface-alt",
                                                ].join(" ")}
                                            >
                                                {/* Left Section (Rank Badge) */}
                                                <div className="flex w-[120px] shrink-0 items-center">
                                                    <div
                                                        className={[
                                                            "flex size-10 items-center justify-center rounded-full text-base font-extrabold",
                                                            isCurrentUser
                                                                ? "bg-brand-blue text-white"
                                                                : "bg-surface-alt text-[var(--color-muted)]",
                                                        ].join(" ")}
                                                    >
                                                        {rankDisplay}
                                                    </div>
                                                </div>

                                                {/* Center Section (Username) */}
                                                <div
                                                    className={[
                                                        "min-w-0 flex-1 truncate text-center text-lg font-extrabold",
                                                        isCurrentUser ? "text-brand-blue" : "text-foreground",
                                                    ].join(" ")}
                                                >
                                                    {entry.username}
                                                </div>

                                                {/* Right Section (XP) */}
                                                <div
                                                    className={[
                                                        "w-[120px] shrink-0 text-right text-lg font-extrabold",
                                                        isCurrentUser ? "text-brand-blue" : "text-[var(--color-muted)]",
                                                    ].join(" ")}
                                                >
                                                    {entry.xp} XP
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right Content Spacer (to match TopBar and other pages) */}
                        <div className="hidden lg:block w-[300px] shrink-0 pt-4"></div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
