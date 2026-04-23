import type { IResourse } from "../types/game-data-types"

export const Dirt: IResourse = {
  name: 'Dirt',
  type: 'resourse',
  image: 'resourses/Dirt.webp'
}

export const resourse: { [key: string]: IResourse } = {
  Dirt
}