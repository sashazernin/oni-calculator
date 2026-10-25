import type { HexMapObjectItem } from "./hex-map-types";
import type { IDuplicate } from "./game-data-types";
import type { RocketsStoragePayload } from "../helpers/readStoredRockets";

export type PlanetoidGameType = "spaced-out" | "classic";

export type Planetoid = {
  id: string;
  name: string;
  /** Служебный планетойд для колонии до явного создания; не показывается в UI. */
  hidden?: boolean;
  gameType: PlanetoidGameType;
  /** DLC «Дополнения» (только Spaced Out). */
  expansions: boolean;
  duplicants: IDuplicate[];
  starMap: HexMapObjectItem[];
  rockets: RocketsStoragePayload;
};

export type PlanetoidsState = {
  activePlanetoidId: string;
  planetoids: Planetoid[];
};
