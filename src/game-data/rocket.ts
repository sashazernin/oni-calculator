import type { IRocketEngine, IRocketModule } from "../types/game-data-types"
import { gas } from "./gas"
import { liquids } from "./liquids"
import { other } from "./other"
import { resourses } from "./resourses"

const carbonDioxide: IRocketEngine = {
  name: "Carbon dioxide engine",
  type: 'rocket-engine',
  consumption: 16.7,
  fuel: gas.carbonDioxide,
  image: "rocket/Carbon_Dioxide_Engine.webp",
  maxHeight: 10,
  tank: 100,
  height: 2,
  width: 3,
}

const sugar: IRocketEngine = {
  name: "Sugar engine",
  type: 'rocket-engine',
  consumption: 75,
  fuel: resourses.sucrose,
  image: "rocket/Sugar_Engine.webp",
  maxHeight: 16,
  tank: 450,
  height: 3,
  width: 3,
}

const steam: IRocketEngine = {
  name: "Steam engine",
  type: 'rocket-engine',
  consumption: 15,
  fuel: gas.steam,
  image: "rocket/Steam_Engine.webp",
  maxHeight: 25,
  tank: 150,
  height: 5,
  width: 7,
}

const smallPetroleum: IRocketEngine = {
  name: "Small Petroleum engine",
  type: 'rocket-engine',
  consumption: 45,
  fuel: liquids.Petroleum,
  image: "rocket/Small_Petroleum_Engine.webp",
  maxHeight: 20,
  height: 4,
  width: 3,
}

const petroleum: IRocketEngine = {
  name: "Petroleum engine",
  type: 'rocket-engine',
  consumption: 90,
  fuel: liquids.Petroleum,
  image: "rocket/Petroleum_Engine.webp",
  maxHeight: 35,
  height: 5,
  width: 7,
}

const radbolt: IRocketEngine = {
  name: "Radbolt engine",
  type: 'rocket-engine',
  consumption: 200,
  fuel: other.redbolt,
  image: "rocket/Radbolt_Engine.webp",
  maxHeight: 20,
  tank: 4000,
  height: 5,
  width: 5,
}

const hydrogen: IRocketEngine = {
  name: "Hydrogen engine",
  type: 'rocket-engine',
  consumption: 56.3,
  fuel: gas.hydrogen,
  image: "rocket/Hydrogen_Engine.webp",
  maxHeight: 35,
  height: 5,
  width: 7,
}

export const rocketEngines = {
  carbonDioxide,
  sugar,
  steam,
  smallPetroleum,
  petroleum,
  radbolt,
  hydrogen,
} as const;

export type RocketEngineId = keyof typeof rocketEngines;

const rocketPlatform: IRocketModule = {
  name: "Rocket Platform",
  type: 'rocket-module',
  image: "rocket/Rocket_Platform.png",
  height: 2,
  width: 7,
}

export const rocketModules = {
  rocketPlatform
}

/** Ширина сетки ракеты в ячейках (по платформе). */
export const ROCKET_GRID_COLUMNS = rocketModules.rocketPlatform.width

/**
 * Каталог модулей для стопки над двигателем (не платформа).
 * Добавляйте сюда элементы — они появятся в диалоге «+».
 */
export const rocketStackModules: Record<string, IRocketModule> = {}

/** Сколько рядов ячеек сетки доступно под модули над двигателем (maxHeight минус высота двигателя, без платформы). */
export function rocketModuleCellBudget(engine: IRocketEngine): number {
  return Math.max(0, engine.maxHeight - engine.height)
}