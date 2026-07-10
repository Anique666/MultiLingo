"use client";

import type { CSSProperties } from "react";
import { Check, Crown, Lock, Star } from "lucide-react";

export type SkillStatus = "locked" | "available" | "completed";

export type UnitColor = "green" | "blue" | "yellow" | "gray";

type ColorTokens = {
  base: string;
  dark: string;
  text: string;
};

export type SkillNodeProps = {
  skillId: number | string;
  title: string;
  status: SkillStatus;
  color: UnitColor | string;
  progress: number;
  onSelect?: (skillId: number | string) => void;
};

export const UNIT_COLOR_TOKENS: Record<UnitColor, ColorTokens> = {
  green: {
    base: "var(--color-brand-green)",
    dark: "var(--color-brand-green-dark)",
    text: "var(--color-surface)",
  },
  blue: {
    base: "var(--color-brand-blue)",
    dark: "var(--color-brand-blue-dark)",
    text: "var(--color-surface)",
  },
  yellow: {
    base: "var(--color-brand-yellow)",
    dark: "var(--color-brand-yellow-dark)",
    text: "var(--color-foreground)",
  },
  gray: {
    base: "var(--color-brand-gray)",
    dark: "var(--color-disabled)",
    text: "var(--color-muted)",
  },
};

export function getUnitColorTokens(color: UnitColor | string): ColorTokens {
  const normalized = color.toLowerCase();

  if (normalized.includes("blue")) {
    return UNIT_COLOR_TOKENS.blue;
  }

  if (normalized.includes("yellow")) {
    return UNIT_COLOR_TOKENS.yellow;
  }

  if (normalized.includes("gray") || normalized.includes("grey")) {
    return UNIT_COLOR_TOKENS.gray;
  }

  return UNIT_COLOR_TOKENS.green;
}

export default function SkillNode({
  skillId,
  title,
  status,
  color,
  progress,
  onSelect,
}: SkillNodeProps) {
  const isLocked = status === "locked";
  const isAvailable = status === "available";
  const isCompleted = status === "completed";
  const hasCrown = isCompleted && progress === 1;
  const unitTokens = getUnitColorTokens(color);
  const fill = isLocked
    ? "var(--color-disabled)"
    : isCompleted
      ? "var(--color-brand-yellow)"
      : unitTokens.base;
  const bottomBorder = isLocked
    ? "var(--color-brand-gray)"
    : isCompleted
      ? "var(--color-brand-yellow-dark)"
      : unitTokens.dark;
  const iconColor = isLocked
    ? "var(--color-muted)"
    : isCompleted || unitTokens.text === "var(--color-surface)"
      ? "var(--color-surface)"
      : "var(--color-foreground)";

  const buttonStyle = {
    "--skill-node-color": fill,
    "--skill-node-border": bottomBorder,
    "--skill-node-ring": fill,
    color: iconColor,
    backgroundColor: fill,
    borderColor: fill,
    borderBottomColor: bottomBorder,
  } as CSSProperties;

  const buttonClassName = [
    "relative flex size-[72px] shrink-0 items-center justify-center rounded-full border-2 font-extrabold",
    isLocked
      ? "cursor-not-allowed"
      : "btn-tactile cursor-default border-b-4",
    isAvailable ? "skill-node-pulse cursor-pointer" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (isAvailable) {
      onSelect?.(skillId);
    }
  };

  return (
    <div className="flex w-32 flex-col items-center gap-2">
      <button
        type="button"
        aria-label={isAvailable ? `Start ${title}` : title}
        aria-disabled={!isAvailable}
        disabled={isLocked}
        tabIndex={isAvailable ? 0 : -1}
        className={buttonClassName}
        style={buttonStyle}
        onClick={handleClick}
      >
        {isLocked ? (
          <Lock aria-hidden="true" className="size-8 stroke-[3]" />
        ) : isCompleted ? (
          <Check aria-hidden="true" className="size-9 stroke-[3.5]" />
        ) : (
          <Star
            aria-hidden="true"
            className="size-9 fill-current stroke-[3]"
          />
        )}

        {hasCrown ? (
          <Crown
            aria-hidden="true"
            className="absolute -right-1 -top-3 size-7 fill-current stroke-[3]"
            style={{ color: "var(--color-brand-yellow)" }}
          />
        ) : null}
      </button>

      <p className="text-caption max-w-32 text-center font-extrabold leading-tight text-[var(--color-muted)]">
        {title}
      </p>
    </div>
  );
}
