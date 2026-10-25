/** Модель полёта ракеты базовой игры (как oni-rocket.kim-g.ru / mass penalty neoazureus). */

import {
  normalizeCargoBayKinds,
  type ClassicCargoBayKind,
} from "./classicCargoBayKinds";
import {
  CLASSIC_RS_STACK_MODULE_KEYS,
  normalizeResearchSightseeingKinds,
  type ClassicResearchSightseeingKind,
} from "./classicResearchSightseeingKinds";
import {
  CLASSIC_LARGE_SOLID_OXIDIZER_CAPACITY_KG,
  CLASSIC_MAX_LIQUID_FUEL_TANKS,
  CLASSIC_MAX_OXIDIZER_TANKS,
  CLASSIC_OXIDIZER_EFFICIENCY_MULT,
  CLASSIC_ROCKET_ENGINE_IDS,
  ROCKET_EXTERNAL_TANK_KG,
  classicRocketEngineData,
  rocketCargos,
  rocketHeads,
  rocketModules,
  rocketModuleClassicDryKg,
  rocketTanks,
  type ClassicEngineId,
  type ClassicOxidizerId,
} from "../game-data/rocket";

export type { ClassicEngineId, ClassicOxidizerId };

export type ClassicRocketModules = {
  cargoBays: number;
  /** Вид каждого грузового отсека (длина = `cargoBays`). */
  cargoBayKinds: ClassicCargoBayKind[];
  researchSightseeing: number;
  /** Исследовательский или туристический модуль на каждый слот. */
  researchSightseeingKinds: ClassicResearchSightseeingKind[];
  solidBoosters: number;
  fuelTanks: number;
  oxidizerTanks: number;
  commandCapsules: number;
};

export const DEFAULT_CLASSIC_MODULES: ClassicRocketModules = {
  cargoBays: 0,
  cargoBayKinds: [],
  researchSightseeing: 0,
  researchSightseeingKinds: [],
  solidBoosters: 0,
  fuelTanks: 1,
  oxidizerTanks: 1,
  commandCapsules: 1,
};

export function classicModulesWithNormalizedCargoKinds(
  modules: ClassicRocketModules,
): ClassicRocketModules {
  return {
    ...modules,
    commandCapsules: 1,
    cargoBayKinds: normalizeCargoBayKinds(
      modules.cargoBays,
      modules.cargoBayKinds,
    ),
    researchSightseeingKinds: normalizeResearchSightseeingKinds(
      modules.researchSightseeing,
      modules.researchSightseeingKinds,
    ),
  };
}

/** Дистанции «состояний» полёта в базовой игре (км), шаг 10 000. */
export const CLASSIC_TARGET_DISTANCE_MIN_KM = 10_000;
export const CLASSIC_TARGET_DISTANCE_MAX_KM = 210_000;
export const CLASSIC_TARGET_DISTANCE_STEP_KM = 10_000;

export const CLASSIC_TARGET_DISTANCES_KM: readonly number[] = Array.from(
  { length: (CLASSIC_TARGET_DISTANCE_MAX_KM - CLASSIC_TARGET_DISTANCE_MIN_KM) / CLASSIC_TARGET_DISTANCE_STEP_KM + 1 },
  (_, i) => CLASSIC_TARGET_DISTANCE_MIN_KM + i * CLASSIC_TARGET_DISTANCE_STEP_KM
);

export type ClassicTargetDistanceKm = (typeof CLASSIC_TARGET_DISTANCES_KM)[number];

export function parseClassicTargetDistanceKm(raw: unknown): ClassicTargetDistanceKm {
  const fallback = CLASSIC_TARGET_DISTANCE_MIN_KM;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return fallback;
  const stepped =
    Math.round(raw / CLASSIC_TARGET_DISTANCE_STEP_KM) * CLASSIC_TARGET_DISTANCE_STEP_KM;
  const clamped = Math.max(
    CLASSIC_TARGET_DISTANCE_MIN_KM,
    Math.min(CLASSIC_TARGET_DISTANCE_MAX_KM, stepped)
  );
  return clamped as ClassicTargetDistanceKm;
}

