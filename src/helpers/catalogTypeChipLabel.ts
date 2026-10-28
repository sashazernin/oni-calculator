import type { TranslationKey } from "../i18n/translations";
import type { KnowledgeBaseItem } from "../types/game-data-types";

/** Короткая подпись типа для чипа на карточке базы знаний. */
export function catalogTypeChipLabelKey(
  type: KnowledgeBaseItem["type"],
): TranslationKey {
  switch (type) {
    case "food":
      return "game_node_food";
    case "ingredient":
      return "game_node_ingredient_chip";
    case "plant":
      return "game_node_plant_chip";
    case "liquid":
      return "game_node_liquid_chip";
    case "resourse":
      return "game_node_resource";
    case "kitchen-tool":
      return "game_node_kitchen_tool_chip";
    case "gas":
      return "game_node_gas";
    case "other":
      return "game_node_other";
    default: {
      const _exhaustive: never = type;
      void _exhaustive;
      return "game_node_food";
    }
  }
}
