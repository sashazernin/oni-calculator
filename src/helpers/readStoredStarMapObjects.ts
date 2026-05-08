import type { HexMapObjectItem } from "../types/hex-map-types";
import { cellNumberFromAxial } from "./hex-map-geometry";

export const STAR_MAP_OBJECTS_KEY = "oni-calculator.star-map.objects";

const initialObjects = (): HexMapObjectItem[] => {
  const planet = cellNumberFromAxial(0, 0);
  const out: HexMapObjectItem[] = [];
  if (planet != null) out.push({ cellNumber: planet, name: "Home planet", type: "planet", main: true });
  return out;
};

export function readStoredStarMapObjects(): HexMapObjectItem[] {
  if (typeof window === "undefined") return initialObjects();
  try {
    const raw = window.localStorage.getItem(STAR_MAP_OBJECTS_KEY);
    if (!raw) return initialObjects();
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return initialObjects();
    const parsed: HexMapObjectItem[] = [];
    for (const x of data) {
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
    return parsed.length > 0 ? parsed : initialObjects();
  } catch {
    return initialObjects();
  }
}