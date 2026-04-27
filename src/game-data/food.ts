import type { IFood } from "../types/game-data-types";
import { kitchenTools } from "./kitchen-tools";
import { liquids } from "./liquids";
import { plants } from "./plants";
import { resourses } from "./resourses";

export const mealLice: IFood = {
  name: 'Meal Lice',
  type: 'food',
  calory: 600,
  image: 'food/Meal_Lice.webp',
  requirements: [
    {
      count: 1,
      item: plants.mealwood
    }
  ]
}

export const liceloaf: IFood = {
  name: 'Liceloaf',
  type: 'food',
  calory: 1700,
  image: 'food/Liceloaf.webp',
  requirements: [
    {
      count: 50,
      item: liquids.water
    },
    {
      count: 1200,
      item: mealLice
    }
  ],
  tool: kitchenTools.microbeMusher
}

export const mushBar: IFood = {
  name: 'Mush Bar',
  type: 'food',
  calory: 800,
  image: 'food/Mush_Bar.webp',
  requirements: [
    {
      count: 75,
      item: liquids.water
    },
    {
      count: 75,
      item: resourses.dirt
    }
  ],
  tool: kitchenTools.microbeMusher
}

export const mushFry: IFood = {
  name: 'Mush Fry',
  type: 'food',
  calory: 1050,
  image: 'food/Mush_Fry.webp',
  requirements: [
    {
      count: 800,
      item: mushBar
    }
  ],
  tool: kitchenTools.electricGrill
}

export const bogJelly: IFood = {
  name: 'Bog Jelly',
  type: 'food',
  calory: 1840,
  image: 'food/Bog_Jelly.webp',
  requirements: [
    {
      count: 1,
      item: plants.bogBucket
    }
  ],
  tool: kitchenTools.electricGrill
}

export const swampyDelights: IFood = {
  name: 'Swampy Delights',
  type: 'food',
  calory: 2240,
  image: 'food/Swampy_Delights.webp',
  requirements: [
    {
      count: 1840,
      item: bogJelly
    }
  ],
  tool: kitchenTools.electricGrill
}

export const meat: IFood = {
  name: 'Meat',
  type: 'food',
  calory: 1600,
  image: 'food/Meat.webp'
}

export const BBQ: IFood = {
  name: 'BBQ',
  type: 'food',
  calory: 4000,
  image: 'food/BBQ.webp',
  requirements: [
    {
      count: 3200,
      item: meat
    }
  ],
  tool: kitchenTools.electricGrill
}

export const pacuFillet: IFood = {
  name: 'Pacu Fillet',
  type: 'food',
  calory: 1000,
  image: 'food/Pacu_Fillet.webp'
}

export const rawShellfish: IFood = {
  name: 'Raw Shellfish',
  type: 'food',
  calory: 1000,
  image: 'food/Raw_Shellfish.webp'
}

export const cookedSeafood: IFood = {
  name: 'Cooked Seafood',
  type: 'food',
  calory: 1600,
  image: 'food/Cooked_Seafood.webp',
  requirements: [
    {
      count: 1000,
      item: pacuFillet
    }
  ],
  tool: kitchenTools.electricGrill
}

export const SurfnTurf: IFood = {
  name: 'Surf\'n Turf',
  type: 'food',
  calory: 1000,
  image: 'food/Surfn_Turf.webp',
  requirements: [
    {
      count: 4000,
      item: BBQ
    },
    {
      count: 1600,
      item: cookedSeafood
    }
  ],
  tool: kitchenTools.gasRange
}

export const bristleBerry: IFood = {
  name: 'Bristle Berry',
  type: 'food',
  calory: 1600,
  image: 'food/Bristle_Berry.webp',
  requirements: [
    {
      count: 1,
      item: plants.bristleBlossom
    }
  ],
}

export const gristleBerry: IFood = {
  name: 'Gristle Berry',
  type: 'food',
  calory: 2000,
  image: 'food/Gristle_Berry.webp',
  requirements: [
    {
      count: 1600,
      item: bristleBerry
    }
  ],
  tool: kitchenTools.electricGrill
}

export const pinchaPeppernut: IFood = {
  name: 'Pincha Peppernut',
  type: 'ingredient',
  calory: 4000,
  image: 'food/Pincha_Peppernut.webp',
  requirements: [
    {
      count: 1,
      item: plants.pinchaPepperplant
    }
  ]
}

export const stuffedBerry: IFood = {
  name: 'Stuffed Berry',
  type: 'food',
  calory: 1000,
  image: 'food/Stuffed_Berry.webp',
  requirements: [
    {
      count: 4000,
      item: gristleBerry
    },
    {
      count: 2000,
      item: pinchaPeppernut
    }
  ],
  tool: kitchenTools.gasRange
}

