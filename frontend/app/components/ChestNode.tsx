"use client";

import { useState } from "react";
import { Gift, Check, Lock, Loader2 } from "lucide-react";
import { API_BASE, useAuth } from "../context/AuthContext";

export type ChestState = "locked" | "available" | "claimed";

interface ChestNodeProps {
    chestIndex: number;
    initialState: ChestState;
}

export default function ChestNode({ chestIndex, initialState }: ChestNodeProps) {
    const { user, login } = useAuth();
    const [state, setState] = useState<ChestState>(initialState);
    const [isClaiming, setIsClaiming] = useState(false);

    const isLocked = state === "locked";
    const isAvailable = state === "available";
    const isClaimed = state === "claimed";

    // Chest colors 
    const fill = isLocked
        ? "var(--color-disabled)"
        : isClaimed
            ? "var(--color-brand-gray)"
            : "var(--color-brand-yellow)";
    const bottomBorder = isLocked
        ? "var(--color-brand-gray)"
        : isClaimed
            ? "var(--color-border)"
            : "var(--color-brand-yellow-dark)";
    const iconColor = isLocked
        ? "var(--color-muted)"
        : isClaimed
            ? "var(--color-muted)"
            : "var(--color-foreground)";

    const buttonStyle = {
        "--skill-node-color": fill,
        "--skill-node-border": bottomBorder,
        "--skill-node-ring": fill,
        color: iconColor,
        backgroundColor: fill,
        borderColor: fill,
        borderBottomColor: bottomBorder,
    } as React.CSSProperties;

    const buttonClassName = [
        "relative flex size-[72px] shrink-0 items-center justify-center rounded-2xl border-2 font-extrabold cursor-pointer transition-transform ease-snappy",
        isLocked || isClaimed || isClaiming
            ? "cursor-not-allowed"
            : "btn-tactile cursor-pointer border-b-4",
        isAvailable ? "skill-node-pulse" : "",
    ]
        .filter(Boolean)
        .join(" ");

    const handleClaim = async () => {
        if (!isAvailable || isClaiming || !user) return;
        setIsClaiming(true);

        try {
            const response = await fetch(`${API_BASE}/chests/${chestIndex}/claim`, {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to claim chest");
            }

            const data = await response.json();

            // Update UI 
            setState("claimed");

            // Instantly update top bar XP
            if (data.total_xp !== undefined && user) {
                login({ ...user, xp: data.total_xp });
            }

        } catch (err) {
            console.error(err);
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <button
                type="button"
                aria-label={`Treasure Chest ${chestIndex}`}
                aria-disabled={isLocked || isClaimed || isClaiming}
                disabled={isLocked || isClaimed || isClaiming}
                className={buttonClassName}
                style={buttonStyle}
                onClick={handleClaim}
            >
                {isClaiming ? (
                    <Loader2 className="size-8 animate-spin" />
                ) : isLocked ? (
                    <Lock aria-hidden="true" className="size-8 stroke-[3]" />
                ) : isClaimed ? (
                    <Check aria-hidden="true" className="size-8 stroke-[3.5]" />
                ) : (
                    <Gift aria-hidden="true" className="size-8 stroke-[2.5]" />
                )}
            </button>
        </div>
    );
}
