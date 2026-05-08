import type { IRocketEngine, IRocketModule } from "../types/game-data-types"
import { gas } from "./gas"
import { liquids } from "./liquids"
import { other } from "./other"
import { resourses } from "./resourses"

export const ROCKET_EXTERNAL_TANK_KG = 900

export const ROCKET_OXIDIZER_TANK_KG = 450

export const ROCKET_OXIDIZER_KG_PER_FUEL_KG = {
  fertilizer: 1,
  oxylite: 1 / 2,
  liquidOxygen: 1 / 4,
} as const

const carbonDioxide: IRocketEngine = {
  name: "gd_rocket_engine_carbon_dioxide",
  type: 'rocket-engine',
  consumption: 16.666666666,
  fuel: gas.carbonDioxide,
  image: "rocket/engines/Carbon_Dioxide_Engine.webp",
  maxHeight: 10,
  tank: 100,
  allowsExternalFuelTank: false,
  height: 2,
  width: 3,
  power: 23,
  load: 3
}

const sugar: IRocketEngine = {
  name: "gd_rocket_engine_sugar",
  type: 'rocket-engine',
  consumption: 75,
  fuel: resourses.sucrose,
  image: "rocket/engines/Sugar_Engine.webp",
  maxHeight: 16,
  tank: 450,
  allowsExternalFuelTank: false,
  height: 3,
  width: 3,
  power: 16,
  load: 1
}

const steam: IRocketEngine = {
  name: "gd_rocket_engine_steam",
  type: 'rocket-engine',
  consumption: 15,
  fuel: gas.steam,
  image: "rocket/engines/Steam_Engine.webp",
  maxHeight: 25,
  tank: 150,
  allowsExternalFuelTank: false,
  height: 5,
  width: 7,
  load: 15,
  power: 27
}

const smallPetroleum: IRocketEngine = {
  name: "gd_rocket_engine_small_petroleum",
  type: 'rocket-engine',
  consumption: 45,
  fuel: liquids.Petroleum,
  image: "rocket/engines/Small_Petroleum_Engine.webp",
  maxHeight: 20,
  tank: 450,
  allowsExternalFuelTank: true,
  height: 4,
  width: 3,
  load: 5,
  power: 31
}

const petroleum: IRocketEngine = {
  name: "gd_rocket_engine_petroleum",
  type: 'rocket-engine',
  consumption: 90,
  fuel: liquids.Petroleum,
  image: "rocket/engines/Petroleum_Engine.webp",
  maxHeight: 35,
  allowsExternalFuelTank: true,
  height: 5,
  width: 7,
  load: 6,
  power: 48
}

const biodieselEngine: IRocketEngine = {
  name: "gd_rocket_engine_biodiesel",
  type: 'rocket-engine',
  consumption: 69.3,
  fuel: liquids.biodiesel,
  image: "rocket/engines/Biodiesel_Engine.webp",
  maxHeight: 35,
  allowsExternalFuelTank: true,
  height: 5,
  width: 7,
  power: 31,
  load: 7
}

const radbolt: IRocketEngine = {
  name: "gd_rocket_engine_radbolt",
  type: 'rocket-engine',
  consumption: 200,
  fuel: other.redbolt,
  image: "rocket/engines/Radbolt_Engine.webp",
  maxHeight: 20,
  tank: 4000,
  allowsExternalFuelTank: false,
  height: 5,
  width: 5,
  load: 5,
  power: 34
}

const hydrogen: IRocketEngine = {
  name: "gd_rocket_engine_hydrogen",
  type: 'rocket-engine',
  consumption: 56.3,
  fuel: gas.hydrogen,
  image: "rocket/engines/Hydrogen_Engine.webp",
  maxHeight: 35,
  allowsExternalFuelTank: true,
  height: 5,
  width: 7,
  load: 7,
  power: 55
}

export const rocketEngines = {
  carbonDioxide,
  sugar,
  steam,
  smallPetroleum,
  petroleum,
  biodieselEngine,
  radbolt,
  hydrogen,
} as const;

export type RocketEngineId = keyof typeof rocketEngines;

const largeLiquidFuelTank: IRocketModule = {
  name: "gd_rocket_tank_large_liquid_fuel",
  type: 'rocket-tank',
  image: "rocket/tanks/Large_Liquid_Fuel_Tank.webp",
  height: 5,
  width: 5,
  weight: 100,
  load: 5,
}

const largeSolidOxidizerTank: IRocketModule = {
  name: "gd_rocket_tank_large_solid_oxidizer",
  type: 'rocket-tank',
  image: "rocket/tanks/Large_Solid_Oxidizer_Tank.webp",
  height: 5,
  width: 5,
  weight: 100,
  load: 5,
}

const liquidOxidizerTank: IRocketModule = {
  name: "gd_rocket_tank_liquid_oxidizer",
  type: 'rocket-tank',
  image: "rocket/tanks/Liquid_Oxidizer_Tank.webp",
  height: 2,
  width: 5,
  weight: 100,
  load: 5,
}

const smallSolidOxidizerTank: IRocketModule = {
  name: "gd_rocket_tank_small_solid_oxidizer",
  type: 'rocket-tank',
  image: "rocket/tanks/Small_Solid_Oxidizer_Tank.webp",
  height: 2,
  width: 5,
  weight: 200,
  load: 2,
}

export const rocketTanks = {
  largeLiquidFuelTank,
  largeSolidOxidizerTank,
  liquidOxidizerTank,
  smallSolidOxidizerTank
}

const biologicalCargoBay: IRocketModule = {
  name: "gd_rocket_cargo_biological",
  type: 'rocket-cargo',
  image: "rocket/cargos/Biological_Cargo_Bay.webp",
  height: 1,
  width: 3,
  weight: 200,
  load: 1
}