export type ClassicFlightSnapshot = {
  engineId: ClassicEngineId;
  oxidizer: ClassicOxidizerId;
  modules: ClassicRocketModules;
  /** Целевое состояние / дистанция полёта (км). */
  targetDistanceKm: ClassicTargetDistanceKm;
};

export function defaultClassicFlightSnapshot(): ClassicFlightSnapshot {
  return {
    engineId: "petroleum",
    oxidizer: "oxylite",
    modules: { ...DEFAULT_CLASSIC_MODULES },
    targetDistanceKm: CLASSIC_TARGET_DISTANCE_MIN_KM,
  };
}

/** @deprecated Используйте `ROCKET_EXTERNAL_TANK_KG` из `game-data/rocket`. */
export const CLASSIC_FUEL_PER_TANK_KG = ROCKET_EXTERNAL_TANK_KG;

/** @deprecated Используйте `CLASSIC_LARGE_SOLID_OXIDIZER_CAPACITY_KG`. */
export const CLASSIC_OXIDIZER_PER_TANK_KG = CLASSIC_LARGE_SOLID_OXIDIZER_CAPACITY_KG;

function classicEngineFlight(id: ClassicEngineId) {
  const cf = classicRocketEngineData(id).classicFlight;
  if (!cf) {
    throw new Error(`classicFlight is not defined for engine "${id}"`);
  }
  return cf;
}

function classicSteamMaxFuelKg(): number {
  const cf = classicEngineFlight("steam");
  return cf.maxFuelKg ?? classicRocketEngineData("steam").tank ?? 150;
}

export const CLASSIC_STEAM_MAX_FUEL_KG = classicSteamMaxFuelKg();

const solidBoosterClassic = rocketModules.solidFuelThruster.classicFlight;

export const CLASSIC_SOLID_BOOSTER_RANGE_KM = solidBoosterClassic?.boosterRangeKm ?? 12_000;
export const CLASSIC_SOLID_BOOSTER_DRY_KG = rocketModuleClassicDryKg(rocketModules.solidFuelThruster);
export const CLASSIC_SOLID_BOOSTER_WET_KG = solidBoosterClassic?.boosterWetKg ?? 800;

const classicFuelTankModule = rocketTanks.largeLiquidFuelTank;
const classicOxidizerTankModule = rocketTanks.largeSolidOxidizerTank;

function classicFuelCapacityPerTankKg(): number {
  return classicFuelTankModule.classicFlight?.fuelCapacityKg ?? ROCKET_EXTERNAL_TANK_KG;
}

function classicOxidizerCapacityPerTankKg(): number {
  return (
    classicOxidizerTankModule.classicFlight?.oxidizerCapacityKg ??
    CLASSIC_LARGE_SOLID_OXIDIZER_CAPACITY_KG
  );
}

export type ClassicRocketEngineView = {
  nameKey: string;
  image: string;
  efficiencyKmPerKg: number;
  engineDryKg: number;
  needsOxidizer: boolean;
};

function buildClassicRocketEngineView(id: ClassicEngineId): ClassicRocketEngineView {
  const eng = classicRocketEngineData(id);
  const cf = classicEngineFlight(id);
  return {
    nameKey: eng.name,
    image: eng.image,
    efficiencyKmPerKg: cf.efficiencyKmPerKg,
    engineDryKg: cf.dryKg,
    needsOxidizer: cf.needsOxidizer,
  };
}

export const classicRocketEngines = Object.fromEntries(
  (Object.keys(CLASSIC_ROCKET_ENGINE_IDS) as ClassicEngineId[]).map((id) => [
    id,
    buildClassicRocketEngineView(id),
  ])
) as Record<ClassicEngineId, ClassicRocketEngineView>;

