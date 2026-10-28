import { food, ingredients } from "../game-data/food";
import { plants } from "../game-data/plants";
import type {
  FoodRequirement,
  IFood,
  IKitchenTool,
  ILiquid,
  IPlant,
  IResourse,
  KnowledgeBaseItem,
} from "../types/game-data-types";
import type { TranslationKey } from "../i18n/translations";

type ReqItem = FoodRequirement["item"];

function formatLocaleNumber(value: number, language: string): string {
  const n = Math.abs(value - Math.round(value)) < 1e-6
    ? Math.round(value)
    : Math.round(value * 100) / 100;
  return n.toLocaleString(language === "ru" ? "ru" : "en", {
    maximumFractionDigits: 2,
  });
}

function formatGramsCaption(
  grams: number,
  language: string,
  t: (key: TranslationKey) => string,
): string {
  return `${formatLocaleNumber(grams, language)} ${t("unit_grams")}`;
}

/** `count` в кг; твёрдые ресурсы: ≥ 5 кг — кг, иначе г. */
function formatSolidResourceMassCaption(
  countKg: number,
  language: string,
  t: (key: TranslationKey) => string,
): string {
  const grams = countKg * 1000;
  if (grams >= 5000) {
    return `${formatLocaleNumber(countKg, language)} ${t("unit_kg")}`;
  }
  return formatGramsCaption(grams, language, t);
}

/** `count` в кг; жидкости: > 1 кг — кг, иначе г. */
function formatLiquidMassCaption(
  countKg: number,
  language: string,
  t: (key: TranslationKey) => string,
): string {
  const grams = countKg * 1000;
  if (grams > 1000) {
    return `${formatLocaleNumber(countKg, language)} ${t("unit_kg")}`;
  }
  return formatGramsCaption(grams, language, t);
}

export function formatRequirementAmount(
  reqItem: ReqItem,
  count: number,
  t: (key: TranslationKey) => string,
  language = "en",
): string {
  if (reqItem.type === "food") {
    if (reqItem.union) {
      return `${formatCount(count)} ${t("unit_piece")}`;
    }
    return `${count} ${t("unit_kcal")}`;
  }
  if (reqItem.type === "ingredient") {
    if (reqItem.union) {
      return `${formatCount(count)} ${t("unit_piece")}`;
    }
    if (reqItem.unit === "mass") {
      return formatGramsCaption(count, language, t);
    }
    return `${count} ${t("unit_kcal")}`;
  }
  if (reqItem.type === "resourse") {
    if (reqItem.unit === "piece") {
      return `${formatCount(count)} ${t("unit_piece")}`;
    }
    return formatSolidResourceMassCaption(count, language, t);
  }
  if (reqItem.type === "liquid") {
    return formatLiquidMassCaption(count, language, t);
  }
  if (reqItem.type === "plant") {
    if (count === 1) return "";
    return formatCount(count);
  }
  return formatCount(count);
}

function formatCount(count: number): string {
  return Number.isInteger(count) ? String(count) : count.toFixed(2);
}

/** Штук за один сбор: `harvest` в данных — за цикл, как у ккал-растений. */
export function plantPieceHarvestPerPick(plant: IPlant): number {
  return plant.harvest * plant.cycles;
}

function allFoodEntries(): IFood[] {
  return [...Object.values(food), ...Object.values(ingredients)];
}

export type FoodUsedInEntry = {
  food: IFood;
  count: number;
  /** Вариант рецепта для схемы (если не первый). */
  requirementsForFlow?: FoodRequirement[];
};

/** Прямые рецепты, где сущность указана во входах (включая альтернативные). */
export function findFoodUsedIn(targetName: string): FoodUsedInEntry[] {
  const out: FoodUsedInEntry[] = [];
  for (const raw of allFoodEntries()) {
    for (const variant of raw.requirements ?? []) {
      const match = variant.find((req) => req.item.name === targetName);
      if (!match) continue;
      const isPrimary = variant === raw.requirements?.[0];
      out.push({
        food: raw,
        count: match.count,
        requirementsForFlow: isPrimary ? undefined : variant,
      });
    }
  }
  return out.sort((a, b) => a.food.name.localeCompare(b.food.name));
}

