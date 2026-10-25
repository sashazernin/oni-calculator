import { rocketModules } from "../game-data/rocket";

export type ClassicResearchSightseeingKind = "research" | "sightseeing";

export const CLASSIC_RESEARCH_SIGHTSEEING_KIND_ORDER: readonly ClassicResearchSightseeingKind[] =
  ["research", "sightseeing"];

export const CLASSIC_RS_STACK_MODULE_KEYS: Record<
  ClassicResearchSightseeingKind,
  string
> = {
  research: "classicResearchModule",
  sightseeing: "classicSightseeingModule",
};

export const CLASSIC_RS_UID_PREFIX = "classic:rs:";

const KIND_SET = new Set<string>(CLASSIC_RESEARCH_SIGHTSEEING_KIND_ORDER);

export function isClassicResearchSightseeingKind(
  raw: unknown,
): raw is ClassicResearchSightseeingKind {
  return typeof raw === "string" && KIND_SET.has(raw);
}

export function classicResearchSightseeingKindImage(
  kind: ClassicResearchSightseeingKind,
): string {
  const key = CLASSIC_RS_STACK_MODULE_KEYS[kind];
  if (key === "classicResearchModule") {
    return rocketModules.classicResearchModule.image;
  }
  return rocketModules.classicSightseeingModule.image;
}

export function normalizeResearchSightseeingKinds(
  moduleCount: number,
  kinds: readonly ClassicResearchSightseeingKind[] | undefined,
): ClassicResearchSightseeingKind[] {
  const n = Math.max(0, Math.min(99, Math.floor(moduleCount)));
  const out: ClassicResearchSightseeingKind[] = [];
  for (let i = 0; i < n; i++) {
    const k = kinds?.[i];
    out.push(isClassicResearchSightseeingKind(k) ? k : "research");
  }
  return out;
}

export function parseResearchSightseeingKinds(
  raw: unknown,
  moduleCount: number,
): ClassicResearchSightseeingKind[] {
  if (!Array.isArray(raw)) {
    return normalizeResearchSightseeingKinds(moduleCount, undefined);
  }
  const parsed: ClassicResearchSightseeingKind[] = [];
  for (const item of raw) {
    if (isClassicResearchSightseeingKind(item)) parsed.push(item);
  }
  return normalizeResearchSightseeingKinds(moduleCount, parsed);
}

export function classicResearchSightseeingSlotIndexFromUid(
  uid: string,
): number | null {
  if (!uid.startsWith(CLASSIC_RS_UID_PREFIX)) return null;
  const tail = uid.slice(CLASSIC_RS_UID_PREFIX.length);
  const idx = Number.parseInt(tail, 10);
  return Number.isFinite(idx) && idx >= 0 ? idx : null;
}
