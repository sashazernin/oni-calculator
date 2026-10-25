import type { IFood } from "../types/game-data-types";
import type { Planetoid } from "../types/planetoid-types";

/** Показывать ли еду в списке выбора с учётом типа активного планетоида. */
export function isFoodShownForPlanetoid(
  item: IFood,
  activePlanetoid: Planetoid | null,
  hasVisiblePlanetoids: boolean,
): boolean {
  if (!item.spaceOutOnly) return true;
  if (!hasVisiblePlanetoids) return true;
  return activePlanetoid?.gameType !== "classic";
}