function findFoodByKitchenTool(toolName: string): IFood[] {
  return allFoodEntries()
    .filter((entry) => entry.tool?.name === toolName)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function findPlantsUsingItem(targetName: string): IPlant[] {
  return Object.values(plants)
    .filter((plant) =>
      plant.requirements?.some((req) => req.item.name === targetName),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type DependencyModalItem =
  | IFood
  | IPlant
  | ILiquid
  | IResourse
  | IKitchenTool;

export function plantGrowthLines(
  plant: IPlant,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
): string[] {
  const lines: string[] = [];
  if (plant.cycles > 0) {
    lines.push(
      t("game_item_plant_grow_cycles", { cycles: formatCount(plant.cycles) }),
    );
  }
  lines.push(
    t("game_item_plant_harvest", { harvest: formatCount(plant.harvest) }),
  );
  return lines;
}

export function isDependencyModalItem(
  item: KnowledgeBaseItem,
): item is DependencyModalItem {
  return (
    item.type === "food" ||
    item.type === "ingredient" ||
    item.type === "plant" ||
    item.type === "liquid" ||
    item.type === "resourse" ||
    item.type === "kitchen-tool"
  );
}

export function isUsedInOnlyDependencyItem(item: DependencyModalItem): boolean {
  return (
    item.type === "liquid" ||
    item.type === "resourse" ||
    item.type === "kitchen-tool"
  );
}

export type DependencyRowData = {
  item: KnowledgeBaseItem | IKitchenTool;
  amount: string;
};

export function foodDependencyInputs(
  foodItem: IFood,
  t: (key: TranslationKey) => string,
): DependencyRowData[] {
  const rows: DependencyRowData[] = [];
  if (foodItem.tool) {
    rows.push({ item: foodItem.tool, amount: "" });
  }
  for (const variant of foodItem.requirements ?? []) {
    for (const req of variant) {
      rows.push({
        item: req.item as KnowledgeBaseItem,
        amount: formatRequirementAmount(req.item, req.count, t),
      });
    }
  }
  return rows;
}

export function plantDependencyInputs(
  plant: IPlant,
  t: (key: TranslationKey) => string,
): DependencyRowData[] {
  return (plant.requirements ?? []).map((req) => ({
    item: req.item,
    amount: formatRequirementAmount(req.item, req.count, t),
  }));
}

export type FlowStep = {
  item: KnowledgeBaseItem | IKitchenTool;
  caption: string;
};

export type DependencyFlow = {
  /** Заголовок карточки: `gd_*` станции, растения или блюда. */
  headerTitleKey?: string;
  /** Группы узлов; между группами — стрелка (ингредиенты | станция | результат). */
  segments: FlowStep[][];
};

function formatPlantLiquidPerCycleCaption(
  countPerCycleKg: number,
  language: string,
  t: (key: TranslationKey) => string,
): string {
  return formatLiquidMassCaption(countPerCycleKg, language, t);
}

function formatPlantResourcePerCycleCaption(
  countPerCycleKg: number,
  language: string,
  t: (key: TranslationKey) => string,
): string {
  return formatSolidResourceMassCaption(countPerCycleKg, language, t);
}

function plantResourcePerCycleCaption(
  reqItem: ReqItem,
  countPerCycle: number,
  _plant: IPlant,
  t: (key: TranslationKey) => string,
  language: string,
): string {
  if (reqItem.type === "liquid") {
    return formatPlantLiquidPerCycleCaption(countPerCycle, language, t);
  }
  if (reqItem.type === "resourse") {
    const resource = reqItem as IResourse;
    if (resource.unit === "piece") {
      return `${formatLocaleNumber(countPerCycle, language)} ${t("unit_piece")}`;
    }
    return formatPlantResourcePerCycleCaption(countPerCycle, language, t);
  }
  return formatLocaleNumber(countPerCycle, language);
}

function plantGrowCyclesCaption(
  plant: IPlant,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
  language: string,
): string {
  if (plant.cycles <= 0) return "";
  return t("game_item_flow_grow_cycles", {
    cycles: formatLocaleNumber(plant.cycles, language),
  });
}

function foodCookTimeCaption(
  food: IFood,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
): string {
  if (!food.tool || food.cookTimeSec == null || food.cookTimeSec <= 0) {
    return "";
  }
  const seconds =
    food.cookTimeSec % 1 === 0
      ? String(food.cookTimeSec)
      : String(food.cookTimeSec);
  return t("game_item_flow_cook_time", { seconds });
}

function foodCropFlowCaption(
  food: IFood,
  plant: IPlant,
  t: (key: TranslationKey) => string,
  language: string,
): string {
  if (food.union) {
    return `${formatLocaleNumber(plant.harvest, language)} ${t("unit_piece")}`;
  }
  if (food.unit === "mass") {
    const gramsPerCycle =
      plant.cycles > 0 ? food.calory / plant.cycles : food.calory;
    return formatGramsCaption(gramsPerCycle, language, t);
  }
  const kcalPerCycle =
    plant.cycles > 0 ? food.calory / plant.cycles : food.calory;
  return `${formatLocaleNumber(kcalPerCycle, language)} ${t("unit_kcal")}`;
}

/** Горизонтальная схема для растения: удобрение → растение → урожай (еда). */
export function buildPlantProductionFlow(
  plant: IPlant,
  t: (key: TranslationKey) => string,
  language: string,
): DependencyFlow | null {
  const usedIn = findFoodUsedIn(plant.name);
  const crop = usedIn[0]?.food;
  const segments: FlowStep[][] = [];

  if (plant.requirements?.length) {
    segments.push(
      plant.requirements.map((req) => ({
        item: req.item as KnowledgeBaseItem,
        caption: plantResourcePerCycleCaption(
          req.item,
          req.count,
          plant,
          t,
          language,
        ),
      })),
    );
  }

  segments.push([
    {
      item: plant,
      caption: plantGrowCyclesCaption(plant, t, language),
    },
  ]);

  if (crop) {
    segments.push([
      {
        item: crop,
        caption: foodCropFlowCaption(crop, plant, t, language),
      },
    ]);
  }

  if (segments.length < 2) return null;
  return { segments, headerTitleKey: plant.name };
}

/** Рецепт: входы → станция → блюдо (или растение → еда без станции). */
export function buildFoodProductionFlow(
  food: IFood,
  t: (key: TranslationKey) => string,
  language: string,
  requirementsOverride?: FoodRequirement[],
): DependencyFlow | null {
  const reqs =
    requirementsOverride ?? food.requirements?.[0] ?? [];
  if (reqs.length === 0) return null;

  if (
    !requirementsOverride &&
    !food.tool &&
    reqs.length === 1 &&
    reqs[0].item.type === "plant"
  ) {
    const plantReq = reqs[0];
    const plant = plantReq.item as IPlant;
    const segments: FlowStep[][] = [];

    if (plant.requirements?.length) {
      segments.push(
        plant.requirements.map((pr) => ({
          item: pr.item as KnowledgeBaseItem,
          caption: plantResourcePerCycleCaption(
            pr.item,
            pr.count,
            plant,
            t,
            language,
          ),
        })),
      );
    }

    segments.push([
      {
        item: plant,
        caption: plantGrowCyclesCaption(plant, t, language),
      },
    ]);

    segments.push([
      {
        item: food,
        caption: foodCropFlowCaption(food, plant, t, language),
      },
    ]);

    return { segments, headerTitleKey: plant.name };
  }

  const inputSteps: FlowStep[] = reqs.map((req) => ({
    item: req.item as KnowledgeBaseItem,
    caption:
      req.item.type === "plant"
        ? plantGrowCyclesCaption(req.item as IPlant, t, language)
        : formatRequirementAmount(req.item, req.count, t, language),
  }));

  const segments: FlowStep[][] = [inputSteps];
  if (food.tool) {
    segments.push([
      {
        item: food.tool,
        caption: foodCookTimeCaption(food, t),
      },
    ]);
  }
  segments.push([
    {
      item: food,
      caption: `${formatLocaleNumber(food.calory, language)} ${t("unit_kcal")}`,
    },
  ]);

  return {
    segments,
    headerTitleKey: food.tool?.name,
  };
}

/** Схемы рецептов, где сущность участвует как вход. */
export function buildUsedInFlows(
  targetName: string,
  t: (key: TranslationKey) => string,
  language: string,
  excludeFoodName?: string | null,
): DependencyFlow[] {
  const flows: DependencyFlow[] = [];
  for (const entry of findFoodUsedIn(targetName)) {
    if (excludeFoodName && entry.food.name === excludeFoodName) continue;
    const flow = buildFoodProductionFlow(
      entry.food,
      t,
      language,
      entry.requirementsForFlow,
    );
    if (!flow) continue;
    flows.push({
      ...flow,
      headerTitleKey: entry.food.name,
    });
  }

  for (const plant of findPlantsUsingItem(targetName)) {
    const flow = buildPlantProductionFlow(plant, t, language);
    if (!flow) continue;
    flows.push({
      ...flow,
      headerTitleKey: plant.name,
    });
  }

  for (const foodEntry of findFoodByKitchenTool(targetName)) {
    const flow = buildFoodProductionFlow(foodEntry, t, language);
    if (!flow) continue;
    flows.push({
      ...flow,
      headerTitleKey: foodEntry.name,
    });
  }

  flows.sort((a, b) =>
    (a.headerTitleKey ?? "").localeCompare(b.headerTitleKey ?? ""),
  );
  return flows;
}

export function buildProductionFlows(
  item: IFood | IPlant,
  t: (key: TranslationKey) => string,
  language: string,
): DependencyFlow[] {
  if (item.type === "plant") {
    const flow = buildPlantProductionFlow(item, t, language);
    return flow ? [flow] : [];
  }

  const food = item;
  const flows: DependencyFlow[] = [];

  const variants = food.requirements ?? [];
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const flow = buildFoodProductionFlow(
      food,
      t,
      language,
      i === 0 ? undefined : variant,
    );
    if (!flow) continue;
    if (i > 0) {
      flows.push({
        ...flow,
        headerTitleKey: variant[0]?.item.name ?? flow.headerTitleKey,
      });
    } else {
      flows.push(flow);
    }
  }

  return flows;
}

export function buildDependencyFlow(
  item: IFood | IPlant,
  t: (key: TranslationKey) => string,
  language: string,
): DependencyFlow | null {
  return buildProductionFlows(item, t, language)[0] ?? null;
}
