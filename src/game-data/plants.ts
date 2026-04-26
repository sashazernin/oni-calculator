import type { IPlant } from "../types/game-data-types";
import { liquids } from "./liquids";
import { resourses } from "./resourses";

export const mealwood: IPlant = {
  name: 'Mealwood',
  type: 'plant',
  image: 'plants/Mealwood.webp',
  cycles: 3,
  harvest: 200,
  requirements: [
    {
      count: 10,
      item: resourses.dirt
    }
  ]
}

export const bogBucket: IPlant = {
  name: 'Bog Bucket',
  type: 'plant',
  image: 'plants/Bog_Bucket.webp',
  cycles: 6.6,
  harvest: 279,
  requirements: [
    {
      count: 40,
      item: liquids.pollutedWater
    }
  ]
}

export const bristleBlossom: IPlant = {
  name: 'Bristle Blossom',
  type: 'plant',
  image: 'plants/Bristle_Blossom.webp',
  cycles: 6,
  harvest: 267,
  requirements: [
    {
      count: 20,
      item: liquids.water
    }
  ]
}

export const pinchaPepperplant: IPlant = {
  name: 'Pincha Pepperplant',
  type: 'plant',
  image: 'plants/Pincha_Pepperplant.webp',
  cycles: 8,
  harvest: 500,
  requirements: [
    {
      count: 35,
      item: liquids.pollutedWater
    },
    {
      count: 1,
      item: resourses.phosphorite
    }
  ]
}

export const sleetWheat: IPlant = {
  name: 'Sleet Wheat',
  type: 'plant',
  image: 'plants/Sleet_Wheat.webp',
  cycles: 18,
  harvest: 1,
  requirements: [
    {
      count: 20,
      item: liquids.water
    },
    {
      count: 5,
      item: resourses.dirt
    }
  ]
}

export const noshSprout: IPlant = {
  name: 'Nosh Sprout',
  type: 'plant',
  image: 'plants/Nosh_Sprout.webp',
  cycles: 21,
  harvest: 0.57,
  requirements: [
    {
      count: 20,
      item: liquids.ethanol
    },
    {
      count: 5,
      item: resourses.dirt
    }
  ]
}

export const duskCap: IPlant = {
  name: 'Dusk Cap',
  type: 'plant',
  image: 'plants/Dusk_Cap.webp',
  cycles: 7.5,
  harvest: 320,
  requirements: [
    {
      count: 4,
      item: resourses.slime
    }
  ]
}

export const waterweed: IPlant = {
  name: 'Waterweed',
  type: 'plant',
  image: 'plants/Waterweed.webp',
  cycles: 12,
  harvest: 400,
  requirements: [
    {
      count: 5,
      item: liquids.saltWater
    },
    {
      count: 0.5,
      item: resourses.bleachStone
    }
  ]
}

export const grubfruitPlant: IPlant = {
  name: 'Grubfruit Plant',
  type: 'plant',
  image: 'plants/Grubfruit_Plant.webp',
  cycles: 4,
  harvest: 250,
  requirements: [
    {
      count: 10,
      item: resourses.sulfur
    }
  ]
}

export const plants = {
  mealwood,
  bogBucket,
  bristleBlossom,
  pinchaPepperplant,
  sleetWheat,
  noshSprout,
  duskCap,
  waterweed,
  grubfruitPlant
}