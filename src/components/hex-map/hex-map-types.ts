export type HexMapObjectType = "planet" | "wreck";

export interface HexMapObjectItem {
  cellNumber: number;
  name: string;
  type: HexMapObjectType;
  /** Основной объект: нельзя сменить тип и удалить из карты (панель редактирования). */
  main?: boolean;
}
