"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ChestNode, { type ChestState } from "./ChestNode";
import SkillNode, {
  getUnitColorTokens,
  type SkillStatus,
  type UnitColor,
} from "./SkillNode";
import { API_BASE } from "@/app/lib/api";

export type HomeTreeSkill = {
  skill_id: number | string;
  title: string;
  status: SkillStatus;
  progress: number;
  globalIndex?: number;
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
const NODE_VERTICAL_STEP = 160;
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

function assignGlobalIndex(units: HomeTreeUnit[]): HomeTreeUnit[] {
  let globalIndex = 0;
  return units.map(unit => ({
    ...unit,
    skills: unit.skills.map(skill => {
      globalIndex++;
      return { ...skill, globalIndex };
    })
  }));
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
      className="mb-10 flex items-center justify-between rounded-full px-[var(--spacing-section)] py-[var(--spacing-card)] text-[var(--color-surface)]"
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
  chestMap,
}: {
  unit: HomeTreeUnit;
  unitIndex: number;
  onSelect: (skillId: number | string) => void;
  chestMap?: Record<number, ChestState>;
}) {
  const pathItems: Array<{ type: "skill", data: HomeTreeSkill } | { type: "chest", chestIndex: number }> = [];

  unit.skills.forEach((skill, index) => {
    pathItems.push({ type: "skill", data: skill });
    if (index === 1) {
      pathItems.push({ type: "chest", chestIndex: unitIndex + 1 });
    }
  });

  const milestoneIndex = Math.max(
    0,
    pathItems.findIndex((item) => {
      if (item.type === "skill") return item.data.status === "available";
      if (item.type === "chest" && chestMap) return chestMap[item.chestIndex] === "available";
      return false;
    }),
  );

  const mascotOffset = getZigzagOffset(milestoneIndex, pathItems.length);

  return (
    <section className="pb-12">
      <UnitBanner unit={unit} unitNumber={unitIndex + 1} />

      <div className="relative mx-auto w-full max-w-sm overflow-visible px-8">
        {pathItems.length > 0 ? (
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
          {pathItems.map((item, index) => (
            <div
              key={item.type === "skill" ? `skill-${item.data.skill_id}` : `chest-${item.chestIndex}`}
              className="flex w-full justify-center transition-transform duration-normal ease-snappy"
              style={{
                transform: `translateX(${getZigzagOffset(
                  index,
                  pathItems.length,
                )}px)`,
              }}
            >
              {item.type === "skill" ? (
                <SkillNode
                  skillId={item.data.skill_id}
                  title={item.data.title}
                  status={item.data.status}
                  color={unit.color}
                  progress={item.data.progress}
                  onSelect={onSelect}
                />
              ) : (
                <ChestNode
                  chestIndex={item.chestIndex}
                  initialState={chestMap?.[item.chestIndex] || "locked"}
                />
              )}
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
  const [chestMap, setChestMap] = useState<Record<number, ChestState>>({});

  const renderedUnits = useMemo(() => {
    const unitsData = units ? units.map((unit) => ({
      ...unit,
      skills: enforceSingleAvailableSkill(unit.skills),
    })) : fetchedUnits;

    return assignGlobalIndex(unitsData);
  }, [fetchedUnits, units]);

  useEffect(() => {
    if (units) {
      return;
    }

    let isMounted = true;

    async function fetchSkillTree() {
      try {
        if (!user) return;
        const [skillsRes, chestsRes] = await Promise.all([
          fetch(`${API_BASE}/skills/tree`, { credentials: "include" }),
          fetch(`${API_BASE}/chests`, { credentials: "include" })
        ]);

        if (skillsRes.ok) {
          const data = await skillsRes.json();
          if (isMounted) {
            setFetchedUnits(normalizeTreeData(data));
          }
        }

        if (chestsRes.ok) {
          const chestData = await chestsRes.json();
          if (isMounted) {
            const map: Record<number, ChestState> = {};
            chestData.forEach((c: { chest_index: number; state: ChestState }) => {
              map[c.chest_index] = c.state;
            });
            setChestMap(map);
          }
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
    <div className="mx-auto w-full max-w-2xl px-4 pb-10">
      {renderedUnits.map((unit, index) => (
        <div key={unit.unit_id}>
          <UnitPath unit={unit} unitIndex={index} onSelect={handleSelect} chestMap={chestMap} />

          {index < renderedUnits.length - 1 ? (
            <div className="mx-auto mb-12 w-full max-w-sm border-t-2 border-dashed border-brand-gray" />
          ) : null}
        </div>
      ))}
      {renderedUnits.length > 0 && (
        <div className="mx-auto mt-8 flex w-full max-w-sm flex-col items-center justify-center rounded-[24px] border-2 border-border bg-surface-alt py-8 text-center shadow-sm">
          <Star className="mb-3 size-8 text-brand-gray" />
          <h3 className="text-xl font-black uppercase text-muted tracking-wide">Coming soon</h3>
          <p className="mt-1 text-sm font-bold text-muted/80">More units are on the way!</p>
        </div>
      )}
    </div>
  );
}
