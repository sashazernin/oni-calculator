import type { IFood } from "../types/game-data-types";
import { liquid } from "./liquid";
import { Mealwood } from "./plants";

export const MealLice: IFood = {
  name: 'Meal Lice',
  type: 'food',
  calory: 600,
  image: 'food/Meal_Lice.webp',
  requirements: [
    {
      count: 1,
      item: Mealwood
    }
  ]
}

export const Liceloaf: IFood = {
  name: 'Liceloaf',
  type: 'food',
  calory: 1700,
  image: 'food/Liceloaf.webp',
  requirements: [
    {
      count: 50,
      item: liquid.water
    },
    {
      count: 1200,
      item: MealLice
    }
  ]
}

export const food: { [key: string]: IFood } = {
  Liceloaf,
  MealLice
}