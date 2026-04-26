export interface IResourse {
  name: string;
  type: 'resourse';
  image: string;
}

export interface ILiquid {
  name: string;
  type: 'liquid';
  image: string;
}

export interface IPlant {
  name: string;
  type: 'plant';
  image: string;
  cycles: number;
  harvest: number;
  requirements?: {
    count: number;
    item: IResourse | ILiquid;
  }[];
}

export interface IFood {
  name: string;
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
  name: string;
  type: 'kitchen-tool';
  image: string;
}

export type GameNode = IFood | ILiquid | IPlant | IResourse | IKitchenTool;

export interface IDuplicate {
  name: string;
  gluttonous: boolean;
}