export const CLASSIC_OXIDIZER_MULT: Record<ClassicOxidizerId, number> =
  CLASSIC_OXIDIZER_EFFICIENCY_MULT;

/** Внешние топливные баки (классический калькулятор). У пара — только встроенный бак двигателя. */
export function classicEngineUsesExternalFuelTanks(engineId: ClassicEngineId): boolean {
  return classicRocketEngineData(engineId).allowsExternalFuelTank;
}

export function classicMassPenaltyKg(totalMassKg: number): number {
  if (totalMassKg <= 0) return 0;
  const nonlinear = (totalMassKg / 300) ** 3.2;
  return Math.max(totalMassKg, nonlinear);
}

function classicResearchSightseeingDryMassKg(
  modules: ClassicRocketModules,
): number {
  const kinds = normalizeResearchSightseeingKinds(
    modules.researchSightseeing,
    modules.researchSightseeingKinds,
  );
  let sum = 0;
  for (const kind of kinds) {
    const key = CLASSIC_RS_STACK_MODULE_KEYS[kind];
    const mod = rocketModules[key as keyof typeof rocketModules];
    if (mod) sum += rocketModuleClassicDryKg(mod);
  }
  return sum;
}

export function classicDryMassKg(
  engineId: ClassicEngineId,
  modules: ClassicRocketModules
): number {
  const eng = classicRocketEngines[engineId];
  return (
    eng.engineDryKg +
    modules.commandCapsules * rocketModuleClassicDryKg(rocketHeads.commandCapsule) +
    modules.cargoBays * rocketModuleClassicDryKg(rocketCargos.classicCargoBay) +
    classicResearchSightseeingDryMassKg(modules) +
    (classicEngineUsesExternalFuelTanks(engineId)
      ? modules.fuelTanks * rocketModuleClassicDryKg(classicFuelTankModule)
      : 0) +
    modules.oxidizerTanks * rocketModuleClassicDryKg(classicOxidizerTankModule) +
    modules.solidBoosters * CLASSIC_SOLID_BOOSTER_DRY_KG
  );
}

export function classicFuelMassKg(engineId: ClassicEngineId, fuelTanks: number): number {
  if (!classicEngineUsesExternalFuelTanks(engineId)) {
    return classicSteamMaxFuelKg();
  }
  if (fuelTanks <= 0) return 0;
  const perTank = classicFuelCapacityPerTankKg();
  return Math.min(fuelTanks * perTank, CLASSIC_MAX_LIQUID_FUEL_TANKS * perTank);
}

export function classicOxidizerMassKg(
  engineId: ClassicEngineId,
  oxidizerTanks: number,
  fuelMassKg: number
): number {
  const eng = classicRocketEngines[engineId];
  if (!eng.needsOxidizer || oxidizerTanks <= 0) return 0;
  const perTank = classicOxidizerCapacityPerTankKg();
  const capacity = Math.min(
    oxidizerTanks * perTank,
    CLASSIC_MAX_OXIDIZER_TANKS * perTank,
  );
  return Math.min(capacity, fuelMassKg);
}

export function classicBurnableFuelKg(
  engineId: ClassicEngineId,
  fuelMassKg: number,
  oxidizerMassKg: number
): number {
  const eng = classicRocketEngines[engineId];
  if (!eng.needsOxidizer) return fuelMassKg;
  return Math.min(fuelMassKg, oxidizerMassKg);
}

export type ClassicFlightStats = {
  dryMassKg: number;
  fuelMassKg: number;
  oxidizerMassKg: number;
  wetMassKg: number;
  baseDistanceKm: number;
  massPenaltyKm: number;
  finalDistanceKm: number;
  burnableFuelKg: number;
};

