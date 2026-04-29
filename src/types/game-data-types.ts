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