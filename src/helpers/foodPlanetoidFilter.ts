import type { IFood } from "../types/game-data-types";
import type { Planetoid } from "../types/planetoid-types";

/** Показывать ли еду в списке выбора с учётом типа активного планетоида. */
export function isFoodShownForPlanetoid(
  item: IFood,
  activePlanetoid: Planetoid | null,
  planetoidRestrictionsActive: boolean,
): boolean {
  if (!item.spaceOutOnly) return true;
  if (!planetoidRestrictionsActive) return true;
  return activePlanetoid?.gameType !== "classic";
}