export function computeClassicFlightStats(
  engineId: ClassicEngineId,
  oxidizer: ClassicOxidizerId,
  modules: ClassicRocketModules,
  fuelMassOverrideKg?: number
): ClassicFlightStats {
  const fuelMassKg =
    fuelMassOverrideKg !== undefined
      ? Math.max(0, fuelMassOverrideKg)
      : classicFuelMassKg(engineId, modules.fuelTanks);
  const oxidizerMassKg = classicOxidizerMassKg(engineId, modules.oxidizerTanks, fuelMassKg);
  const burnableFuelKg = classicBurnableFuelKg(engineId, fuelMassKg, oxidizerMassKg);
  const eng = classicRocketEngines[engineId];
  const oxMult = eng.needsOxidizer ? CLASSIC_OXIDIZER_MULT[oxidizer] : 1;
  const boosterKm = modules.solidBoosters * CLASSIC_SOLID_BOOSTER_RANGE_KM;
  const baseDistanceKm = burnableFuelKg * eng.efficiencyKmPerKg * oxMult + boosterKm;

  const dryMassKg = classicDryMassKg(engineId, modules);
  const wetMassKg =
    dryMassKg +
    fuelMassKg +
    oxidizerMassKg +
    modules.solidBoosters * CLASSIC_SOLID_BOOSTER_WET_KG;

  const massPenaltyKm = classicMassPenaltyKg(wetMassKg);
  const finalDistanceKm = Math.max(0, baseDistanceKm - massPenaltyKm);

  return {
    dryMassKg,
    fuelMassKg,
    oxidizerMassKg,
    wetMassKg,
    baseDistanceKm,
    massPenaltyKm,
    finalDistanceKm,
    burnableFuelKg,
  };
}

/** Кривая «итоговое расстояние» при фиксированной конфигурации и переменной массе топлива. */
export function sampleClassicDistanceCurve(
  engineId: ClassicEngineId,
  oxidizer: ClassicOxidizerId,
  modules: ClassicRocketModules,
  maxFuelKg: number,
  stepKg = 4
): { fuelKg: number; distanceKm: number }[] {
  const points: { fuelKg: number; distanceKm: number }[] = [];
  const max = Math.max(0, Math.ceil(maxFuelKg));
  for (let fuelKg = 0; fuelKg <= max; fuelKg += stepKg) {
    const stats = computeClassicFlightStats(engineId, oxidizer, modules, fuelKg);
    points.push({ fuelKg, distanceKm: stats.finalDistanceKm });
  }
  return points;
}

export function classicMaxFuelKgForGraph(engineId: ClassicEngineId, fuelTanks: number): number {
  if (engineId === "steam") return classicSteamMaxFuelKg();
  const perTank = classicFuelCapacityPerTankKg();
  const tanks = Math.max(fuelTanks, 1);
  return Math.min(tanks * perTank, CLASSIC_MAX_LIQUID_FUEL_TANKS * perTank);
}

export type ClassicRequiredMassForTarget = {
  fuelKg: number;
  oxidizerKg: number;
};

/** Минимальная масса топлива (и окислителя) для достижения `targetDistanceKm` при текущей сборке. */
export function classicRequiredMassForTargetKm(
  engineId: ClassicEngineId,
  oxidizer: ClassicOxidizerId,
  modules: ClassicRocketModules,
  targetDistanceKm: number
): ClassicRequiredMassForTarget | null {
  const eng = classicRocketEngines[engineId];
  const oxMult = eng.needsOxidizer ? CLASSIC_OXIDIZER_MULT[oxidizer] : 1;
  const boosterKm = modules.solidBoosters * CLASSIC_SOLID_BOOSTER_RANGE_KM;

  const maxFromTanks = classicFuelMassKg(engineId, modules.fuelTanks);
  const roughFuelKg = Math.max(
    0,
    (targetDistanceKm - boosterKm) / Math.max(1, eng.efficiencyKmPerKg * oxMult)
  );
  const searchMax = Math.min(
    20_000,
    Math.max(
      maxFromTanks,
      Math.ceil(roughFuelKg * 2.5) + 50,
      engineId === "steam" ? classicSteamMaxFuelKg() : classicFuelCapacityPerTankKg()
    )
  );

  let foundFuel: number | null = null;
  for (let fuelKg = 0; fuelKg <= searchMax; fuelKg++) {
    const stats = computeClassicFlightStats(engineId, oxidizer, modules, fuelKg);
    if (stats.finalDistanceKm >= targetDistanceKm) {
      foundFuel = fuelKg;
      break;
    }
  }

  if (foundFuel === null) return null;

  const atTarget = computeClassicFlightStats(engineId, oxidizer, modules, foundFuel);
  return {
    fuelKg: foundFuel,
    oxidizerKg: atTarget.oxidizerMassKg,
  };
}