const cargoBay: IRocketModule = {
  name: "gd_rocket_cargo_bay",
  type: 'rocket-cargo',
  image: "rocket/cargos/Cargo_Bay.webp",
  height: 3,
  width: 3,
  weight: 200,
  load: 4
}

const gasCargoCanister: IRocketModule = {
  name: "gd_rocket_cargo_gas_canister",
  type: 'rocket-cargo',
  image: "rocket/cargos/Gas_Cargo_Canister.webp",
  height: 3,
  width: 3,
  weight: 200,
  load: 2
}

const largeCargoBay: IRocketModule = {
  name: "gd_rocket_cargo_large_bay",
  type: 'rocket-cargo',
  image: "rocket/cargos/Large_Cargo_Bay.webp",
  height: 5,
  width: 5,
  weight: 1000,
  load: 6
}

const largeGasCargoCanister: IRocketModule = {
  name: "gd_rocket_cargo_large_gas_canister",
  type: 'rocket-cargo',
  image: "rocket/cargos/Large_Gas_Cargo_Canister.webp",
  height: 5,
  width: 5,
  weight: 1000,
  load: 4
}

const largeLiquidCargoTank: IRocketModule = {
  name: "gd_rocket_cargo_large_liquid",
  type: 'rocket-cargo',
  image: "rocket/cargos/Large_Liquid_Cargo_Tank.webp",
  height: 5,
  width: 5,
  weight: 1000,
  load: 5
}

const liquidCargoTank: IRocketModule = {
  name: "gd_rocket_cargo_liquid_tank",
  type: 'rocket-cargo',
  image: "rocket/cargos/Liquid_Cargo_Tank.webp",
  height: 3,
  width: 3,
  weight: 200,
  load: 3
}

export const rocketCargos = {
  biologicalCargoBay,
  cargoBay,
  gasCargoCanister,
  largeCargoBay,
  largeGasCargoCanister,
  largeLiquidCargoTank,
  liquidCargoTank
}

const basicNosecone: IRocketModule = {
  name: "gd_rocket_head_basic_nosecone",
  type: 'rocket-head',
  image: "rocket/heads/Basic_Nosecone.webp",
  height: 2,
  width: 5,
  weight: 600,
  load: 2
}

const Drillcone: IRocketModule = {
  name: "gd_rocket_head_drillcone",
  type: 'rocket-head',
  image: "rocket/heads/Drillcone.webp",
  height: 4,
  width: 5,
  weight: 600,
  load: 2
}

const soloSpacefarerNosecone: IRocketModule = {
  name: "gd_rocket_head_solo_spacefarer",
  type: 'rocket-head',
  image: "rocket/heads/Solo_Spacefarer_Nosecone.webp",
  height: 3,
  width: 5,
  weight: 200,
  commondModule: true,
  load: 3
}

export const rocketHeads = {
  basicNosecone,
  Drillcone,
  soloSpacefarerNosecone
}

const artifactTransportModule: IRocketModule = {
  name: "gd_rocket_mod_artifact_transport",
  type: 'rocket-module',
  image: "rocket/modules/Artifact_Transport_Module.webp",
  height: 1,
  width: 3,
  weight: 200,
  load: 3
}

const batteryModule: IRocketModule = {
  name: "gd_rocket_mod_battery",
  type: 'rocket-module',
  image: "rocket/modules/Battery_Module.webp",
  height: 2,
  width: 3,
  weight: 400,
  load: 2
}

const cartographicModule: IRocketModule = {
  name: "gd_rocket_mod_cartographic",
  type: 'rocket-module',
  image: "rocket/modules/Cartographic_Module.webp",
  height: 5,
  width: 5,
  weight: 1350,
  load: 3
}

const orbitalCargoModule: IRocketModule = {
  name: "gd_rocket_mod_orbital_cargo",
  type: 'rocket-module',
  image: "rocket/modules/Orbital_Cargo_Module.webp",
  height: 2,
  width: 3,
  weight: 400,
  load: 4
}

const researchModule: IRocketModule = {
  name: "gd_rocket_mod_research",
  type: 'rocket-module',
  image: "rocket/modules/Research_Module.webp",
  height: 2,
  width: 3,
  weight: 1000,
  load: 3
}

const roverModule: IRocketModule = {
  name: "gd_rocket_mod_rover",
  type: 'rocket-module',
  image: "rocket/modules/Rover_Module.webp",
  height: 3,
  width: 3,
  weight: 200,
  load: 4
}

const solarPanelModule: IRocketModule = {
  name: "gd_rocket_mod_solar_panel",
  type: 'rocket-module',
  image: "rocket/modules/Solar_Panel_Module.webp",
  height: 1,
  width: 3,
  weight: 200,
  load: 1
}

const spacefarerModule: IRocketModule = {
  name: "gd_rocket_mod_spacefarer",
  type: 'rocket-module',
  image: "rocket/modules/Spacefarer_Module.webp",
  height: 4,
  width: 5,
  weight: 500,
  commondModule: true,
  load: 6
}

const trailblazerModule: IRocketModule = {
  name: "gd_rocket_mod_trailblazer",
  type: 'rocket-module',
  image: "rocket/modules/Trailblazer_Module.webp",
  height: 3,
  width: 3,
  weight: 200,
  load: 4
}

export const rocketModules = {
  artifactTransportModule,
  batteryModule,
  cartographicModule,
  orbitalCargoModule,
  researchModule,
  roverModule,
  solarPanelModule,
  spacefarerModule,
  trailblazerModule
}

export const rocketPlatform: IRocketModule = {
  name: "gd_rocket_platform",
  type: 'rocket-platform',
  image: "rocket/Rocket_Platform.webp",
  height: 2,
  width: 7,
  weight: 800,
}