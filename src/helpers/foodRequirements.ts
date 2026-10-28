import type { FoodRequirement, IFood } from "../types/game-data-types";

/** Варианты рецепта (внутренний массив — все ингредиенты вместе, внешний — альтернативы). */
export function foodRequirementVariants(food: IFood): FoodRequirement[][] {
  return food.requirements ?? [];
}

export function foodHasRecipeVariants(food: IFood): boolean {
  return (food.requirements?.length ?? 0) > 1;
}

/** Первый вариант рецепта (для сводки ресурсов при ИЛИ). */
export function primaryFoodRequirementVariant(
  food: IFood,
): FoodRequirement[] {
  return food.requirements?.[0] ?? [];
}
