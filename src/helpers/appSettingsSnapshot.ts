import { THEME_STORAGE_KEY } from "../providers/app-theme-provider";
import { LANGUAGE_STORAGE_KEY } from "../providers/localization-provider";
import { ROCKETS_STORAGE_KEY } from "./readStoredRockets";
import { STAR_MAP_OBJECTS_KEY } from "./readStoredStarMapObjects";

const DUPES_STORAGE_KEY = "oni-calculator:game-duplicants";

export const SETTINGS_SNAPSHOT_VERSION = 2;

export type AppSettingsSnapshot = {
  version: number;
  exportedAt: string;
  theme: string | null;
  language: string | null;
  activePlanetoidId?: string | null;
  planetoids?: unknown;
  duplicants: unknown;
  rockets: unknown;
  starMap: unknown;
};

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function buildAppSettingsSnapshot(): AppSettingsSnapshot {
  return {
    version: SETTINGS_SNAPSHOT_VERSION,
    exportedAt: new Date().toISOString(),
    theme: localStorage.getItem(THEME_STORAGE_KEY),
    language: localStorage.getItem(LANGUAGE_STORAGE_KEY),
    duplicants: readJson(DUPES_STORAGE_KEY),
    rockets: readJson(ROCKETS_STORAGE_KEY),
    starMap: readJson(STAR_MAP_OBJECTS_KEY),
  };
}

export function applyAppSettingsSnapshot(snapshot: AppSettingsSnapshot): void {
  if (snapshot.theme != null) {
    localStorage.setItem(THEME_STORAGE_KEY, snapshot.theme);
  }
  if (snapshot.language != null) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, snapshot.language);
  }
  if (snapshot.duplicants != null) {
    localStorage.setItem(DUPES_STORAGE_KEY, JSON.stringify(snapshot.duplicants));
  }
  if (snapshot.rockets != null) {
    localStorage.setItem(ROCKETS_STORAGE_KEY, JSON.stringify(snapshot.rockets));
  }
  if (snapshot.starMap != null) {
    localStorage.setItem(STAR_MAP_OBJECTS_KEY, JSON.stringify(snapshot.starMap));
  }
}
