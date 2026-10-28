import type { IFood, IPlant } from "../types/game-data-types";
import type { PlanetoidGameType } from "../types/planetoid-types";

/** Показывать ли еду в списке для выбранного режима (Classic / Spaced Out). */
export function isFoodShownForGameType(
  item: IFood,
  gameType: PlanetoidGameType,
): boolean {
  if (!item.spaceOutOnly) return true;
  return gameType !== "classic";
}

export function isSpaceOutOnlyFood(item: IFood): boolean {
  return Boolean(item.spaceOutOnly);
}

export function isSpaceOutOnlyPlant(item: IPlant): boolean {
  return Boolean(item.spaceOutOnly);
}

/** Значок / блок «Spaced Out» в справочнике и модалке. */
export function isSpaceOutOnlyCatalogItem(
  item: IFood | IPlant,
): boolean {
  if (item.type === "plant") return isSpaceOutOnlyPlant(item);
  return isSpaceOutOnlyFood(item);
}
