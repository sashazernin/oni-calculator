import type { PlacedRocketStackModule, RocketOxidizerVariant } from "../components/rocket-builder/RocketBuilder";
import { parseCargoBayKinds } from "./classicCargoBayKinds";
import { parseResearchSightseeingKinds } from "./classicResearchSightseeingKinds";
import {
  classicModulesWithNormalizedCargoKinds,
  classicRocketEngines,
  defaultClassicFlightSnapshot,
  parseClassicTargetDistanceKm,
  type ClassicEngineId,
  type ClassicFlightSnapshot,
  type ClassicOxidizerId,
  type ClassicRocketModules,
} from "./classicRocketFlight";
import { rocketEngines, type RocketEngineId } from "../game-data/rocket";

export const ROCKETS_STORAGE_KEY = "oni-calculator.rockets.v1";

export type StoredRocketSnapshot = {
  id: string;
  title: string;
  way: number[] | null;
  engineId: RocketEngineId | null;
  selectedOxidizerVariant: RocketOxidizerVariant;
  stackModules: PlacedRocketStackModule[];
  /** Калькулятор полёта базовой игры. */
  classicFlight?: ClassicFlightSnapshot;
};

export type RocketsStoragePayload = {
  rockets: StoredRocketSnapshot[];
  activeIndex: number;
};

const OX_SET = new Set<string>(["fertilizer", "oxylite", "liquidOxygen"]);

function newRocketId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createStoredRocket(titleIndex: number): StoredRocketSnapshot {
  return {
    id: newRocketId(),
    title: `Ракета ${titleIndex + 1}`,
    way: null,
    engineId: null,
    selectedOxidizerVariant: "oxylite",
    stackModules: [],
    classicFlight: defaultClassicFlightSnapshot(),
  };
}

function parseClassicModules(raw: unknown): ClassicRocketModules | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const num = (k: string) => {
    const v = rec[k];
    return typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(99, Math.floor(v))) : 0;
  };
  const cargoBays = num("cargoBays");
  const researchSightseeing = num("researchSightseeing");
  const modules: ClassicRocketModules = classicModulesWithNormalizedCargoKinds({
    cargoBays,
    cargoBayKinds: parseCargoBayKinds(rec.cargoBayKinds, cargoBays),
    researchSightseeing,
    researchSightseeingKinds: parseResearchSightseeingKinds(
      rec.researchSightseeingKinds,
      researchSightseeing,
    ),
    solidBoosters: num("solidBoosters"),
    fuelTanks: num("fuelTanks"),
    oxidizerTanks: num("oxidizerTanks"),
    commandCapsules: 1,
  });
  return modules;
}

function parseClassicEngineId(raw: unknown): ClassicEngineId | null {
  if (typeof raw !== "string") return null;
  return raw in classicRocketEngines ? (raw as ClassicEngineId) : null;
}

function parseClassicOxidizer(raw: unknown): ClassicOxidizerId {
  return raw === "liquidOxygen" ? "liquidOxygen" : "oxylite";
}

function parseClassicFlight(raw: unknown): ClassicFlightSnapshot {
  const base = defaultClassicFlightSnapshot();
  if (!raw || typeof raw !== "object") return base;
  const rec = raw as Record<string, unknown>;
  const engineId = parseClassicEngineId(rec.engineId) ?? base.engineId;
  const oxidizer = parseClassicOxidizer(rec.oxidizer);
  const modules = parseClassicModules(rec.modules) ?? base.modules;
  const targetDistanceKm = parseClassicTargetDistanceKm(rec.targetDistanceKm);
  return { engineId, oxidizer, modules, targetDistanceKm };
}

export function ensureClassicFlight(snapshot: StoredRocketSnapshot): ClassicFlightSnapshot {
  const flight = snapshot.classicFlight ?? defaultClassicFlightSnapshot();
  return {
    ...flight,
    modules: classicModulesWithNormalizedCargoKinds({
      ...flight.modules,
      commandCapsules: 1,
    }),
    targetDistanceKm: parseClassicTargetDistanceKm(flight.targetDistanceKm),
  };
}