export const sleetWheatGrain: IFood = {
  name: 'Sleet Wheat Grain',
  type: 'ingredient',
  calory: 1,
  union: true,
  image: 'food/Sleet_Wheat_Grain.webp',
  requirements: [
    {
      count: 1,
      item: plants.sleetWheat
    }
  ]
}

export const berrySludge: IFood = {
  name: 'Berry Sludge',
  type: 'food',
  calory: 4000,
  image: 'food/Berry_Sludge.webp',
  requirements: [
    {
      count: 5,
      item: sleetWheatGrain
    },
    {
      count: 1600,
      item: bristleBerry
    }
  ],
  tool: kitchenTools.microbeMusher
}

export const noshBean: IFood = {
  name: 'Nosh Bean',
  type: 'ingredient',
  calory: 1,
  union: true,
  image: 'food/Nosh_Bean.webp',
  requirements: [
    {
      count: 1,
      item: plants.noshSprout
    }
  ]
}

export const curriedBeans: IFood = {
  name: 'Curried Beans',
  type: 'food',
  calory: 5000,
  image: 'food/Curried_Beans.webp',
  requirements: [
    {
      count: 4,
      item: noshBean
    },
    {
      count: 4,
      item: resourses.tonicRoot
    }
  ],
  tool: kitchenTools.gasRange
}

export const mushroom: IFood = {
  name: 'Mushroom',
  type: 'food',
  calory: 2400,
  image: 'food/Mushroom.webp',
  requirements: [
    {
      count: 1,
      item: plants.duskCap
    }
  ]
}

export const friedMushroom: IFood = {
  name: 'Fried Mushroom',
  type: 'food',
  calory: 2800,
  image: 'food/Fried_Mushroom.webp',
  requirements: [
    {
      count: 2400,
      item: mushroom
    }
  ],
  tool: kitchenTools.electricGrill
}

export const frostBun: IFood = {
  name: 'Frost Bun',
  type: 'food',
  calory: 1200,
  image: 'food/Frost_Bun.webp',
  requirements: [
    {
      count: 3,
      item: sleetWheatGrain
    }
  ],
  tool: kitchenTools.electricGrill
}

export const lettuce: IFood = {
  name: 'Lettuce',
  type: 'food',
  calory: 4800,
  image: 'food/Lettuce.webp',
  requirements: [
    {
      count: 1,
      item: plants.waterweed
    }
  ]
}

export const frostBurger: IFood = {
  name: 'Frost Burger',
  type: 'food',
  calory: 6000,
  image: 'food/Frost_Burger.webp',
  requirements: [
    {
      count: 1200,
      item: frostBun
    },
    {
      count: 4000,
      item: BBQ
    },
    {
      count: 400,
      item: lettuce
    }
  ],
  tool: kitchenTools.gasRange
}

export const grubfruit: IFood = {
  name: 'Grubfruit',
  type: 'food',
  calory: 1000,
  image: 'food/Grubfruit.webp',
  requirements: [
    {
      count: 1,
      item: plants.grubfruitPlant
    }
  ]
}

export const grubfruitPreserve: IFood = {
  name: 'Grubfruit Preserve',
  type: 'food',
  calory: 2400,
  image: 'food/Grubfruit_Preserve.webp',
  requirements: [
    {
      count: 2000,
      item: grubfruit
    },
    {
      count: 4,
      item: resourses.sucrose
    }
  ],
  tool: kitchenTools.electricGrill
}

export const hexalentFruit: IFood = {
  name: 'Hexalent Fruit',
  type: 'food',
  calory: 6400,
  image: 'food/Hexalent_Fruit.webp',
  requirements: [
    {
      count: 1,
      item: plants.hexalent
    }
  ]
}

export const mixedBerryPie: IFood = {
  name: 'Mixed Berry Pie',
  type: 'food',
  calory: 1000,
  image: 'food/Mixed_Berry_Pie.webp',
  requirements: [
    {
      count: 3,
      item: sleetWheatGrain
    },
    {
      count: 1000,
      item: grubfruit
    },
    {
      count: 2000,
      item: bristleBerry
    }
  ],
  tool: kitchenTools.gasRange
}

export const muckroot: IFood = {
  name: 'Resource Muckroot',
  type: 'ingredient',
  calory: 800,
  union: true,
  image: 'food/Muckroot.webp'
}

export const rawEgg: IFood = {
  name: 'Raw Egg',
  type: 'ingredient',
  calory: 1600,
  image: 'food/Raw_Egg.webp'
}

export const omelette: IFood = {
  name: 'Omelette',
  type: 'food',
  calory: 2800,
  image: 'food/Omelette.webp',
  requirements: [
    {
      count: 1600,
      item: rawEgg
    }
  ]
}

