import type { IRocketEngine, IRocketModule } from "../types/game-data-types"
import { gas } from "./gas"
import { liquids } from "./liquids"
import { other } from "./other"
import { resourses } from "./resourses"

const carbonDioxide: IRocketEngine = {
  name: "gd_rocket_engine_carbon_dioxide",
  type: 'rocket-engine',
  consumption: 16.666666666,
  fuel: gas.carbonDioxide,
  image: "rocket/Carbon_Dioxide_Engine.webp",
  maxHeight: 10,
  tank: 100,
  allowsExternalFuelTank: false,
  height: 2,
  width: 3,
}

const sugar: IRocketEngine = {
  name: "gd_rocket_engine_sugar",
  type: 'rocket-engine',
  consumption: 75,
  fuel: resourses.sucrose,
  image: "rocket/Sugar_Engine.webp",
  maxHeight: 16,
  tank: 450,
  allowsExternalFuelTank: false,
  height: 3,
  width: 3,
}

const steam: IRocketEngine = {
  name: "gd_rocket_engine_steam",
  type: 'rocket-engine',
  consumption: 15,
  fuel: gas.steam,
  image: "rocket/Steam_Engine.webp",
  maxHeight: 25,
  tank: 150,
  allowsExternalFuelTank: false,
  height: 5,
  width: 7,
}

const smallPetroleum: IRocketEngine = {
  name: "gd_rocket_engine_small_petroleum",
  type: 'rocket-engine',
  consumption: 45,
  fuel: liquids.Petroleum,
  image: "rocket/Small_Petroleum_Engine.webp",
  maxHeight: 20,
  tank: 450,
  allowsExternalFuelTank: true,
  height: 4,
  width: 3,
}

const petroleum: IRocketEngine = {
  name: "gd_rocket_engine_petroleum",
  type: 'rocket-engine',
  consumption: 90,
  fuel: liquids.Petroleum,
  image: "rocket/Petroleum_Engine.webp",
  maxHeight: 35,
  allowsExternalFuelTank: true,
  height: 5,
  width: 7,
}

const radbolt: IRocketEngine = {
  name: "gd_rocket_engine_radbolt",
  type: 'rocket-engine',
  consumption: 200,
  fuel: other.redbolt,
  image: "rocket/Radbolt_Engine.webp",
  maxHeight: 20,
  tank: 4000,
  allowsExternalFuelTank: false,
  height: 5,
  width: 5,
}

