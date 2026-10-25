import { rocketCargos } from "../game-data/rocket";

export type ClassicCargoBayKind = "solid" | "biological" | "gas" | "liquid";

export const CLASSIC_CARGO_BAY_KIND_ORDER: readonly ClassicCargoBayKind[] = [
  "solid",
  "biological",
  "gas",
  "liquid",
];

export const CLASSIC_CARGO_STACK_MODULE_KEYS: Record<
  ClassicCargoBayKind,
  string
> = {
  solid: "classicCargoBay",
  biological: "classicBiologicalCargoBay",
  gas: "largeGasCargoCanister",
  liquid: "largeLiquidCargoTank",
};

export const CLASSIC_CARGO_UID_PREFIX = "classic:cargo:";

const KIND_SET = new Set<string>(CLASSIC_CARGO_BAY_KIND_ORDER);

export function isClassicCargoBayKind(raw: unknown): raw is ClassicCargoBayKind {
  return typeof raw === "string" && KIND_SET.has(raw);
}

export function classicCargoBayKindImage(kind: ClassicCargoBayKind): string {
  const key = CLASSIC_CARGO_STACK_MODULE_KEYS[kind];
  if (key === "classicCargoBay") return rocketCargos.classicCargoBay.image;
  if (key === "classicBiologicalCargoBay") {
    return rocketCargos.classicBiologicalCargoBay.image;
  }
  if (key === "largeGasCargoCanister") {
    return rocketCargos.largeGasCargoCanister.image;
  }
  return rocketCargos.largeLiquidCargoTank.image;
}

export function normalizeCargoBayKinds(
  cargoBayCount: number,
  kinds: readonly ClassicCargoBayKind[] | undefined,
): ClassicCargoBayKind[] {
  const n = Math.max(0, Math.min(99, Math.floor(cargoBayCount)));
  const out: ClassicCargoBayKind[] = [];
  for (let i = 0; i < n; i++) {
    const k = kinds?.[i];
    out.push(isClassicCargoBayKind(k) ? k : "solid");
  }
  return out;
}

export function parseCargoBayKinds(
  raw: unknown,
  cargoBayCount: number,
): ClassicCargoBayKind[] {
  if (!Array.isArray(raw)) {
    return normalizeCargoBayKinds(cargoBayCount, undefined);
  }
  const parsed: ClassicCargoBayKind[] = [];
  for (const item of raw) {
    if (isClassicCargoBayKind(item)) parsed.push(item);
  }
  return normalizeCargoBayKinds(cargoBayCount, parsed);
}

export function classicCargoSlotIndexFromUid(uid: string): number | null {
  if (!uid.startsWith(CLASSIC_CARGO_UID_PREFIX)) return null;
  const tail = uid.slice(CLASSIC_CARGO_UID_PREFIX.length);
  const idx = Number.parseInt(tail, 10);
  return Number.isFinite(idx) && idx >= 0 ? idx : null;
}

export function isClassicCargoStackModuleKey(moduleKey: string): boolean {
  return Object.values(CLASSIC_CARGO_STACK_MODULE_KEYS).includes(moduleKey);
}