function parseWay(raw: unknown): number[] | null {
  if (raw == null) return null;
  if (!Array.isArray(raw)) return null;
  const out: number[] = [];
  for (const x of raw) {
    if (typeof x !== "number" || !Number.isFinite(x)) return null;
    out.push(x);
  }
  return out.length === 0 ? null : out;
}

function parseStackModules(raw: unknown): PlacedRocketStackModule[] {
  if (!Array.isArray(raw)) return [];
  const out: PlacedRocketStackModule[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const rec = x as Record<string, unknown>;
    const uid = rec.uid;
    const moduleKey = rec.moduleKey;
    const row = rec.row;
    const col = rec.col;
    if (typeof uid !== "string" || uid.length === 0) continue;
    if (typeof moduleKey !== "string" || moduleKey.length === 0) continue;
    if (typeof row !== "number" || !Number.isFinite(row)) continue;
    if (typeof col !== "number" || !Number.isFinite(col)) continue;
    out.push({ uid, moduleKey, row, col });
  }
  return out;
}

function parseEngineId(raw: unknown): RocketEngineId | null {
  if (raw == null || raw === "") return null;
  if (typeof raw !== "string") return null;
  return raw in rocketEngines ? (raw as RocketEngineId) : null;
}

function parseOxidizer(raw: unknown): RocketOxidizerVariant {
  if (typeof raw === "string" && OX_SET.has(raw)) {
    return raw as RocketOxidizerVariant;
  }
  return "oxylite";
}

function parseRocket(raw: unknown, fallbackIndex: number): StoredRocketSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const id = typeof rec.id === "string" && rec.id.length > 0 ? rec.id : newRocketId();
  const title =
    typeof rec.title === "string" && rec.title.trim().length > 0
      ? rec.title.trim()
      : `Ракета ${fallbackIndex + 1}`;
  return {
    id,
    title,
    way: parseWay(rec.way),
    engineId: parseEngineId(rec.engineId),
    selectedOxidizerVariant: parseOxidizer(rec.selectedOxidizerVariant),
    stackModules: parseStackModules(rec.stackModules),
    classicFlight: parseClassicFlight(rec.classicFlight),
  };
}

export function defaultRocketsPayload(): RocketsStoragePayload {
  return { rockets: [createStoredRocket(0)], activeIndex: 0 };
}

export function parseRocketsStoragePayload(data: unknown): RocketsStoragePayload {
  if (!data || typeof data !== "object") return defaultRocketsPayload();
  const root = data as Record<string, unknown>;
  const rocketsRaw = root.rockets;
  const activeRaw = root.activeIndex;
  if (!Array.isArray(rocketsRaw) || rocketsRaw.length === 0) {
    return defaultRocketsPayload();
  }
  const rockets: StoredRocketSnapshot[] = [];
  for (let i = 0; i < rocketsRaw.length; i++) {
    const r = parseRocket(rocketsRaw[i], i);
    if (r) rockets.push(r);
  }
  if (rockets.length === 0) return defaultRocketsPayload();
  let activeIndex = 0;
  if (typeof activeRaw === "number" && Number.isFinite(activeRaw)) {
    activeIndex = Math.max(0, Math.min(Math.floor(activeRaw), rockets.length - 1));
  }
  return { rockets, activeIndex };
}

export function readStoredRockets(): RocketsStoragePayload {
  if (typeof window === "undefined") return defaultRocketsPayload();
  try {
    const raw = window.localStorage.getItem(ROCKETS_STORAGE_KEY);
    if (!raw) return defaultRocketsPayload();
    return parseRocketsStoragePayload(JSON.parse(raw) as unknown);
  } catch {
    return defaultRocketsPayload();
  }
}
