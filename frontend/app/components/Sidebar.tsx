"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  Dumbbell,
  Gift,
  House,
  MoreHorizontal,
  Store,
  Trophy,
  UserRound,
  LogOut,
} from "lucide-react";
import OwlMascot from "./OwlMascot";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { label: "LEARN", icon: House, active: true },
  { label: "PRACTICE", icon: Dumbbell, active: false },
  { label: "LEADERBOARDS", icon: Trophy, active: false },
  { label: "QUESTS", icon: Gift, active: false },
  { label: "SHOP", icon: Store, active: false },
  { label: "PROFILE", icon: UserRound, active: false },
  { label: "LOGOUT", icon: LogOut, active: false },
] as const;

export default function Sidebar() {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-full flex-col border-r-2 border-border bg-white px-4 lg:flex lg:w-[16rem] z-50">
      {/* Brand / Logo Area */}
      <div className="mb-8 flex items-center gap-3 px-4 pt-4">
        <OwlMascot className="size-8" />
        <span className="text-[26px] font-black tracking-tighter text-[#58cc02]">
          duolingo
        </span>
      </div>

      <nav aria-label="Primary" className="space-y-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.label === "LEARN" ? pathname === "/sections" || pathname === "/learn" : item.label === "LEADERBOARDS" ? pathname === "/leaderboard" : item.label === "PROFILE" ? pathname === "/profile" : item.label === "PRACTICE" ? pathname === "/practice" : item.active;

          return (
            <button
              key={item.label}
              type="button"
              onClick={
                item.label === "LOGOUT"
                  ? logout
                  : item.label === "LEARN"
                    ? () => router.push("/sections")
                    : item.label === "LEADERBOARDS"
                      ? () => router.push("/leaderboard")
                      : item.label === "PROFILE"
                        ? () => router.push("/profile")
                        : item.label === "PRACTICE"
                          ? () => router.push("/practice")
                          : undefined
              }
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex h-14 w-full items-center gap-4 rounded-2xl border-2 px-4 text-left text-[0.92rem] font-black uppercase tracking-[0.12em] transition-colors",
                isActive
                  ? "border-brand-blue bg-brand-blue-bg text-brand-blue shadow-card"
                  : "border-transparent text-[var(--color-muted)] hover:bg-surface-alt",
              ].join(" ")}
            >
              <Icon
                aria-hidden="true"
                className={[
                  "size-6 shrink-0",
                  item.label === "LEARN"
                    ? "text-brand-blue"
                    : item.label === "PRACTICE"
                      ? "text-brand-blue"
                      : item.label === "LEADERBOARDS"
                        ? "text-brand-yellow"
                        : item.label === "QUESTS"
                          ? "text-brand-yellow-dark"
                          : item.label === "SHOP"
                            ? "text-brand-red"
                            : item.label === "PROFILE"
                              ? "text-brand-purple"
                              : "text-[var(--color-muted)]",
                ].join(" ")}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}