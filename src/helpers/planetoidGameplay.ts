import type { Planetoid } from "../types/planetoid-types";
import { visiblePlanetoids } from "./planetoidStorage";

/** Ограничения по типу планетойда (еда SO, classic-ракета, звёздная карта…) активны. */
export function planetoidRestrictionsActive(
  mixedMode: boolean,
  planetoids: Planetoid[],
): boolean {
  if (mixedMode) return false;
  return visiblePlanetoids(planetoids).length > 0;
}
