import {
  ROCKET_GRID_COLUMNS,
  rocketStackModules,
  type PlacedRocketStackModule,
} from "../components/rocket-builder/RocketBuilder";
import type { ClassicOxidizerId, ClassicRocketModules } from "./classicRocketFlight";
import {
  classicEngineUsesExternalFuelTanks,
  classicModulesWithNormalizedCargoKinds,
} from "./classicRocketFlight";
import {
  CLASSIC_CARGO_STACK_MODULE_KEYS,
  CLASSIC_CARGO_UID_PREFIX,
} from "./classicCargoBayKinds";
import {
  CLASSIC_RS_STACK_MODULE_KEYS,
  CLASSIC_RS_UID_PREFIX,
} from "./classicResearchSightseeingKinds";
import {
  CLASSIC_ROCKET_ENGINE_IDS,
  classicRocketEngineData,
  type ClassicEngineId,
  type RocketEngineId,
} from "../game-data/rocket";
import type { IRocketModule } from "../types/game-data-types";

export function classicEngineToRocketEngineId(id: ClassicEngineId): RocketEngineId {
  return CLASSIC_ROCKET_ENGINE_IDS[id];
}

function centeredModuleCol(mod: IRocketModule): number {
  return Math.max(0, Math.floor((ROCKET_GRID_COLUMNS - mod.width) / 2));
}

function classicStackHeightRows(
  classicEngineId: ClassicEngineId,
  modules: ClassicRocketModules,
  needsOxidizer: boolean,
): number {
  let h = 0;
  const add = (moduleKey: string, count: number) => {
    const mod = rocketStackModules[moduleKey];
    if (mod && count > 0) h += mod.height * count;
  };
  add("solidFuelThruster", modules.solidBoosters);
  if (classicEngineUsesExternalFuelTanks(classicEngineId)) {
    add("largeLiquidFuelTank", modules.fuelTanks);
  }
  if (needsOxidizer) {
    add("largeSolidOxidizerTank", modules.oxidizerTanks);
  }
  add("classicCargoBay", modules.cargoBays);
  const rsKinds = modules.researchSightseeingKinds ?? [];
  for (let i = 0; i < modules.researchSightseeing; i++) {
    const kind = rsKinds[i] ?? "research";
    add(CLASSIC_RS_STACK_MODULE_KEYS[kind], 1);
  }
  add("commandCapsule", modules.commandCapsules);
  return h;
}

/** Стек модулей для `RocketBuilder` по счётчикам классического калькулятора. */
export function buildClassicRocketPlacements(
  classicEngineId: ClassicEngineId,
  _oxidizer: ClassicOxidizerId,
  modules: ClassicRocketModules
): { engineId: RocketEngineId; placements: PlacedRocketStackModule[] } {
  const normalized = classicModulesWithNormalizedCargoKinds(modules);
  const engineId = classicEngineToRocketEngineId(classicEngineId);
  const needsOxidizer = classicRocketEngineData(classicEngineId).classicFlight?.needsOxidizer ?? true;

  const stackRows = classicStackHeightRows(classicEngineId, normalized, needsOxidizer);
  /** Только высота стека — без «пустой» зоны под maxHeight (readOnly сетка = фактическая ракета). */
  const moduleRows = stackRows;

  const out: PlacedRocketStackModule[] = [];
  let rowBottom = moduleRows;
  let uid = 0;

  const push = (moduleKey: string, count: number) => {
    const mod = rocketStackModules[moduleKey];
    if (!mod || count <= 0) return;
    for (let i = 0; i < count; i++) {
      if (rowBottom < mod.height) break;
      rowBottom -= mod.height;
      out.push({
        uid: `classic:${moduleKey}:${uid++}`,
        moduleKey,
        row: rowBottom,
        col: centeredModuleCol(mod),
      });
    }
  };

  push("solidFuelThruster", normalized.solidBoosters);
  if (classicEngineUsesExternalFuelTanks(classicEngineId)) {
    push("largeLiquidFuelTank", normalized.fuelTanks);
  }
  if (needsOxidizer && normalized.oxidizerTanks > 0) {
    push("largeSolidOxidizerTank", normalized.oxidizerTanks);
  }
  for (let i = 0; i < normalized.cargoBays; i++) {
    const kind = normalized.cargoBayKinds[i] ?? "solid";
    const moduleKey = CLASSIC_CARGO_STACK_MODULE_KEYS[kind];
    const mod = rocketStackModules[moduleKey];
    if (!mod) continue;
    if (rowBottom < mod.height) break;
    rowBottom -= mod.height;
    out.push({
      uid: `${CLASSIC_CARGO_UID_PREFIX}${i}`,
      moduleKey,
      row: rowBottom,
      col: centeredModuleCol(mod),
    });
  }
  for (let i = 0; i < normalized.researchSightseeing; i++) {
    const kind = normalized.researchSightseeingKinds[i] ?? "research";
    const moduleKey = CLASSIC_RS_STACK_MODULE_KEYS[kind];
    const mod = rocketStackModules[moduleKey];
    if (!mod) continue;
    if (rowBottom < mod.height) break;
    rowBottom -= mod.height;
    out.push({
      uid: `${CLASSIC_RS_UID_PREFIX}${i}`,
      moduleKey,
      row: rowBottom,
      col: centeredModuleCol(mod),
    });
  }
  push("commandCapsule", normalized.commandCapsules);

  return { engineId, placements: out };
}
