export interface IResourse {
  /** Ключ перевода из `gameDataTranslations` (`gd_*`). */
  name: string;
  type: "resourse";
  image: string;
}

export interface ILiquid {
  /** Ключ перевода из `gameDataTranslations` (`gd_*`). */
  name: string;
  type: "liquid";
  image: string;
}

export interface IPlant {
  /** Ключ перевода из `gameDataTranslations` (`gd_*`). */
  name: string;
  type: "plant";
  image: string;
  cycles: number;
  harvest: number;
  requirements?: {
    count: number;
    item: IResourse | ILiquid;
  }[];
}

export interface IFood {
  /** Ключ перевода из `gameDataTranslations` (`gd_*`). */
  name: string;
  quality?: number;
  type: 'food' | 'ingredient';
  calory: number;
  image: string;
  union?: boolean;
  /** Только DLC Spaced Out; скрывается в списке при классическом планетоиде. */
  spaceOutOnly?: boolean;
  requirements?: {
    count: number;
    item: IFood | ILiquid | IPlant | IResourse;
  }[],
  tool?: IKitchenTool;
}

export interface IKitchenTool {
  /** Ключ перевода из `gameDataTranslations` (`gd_*`). */
  name: string;
  type: 'kitchen-tool';
  image: string;
}

export type GameNode = IFood | ILiquid | IPlant | IResourse | IKitchenTool;

export interface IDuplicate {
  name: string;
  gluttonous: boolean;
}

/** Параметры калькулятора полёта базовой игры (сухая масса, КПД, окислитель). */
export interface IRocketClassicEngineFlight {
  /** Сухая масса двигателя (кг), без топлива и окислителя. */
  dryKg: number;
  /** Км на 1 кг сжигаемого топлива до штрафа за массу. */
  efficiencyKmPerKg: number;
  /** Нужен окислитель (оксилит / ЖК). */
  needsOxidizer: boolean;
  /** Лимит топлива (кг), если только встроенный бак (паровой двигатель). */
  maxFuelKg?: number;
}

/** Доп. параметры модуля для классического калькулятора (если отличаются от `weight`). */
export interface IRocketClassicModuleFlight {
  dryKg?: number;
  fuelCapacityKg?: number;
  oxidizerCapacityKg?: number;
  boosterRangeKm?: number;
  boosterWetKg?: number;
}

export interface IRocketEngine {
  name: string;
  consumption: number;
  fuel: IGas | IResourse | ILiquid | IOther;
  image: string;
  maxHeight: number;
  type: 'rocket-engine';
  /** Встроенный бак топлива (кг), если есть. */
  tank?: number;
  /** Топливо подаётся с внешних модулей (например 1000 кг), а не только из встроенного бака. */
  allowsExternalFuelTank: boolean;
  height: number;
  width: number;
  power: number;
  load: number;
  classicFlight?: IRocketClassicEngineFlight;
}

export interface IGas {
  name: string;
  type: 'gas';
  image: string;
}

export interface IOther {
  name: string;
  type: 'other';
  image: string;
}

export interface IRocketModule {
  name: string;
  type: 'rocket-module' | 'rocket-engine' | 'rocket-tank' | 'rocket-cargo' | 'rocket-platform' | 'rocket-head';
  image: string;
  height: number;
  width: number;
  weight: number;
  commondModule?: boolean;
  load?: number;
  classicFlight?: IRocketClassicModuleFlight;
  /** Только базовая игра / классический калькулятор — скрыть в SO-билдере. */
  classicOnly?: boolean;
}