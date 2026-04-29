import type { ILiquid } from "../types/game-data-types"

export const water: ILiquid = {
  name: "gd_water",
  type: "liquid",
  image: "liquids/Liquid_Water.webp",
};

export const pollutedWater: ILiquid = {
  name: "gd_polluted_water",
  type: "liquid",
  image: "liquids/Polluted_Water.webp",
};

export const ethanol: ILiquid = {
  name: "gd_ethanol",
  type: "liquid",
  image: "liquids/Ethanol.webp",
};

export const saltWater: ILiquid = {
  name: "gd_salt_water",
  type: "liquid",
  image: "liquids/Salt_Water.webp",
};

export const liquids = {
  water,
  pollutedWater,
  ethanol,
  saltWater,
};
