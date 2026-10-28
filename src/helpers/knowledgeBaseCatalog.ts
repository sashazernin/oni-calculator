import { food, ingredients } from "../game-data/food";
import { gas } from "../game-data/gas";
import { kitchenTools } from "../game-data/kitchen-tools";
import { liquids } from "../game-data/liquids";
import { other } from "../game-data/other";
import { plants } from "../game-data/plants";
import { resourses } from "../game-data/resourses";
import type { KnowledgeBaseItem } from "../types/game-data-types";

/** `food` — еда и ингредиенты вместе. */
export type KnowledgeBaseTypeFilter =
  | "all"
  | "food"
  | "plant"
  | "liquid"
  | "resourse"
  | "kitchen-tool"
  | "gas"
  | "other";

const CATALOG: KnowledgeBaseItem[] = [
  ...Object.values(food),
  ...Object.values(ingredients),
  ...Object.values(plants),
  ...Object.values(liquids),
  ...Object.values(resourses),
  ...Object.values(kitchenTools),
  ...Object.values(gas),
  ...Object.values(other),
];

export function getKnowledgeBaseCatalog(): KnowledgeBaseItem[] {
  return CATALOG;
}

export function knowledgeBaseItemMatchesFilter(
  item: KnowledgeBaseItem,
  filter: KnowledgeBaseTypeFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "food") {
    return item.type === "food" || item.type === "ingredient";
  }
  return item.type === filter;
}