/** Максимум топлива (кг), который помещается в текущие топливные баки / встроенный бак. */
export function classicMaxStorableFuelKg(
  engineId: ClassicEngineId,
  modules: ClassicRocketModules
): number {
  return classicFuelMassKg(engineId, modules.fuelTanks);
}

export function classicRequiredExceedsFuelTankCapacity(
  engineId: ClassicEngineId,
  modules: ClassicRocketModules,
  required: ClassicRequiredMassForTarget
): boolean {
  return required.fuelKg > classicMaxStorableFuelKg(engineId, modules);
}

function classicMinFuelTanksForFuelKg(fuelKg: number): number {
  if (fuelKg <= 0) return 0;
  const perTank = classicFuelCapacityPerTankKg();
  return Math.min(
    CLASSIC_MAX_LIQUID_FUEL_TANKS,
    Math.max(1, Math.ceil(fuelKg / perTank)),
  );
}

function classicMinOxidizerTanksForOxidizerKg(oxidizerKg: number): number {
  if (oxidizerKg <= 0) return 0;
  const perTank = classicOxidizerCapacityPerTankKg();
  return Math.min(
    CLASSIC_MAX_OXIDIZER_TANKS,
    Math.max(1, Math.ceil(oxidizerKg / perTank)),
  );
}

/** Есть ли такие числа баков, при которых цель достижима с заправкой в пределах ёмкости. */
function classicTargetReachableWithSomeTankCounts(
  engineId: ClassicEngineId,
  oxidizer: ClassicOxidizerId,
  modules: ClassicRocketModules,
  targetDistanceKm: number,
): boolean {
  const eng = classicRocketEngines[engineId];
  const usesExternalFuel = classicEngineUsesExternalFuelTanks(engineId);
  const maxFuelTanks = usesExternalFuel ? CLASSIC_MAX_LIQUID_FUEL_TANKS : 0;
  const maxOxTanks = eng.needsOxidizer ? CLASSIC_MAX_OXIDIZER_TANKS : 0;

  for (let fuelTanks = 0; fuelTanks <= maxFuelTanks; fuelTanks++) {
    for (let oxidizerTanks = 0; oxidizerTanks <= maxOxTanks; oxidizerTanks++) {
      const trial: ClassicRocketModules = {
        ...modules,
        commandCapsules: 1,
        fuelTanks,
        oxidizerTanks,
      };
      const required = classicRequiredMassForTargetKm(
        engineId,
        oxidizer,
        trial,
        targetDistanceKm,
      );
      if (required === null) continue;

      const maxFuelKg = classicMaxStorableFuelKg(engineId, trial);
      if (required.fuelKg > maxFuelKg) continue;

      const oxidizerAtRequired = classicOxidizerMassKg(
        engineId,
        oxidizerTanks,
        required.fuelKg,
      );
      if (required.oxidizerKg > oxidizerAtRequired) continue;

      return true;
    }
  }
  return false;
}

/** Цель недостижима ни при каком допустимом числе баков. */
export function classicTargetUnreachableInPrinciple(
  engineId: ClassicEngineId,
  oxidizer: ClassicOxidizerId,
  modules: ClassicRocketModules,
  targetDistanceKm: number,
): boolean {
  return !classicTargetReachableWithSomeTankCounts(
    engineId,
    oxidizer,
    modules,
    targetDistanceKm,
  );
}

