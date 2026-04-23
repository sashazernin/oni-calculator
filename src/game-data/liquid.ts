import type { ILiquid } from "../types/game-data-types"

export const water: ILiquid = {
  name: 'Water',
  type: 'liquid',
  image: 'liquids/Liquid_Water.webp'
}

export const liquid: { [key: string]: ILiquid } = {
  water
}