import type { IRocketEngine, IRocketModule } from "../../types/game-data-types";

/** Подстройка спрайта к сетке: увеличение «холста» картинки в px со сторон. */
export type RocketModuleSpriteInset = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

/**
 * Смещения по полю `image` у объекта модуля/двигателя (как в `rocket.ts`).
 * Если пути здесь нет — инсеты {0}.
 *
 * Вынесено из `rocket-modules.tsx`, чтобы не было цикла RocketBuilder → rocket-modules → RocketBuilder
 * (иначе при первой загрузке таблица инсетов может быть неполной).
 */
export const ROCKET_MODULE_SPRITE_INSETS: Record<
  string,
  RocketModuleSpriteInset
> = {
  "rocket/Rocket_Platform.webp": { top: 20, bottom: 6 },
  "rocket/engines/Small_Petroleum_Engine.webp": {
    bottom: 2,
    top: 0,
    left: 10,
    right: 10,
  },
  "rocket/engines/Petroleum_Engine.webp": {
    bottom: 14,
    top: 0,
    left: 10,
    right: 10,
  },
  "rocket/engines/Hydrogen_Engine.webp": { bottom: 30, left: 20, right: 30 },
  "rocket/engines/Carbon_Dioxide_Engine.webp": {
    bottom: 10,
    top: 2,
    left: 20,
    right: 20,
  },
  "rocket/engines/Sugar_Engine.webp": { bottom: 16, left: 20, right: 10 },
  "rocket/engines/Steam_Engine.webp": { bottom: 4 },
  "rocket/engines/Radbolt_Engine.webp": {
    bottom: 10,
    top: 2,
    left: 30,
    right: 30,
  },
  "rocket/modules/Artifact_Transport_Module.webp": {
    bottom: 0,
    top: 0,
    left: 20,
    right: 20,
  },
  "rocket/modules/Battery_Module.webp": {
    bottom: 0,
    top: 0,
    left: 40,
    right: 40,
  },
  "rocket/modules/Cartographic_Module.webp": {
    bottom: 0,
    top: 0,
    left: 16,
    right: 10,
  },
  "rocket/modules/Orbital_Cargo_Module.webp": {
    bottom: 16,
    top: 16,
    left: 60,
    right: 60,
  },
  "rocket/modules/Research_Module.webp": {
    bottom: 0,
    top: 0,
    left: 30,
    right: 30,
  },
  "rocket/modules/Rover_Module.webp": {
    bottom: 4,
    top: 0,
    left: 30,
    right: 30,
  },
  "rocket/modules/Solar_Panel_Module.webp": {
    bottom: 0,
    top: 0,
    left: 30,
    right: 30,
  },
  "rocket/cargos/Biological_Cargo_Bay.webp": {
    bottom: 0,
    top: 1,
    left: 30,
    right: 30,
  },
  "rocket/cargos/Cargo_Bay.webp": { bottom: 0, top: 0, left: 30, right: 30 },
  "rocket/cargos/Gas_Cargo_Canister.webp": {
    bottom: 0,
    top: 0,
    left: 30,
    right: 30,
  },
  "rocket/cargos/Large_Cargo_Bay.webp": {
    bottom: 0,
    top: 0,
    left: 40,
    right: 20,
  },
  "rocket/cargos/Large_Gas_Cargo_Canister.webp": {
    bottom: 0,
    top: 0,
    left: 30,
    right: 30,
  },
  "rocket/cargos/Liquid_Cargo_Tank.webp": {
    bottom: 0,
    top: 0,
    left: 30,
    right: 30,
  },
  'rocket/modules/Trailblazer_Module.webp': {
    bottom: 0,
    top: 0,
    left: 30,
    right: 30,
  },
};

/** Инсеты из `ROCKET_MODULE_SPRITE_INSETS` по `module.image` (нет ключа → нули). */
export function getRocketModuleSpriteInset(
  module: IRocketModule | IRocketEngine,
): Required<RocketModuleSpriteInset> {
  const s = ROCKET_MODULE_SPRITE_INSETS[module.image];
  return {
    top: s?.top ?? 0,
    right: s?.right ?? 0,
    bottom: s?.bottom ?? 0,
    left: s?.left ?? 0,
  };
}
