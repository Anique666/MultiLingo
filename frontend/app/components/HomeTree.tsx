"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SkillNode, {
  getUnitColorTokens,
  type SkillStatus,
  type UnitColor,
} from "./SkillNode";

export type HomeTreeSkill = {
  skill_id: number | string;
  title: string;
  status: SkillStatus;
  progress: number;
};

export type HomeTreeUnit = {
  unit_id: number | string;
  title: string;
  color: UnitColor | string;
  skills: HomeTreeSkill[];
};

type LegacySkill = {
  id: number;
  title: string;
  crowns?: number;
  is_completed?: boolean;
  is_locked?: boolean;
};

type LegacyUnit = {
  id: number;
  title: string;
  skills: LegacySkill[];
};

type HomeTreeProps = {
  units?: HomeTreeUnit[];
  onSelect?: (skillId: number | string) => void;
};

const FULL_WAVE_OFFSETS = [0, -60, -80, -60, 0, 60, 80, 60];
const NODE_VERTICAL_STEP = 132;
const SHORT_PATH_OFFSETS: Record<number, number[]> = {
  1: [0],
  2: [-44, 44],
  3: [0, -64, 64],
  4: [0, -64, 64, 0],
  5: [0, -56, -76, 0, 56],
  6: [0, -56, -76, 0, 56, 76],
  7: [0, -52, -76, -52, 0, 52, 76],
};

function getZigzagOffset(index: number, totalSkills: number) {
  if (totalSkills < FULL_WAVE_OFFSETS.length) {
    return SHORT_PATH_OFFSETS[totalSkills][index] ?? 0;
  }

  return FULL_WAVE_OFFSETS[index % FULL_WAVE_OFFSETS.length];
}

function enforceSingleAvailableSkill(skills: HomeTreeSkill[]) {
  let hasAvailableSkill = false;

  return skills.map((skill) => {
    if (skill.status !== "available") {
      return skill;
    }

    if (hasAvailableSkill) {
      return { ...skill, status: "locked" as const };
    }

    hasAvailableSkill = true;
    return skill;
  });
}

function isHomeTreeUnit(value: unknown): value is HomeTreeUnit {
  if (!value || typeof value !== "object") {
    return false;
  }

  const unit = value as Partial<HomeTreeUnit>;
  return "unit_id" in unit && Array.isArray(unit.skills);
}

function getLegacySkillStatus(skill: LegacySkill): SkillStatus {
  if (skill.is_completed) {
    return "completed";
  }

  if (skill.is_locked) {
    return "locked";
  }

  return "available";
}

function normalizeTreeData(data: unknown): HomeTreeUnit[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((unit, index) => {
    if (isHomeTreeUnit(unit)) {
      return {
        ...unit,
        color: unit.color || "green",
        skills: enforceSingleAvailableSkill(unit.skills),
      };
    }

    const legacyUnit = unit as LegacyUnit;

    return {
      unit_id: legacyUnit.id,
      title: legacyUnit.title,
      color: index % 2 === 0 ? "green" : "blue",
      skills: enforceSingleAvailableSkill(
        (legacyUnit.skills ?? []).map((skill) => ({
          skill_id: skill.id,
          title: skill.title,
          status: getLegacySkillStatus(skill),
          progress: skill.is_completed ? 1 : Math.min((skill.crowns ?? 0) / 5, 1),
        })),
      ),
    };
  });
}

function UnitBanner({
  unit,
  unitNumber,
}: {
  unit: HomeTreeUnit;
  unitNumber: number;
}) {
  const tokens = getUnitColorTokens(unit.color);

  return (
    <div
      className="mb-10 flex items-center justify-between rounded-full px-5 py-3 text-[var(--color-surface)]"
      style={{
        backgroundColor: tokens.base,
        borderBottom: `4px solid ${tokens.dark}`,
      }}
    >
      <div>
        <p className="text-caption font-extrabold uppercase leading-none opacity-90">
          Section 1, Unit {unitNumber}
        </p>
        <h2 className="text-base font-extrabold leading-tight sm:text-lg">
          {unit.title}
        </h2>
      </div>

      <span className="text-caption font-extrabold">
        {unit.skills.length} skills
      </span>
    </div>
  );
}

function UnitPath({
  unit,
  unitIndex,
  onSelect,
}: {
  unit: HomeTreeUnit;
  unitIndex: number;
  onSelect: (skillId: number | string) => void;
}) {
  const milestoneIndex = Math.max(
    0,
    unit.skills.findIndex((skill) => skill.status === "available"),
  );
  const mascotOffset = getZigzagOffset(milestoneIndex, unit.skills.length);

  return (
    <section className="pb-12">
      <UnitBanner unit={unit} unitNumber={unitIndex + 1} />

      <div className="relative mx-auto w-full max-w-sm overflow-visible px-8">
        {unit.skills.length > 0 ? (
          <Star
            aria-hidden="true"
            className="home-tree-mascot-float absolute z-10 size-9 fill-current stroke-[3] text-brand-yellow"
            style={{
              left: `calc(50% + ${mascotOffset + 72}px)`,
              top: `${milestoneIndex * NODE_VERTICAL_STEP + 8}px`,
            }}
          />
        ) : null}

        <div className="flex flex-col items-center gap-[18px] overflow-visible py-1">
          {unit.skills.map((skill, index) => (
            <div
              key={skill.skill_id}
              className="flex w-full justify-center transition-transform duration-normal ease-snappy"
              style={{
                transform: `translateX(${getZigzagOffset(
                  index,
                  unit.skills.length,
                )}px)`,
              }}
            >
              <SkillNode
                skillId={skill.skill_id}
                title={skill.title}
                status={skill.status}
                color={unit.color}
                progress={skill.progress}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomeTree({
  units,
  onSelect,
}: HomeTreeProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [fetchedUnits, setFetchedUnits] = useState<HomeTreeUnit[]>([]);
  const renderedUnits = useMemo(
    () => (units ? units.map((unit) => ({
      ...unit,
      skills: enforceSingleAvailableSkill(unit.skills),
    })) : fetchedUnits),
    [fetchedUnits, units],
  );

  useEffect(() => {
    if (units) {
      return;
    }

    let isMounted = true;

    async function fetchSkillTree() {
      try {
        if (!user) return;
        const response = await fetch(`http://localhost:8000/skills/tree`, {
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (isMounted) {
          setFetchedUnits(normalizeTreeData(data));
        }
      } catch {
        if (isMounted) {
          setFetchedUnits([]);
        }
      }
    }

    void fetchSkillTree();

    return () => {
      isMounted = false;
    };
  }, [units, user]);

  const handleSelect = (skillId: number | string) => {
    if (onSelect) {
      onSelect(skillId);
      return;
    }

    router.push(`/lesson/${skillId}`);
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-10 pt-24">
      {renderedUnits.map((unit, index) => (
        <div key={unit.unit_id}>
          <UnitPath unit={unit} unitIndex={index} onSelect={handleSelect} />

          {index < renderedUnits.length - 1 ? (
            <div className="mx-auto mb-12 w-full max-w-sm border-t-2 border-dashed border-brand-gray" />
          ) : null}
        </div>
      ))}
    </main>
  );
}
