import type { IKitchenTool } from "../types/game-data-types";


export const microbeMusher: IKitchenTool = {
  name: "Microbe Musher",
  image: "kitchen-tools/Microbe_Musher.webp",
  type: "kitchen-tool",
};

export const electricGrill: IKitchenTool = {
  name: "Electric Grill",
  image: "kitchen-tools/Electric_Grill.webp",
  type: "kitchen-tool",
};

export const gasRange: IKitchenTool = {
  name: "Gas Range",
  image: "kitchen-tools/Gas_Range.webp",
  type: "kitchen-tool",
};

export const kitchenTools = {
  microbeMusher,
  electricGrill,
  gasRange
};