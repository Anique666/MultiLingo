"use client";

import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth, API_BASE } from "../context/AuthContext";
import { Flame, Zap, Shield, Medal, Lock, Search, UserPlus, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "../context/ThemeContext";

export default function ProfilePage() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showResetModal, setShowResetModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!user) return null;

    // Formatting date safely, fallbacks to a placeholder if not set
    const joinedDate = user.created_at ? new Date(user.created_at) : new Date();
    const joinedStr = joinedDate.toLocaleString("default", { month: "long", year: "numeric" });

    // Derive display name from username or email if no display name is defined in User model. We have username.
    const displayName = user.username;
    const userHandle = user.email ? user.email.split("@")[0] : user.username;

    const handleReset = async () => {
        setIsResetting(true);
        try {
            const res = await fetch(`${API_BASE}/users/reset`, {
                method: "POST",
                credentials: "include"
            });
            if (res.ok) {
                window.location.reload();
            }
        } catch (e) {
            console.error("Failed to reset progress", e);
        } finally {
            setIsResetting(false);
            setShowResetModal(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                <TopBar />
                <Sidebar />
                <main className="w-full pb-10 pt-24 lg:pl-[16rem]">
                    <div className="mx-auto flex w-full max-w-5xl gap-8 px-4 sm:px-6 lg:px-8 items-start">
                        {/* CENTER CONTENT */}
                        <div className="min-w-0 flex-1 space-y-8 pb-12">
                            {/* Header Block */}
                            <div className="space-y-4">
                                <div className="h-48 rounded-[1.5rem] bg-brand-blue-bg relative flex items-center justify-center border-2 border-border overflow-hidden">
                                    <div className="w-32 h-32 rounded-full border-4 border-white/50 border-dashed bg-white/20 flex items-center justify-center shadow-sm relative overflow-hidden">
                                        <div className="text-white/40 text-[5rem] mb-4">👤</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-[2rem] font-bold text-foreground leading-tight">{displayName}</h1>
                                        <p className="text-[1rem] text-[var(--color-muted)]">{userHandle}</p>
                                        <p className="text-[1rem] text-[var(--color-muted)] mt-2">Joined {joinedStr}</p>
                                        <div className="flex gap-4 mt-2 text-sm font-bold opacity-80">
                                            <span>0 Following</span>
                                            <span>0 Followers</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 mt-2 shrink-0">
                                        <div className="w-10 h-8 rounded overflow-hidden border-2 border-border">
                                            {/* A placeholder for the Flag icon */}
                                            <div className="w-full h-full bg-gradient-to-b from-black via-red-500 to-yellow-500"></div>
                                        </div>
                                        {mounted && (
                                            <button
                                                onClick={toggleTheme}
                                                className="p-2 rounded-xl border-2 border-border text-muted hover:bg-surface-alt transition-colors"
                                                aria-label="Toggle Dark Mode"
                                            >
                                                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-t-2 border-border" />

                            {/* Statistics Block */}
                            <section>
                                <h2 className="text-2xl font-bold mb-4">Statistics</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex bg-surface border-2 border-border rounded-[1rem] p-4 gap-4 items-center">
                                        <Flame className="text-brand-yellow-dark shrink-0" size={32} />
                                        <div>
                                            <div className="font-bold text-lg">{user.streak}</div>
                                            <div className="text-[var(--color-muted)] text-sm">Day streak</div>
                                        </div>
                                    </div>
                                    <div className="flex bg-surface border-2 border-border rounded-[1rem] p-4 gap-4 items-center">
                                        <Zap className="text-brand-yellow shrink-0" size={32} />
                                        <div>
                                            <div className="font-bold text-lg">{user.xp}</div>
                                            <div className="text-[var(--color-muted)] text-sm">Total XP</div>
                                        </div>
                                    </div>
                                    <div className="flex bg-surface border-2 border-border rounded-[1rem] p-4 gap-4 items-center">
                                        <Shield className="text-[#a57164] shrink-0 fill-current" size={32} />
                                        <div>
                                            <div className="font-bold text-lg">Bronze</div>
                                            <div className="text-[var(--color-muted)] text-sm">Current league</div>
                                        </div>
                                    </div>
                                    <div className="flex bg-surface border-2 border-border rounded-[1rem] p-4 gap-4 items-center opacity-70">
                                        <Medal className="text-muted shrink-0 fill-[var(--color-disabled)]" size={32} />
                                        <div>
                                            <div className="font-bold text-lg">0</div>
                                            <div className="text-[var(--color-muted)] text-sm">Top 3 finishes</div>
                                            {/* (Placeholder because league rotation isn't implemented in this build) */}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-t-2 border-border" />

                            {/* Achievements Block */}
                            <section className="relative">
                                <div className="flex justify-between items-end mb-4">
                                    <h2 className="text-2xl font-bold">Achievements</h2>
                                    <span className="text-[var(--color-muted)] text-sm font-bold tracking-widest cursor-not-allowed">VIEW ALL</span>
                                </div>

                                <div className="relative border-2 border-border rounded-2xl overflow-hidden bg-surface">
                                    {/* Mock Content over Blur */}
                                    <div className="blur-[3px] opacity-60">
                                        {/* Wildfire */}
                                        <div className="flex items-center gap-4 p-6 border-b-2 border-border">
                                            <div className="w-16 h-20 bg-brand-red-dark flex items-center justify-center rounded-xl relative">
                                                <div className="absolute top-2 w-full text-center text-white font-black text-xs uppercase tracking-widest">Level 1</div>
                                                <Flame size={40} className="text-white fill-current mt-4" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between text-lg font-bold">
                                                    <span>Wildfire</span>
                                                    <span className="text-[var(--color-muted)]">2/3</span>
                                                </div>
                                                <div className="h-4 bg-[var(--color-disabled)] rounded-full overflow-hidden w-full">
                                                    <div className="h-full bg-brand-yellow w-2/3 rounded-full"></div>
                                                </div>
                                                <div className="text-[var(--color-muted)]">Reach a 3 day streak</div>
                                            </div>
                                        </div>

                                        {/* Sage */}
                                        <div className="flex items-center gap-4 p-6 border-b-2 border-border">
                                            <div className="w-16 h-20 bg-brand-green-dark flex items-center justify-center rounded-xl relative">
                                                <div className="absolute top-2 w-full text-center text-white font-black text-xs uppercase tracking-widest">Level 3</div>
                                                <div className="mt-4 text-3xl">🧙</div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between text-lg font-bold">
                                                    <span>Sage</span>
                                                    <span className="text-[var(--color-muted)]">400/500</span>
                                                </div>
                                                <div className="h-4 bg-[var(--color-disabled)] rounded-full overflow-hidden w-full">
                                                    <div className="h-full bg-brand-yellow w-[80%] rounded-full"></div>
                                                </div>
                                                <div className="text-[var(--color-muted)]">Earn 500 XP</div>
                                            </div>
                                        </div>

                                        {/* Champion */}
                                        <div className="flex items-center gap-4 p-6">
                                            <div className="w-16 h-20 bg-brand-purple flex items-center justify-center rounded-xl relative">
                                                <div className="absolute top-2 w-full text-center text-white font-black text-xs uppercase tracking-widest">Level 2</div>
                                                <Shield size={40} className="text-white fill-current mt-4" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between text-lg font-bold">
                                                    <span>Champion</span>
                                                    <span className="text-[var(--color-muted)]">1/2</span>
                                                </div>
                                                <div className="h-4 bg-[var(--color-disabled)] rounded-full overflow-hidden w-full">
                                                    <div className="h-full bg-brand-yellow w-1/2 rounded-full"></div>
                                                </div>
                                                <div className="text-[var(--color-muted)]">Advance to the Silver League</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lock Overlay */}
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                                        <div className="bg-surface/80 p-6 rounded-2xl text-center shadow-modal backdrop-blur-sm border-2 border-border">
                                            <Lock size={48} className="text-brand-gray mx-auto mb-4" />
                                            <p className="text-xl font-bold">Achievements coming soon</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="hidden lg:block lg:pr-0 w-[300px] shrink-0 pt-4">
                            <div className="border-2 border-border rounded-[1rem] bg-surface overflow-hidden relative">
                                <div className="p-4 border-b-2 border-border font-bold">
                                    Add friends
                                </div>
                                <div className="opacity-50">
                                    <div className="p-4 border-b-2 border-border flex items-center justify-between cursor-not-allowed">
                                        <div className="flex items-center gap-4">
                                            <Search className="text-[var(--color-muted)]" size={24} />
                                            <span className="text-[var(--color-muted)] font-bold">Find friends</span>
                                        </div>
                                        <span className="text-[var(--color-muted)]">&gt;</span>
                                    </div>
                                    <div className="p-4 flex items-center justify-between cursor-not-allowed">
                                        <div className="flex items-center gap-4">
                                            <UserPlus className="text-brand-green" size={24} />
                                            <span className="text-[var(--color-muted)] font-bold">Invite friends</span>
                                        </div>
                                        <span className="text-[var(--color-muted)]">&gt;</span>
                                    </div>
                                </div>

                                {/* Coming Soon overlay */}
                                <div className="absolute inset-0 flex items-center justify-center top-14 bg-surface/40 backdrop-blur-[1px]">
                                    <span className="bg-surface border-2 border-border px-4 py-1 rounded-full text-sm font-bold text-[var(--color-muted)]">
                                        Coming Soon
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Reset Output Bottom Right */}
                <button
                    className="fixed bottom-6 right-6 text-brand-red font-bold text-sm bg-surface py-3 px-4 rounded-xl border-2 border-brand-red shadow-card hover:bg-brand-red-light active:translate-y-1 transition-all z-50 uppercase"
                    onClick={() => setShowResetModal(true)}
                >
                    Reset Progress
                </button>

                {/* Reset Modal */}
                {showResetModal && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                        <div className="bg-surface rounded-2xl border-2 border-border p-6 max-w-md w-full shadow-modal space-y-4">
                            <h2 className="text-xl font-bold">Reset Progress</h2>
                            <p className="text-[var(--color-muted)] font-bold">
                                Are you sure you want to reset all your progress? This is present purely for development and testing purposes.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <button
                                    className="flex-1 rounded-xl font-black uppercase py-3 border-2 border-border text-[var(--color-muted)] hover:bg-surface-alt active:translate-y-1 transition-all"
                                    onClick={() => setShowResetModal(false)}
                                    disabled={isResetting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 rounded-xl font-black uppercase py-3 border-b-4 border-brand-red-dark bg-brand-red text-white hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50"
                                    onClick={handleReset}
                                    disabled={isResetting}
                                >
                                    {isResetting ? "Resetting..." : "Okay"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
