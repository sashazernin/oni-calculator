import type { Planetoid, PlanetoidGameType, PlanetoidsState } from "../types/planetoid-types";
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

export function createHiddenPlanetoid(
  colony?: Pick<Planetoid, "duplicants" | "starMap" | "rockets">
): Planetoid {
  return {
    id: newPlanetoidId(),
    name: "",
    hidden: true,
    gameType: "spaced-out",
    expansions: false,
    duplicants: colony?.duplicants ?? [],
    starMap: colony?.starMap ?? defaultStarMapObjects(),
    rockets: colony?.rockets ?? defaultRocketsPayload(),
  };
}

export function visiblePlanetoids(planetoids: Planetoid[]): Planetoid[] {
  return planetoids.filter((p) => !p.hidden);
}

export function hasStoredColonyActivity(
  colony: Pick<Planetoid, "duplicants" | "starMap" | "rockets">
): boolean {
  if (colony.duplicants.length > 0) return true;
  if (JSON.stringify(colony.rockets) !== JSON.stringify(defaultRocketsPayload())) return true;
  if (JSON.stringify(colony.starMap) !== JSON.stringify(defaultStarMapObjects())) return true;
  return false;
}

export function activeVisiblePlanetoid(
  activePlanetoidId: string,
  planetoids: Planetoid[]
): Planetoid | null {
  const active = planetoids.find((p) => p.id === activePlanetoidId) ?? null;
  if (!active || active.hidden) return null;
  return active;
}

/** Пока нет явных планетоидов — держим колонию в скрытом планетойде. */
export function ensureColonyPlanetoidState(
  state: PlanetoidsState,
  colony: Pick<Planetoid, "duplicants" | "starMap" | "rockets">
): PlanetoidsState {
  if (visiblePlanetoids(state.planetoids).length > 0) {
    return syncColonyIntoActivePlanetoid(state, colony);
  }

  let hidden = state.planetoids.find((p) => p.hidden);
  if (!hidden) {
    if (!hasStoredColonyActivity(colony)) {
      return state;
    }
    hidden = createHiddenPlanetoid(colony);
    const planetoids = [...state.planetoids.filter((p) => !p.hidden), hidden];
    state = { activePlanetoidId: hidden.id, planetoids };
    return state;
  }

  state = { ...state, activePlanetoidId: hidden.id };
  return syncColonyIntoActivePlanetoid(state, colony);
}

export function emptyPlanetoidsState(): PlanetoidsState {
  return { activePlanetoidId: "", planetoids: [] };
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
  if (!next || next.hidden) return null;
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
  const target = state.planetoids.find((p) => p.id === id);
  if (!target || target.hidden) return null;

  const withSaved = syncColonyIntoActivePlanetoid(state, currentColony);
  const visible = visiblePlanetoids(withSaved.planetoids);
  if (visible.length <= 1) {
    const hidden = createHiddenPlanetoid(currentColony);
    return { activePlanetoidId: hidden.id, planetoids: [hidden] };
  }

  const planetoids = withSaved.planetoids.filter((p) => p.id !== id);
  let activePlanetoidId = withSaved.activePlanetoidId;
  if (activePlanetoidId === id) {
    const nextVisible = visiblePlanetoids(planetoids);
    activePlanetoidId = nextVisible[0]?.id ?? activePlanetoidId;
  }
  return { ...withSaved, activePlanetoidId, planetoids };
}