/** Нужно ли пересчитать баки при частичном обновлении `modules`. */
export function classicModulePatchAffectsTankSync(
  prev: ClassicRocketModules,
  patch: Partial<ClassicRocketModules>,
): boolean {
  for (const key of Object.keys(patch) as (keyof ClassicRocketModules)[]) {
    if (
      key === "fuelTanks" ||
      key === "oxidizerTanks" ||
      key === "cargoBayKinds" ||
      key === "researchSightseeingKinds"
    ) {
      continue;
    }
    if (patch[key] !== prev[key]) return true;
  }
  return false;
}

/**
 * Подбирает число топливных и окислительных баков под целевую дистанцию
 * (с учётом роста сухой массы от самих баков).
 */
export function classicModulesWithSyncedTanksForTarget(
  engineId: ClassicEngineId,
  oxidizer: ClassicOxidizerId,
  modules: ClassicRocketModules,
  targetDistanceKm: number,
): ClassicRocketModules {
  if (
    classicTargetUnreachableInPrinciple(
      engineId,
      oxidizer,
      modules,
      targetDistanceKm,
    )
  ) {
    return { ...modules, commandCapsules: 1 };
  }

  const eng = classicRocketEngines[engineId];
  const usesExternalFuel = classicEngineUsesExternalFuelTanks(engineId);

  let fuelTanks = usesExternalFuel ? modules.fuelTanks : 0;
  let oxidizerTanks = modules.oxidizerTanks;

  for (let iter = 0; iter < 32; iter++) {
    const trial: ClassicRocketModules = {
      ...modules,
      commandCapsules: 1,
      fuelTanks,
      oxidizerTanks,
    };
    const required = classicRequiredMassForTargetKm(
      engineId,
      oxidizer,
      trial,
      targetDistanceKm,
    );

    let nextFuel = fuelTanks;
    let nextOx = oxidizerTanks;

    if (!usesExternalFuel) {
      nextFuel = 0;
    } else if (required === null) {
      if (usesExternalFuel && fuelTanks < CLASSIC_MAX_LIQUID_FUEL_TANKS) {
        nextFuel = fuelTanks + 1;
      } else if (usesExternalFuel) {
        nextFuel = CLASSIC_MAX_LIQUID_FUEL_TANKS;
      } else {
        nextFuel = 0;
      }
    } else if (required.fuelKg <= 0) {
      nextFuel = 0;
    } else {
      nextFuel = classicMinFuelTanksForFuelKg(required.fuelKg);
    }

    if (!eng.needsOxidizer) {
      nextOx = 0;
    } else if (required === null) {
      if (eng.needsOxidizer && oxidizerTanks < CLASSIC_MAX_OXIDIZER_TANKS) {
        nextOx = oxidizerTanks + 1;
      } else if (eng.needsOxidizer) {
        const maxFuelKg =
          (usesExternalFuel ? CLASSIC_MAX_LIQUID_FUEL_TANKS : 0) *
            classicFuelCapacityPerTankKg() ||
          classicSteamMaxFuelKg();
        nextOx = classicMinOxidizerTanksForOxidizerKg(maxFuelKg);
      } else {
        nextOx = 0;
      }
    } else if (required.oxidizerKg <= 0 && required.fuelKg <= 0) {
      nextOx = 0;
    } else {
      nextOx = classicMinOxidizerTanksForOxidizerKg(required.oxidizerKg);
    }

    if (nextFuel === fuelTanks && nextOx === oxidizerTanks) {
      return {
        ...modules,
        commandCapsules: 1,
        fuelTanks: nextFuel,
        oxidizerTanks: nextOx,
      };
    }
    fuelTanks = nextFuel;
    oxidizerTanks = nextOx;
  }

  return {
    ...modules,
    commandCapsules: 1,
    fuelTanks,
    oxidizerTanks,
  };
}
