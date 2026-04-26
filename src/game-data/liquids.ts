import type { ILiquid } from "../types/game-data-types"

export const water: ILiquid = {
  name: 'Water',
  type: 'liquid',
  image: 'liquids/Liquid_Water.webp'
}

export const pollutedWater: ILiquid = {
  name: 'Polluted Water',
  type: 'liquid',
  image: 'liquids/Polluted_Water.webp'
}

export const ethanol: ILiquid = {
  name: 'Ethanol',
  type: 'liquid',
  image: 'liquids/Ethanol.webp'
}

export const saltWater: ILiquid = {
  name: 'Salt Water',
  type: 'liquid',
  image: 'liquids/Salt_Water.webp'
}

export const liquids = {
  water,
  pollutedWater,
  ethanol,
  saltWater
}