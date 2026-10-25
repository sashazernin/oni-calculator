import { z } from "zod";
import type { HexMapObjectItem } from "../types/hex-map-types";
import type { IDuplicate } from "../types/game-data-types";
import type { Planetoid, PlanetoidGameType } from "../types/planetoid-types";
import {
  supportedThemes,
  type ISupportedThemes,
  THEME_STORAGE_KEY,
} from "../providers/app-theme-provider";
import {
  LANGUAGE_STORAGE_KEY,
  supportedLanguages,
  type ISupportedLanguages,
  resolveSystemLanguage,
} from "../providers/localization-provider";
import {
  parseRocketsStoragePayload,
  readStoredRockets,
  ROCKETS_STORAGE_KEY,
  type RocketsStoragePayload,
} from "./readStoredRockets";
import { readStoredStarMapObjects, STAR_MAP_OBJECTS_KEY } from "./readStoredStarMapObjects";
import { dupeSchema } from "../schemas/gameSchemas";
import {
  SETTINGS_SNAPSHOT_VERSION,
  type AppSettingsSnapshot,
} from "./appSettingsSnapshot";
import type { PlanetoidsState } from "../types/planetoid-types";
import {
  activePlanetoidFromState,
  emptyPlanetoidsState,
  loadPlanetoidsStateFromLocal,
  migrateLegacyColonyToPlanetoidsState,
  persistPlanetoidsState,
  PLANETOIDS_STATE_KEY,
  readPlanetoidsStateFromLocal,
  syncColonyIntoActivePlanetoid,
} from "./planetoidStorage";
import { defaultRocketsPayload } from "./readStoredRockets";
import { defaultStarMapObjects } from "./readStoredStarMapObjects";

const DUPES_STORAGE_KEY = "oni-calculator:game-duplicants";
const dupeListSchema = z.array(dupeSchema);

export type AppSettingsData = {
  theme: ISupportedThemes;
  language: ISupportedLanguages;
  activePlanetoidId: string;
  planetoids: Planetoid[];
  duplicants: IDuplicate[];
  rockets: RocketsStoragePayload;
  starMap: HexMapObjectItem[];
};

export function readDuplicantsFromStorage(): IDuplicate[] {
  try {
    const raw = localStorage.getItem(DUPES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    const r = dupeListSchema.safeParse(parsed);
    return r.success ? r.data : [];
  } catch {
    return [];
  }
}

function readThemeFromStorage(): ISupportedThemes {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw && (supportedThemes as readonly string[]).includes(raw)) {
      return raw as ISupportedThemes;
    }
  } catch {
    /* */
  }
  return "system";
}

function readLanguageFromStorage(): ISupportedLanguages {
  try {
    const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (raw && (supportedLanguages as readonly string[]).includes(raw)) {
      return raw as ISupportedLanguages;
    }
  } catch {
    /* */
  }
  return resolveSystemLanguage();
}

function hasLegacyColonyStorage(): boolean {
  try {
    if (localStorage.getItem(DUPES_STORAGE_KEY)) return true;
    if (localStorage.getItem(STAR_MAP_OBJECTS_KEY)) return true;
    if (localStorage.getItem(ROCKETS_STORAGE_KEY)) return true;
  } catch {
    /* */
  }
  return false;
}

function colonyFromPlanetoidsState(state: PlanetoidsState): {
  duplicants: IDuplicate[];
  starMap: HexMapObjectItem[];
  rockets: RocketsStoragePayload;
} {
  const active = activePlanetoidFromState(state);
  if (!active) {
    return { duplicants: [], starMap: readStoredStarMapObjects(), rockets: readStoredRockets() };
  }
  return {
    duplicants: active.duplicants,
    starMap: active.starMap,
    rockets: active.rockets,
  };
}

/** Есть ли сохранённые данные колонии / планетоидов в localStorage. */
export function hasLocalAppSettings(): boolean {
  try {
    if (localStorage.getItem(PLANETOIDS_STATE_KEY)) return true;
    if (localStorage.getItem(DUPES_STORAGE_KEY)) return true;
    if (localStorage.getItem(STAR_MAP_OBJECTS_KEY)) return true;
    if (localStorage.getItem(ROCKETS_STORAGE_KEY)) return true;
  } catch {
    /* */
  }
  return false;
}

export function createEmptyAppSettingsData(): AppSettingsData {
  return {
    theme: readThemeFromStorage(),
    language: readLanguageFromStorage(),
    activePlanetoidId: "",
    planetoids: [],
    duplicants: [],
    starMap: defaultStarMapObjects(),
    rockets: defaultRocketsPayload(),
  };
}

export function loadAppSettingsDataFromLocal(): AppSettingsData {
  const theme = readThemeFromStorage();
  const language = readLanguageFromStorage();
  const storedPlanetoids = readPlanetoidsStateFromLocal();
  const planetoidsState = storedPlanetoids
    ? storedPlanetoids
    : hasLegacyColonyStorage()
      ? migrateLegacyColonyToPlanetoidsState(
          readDuplicantsFromStorage(),
          readStoredStarMapObjects(),
          readStoredRockets()
        )
      : emptyPlanetoidsState();
  const colony = colonyFromPlanetoidsState(planetoidsState);

  return {
    theme,
    language,
    activePlanetoidId: planetoidsState.activePlanetoidId,
    planetoids: planetoidsState.planetoids,
    ...colony,
  };
}

function parseDuplicants(raw: unknown): IDuplicate[] {
  const r = dupeListSchema.safeParse(raw);
  return r.success ? r.data : [];
}

