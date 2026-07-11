import { Lock } from "lucide-react";

export default function DailyQuestsCard() {
    return (
        <aside className="w-full rounded-[var(--radius-card)] border-2 border-border bg-surface p-[var(--spacing-card)] shadow-card">
            <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-extrabold text-foreground">
                    Daily Quests
                </h2>
                <span className="cursor-not-allowed text-[13px] font-black uppercase tracking-wide text-[var(--color-muted)]">
                    VIEW ALL
                </span>
            </div>

            <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-surface-alt py-6 px-4">
                <Lock className="h-8 w-8 text-[var(--color-muted)]" />
                <p className="text-[15px] font-medium text-[var(--color-muted)]">
                    Coming Soon
                </p>
            </div>
        </aside>
    );
}