export const mushroomQuiche: IFood = {
  name: 'Mushroom Quiche',
  type: 'food',
  calory: 6400,
  image: 'food/Mushroom_Quiche.webp',
  requirements: [
    {
      count: 2800,
      item: omelette
    },
    {
      count: 400,
      item: lettuce
    },
    {
      count: 2800,
      item: friedMushroom
    }
  ],
  tool: kitchenTools.gasRange
}

export const mushroomWrap: IFood = {
  name: 'Mushroom Wrap',
  type: 'food',
  calory: 4800,
  image: 'food/Mushroom_Wrap.webp',
  requirements: [
    {
      count: 2800,
      item: friedMushroom
    },
    {
      count: 1600,
      item: lettuce
    }
  ],
  tool: kitchenTools.gasRange
}

export const nutrientBar: IFood = {
  name: 'Nutrient Bar',
  type: 'food',
  calory: 800,
  image: 'food/Nutrient_Bar.webp'
}

export const pepperBread: IFood = {
  name: 'Pepper Bread',
  type: 'food',
  calory: 4000,
  image: 'food/Pepper_Bread.webp',
  requirements: [
    {
      count: 10,
      item: sleetWheatGrain
    },
    {
      count: 1000,
      item: pinchaPeppernut
    }
  ],
  tool: kitchenTools.gasRange
}

export const pickledMeal: IFood = {
  name: 'Pickled Meal',
  type: 'food',
  calory: 1800,
  image: 'food/Pickled_Meal.webp',
  requirements: [
    {
      count: 1800,
      item: mealLice
    }
  ],
  tool: kitchenTools.electricGrill
}

export const plantMeat: IFood = {
  name: 'Plant Meat',
  type: 'food',
  calory: 1200,
  image: 'food/Plant_Meat.webp'
}

export const spindlyGrubfruit: IFood = {
  name: 'Spindly Grubfruit',
  type: 'food',
  calory: 800,
  image: 'food/Spindly_Grubfruit.webp',
  requirements: [
    {
      count: 1,
      item: plants.spindlyGrubfruitPlant
    }
  ]
}

export const roastGrubfruitNut: IFood = {
  name: 'Roast Grubfruit Nut',
  type: 'food',
  calory: 1200,
  image: 'food/Roast_Grubfruit_Nut.webp',
  requirements: [
    {
      count: 800,
      item: spindlyGrubfruit
    }
  ],
  tool: kitchenTools.electricGrill
}

export const soufflePancakes: IFood = {
  name: 'Souffle Pancakes',
  type: 'food',
  calory: 3600,
  image: 'food/Souffle_Pancakes.webp',
  requirements: [
    {
      count: 1600,
      item: rawEgg
    },
    {
      count: 2,
      item: sleetWheatGrain
    }
  ],
  tool: kitchenTools.electricGrill
}

export const tofu: IFood = {
  name: 'Tofu',
  type: 'food',
  calory: 3600,
  image: 'food/Tofu.webp',
  requirements: [
    {
      count: 6,
      item: noshBean
    },
    {
      count: 50,
      item: liquids.water
    }
  ],
  tool: kitchenTools.microbeMusher
}

export const spicyTofu: IFood = {
  name: 'Spicy Tofu',
  type: 'food',
  calory: 4000,
  image: 'food/Spicy_Tofu.webp',
  requirements: [
    {
      count: 3600,
      item: tofu
    },
    {
      count: 1000,
      item: pinchaPeppernut
    }
  ],
  tool: kitchenTools.gasRange
}

export const swampChardHeart: IFood = {
  name: 'Swamp Chard Heart',
  type: 'food',
  calory: 2400,
  image: 'food/Swamp_Chard_Heart.webp',
  requirements: [
    {
      count: 1,
      item: plants.swampChard
    }
  ]
}

export const ingredients = {
  pinchaPeppernut,
  sleetWheatGrain,
  noshBean
}

export const food = {
  mushBar,
  mushFry,
  mealLice,
  liceloaf,
  bristleBerry,
  gristleBerry,
  stuffedBerry,
  berrySludge,
  meat,
  pacuFillet,
  rawShellfish,
  cookedSeafood,
  frostBun,
  BBQ,
  mushroom,
  friedMushroom,
  curriedBeans,
  SurfnTurf,
  bogJelly,
  swampyDelights,
  lettuce,
  frostBurger,
  grubfruit,
  grubfruitPreserve,
  hexalentFruit,
  mixedBerryPie,
  muckroot,
  mushroomQuiche,
  rawEgg,
  omelette,
  mushroomWrap,
  nutrientBar,
  pepperBread,
  pickledMeal,
  plantMeat,
  spindlyGrubfruit,
  roastGrubfruitNut,
  soufflePancakes,
  tofu,
  spicyTofu,
  swampChardHeart
}