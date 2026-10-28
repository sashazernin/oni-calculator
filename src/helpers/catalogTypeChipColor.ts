import type { KnowledgeBaseItem } from "../types/game-data-types";

/** Акцентный цвет чипа типа на карточке базы знаний. */
export function getCatalogTypeChipColor(type: KnowledgeBaseItem["type"]): string {
  switch (type) {
    case "food":
      return "rgb(214, 118, 72)";
    case "ingredient":
      return "rgb(204, 168, 58)";
    case "plant":
      return "rgb(88, 168, 82)";
    case "liquid":
      return "rgb(72, 142, 220)";
    case "resourse":
      return "rgb(168, 132, 88)";
    case "kitchen-tool":
      return "rgb(148, 108, 204)";
    case "gas":
      return "rgb(76, 182, 196)";
    case "other":
      return "rgb(186, 102, 158)";
    default: {
      const _exhaustive: never = type;
      void _exhaustive;
      return "rgb(140, 140, 140)";
    }
  }
}
