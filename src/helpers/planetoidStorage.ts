import type { Planetoid, PlanetoidGameType, PlanetoidsState } from "../types/planetoid-types";
import type { IDuplicate } from "../types/game-data-types";
import type { HexMapObjectItem } from "../types/hex-map-types";
import { defaultRocketsPayload } from "./readStoredRockets";
import { defaultStarMapObjects } from "./readStoredStarMapObjects";

export const PLANETOIDS_STATE_KEY = "oni-calculator:planetoids-state";

export function newPlanetoidId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `planetoid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createPlanetoid(
  name: string,
  gameType: PlanetoidGameType,
  expansions: boolean
): Planetoid {
  return {
    id: newPlanetoidId(),
    name: name.trim() || "Планетойд",
    gameType,
    expansions: gameType === "spaced-out" ? expansions : false,
    duplicants: [],
    starMap: defaultStarMapObjects(),
    rockets: defaultRocketsPayload(),
  };
}

export function emptyPlanetoidsState(): PlanetoidsState {
  return { activePlanetoidId: "", planetoids: [] };
}

export function migrateLegacyColonyToPlanetoidsState(
  duplicants: IDuplicate[],
  starMap: HexMapObjectItem[],
  rockets: PlanetoidsState["planetoids"][0]["rockets"]
): PlanetoidsState {
  const first: Planetoid = {
    id: newPlanetoidId(),
    name: "Планетойд 1",
    gameType: "classic",
    expansions: false,
    duplicants,
    starMap,
    rockets,
  };
  return { activePlanetoidId: first.id, planetoids: [first] };
}

export function readPlanetoidsStateFromLocal(): PlanetoidsState | null {
  try {
    const raw = localStorage.getItem(PLANETOIDS_STATE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PlanetoidsState;
    if (!data?.activePlanetoidId || !Array.isArray(data.planetoids) || data.planetoids.length === 0) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function persistPlanetoidsState(state: PlanetoidsState): void {
  try {
    localStorage.setItem(PLANETOIDS_STATE_KEY, JSON.stringify(state));
  } catch {
    /* */
  }
}

export function loadPlanetoidsStateFromLocal(legacy?: {
  duplicants: IDuplicate[];
  starMap: HexMapObjectItem[];
  rockets: Planetoid["rockets"];
}): PlanetoidsState {
  const stored = readPlanetoidsStateFromLocal();
  if (stored) return stored;
  if (legacy) {
    return migrateLegacyColonyToPlanetoidsState(
      legacy.duplicants,
      legacy.starMap,
      legacy.rockets
    );
  }
  return emptyPlanetoidsState();
}

export function activePlanetoidFromState(state: PlanetoidsState): Planetoid | null {
  return state.planetoids.find((p) => p.id === state.activePlanetoidId) ?? state.planetoids[0] ?? null;
}

export function syncColonyIntoActivePlanetoid(
  state: PlanetoidsState,
  colony: Pick<Planetoid, "duplicants" | "starMap" | "rockets">
): PlanetoidsState {
  const planetoids = state.planetoids.map((p) =>
    p.id === state.activePlanetoidId ? { ...p, ...colony } : p
  );
  return { ...state, planetoids };
}

export function switchActivePlanetoid(
  state: PlanetoidsState,
  nextId: string,
  currentColony: Pick<Planetoid, "duplicants" | "starMap" | "rockets">
): PlanetoidsState | null {
  const withSaved = syncColonyIntoActivePlanetoid(state, currentColony);
  const next = withSaved.planetoids.find((p) => p.id === nextId);
  if (!next) return null;
  return { ...withSaved, activePlanetoidId: nextId };
}

export function updatePlanetoidInState(
  state: PlanetoidsState,
  id: string,
  patch: Pick<Planetoid, "name" | "gameType" | "expansions">
): PlanetoidsState {
  const planetoids = state.planetoids.map((p) => {
    if (p.id !== id) return p;
    const gameType = patch.gameType;
    return {
      ...p,
      name: patch.name.trim() || p.name,
      gameType,
      expansions: gameType === "spaced-out" ? patch.expansions : false,
    };
  });
  return { ...state, planetoids };
}

export function removePlanetoidFromState(
  state: PlanetoidsState,
  id: string,
  currentColony: Pick<Planetoid, "duplicants" | "starMap" | "rockets">
): PlanetoidsState | null {
  if (state.planetoids.length <= 1) return null;
  const withSaved = syncColonyIntoActivePlanetoid(state, currentColony);
  const planetoids = withSaved.planetoids.filter((p) => p.id !== id);
  if (planetoids.length === withSaved.planetoids.length) return null;
  let activePlanetoidId = withSaved.activePlanetoidId;
  if (activePlanetoidId === id) {
    activePlanetoidId = planetoids[0]!.id;
  }
  return { ...withSaved, activePlanetoidId, planetoids };
}
