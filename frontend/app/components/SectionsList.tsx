"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Lock, Trophy } from "lucide-react";
import OwlMascot from "./OwlMascot";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "@/app/lib/api";

export default function SectionsList() {
    const { user } = useAuth();
    const [progress, setProgress] = useState({ completed: 0, total: 10 });

    useEffect(() => {
        if (!user) return;
        let isMounted = true;
        async function fetchTree() {
            try {
                const response = await fetch(`${API_BASE}/skills/tree`, {
                    credentials: "include",
                });
                if (!response.ok) return;
                const data = await response.json();
                if (!isMounted || !Array.isArray(data)) return;

                let completed = 0;
                let total = 0;

                data.forEach((unit: any) => {
                    if (Array.isArray(unit.skills)) {
                        unit.skills.forEach((skill: any) => {
                            total++;
                            if (skill.is_completed || skill.status === "completed") {
                                completed++;
                            }
                        });
                    }
                });

                // Prevent div by zero
                if (total === 0) total = 24;

                setProgress({ completed, total });
            } catch (err) { }
        }
        fetchTree();
        return () => {
            isMounted = false;
        };
    }, [user]);

    const percentage = Math.round((progress.completed / progress.total) * 100);

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-10">
            {/* Back Link */}
            <Link
                href="/sections"
                className="mb-2 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted transition-colors hover:text-foreground"
            >
                <ChevronLeft className="size-5" />
                Back
            </Link>

            {/* Section 1 Card */}
            <div className="relative flex min-h-[220px] flex-col gap-4 rounded-[24px] bg-brand-blue-bg p-6 text-foreground shadow-sm">
                <div className="z-10 flex w-full items-start justify-between">
                    <div className="flex flex-1 flex-col gap-2">
                        <span className="text-[13px] font-black uppercase tracking-[0.1em] text-brand-blue">
                            A1 • SEE DETAILS
                        </span>
                        <h1 className="text-[28px] font-black leading-tight tracking-tight">
                            Section 1
                        </h1>

                        {/* Progress bar */}
                        <div className="mt-2 flex w-full max-w-[200px] items-center gap-3">
                            <div className="relative h-4 flex-1 shrink-0 overflow-hidden rounded-full bg-surface-alt">
                                <div
                                    className="ease-snappy h-full rounded-full bg-brand-green transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                                {percentage > 0 && percentage < 100 && (
                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm">
                                        {percentage}%
                                    </span>
                                )}
                            </div>
                            <Trophy className="size-6 shrink-0 text-brand-green" />
                        </div>
                    </div>

                    {/* Right Side Illustration */}
                    <div className="relative ml-4 flex w-[140px] shrink-0 items-end justify-end pt-[30px]">
                        {/* Speech Bubble */}
                        <div className="absolute right-[40px] top-[-10px] z-20 whitespace-nowrap rounded-2xl bg-surface px-4 py-3 text-[15px] font-bold text-foreground shadow-sm">
                            ¡Hola!
                            {/* SVG pointer triangle */}
                            <div className="absolute bottom-[-5px] right-[24px] h-3 w-3 rotate-45 transform bg-surface" />
                        </div>
                        <OwlMascot className="relative z-10 size-[110px] drop-shadow-md" />
                    </div>
                </div>

                {/* Action Button */}
                <div className="z-10 mt-4 w-[200px]">
                    <Link
                        href="/learn"
                        className="btn-tactile flex h-12 w-full items-center justify-center border-brand-blue-dark bg-brand-blue text-[15px] font-black uppercase tracking-widest text-white shadow-sm hover:brightness-105"
                    >
                        CONTINUE
                    </Link>
                </div>
            </div>

            {/* Section 2 Card (Locked) */}
            <div className="relative flex min-h-[220px] flex-col gap-4 rounded-[24px] border-2 border-border bg-surface p-6 text-foreground opacity-90 shadow-sm">
                <div className="z-10 flex w-full items-start justify-between">
                    <div className="flex flex-1 flex-col gap-2">
                        <span className="text-[13px] font-black uppercase tracking-[0.1em] text-muted">
                            A2 • SEE DETAILS
                        </span>
                        <h1 className="text-[28px] font-black leading-tight tracking-tight text-foreground/80">
                            Section 2
                        </h1>

                        {/* Locking text */}
                        <div className="mt-2 flex items-center gap-1.5 text-[14px] font-bold text-muted">
                            <Lock className="size-4" />
                            24 UNITS
                        </div>
                    </div>

                    {/* Right Side Illustration */}
                    <div className="relative ml-4 flex w-[160px] shrink-0 items-end justify-end pt-[30px]">
                        <div className="absolute right-[40px] top-[-20px] z-20 whitespace-nowrap rounded-2xl border-2 border-border bg-surface px-4 py-3 text-[13px] font-bold text-muted shadow-sm">
                            Quiero aprender español.
                            <div className="absolute bottom-[-6px] right-[24px] h-3 w-3 rotate-45 transform border-b-2 border-r-2 border-border bg-surface" />
                        </div>
                        <OwlMascot className="relative z-10 size-[110px] opacity-80 drop-shadow-sm" />
                    </div>
                </div>

                {/* Action Button */}
                <div className="z-10 mt-4 w-[240px]">
                    <button
                        disabled
                        className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-xl border-2 border-border bg-surface-alt text-[15px] font-black uppercase tracking-widest text-muted"
                    >
                        JUMP TO SECTION 2
                    </button>
                </div>
            </div>
        </div>
    );
}
