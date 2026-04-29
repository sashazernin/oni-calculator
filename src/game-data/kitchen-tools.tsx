import type { IKitchenTool } from "../types/game-data-types";

export const microbeMusher: IKitchenTool = {
  name: "gd_microbe_musher",
  image: "kitchen-tools/Microbe_Musher.webp",
  type: "kitchen-tool",
};

export const electricGrill: IKitchenTool = {
  name: "gd_electric_grill",
  image: "kitchen-tools/Electric_Grill.webp",
  type: "kitchen-tool",
};

export const gasRange: IKitchenTool = {
  name: "gd_gas_range",
  image: "kitchen-tools/Gas_Range.webp",
  type: "kitchen-tool",
};

export const kitchenTools = {
  microbeMusher,
  electricGrill,
  gasRange,
};
