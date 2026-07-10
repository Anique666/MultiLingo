"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import OwlMascot from "./components/OwlMascot";

/* ─── Language items for bottom bar ─── */
const LANGUAGES = [
  { flag: "🇬🇧", label: "ENGLISH" },
  { flag: "🇪🇸", label: "SPANISH" },
  { flag: "🇫🇷", label: "FRENCH" },
  { flag: "🇩🇪", label: "GERMAN" },
  { flag: "🇮🇹", label: "ITALIAN" },
  { flag: "🇧🇷", label: "PORTUGUESE" },
  { flag: "➕", label: "MATH" },
  { flag: "♟️", label: "CHESS" },
] as const;

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/sections");
    }
  }, [isLoading, user, router]);

  const scrollBy = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -160 : 160,
      behavior: "smooth",
    });
  };

  /* While checking auth, show nothing */
  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <OwlMascot className="size-20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ───── TOP BAR ───── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5 md:px-10">
        {/* Wordmark */}
        <div className="flex items-center gap-2">
          <OwlMascot className="size-10 drop-shadow-md" />
          <span className="text-2xl font-black tracking-tight text-brand-green select-none">
            multilingo
          </span>
        </div>

        {/* Site language (static) */}
        <button
          type="button"
          className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest text-muted transition hover:bg-surface-alt"
          aria-label="Site language"
        >
          <span>Site Language: English</span>
          <ChevronDown className="size-4" />
        </button>
      </header>

      {/* ───── HERO ───── */}
      <main className="flex flex-1 items-center justify-center px-6 py-12 md:py-0">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
          {/* Left — Phone mock-up */}
          <div className="flex items-center justify-center">
            <div
              className="relative flex h-[420px] w-[240px] items-center justify-center rounded-[2.5rem] border-4 border-brand-green/30 bg-brand-green/8 shadow-xl"
              style={{ transform: "rotate(-8deg)" }}
            >
              {/* Screen inner area */}
              <div className="absolute inset-3 rounded-[2rem] bg-brand-green/5" />
              {/* Notch */}
              <div className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-brand-green/15" />
              {/* Mascot centered */}
              <OwlMascot className="relative z-10 size-28 drop-shadow-xl" />
              {/* Decorative lines */}
              <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 flex-col gap-2">
                <div className="h-2 w-24 rounded-full bg-brand-green/15" />
                <div className="h-2 w-16 rounded-full bg-brand-green/10" />
              </div>
            </div>
          </div>

          {/* Right — Copy + CTA */}
          <div className="flex flex-col items-center gap-8 text-center lg:items-start lg:text-left">
            <h1
              className="text-4xl font-black leading-tight tracking-tight text-foreground md:text-5xl lg:text-[3.2rem]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              The free, fun, and effective way to learn a language!
            </h1>

            <Link
              href="/signup"
              className="btn-tactile inline-flex h-14 w-full max-w-sm items-center justify-center rounded-2xl border-b-4 border-brand-green-dark bg-brand-green text-lg font-black uppercase tracking-wider text-white shadow-md transition-all hover:brightness-105 active:translate-y-1 active:border-b-0 active:shadow-none"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>

      {/* ───── BOTTOM LANGUAGE BAR ───── */}
      <footer className="shrink-0 border-t border-border bg-surface-alt">
        <div className="mx-auto flex max-w-5xl items-center px-2 py-3">
          {/* Left arrow */}
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy("left")}
            className="shrink-0 rounded-lg p-1 text-muted transition hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Scrollable language chips — hidden scrollbar */}
          <div
            ref={scrollRef}
            className="scrollbar-hide flex flex-1 gap-3 overflow-x-auto px-2"
          >
            {LANGUAGES.map(({ flag, label }) => (
              <div
                key={label}
                className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold uppercase tracking-wide text-foreground/80 transition hover:bg-white"
              >
                <span className="text-xl leading-none">{flag}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy("right")}
            className="shrink-0 rounded-lg p-1 text-muted transition hover:text-foreground"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
