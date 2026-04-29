import type { IPlant } from "../types/game-data-types";
import { liquids } from "./liquids";
import { resourses } from "./resourses";

const mealwood: IPlant = {
  name: "gd_mealwood",
  type: "plant",
  image: "plants/Mealwood.webp",
  cycles: 3,
  harvest: 200,
  requirements: [
    {
      count: 10,
      item: resourses.dirt,
    },
  ],
};

const bogBucket: IPlant = {
  name: "gd_bog_bucket",
  type: "plant",
  image: "plants/Bog_Bucket.webp",
  cycles: 6.6,
  harvest: 279,
  requirements: [
    {
      count: 40,
      item: liquids.pollutedWater,
    },
  ],
};

const bristleBlossom: IPlant = {
  name: "gd_bristle_blossom",
  type: "plant",
  image: "plants/Bristle_Blossom.webp",
  cycles: 6,
  harvest: 267,
  requirements: [
    {
      count: 20,
      item: liquids.water,
    },
  ],
};

const pinchaPepperplant: IPlant = {
  name: "gd_pincha_pepperplant",
  type: "plant",
  image: "plants/Pincha_Pepperplant.webp",
  cycles: 8,
  harvest: 500,
  requirements: [
    {
      count: 35,
      item: liquids.pollutedWater,
    },
    {
      count: 1,
      item: resourses.phosphorite,
    },
  ],
};

const sleetWheat: IPlant = {
  name: "gd_sleet_wheat",
  type: "plant",
  image: "plants/Sleet_Wheat.webp",
  cycles: 18,
  harvest: 1,
  requirements: [
    {
      count: 20,
      item: liquids.water,
    },
    {
      count: 5,
      item: resourses.dirt,
    },
  ],
};

const noshSprout: IPlant = {
  name: "gd_nosh_sprout",
  type: "plant",
  image: "plants/Nosh_Sprout.webp",
  cycles: 21,
  harvest: 0.57,
  requirements: [
    {
      count: 20,
      item: liquids.ethanol,
    },
    {
      count: 5,
      item: resourses.dirt,
    },
  ],
};

const duskCap: IPlant = {
  name: "gd_dusk_cap",
  type: "plant",
  image: "plants/Dusk_Cap.webp",
  cycles: 7.5,
  harvest: 320,
  requirements: [
    {
      count: 4,
      item: resourses.slime,
    },
  ],
};

const waterweed: IPlant = {
  name: "gd_waterweed",
  type: "plant",
  image: "plants/Waterweed.webp",
  cycles: 12,
  harvest: 400,
  requirements: [
    {
      count: 5,
      item: liquids.saltWater,
    },
    {
      count: 0.5,
      item: resourses.bleachStone,
    },
  ],
};

const grubfruitPlant: IPlant = {
  name: "gd_grubfruit_plant",
  type: "plant",
  image: "plants/Grubfruit_Plant.webp",
  cycles: 4,
  harvest: 250,
  requirements: [
    {
      count: 10,
      item: resourses.sulfur,
    },
  ],
};

const spindlyGrubfruitPlant: IPlant = {
  name: "gd_spindly_grubfruit_plant",
  type: "plant",
  image: "plants/Grubfruit_Plant.webp",
  cycles: 4,
  harvest: 200,
  requirements: [
    {
      count: 10,
      item: resourses.sulfur,
    },
  ],
};

const hexalent: IPlant = {
  name: "gd_hexalent",
  type: "plant",
  image: "plants/Hexalent.webp",
  cycles: 0,
  harvest: 6400,
};

const swampChard: IPlant = {
  name: "gd_swamp_chard",
  type: "plant",
  image: "plants/Swamp_Chard.webp",
  cycles: 0,
  harvest: 2400,
};

export const plants = {
  mealwood,
  bogBucket,
  bristleBlossom,
  pinchaPepperplant,
  sleetWheat,
  noshSprout,
  duskCap,
  waterweed,
  grubfruitPlant,
  spindlyGrubfruitPlant,
  hexalent,
  swampChard,
};
