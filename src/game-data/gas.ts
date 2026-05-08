import type { IGas } from "../types/game-data-types"

const carbonDioxide: IGas = {
  name: "gd_carbon_dioxide",
  type: "gas",
  image: "gas/Carbon_Dioxide.webp",
}

const steam: IGas = {
  name: "Steam",
  type: "gas",
  image: "gas/Steam.webp",
}

const hydrogen: IGas = {
  name: "Hydrogen",
  type: "gas",
  image: "gas/Hydrogen.webp",
}

export const gas = {
  carbonDioxide,
  steam,
  hydrogen,
}