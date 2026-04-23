import type { IPlant } from "../types/game-data-types";
import { resourse } from "./resourses";

export const Mealwood: IPlant = {
  name: 'Mealwood',
  type: 'plant',
  image: 'plants/Mealwood.webp',
  cycles: 3,
  harvest: 200,
  requirements: [
    {
      count: 10,
      item: resourse.Dirt
    }
  ]
}

export const plant: { [key: string]: IPlant } = {
  Mealwood
}