const hydrogen: IRocketEngine = {
  name: "gd_rocket_engine_hydrogen",
  type: 'rocket-engine',
  consumption: 56.3,
  fuel: gas.hydrogen,
  image: "rocket/Hydrogen_Engine.webp",
  maxHeight: 35,
  allowsExternalFuelTank: true,
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

/** Вместимость одного внешнего топливного модуля (кг), если у двигателя нет встроенного бака. */
export const ROCKET_EXTERNAL_TANK_KG = 900

/** Вместимость модуля окислителя (кг), любой тип. */
export const ROCKET_OXIDIZER_TANK_KG = 450

/**
 * Кг окислителя на 1 кг топлива.
 * Соотношения: удобрение 1:1, кислолит 1:2, жидкий кислород 1:4 (1 кг окислителя на X кг топлива).
 */
export const ROCKET_OXIDIZER_KG_PER_FUEL_KG = {
  fertilizer: 1,
  oxylite: 1 / 2,
  liquidOxygen: 1 / 4,
} as const

export type RocketOxidizerVariant = keyof typeof ROCKET_OXIDIZER_KG_PER_FUEL_KG

export type RocketOxidizerPlanLine = {
  variant: RocketOxidizerVariant
  /** Ключ `gd_*` для перевода. */
  translationKey: string
  /** Путь к иконке в `game-data/assets`. */
  image: string
  totalOxidizerKg: number
  oxidizerTanksNeeded: number
}

export type RocketFuelPlan = {
  steps: number
  totalFuelKg: number
  /** Объём одного модуля в расчёте: внешний топливный = 900; только встроенный — вместимость бака. */
  volumePerTankKg: number
  /** Число внешних топливных модулей (после учёта встроенного бака). */
  tanksNeeded: number
  /** Есть встроенный бак в расчёте / подписи UI. */
  usesIntegratedTank: boolean
  /** Расчёт по видам окислителя — только если нужен внешний топливный бак и топливо нефть или водород. */
  oxidizerLines?: RocketOxidizerPlanLine[]
}

/** Число прыжков по маршруту (ребра между шестиугольниками). */
export function rocketRouteSteps(way: number[] | null | undefined): number {
  if (!way || way.length < 2) return 0
  return way.length - 1
}

/** Двигатель с внешним топливным модулем, для которого нужны отдельные баки окислителя (нефть / водород). */
export function rocketEngineNeedsOxidizerTanks(engine: IRocketEngine): boolean {
  if (!engine.allowsExternalFuelTank) return false
  return engine.fuel === liquids.Petroleum || engine.fuel === gas.hydrogen
}

function computeOxidizerLines(totalFuelKg: number): RocketOxidizerPlanLine[] {
  if (totalFuelKg <= 0) return []
  const keyByVariant: Record<RocketOxidizerVariant, string> = {
    fertilizer: resourses.fertilizer.name,
    oxylite: resourses.oxylite.name,
    liquidOxygen: liquids.liquidOxygen.name,
  }
  const imageByVariant: Record<RocketOxidizerVariant, string> = {
    fertilizer: resourses.fertilizer.image,
    oxylite: resourses.oxylite.image,
    liquidOxygen: liquids.liquidOxygen.image,
  }
  return (Object.keys(ROCKET_OXIDIZER_KG_PER_FUEL_KG) as RocketOxidizerVariant[]).map(
    (variant) => {
      const totalOxidizerKg = totalFuelKg * ROCKET_OXIDIZER_KG_PER_FUEL_KG[variant]
      const oxidizerTanksNeeded =
        totalOxidizerKg <= 0 ? 0 : Math.ceil(totalOxidizerKg / ROCKET_OXIDIZER_TANK_KG)
      return {
        variant,
        translationKey: keyByVariant[variant],
        image: imageByVariant[variant],
        totalOxidizerKg,
        oxidizerTanksNeeded,
      }
    },
  )
}

/** Достаточно ли топлива для маршрута: встроенный бак ограничен; внешние модули считаем безлимитными. */
export function isRocketEngineFeasibleForSteps(
  engine: IRocketEngine,
  steps: number,
): boolean {
  if (steps <= 0) return true
  if (engine.allowsExternalFuelTank) return true
  const needKg = steps * engine.consumption
  if (engine.tank === undefined) return false
  return needKg <= engine.tank
}

export function computeRocketFuelPlan(
  engine: IRocketEngine,
  steps: number,
): RocketFuelPlan {
  const totalFuelKg = Math.max(0, steps * engine.consumption)
  const internalCap = engine.tank ?? 0
  const hasInternal = internalCap > 0
  const { allowsExternalFuelTank: allowsExt } = engine

  let tanksNeeded = 0
  let volumePerTankKg: number
  let usesIntegratedTank: boolean

  if (steps <= 0 || totalFuelKg === 0) {
    tanksNeeded = 0
    volumePerTankKg = allowsExt && !hasInternal ? ROCKET_EXTERNAL_TANK_KG : internalCap || ROCKET_EXTERNAL_TANK_KG
    usesIntegratedTank = hasInternal
  } else if (!allowsExt) {
    tanksNeeded = 0
    volumePerTankKg = internalCap
    usesIntegratedTank = hasInternal
  } else if (!hasInternal) {
    tanksNeeded = Math.ceil(totalFuelKg / ROCKET_EXTERNAL_TANK_KG)
    volumePerTankKg = ROCKET_EXTERNAL_TANK_KG
    usesIntegratedTank = false
  } else {
    const fromExternalKg = Math.max(0, totalFuelKg - internalCap)
    tanksNeeded =
      fromExternalKg <= 0 ? 0 : Math.ceil(fromExternalKg / ROCKET_EXTERNAL_TANK_KG)
    volumePerTankKg = ROCKET_EXTERNAL_TANK_KG
    usesIntegratedTank = true
  }

  const oxidizerLines =
    rocketEngineNeedsOxidizerTanks(engine) && steps > 0 && totalFuelKg > 0
      ? computeOxidizerLines(totalFuelKg)
      : undefined

  return {
    steps,
    totalFuelKg,
    volumePerTankKg,
    tanksNeeded,
    usesIntegratedTank,
    oxidizerLines,
  }
}

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

/** Размер ячейки сетки (px). */
export const ROCKET_CELL_PX = 40

/**
 * Каталог модулей для стопки над двигателем (не платформа).
 * Добавляйте сюда элементы — они появятся в диалоге «+».
 */
export const rocketStackModules: Record<string, IRocketModule> = {}

/** Размещённый над двигателем модуль (якорь — верхняя левая ячейка сетки). */
export type PlacedRocketStackModule = {
  uid: string;
  moduleKey: string;
  row: number;
  col: number;
}

/** Сколько рядов ячеек сетки доступно под модули над двигателем (maxHeight минус высота двигателя, без платформы). */
export function rocketModuleCellBudget(engine: IRocketEngine): number {
  return Math.max(0, engine.maxHeight - engine.height)
}