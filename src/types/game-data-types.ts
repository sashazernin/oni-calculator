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
  type: 'food'
  calory: number;
  image: string;
  requirements?: {
    count: number;
    item: IFood | ILiquid | IPlant;
  }[]
}

export type GameNode = IFood | ILiquid | IPlant | IResourse;

export interface IDuplicate {
  name: string;
  gluttonous: boolean;
}