function parseStarMap(raw: unknown): HexMapObjectItem[] {
  if (!Array.isArray(raw)) return readStoredStarMapObjects();
  const parsed: HexMapObjectItem[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const rec = x as Record<string, unknown>;
    const cellNumber = rec.cellNumber;
    const name = rec.name;
    const type = rec.type;
    if (typeof cellNumber !== "number" || !Number.isFinite(cellNumber)) continue;
    if (typeof name !== "string") continue;
    if (type !== "planet" && type !== "wreck" && type !== "nebula") continue;
    parsed.push({
      cellNumber,
      name,
      type,
      main: typeof rec.main === "boolean" ? rec.main : undefined,
    });
  }
  return parsed.length > 0 ? parsed : readStoredStarMapObjects();
}

function parsePlanetoidGameType(raw: unknown): PlanetoidGameType {
  return raw === "classic" ? "classic" : "spaced-out";
}

function parsePlanetoid(raw: unknown): Planetoid | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const id = rec.id;
  const name = rec.name;
  if (typeof id !== "string" || !id) return null;
  if (typeof name !== "string" || !name.trim()) return null;
  const gameType = parsePlanetoidGameType(rec.gameType);
  return {
    id,
    name: name.trim(),
    gameType,
    expansions: gameType === "spaced-out" ? Boolean(rec.expansions) : false,
    duplicants: parseDuplicants(rec.duplicants),
    starMap: parseStarMap(rec.starMap),
    rockets: parseRocketsStoragePayload(rec.rockets),
  };
}

function parsePlanetoidsFromSnapshot(snapshot: AppSettingsSnapshot): Planetoid[] | null {
  const raw = snapshot.planetoids;
  if (!Array.isArray(raw)) return null;
  const planetoids: Planetoid[] = [];
  for (const item of raw) {
    const p = parsePlanetoid(item);
    if (p) planetoids.push(p);
  }
  return planetoids.length > 0 ? planetoids : null;
}

export function parseAppSettingsData(snapshot: AppSettingsSnapshot): AppSettingsData {
  const theme =
    snapshot.theme &&
    (supportedThemes as readonly string[]).includes(snapshot.theme)
      ? (snapshot.theme as ISupportedThemes)
      : "system";
  const language =
    snapshot.language &&
    (supportedLanguages as readonly string[]).includes(snapshot.language)
      ? (snapshot.language as ISupportedLanguages)
      : resolveSystemLanguage();

  const fromPlanetoids = parsePlanetoidsFromSnapshot(snapshot);
  if (fromPlanetoids) {
    const activeId =
      typeof snapshot.activePlanetoidId === "string" &&
      fromPlanetoids.some((p) => p.id === snapshot.activePlanetoidId)
        ? snapshot.activePlanetoidId
        : fromPlanetoids[0].id;
    const active = fromPlanetoids.find((p) => p.id === activeId) ?? fromPlanetoids[0];
    return {
      theme,
      language,
      activePlanetoidId: activeId,
      planetoids: fromPlanetoids,
      duplicants: active.duplicants,
      starMap: active.starMap,
      rockets: active.rockets,
    };
  }

  const duplicants = parseDuplicants(snapshot.duplicants);
  const starMap = parseStarMap(snapshot.starMap);
  const rockets = parseRocketsStoragePayload(snapshot.rockets);
  const migrated = loadPlanetoidsStateFromLocal({ duplicants, starMap, rockets });

  return {
    theme,
    language,
    activePlanetoidId: migrated.activePlanetoidId,
    planetoids: migrated.planetoids,
    duplicants,
    starMap,
    rockets,
  };
}

export function appSettingsDataToSnapshot(data: AppSettingsData): AppSettingsSnapshot {
  const synced = syncColonyIntoActivePlanetoid(
    { activePlanetoidId: data.activePlanetoidId, planetoids: data.planetoids },
    {
      duplicants: data.duplicants,
      starMap: data.starMap,
      rockets: data.rockets,
    }
  );

  return {
    version: SETTINGS_SNAPSHOT_VERSION,
    exportedAt: new Date().toISOString(),
    theme: data.theme,
    language: data.language,
    activePlanetoidId: synced.activePlanetoidId,
    planetoids: synced.planetoids,
    duplicants: data.duplicants,
    rockets: data.rockets,
    starMap: data.starMap,
  };
}

export function clearUnconfiguredColonyFromLocalStorage(): void {
  try {
    localStorage.removeItem(PLANETOIDS_STATE_KEY);
    localStorage.removeItem(DUPES_STORAGE_KEY);
    localStorage.removeItem(ROCKETS_STORAGE_KEY);
    localStorage.removeItem(STAR_MAP_OBJECTS_KEY);
  } catch {
    /* */
  }
}

export function persistAppSettingsDataToLocal(data: AppSettingsData): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, data.theme);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, data.language);
    if (data.planetoids.length === 0) {
      clearUnconfiguredColonyFromLocalStorage();
      return;
    }

    const synced = syncColonyIntoActivePlanetoid(
      { activePlanetoidId: data.activePlanetoidId, planetoids: data.planetoids },
      {
        duplicants: data.duplicants,
        starMap: data.starMap,
        rockets: data.rockets,
      }
    );
    persistPlanetoidsState(synced);
    localStorage.setItem(DUPES_STORAGE_KEY, JSON.stringify(data.duplicants));
    localStorage.setItem(ROCKETS_STORAGE_KEY, JSON.stringify(data.rockets));
    localStorage.setItem(STAR_MAP_OBJECTS_KEY, JSON.stringify(data.starMap));
  } catch {
    /* quota / private mode */
  }
}
