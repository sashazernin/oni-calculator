import type { ILiquid } from "../types/game-data-types"

const water: ILiquid = {
  name: "gd_water",
  type: "liquid",
  image: "liquids/Liquid_Water.webp",
};

const pollutedWater: ILiquid = {
  name: "gd_polluted_water",
  type: "liquid",
  image: "liquids/Polluted_Water.webp",
};

const ethanol: ILiquid = {
  name: "gd_ethanol",
  type: "liquid",
  image: "liquids/Ethanol.webp",
};

const saltWater: ILiquid = {
  name: "gd_salt_water",
  type: "liquid",
  image: "liquids/Salt_Water.webp",
};

const Petroleum: ILiquid = {
  name: "gd_petroleum",
  type: "liquid",
  image: "liquids/Petroleum.webp",
};

export const liquids = {
  water,
  pollutedWater,
  ethanol,
  saltWater,
  Petroleum
};
