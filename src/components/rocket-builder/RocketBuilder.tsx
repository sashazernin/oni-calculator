import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import type { IRocketEngine, IRocketModule } from "../../types/game-data-types";
import {
  ROCKET_EXTERNAL_TANK_KG,
  ROCKET_OXIDIZER_KG_PER_FUEL_KG,
  ROCKET_OXIDIZER_TANK_KG,
  rocketCargos,
  rocketEngines,
  rocketHeads,
  rocketModules,
  rocketPlatform,
  rocketTanks,
  type RocketEngineId,
} from "../../game-data/rocket";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";
import type { TranslationKey } from "../../i18n/translations";
import { getAssetImageUrl } from "../asset-image/AssetImage";
import {
  CLASSIC_CARGO_BAY_KIND_ORDER,
  classicCargoBayKindImage,
  classicCargoSlotIndexFromUid,
  type ClassicCargoBayKind,
} from "../../helpers/classicCargoBayKinds";
import {
  CLASSIC_RESEARCH_SIGHTSEEING_KIND_ORDER,
  classicResearchSightseeingKindImage,
  classicResearchSightseeingSlotIndexFromUid,
  type ClassicResearchSightseeingKind,
} from "../../helpers/classicResearchSightseeingKinds";
import { Popup } from "../popup/Popup";
import { getRocketModuleSpriteInset } from "./rocket-sprite-insets";
import { liquids } from "../../game-data/liquids";
import { gas } from "../../game-data/gas";
import { resourses } from "../../game-data/resourses";

export type PlacedRocketStackModule = {
  uid: string;
  moduleKey: string;
  row: number;
  col: number;
}

export const ROCKET_GRID_COLUMNS = rocketPlatform.width

/** Размер ячейки сетки (px). */
export const ROCKET_CELL_PX = 40

/** Ширина колонки с номером ряда слева от сетки. */
const ROCKET_ROW_INDEX_RAIL_PX = 26
/** Мин. ширина колонки с нагрузкой (burden / `load`) модулей справа. */
const ROCKET_LOAD_RAIL_MIN_PX = 40
/** Невидимый «мост» от классического модуля к панели выбора типа (px). */
const CLASSIC_MODULE_PICKER_BRIDGE_PX = 58
const CLASSIC_MODULE_PICKER_COLUMN_PX = 52
const CLASSIC_MODULE_PICKER_COLUMN_OVERLAP_PX = 10

/** Игровая «нагрузка» (burden / load), не высота модуля в ячейках. */
function rocketPartBurden(part: IRocketModule | IRocketEngine): number {
  return typeof part.load === "number" ? part.load : 0;
}

export const rocketStackModules: Record<string, IRocketModule> = {
  ...rocketModules,
  ...rocketCargos,
  ...rocketHeads,
  ...rocketTanks,
}

/** Порядок секций в каталоге «Добавить модуль». */
const MODULE_CATALOG_SECTIONS: {
  type: IRocketModule["type"];
  titleKey: TranslationKey;
}[] = [
  { type: "rocket-module", titleKey: "rocket_builder_section_modules" },
  { type: "rocket-cargo", titleKey: "rocket_builder_section_cargo" },
  { type: "rocket-head", titleKey: "rocket_builder_section_noses" },
  { type: "rocket-tank", titleKey: "rocket_builder_section_tanks" },
];

function isRocketHeadModule(mod: IRocketModule | undefined): boolean {
  return mod?.type === "rocket-head";
}

/** Горизонтальное центрирование модуля в сетке ракеты. */
function centeredModuleCol(mod: IRocketModule): number {
  return Math.max(0, Math.floor((ROCKET_GRID_COLUMNS - mod.width) / 2));
}

function topOccupiedRow(occ: Set<string>): number | null {
  if (occ.size === 0) return null;
  let top = Infinity;
  for (const key of occ) {
    const r = Number(key.split(",")[0]);
    if (!Number.isNaN(r) && r < top) top = r;
  }
  return top === Infinity ? null : top;
}

/**
 * Якорь для не-носового модуля: первый модуль — у «дна» зоны (над двигателем),
 * следующие — вплотную сверху уже построенного стека (к row 0).
 */
function anchorForStackModule(
  mod: IRocketModule,
  budget: number,
  occ: Set<string>,
): { row: number; col: number } | null {
  if (budget <= 0) return null;
  const col = centeredModuleCol(mod);
  const topOcc = topOccupiedRow(occ);
  const anchorRow =
    topOcc === null ? budget - mod.height : topOcc - mod.height;
  if (!placementFitsAt(anchorRow, col, mod, budget, occ)) return null;
  return { row: anchorRow, col };
}

function maxOccupiedRow(occ: Set<string>): number {
  let maxR = -1;
  for (const key of occ) {
    const r = Number(key.split(",")[0]);
    if (!Number.isNaN(r) && r > maxR) maxR = r;
  }
  return maxR;
}

/** Свободный якорь, перебор снизу вверх (предпочтение ближе к двигателю). */
function findLowestFreeAnchor(
  mod: IRocketModule,
  budget: number,
  occFull: Set<string>,
): { row: number; col: number } | null {
  const col = centeredModuleCol(mod);
  for (let r = budget - mod.height; r >= 0; r--) {
    if (placementFitsAt(r, col, mod, budget, occFull)) {
      return { row: r, col };
    }
  }
  return null;
}

/** Префикс uid баков, подставляемых по расчёту топлива (не хранятся в состоянии пользователя). */
export const INFERRED_ROCKET_TANK_UID_PREFIX = "auto:tank:";

/**
 * Внешние топливные и окислительные баки: сплошная колонна от двигателя вверх
 * (нижние ряды сетки), без «вставки» в зазор между носом и телом.
 */
export function buildInferredTankPlacements(
  _engine: IRocketEngine,
  budget: number,
  _userPlacements: PlacedRocketStackModule[],
  fuelPlan: RocketFuelPlan,
  oxidizerVariant: RocketOxidizerVariant,
): PlacedRocketStackModule[] {
  if (budget <= 0) return [];
  const out: PlacedRocketStackModule[] = [];
  /** Индекс верхней границы следующего модуля (ряд под ним — двигатель / уже поставленный бак). */
  let rowBottom = budget;

  const pushStacked = (
    moduleKey: string,
    count: number,
    uidSegment: string,
  ) => {
    const mod = rocketStackModules[moduleKey];
    if (!mod || count <= 0) return;
    for (let i = 0; i < count; i++) {
      if (rowBottom < mod.height) break;
      rowBottom -= mod.height;
      out.push({
        uid: `${INFERRED_ROCKET_TANK_UID_PREFIX}${uidSegment}:${i}`,
        moduleKey,
        row: rowBottom,
        col: centeredModuleCol(mod),
      });
    }
  };

  pushStacked("largeLiquidFuelTank", fuelPlan.tanksNeeded, "fuel");

  const oxLine = fuelPlan.oxidizerLines?.find(
    (l) => l.variant === oxidizerVariant,
  );
  const oxCount = oxLine?.oxidizerTanksNeeded ?? 0;
  if (oxCount > 0) {
    const oxKey =
      oxidizerVariant === "liquidOxygen"
        ? "liquidOxidizerTank"
        : "smallSolidOxidizerTank";
    if (rocketStackModules[oxKey]) {
      pushStacked(oxKey, oxCount, "ox");
    }
  }

  return out;
}

/**
 * Позиция не-носового модуля: над «телом» (без учёта носа), либо ниже тела к двигателю,
 * если сверху уже занят носом; иначе любая свободная ячейка (нос не блокирует добавление).
 */
function anchorForNonHeadModule(
  mod: IRocketModule,
  budget: number,
  prev: PlacedRocketStackModule[],
): { row: number; col: number } | null {
  if (budget <= 0) return null;
  const occBody = occupiedCellsNonHead(prev);
  const headPlacements = prev.filter(isHeadPlacement);
  const occHead = occupiedCells(headPlacements);
  const occFull = occupiedCells(prev);
  const col = centeredModuleCol(mod);

  const stackOnBody = anchorForStackModule(mod, budget, occBody);
  if (stackOnBody) {
    if (headPlacements.length === 0) return stackOnBody;
    const clearOfHead = placementFitsAt(
      stackOnBody.row,
      stackOnBody.col,
      mod,
      budget,
      occHead,
    );
    if (clearOfHead) return stackOnBody;
  }

  const maxBodyRow = maxOccupiedRow(occBody);
  if (maxBodyRow < 0) {
    return findLowestFreeAnchor(mod, budget, occFull);
  }
  const belowAnchor = maxBodyRow + 1;
  if (placementFitsAt(belowAnchor, col, mod, budget, occFull)) {
    return { row: belowAnchor, col };
  }
  return findLowestFreeAnchor(mod, budget, occFull);
}

function placementsDeepEqual(
  a: PlacedRocketStackModule[],
  b: PlacedRocketStackModule[],
): boolean {
  if (a.length !== b.length) return false;
  const byUid = new Map(a.map((p) => [p.uid, p]));
  for (const p of b) {
    const q = byUid.get(p.uid);
    if (!q || q.row !== p.row || q.col !== p.col || q.moduleKey !== p.moduleKey)
      return false;
  }
  return true;
}

function isHeadPlacement(p: PlacedRocketStackModule): boolean {
  return isRocketHeadModule(rocketStackModules[p.moduleKey]);
}

/** Занятость только «тела» ракеты (всё кроме носов), для наслоения блоков и позиции носа. */
function occupiedCellsNonHead(
  placements: PlacedRocketStackModule[],
): Set<string> {
  return occupiedCells(placements.filter((p) => !isHeadPlacement(p)));
}

/** Переставляет не-носовые модули в сплошной стек от двигателя вверх (без дыр после удаления). */
function compactBodyPlacements(
  body: PlacedRocketStackModule[],
  budget: number,
): PlacedRocketStackModule[] {
  if (body.length === 0 || budget <= 0) return body;
  const sorted = [...body].sort((a, b) => {
    if (b.row !== a.row) return b.row - a.row;
    return a.uid.localeCompare(b.uid);
  });
  const next: PlacedRocketStackModule[] = [];
  for (const p of sorted) {
    const mod = rocketStackModules[p.moduleKey];
    if (!mod) continue;
    const occ = occupiedCells(next);
    const anchor = anchorForStackModule(mod, budget, occ);
    if (!anchor) continue;
    next.push({ ...p, row: anchor.row, col: anchor.col });
  }
  return next;
}

/** Один `commondModule`, один нос; тело уплотняется снизу; нос — наверху построенного стека, по центру. */
export function normalizeRocketStackPlacements(
  placements: PlacedRocketStackModule[],
  budget: number,
): PlacedRocketStackModule[] {
  if (placements.length === 0) return placements;

  const afterCommon: PlacedRocketStackModule[] = [];
  let commonKeptUid: string | null = null;
  for (const p of placements) {
    const mod = rocketStackModules[p.moduleKey];
    if (mod?.commondModule) {
      if (commonKeptUid !== null) continue;
      commonKeptUid = p.uid;
    }
    afterCommon.push(p);
  }

  const headPlacements = afterCommon.filter((p) =>
    isRocketHeadModule(rocketStackModules[p.moduleKey]),
  );
  const primaryHead = headPlacements[0];
  const dropHeadUids = new Set(headPlacements.slice(1).map((h) => h.uid));

  const bodyCandidates = afterCommon.filter(
    (p) =>
      !isHeadPlacement(p) && !dropHeadUids.has(p.uid),
  );

  if (budget <= 0) {
    const rest = [...bodyCandidates];
    if (primaryHead) rest.push(primaryHead);
    return rest;
  }

  const compactedBody = compactBodyPlacements(bodyCandidates, budget);

  if (!primaryHead) {
    return compactedBody;
  }

  const headMod = rocketStackModules[primaryHead.moduleKey];
  if (!headMod) {
    return compactedBody;
  }

  const occBody = occupiedCells(compactedBody);
  const anchor = anchorForStackModule(headMod, budget, occBody);
  if (!anchor) {
    return compactedBody;
  }

  const snappedHead: PlacedRocketStackModule = {
    ...primaryHead,
    row: anchor.row,
    col: anchor.col,
  };

  return [...compactedBody, snappedHead];
}

/** SO-билдер: убрать классические модули и пересобрать стек под новый двигатель и авто-баки. */
export function sanitizeRocketStackForEngine(
  stackModules: PlacedRocketStackModule[],
  engineId: RocketEngineId,
  steps: number,
  oxidizerVariant: RocketOxidizerVariant,
): PlacedRocketStackModule[] {
  const engine = rocketEngines[engineId];
  const budget = rocketModuleCellBudget(engine);
  const fuelPlan = computeRocketFuelPlan(engine, steps);
  const inferred = buildInferredTankPlacements(
    engine,
    budget,
    [],
    fuelPlan,
    oxidizerVariant,
  );
  let tankStackRows = 0;
  for (const p of inferred) {
    const m = rocketStackModules[p.moduleKey];
    if (m) tankStackRows += m.height;
  }
  const bodyModuleBudget = Math.max(0, budget - tankStackRows);
  const withoutClassic = stackModules.filter((p) => {
    const mod = rocketStackModules[p.moduleKey];
    return mod && !mod.classicOnly;
  });
  return normalizeRocketStackPlacements(withoutClassic, bodyModuleBudget);
}

function cellKey(row: number, col: number) {
  return `${row},${col}`;
}

function occupiedCells(placements: PlacedRocketStackModule[]): Set<string> {
  const occ = new Set<string>();
  for (const p of placements) {
    const mod = rocketStackModules[p.moduleKey];
    if (!mod) continue;
    for (let dr = 0; dr < mod.height; dr++) {
      for (let dc = 0; dc < mod.width; dc++) {
        occ.add(cellKey(p.row + dr, p.col + dc));
      }
    }
  }
  return occ;
}

function placementFitsAt(
  anchorRow: number,
  anchorCol: number,
  mod: IRocketModule,
  budget: number,
  occ: Set<string>,
): boolean {
  if (
    anchorRow < 0 ||
    anchorCol < 0 ||
    anchorRow + mod.height > budget ||
    anchorCol + mod.width > ROCKET_GRID_COLUMNS
  ) {
    return false;
  }
  for (let dr = 0; dr < mod.height; dr++) {
    for (let dc = 0; dc < mod.width; dc++) {
      if (occ.has(cellKey(anchorRow + dr, anchorCol + dc))) return false;
    }
  }
  return true;
}

export function rocketModuleCellBudget(engine: IRocketEngine): number {
  return Math.max(0, engine.maxHeight - engine.height);
}

/** Нижний ряд (exclusive) занятого стеком модулей в координатах сетки. */
export function placementsStackExtentRows(
  placements: readonly PlacedRocketStackModule[],
): number {
  let max = 0;
  for (const p of placements) {
    const m = rocketStackModules[p.moduleKey];
    if (m) max = Math.max(max, p.row + m.height);
  }
  return max;
}

/** Число прыжков по маршруту (ребра между шестиугольниками). */
export function rocketRouteSteps(way: number[] | null | undefined): number {
  if (!way || way.length < 2) return 0
  return way.length - 1
}

/** Двигатель с внешним топливным модулем, для которого нужны отдельные баки окислителя (нефть / водород). */
export function rocketEngineNeedsOxidizerTanks(engine: IRocketEngine): boolean {
  if (!engine.allowsExternalFuelTank) return false
  return engine.fuel === liquids.Petroleum || engine.fuel === gas.hydrogen
}

export type RocketOxidizerVariant = keyof typeof ROCKET_OXIDIZER_KG_PER_FUEL_KG

export type RocketOxidizerPlanLine = {
  variant: RocketOxidizerVariant
  /** Ключ `gd_*` для перевода. */
  translationKey: string
  /** Путь к иконке в `game-data/assets`. */
  image: string
  totalOxidizerKg: number
  oxidizerTanksNeeded: number
}

export type RocketFuelPlan = {
  steps: number
  totalFuelKg: number
  /** Объём одного модуля в расчёте: внешний топливный = ROCKET_EXTERNAL_TANK_KG; только встроенный — вместимость бака. */
  volumePerTankKg: number
  /** Число внешних топливных модулей (после учёта встроенного бака). */
  tanksNeeded: number
  /** Есть встроенный бак в расчёте / подписи UI. */
  usesIntegratedTank: boolean
  /** Расчёт по видам окислителя — только если нужен внешний топливный бак и топливо нефть или водород. */
  oxidizerLines?: RocketOxidizerPlanLine[]
}

function computeOxidizerLines(totalFuelKg: number): RocketOxidizerPlanLine[] {
  if (totalFuelKg <= 0) return []
  const keyByVariant: Record<RocketOxidizerVariant, string> = {
    fertilizer: resourses.fertilizer.name,
    oxylite: resourses.oxylite.name,
    liquidOxygen: liquids.liquidOxygen.name,
  }
  const imageByVariant: Record<RocketOxidizerVariant, string> = {
    fertilizer: resourses.fertilizer.image,
    oxylite: resourses.oxylite.image,
    liquidOxygen: liquids.liquidOxygen.image,
  }
  return (Object.keys(ROCKET_OXIDIZER_KG_PER_FUEL_KG) as RocketOxidizerVariant[]).map(
    (variant) => {
      const totalOxidizerKg = totalFuelKg * ROCKET_OXIDIZER_KG_PER_FUEL_KG[variant]
      const oxidizerTanksNeeded =
        totalOxidizerKg <= 0 ? 0 : Math.ceil(totalOxidizerKg / ROCKET_OXIDIZER_TANK_KG)
      return {
        variant,
        translationKey: keyByVariant[variant],
        image: imageByVariant[variant],
        totalOxidizerKg,
        oxidizerTanksNeeded,
      }
    },
  )
}

/** Достаточно ли топлива для маршрута: встроенный бак ограничен; внешние модули считаем безлимитными. */
export function isRocketEngineFeasibleForSteps(
  engine: IRocketEngine,
  steps: number,
): boolean {
  if (steps <= 0) return true
  if (engine.allowsExternalFuelTank) return true
  const needKg = steps * engine.consumption
  if (engine.tank === undefined) return false
  return needKg <= engine.tank
}

export function computeRocketFuelPlan(
  engine: IRocketEngine,
  steps: number,
): RocketFuelPlan {
  const totalFuelKg = Math.max(0, steps * engine.consumption)
  const internalCap = engine.tank ?? 0
  const hasInternal = internalCap > 0
  const { allowsExternalFuelTank: allowsExt } = engine

  let tanksNeeded = 0
  let volumePerTankKg: number
  let usesIntegratedTank: boolean

  if (steps <= 0 || totalFuelKg === 0) {
    tanksNeeded = 0
    volumePerTankKg = allowsExt && !hasInternal ? ROCKET_EXTERNAL_TANK_KG : internalCap || ROCKET_EXTERNAL_TANK_KG
    usesIntegratedTank = hasInternal
  } else if (!allowsExt) {
    tanksNeeded = 0
    volumePerTankKg = internalCap
    usesIntegratedTank = hasInternal
  } else if (!hasInternal) {
    tanksNeeded = Math.ceil(totalFuelKg / ROCKET_EXTERNAL_TANK_KG)
    volumePerTankKg = ROCKET_EXTERNAL_TANK_KG
    usesIntegratedTank = false
  } else {
    const fromExternalKg = Math.max(0, totalFuelKg - internalCap)
    tanksNeeded =
      fromExternalKg <= 0 ? 0 : Math.ceil(fromExternalKg / ROCKET_EXTERNAL_TANK_KG)
    volumePerTankKg = ROCKET_EXTERNAL_TANK_KG
    usesIntegratedTank = true
  }

  const oxidizerLines =
    rocketEngineNeedsOxidizerTanks(engine) && steps > 0 && totalFuelKg > 0
      ? computeOxidizerLines(totalFuelKg)
      : undefined

  return {
    steps,
    totalFuelKg,
    volumePerTankKg,
    tanksNeeded,
    usesIntegratedTank,
    oxidizerLines,
  }
}

interface RocketBuilderProps {
  engineId: RocketEngineId | null;
  placements: PlacedRocketStackModule[];
  onPlacementsChange: React.Dispatch<React.SetStateAction<PlacedRocketStackModule[]>>;
  /** Баки по расчёту топлива/окислителя (не редактируются пользователем). */
  inferredTankPlacements?: PlacedRocketStackModule[];
  /** Только отображение сетки и модулей (классический калькулятор). */
  readOnly?: boolean;
  /** Виды грузовых отсеков (классика), длина = число отсеков. */
  classicCargoBayKinds?: ClassicCargoBayKind[];
  onClassicCargoBayKindChange?: (
    slotIndex: number,
    kind: ClassicCargoBayKind,
  ) => void;
  classicResearchSightseeingKinds?: ClassicResearchSightseeingKind[];
  onClassicResearchSightseeingKindChange?: (
    slotIndex: number,
    kind: ClassicResearchSightseeingKind,
  ) => void;
}

export default function RocketBuilder(props: RocketBuilderProps) {
  const {
    engineId,
    placements,
    onPlacementsChange,
    inferredTankPlacements = [],
    readOnly = false,
    classicCargoBayKinds,
    onClassicCargoBayKindChange,
    classicResearchSightseeingKinds,
    onClassicResearchSightseeingKindChange,
  } = props;
  const { colors } = useContext(ThemeContext);
  const { t, entityName } = useTranslation();
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const classicSidePickerZoneRef = useRef<HTMLDivElement>(null);
  /** Курсор над любой свободной ячейкой зоны модулей — показываем общую подсветку области. */
  const [highlightFreeStack, setHighlightFreeStack] = useState(false);
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [hoveredStackModuleUid, setHoveredStackModuleUid] = useState<
    string | null
  >(null);
  const [hoveredCatalogModKey, setHoveredCatalogModKey] = useState<
    string | null
  >(null);

  const engine = engineId ? rocketEngines[engineId] : null;



  /** Рядов под модули над двигателем (= maxHeight двигателя минус высота двигателя). */
  const budget = engine ? rocketModuleCellBudget(engine) : 0;
  /** Общая высота ракеты на сетке в ячейках; включает и двигатель (без платформы под ним). */
  const rocketTotalRows = engine?.maxHeight ?? 0;
  const platform = rocketPlatform;
  const platformRows = platform.height;
  /** Классический калькулятор: без стартовой платформы Spaced Out. */
  const showPlatform = !readOnly;
  const platformRowCount = showPlatform ? platformRows : 0;
  const engineColOffset = engine
    ? Math.floor((ROCKET_GRID_COLUMNS - engine.width) / 2)
    : 0;

  const mergedPlacements = useMemo(
    () => [...placements, ...inferredTankPlacements],
    [placements, inferredTankPlacements],
  );

  /** Суммарная высота колонны авто-баков (ряды сетки), прижатой к двигателю. */
  const tankStackRowCount = useMemo(() => {
    let s = 0;
    for (const p of inferredTankPlacements) {
      const m = rocketStackModules[p.moduleKey];
      if (m) s += m.height;
    }
    return s;
  }, [inferredTankPlacements]);

  /** Ряды сетки только для пользовательских модулей (над колонной баков). */
  const bodyModuleBudget = Math.max(0, budget - tankStackRowCount);

  const occ = useMemo(
    () => occupiedCells(mergedPlacements),
    [mergedPlacements],
  );
  const occNonHead = useMemo(
    () => occupiedCellsNonHead(mergedPlacements),
    [mergedPlacements],
  );
  const primary = colors.primary.main;

  const stackCatalog = useMemo(() => Object.entries(rocketStackModules), []);

  const catalogBySection = useMemo(() => {
    const byType = new Map<IRocketModule["type"], [string, IRocketModule][]>();
    for (const sec of MODULE_CATALOG_SECTIONS) {
      byType.set(sec.type, []);
    }
    for (const entry of stackCatalog) {
      const [k, m] = entry;
      if (m.classicOnly) continue;
      const arr = byType.get(m.type);
      if (arr) arr.push([k, m]);
    }
    for (const arr of byType.values()) {
      arr.sort((a, b) =>
        entityName(a[1].name).localeCompare(entityName(b[1].name)),
      );
    }
    return MODULE_CATALOG_SECTIONS.map((sec) => ({
      title: t(sec.titleKey),
      type: sec.type,
      items: byType.get(sec.type) ?? [],
    })).filter((s) => s.items.length > 0);
  }, [stackCatalog, t, entityName]);

  const hasHead = useMemo(
    () =>
      mergedPlacements.some((p) =>
        isRocketHeadModule(rocketStackModules[p.moduleKey]),
      ),
    [mergedPlacements],
  );

  const hasCommonModule = useMemo(
    () =>
      mergedPlacements.some((p) =>
        rocketStackModules[p.moduleKey]?.commondModule,
      ),
    [mergedPlacements],
  );

  useEffect(() => {
    if (readOnly) return;
    const withoutClassic = placements.filter((p) => {
      const mod = rocketStackModules[p.moduleKey];
      return mod && !mod.classicOnly;
    });
    const next = normalizeRocketStackPlacements(
      withoutClassic,
      bodyModuleBudget,
    );
    if (placementsDeepEqual(placements, next)) return;
    onPlacementsChange(next);
  }, [readOnly, placements, bodyModuleBudget, onPlacementsChange]);

  useEffect(() => {
    if (!addModuleOpen) setHoveredCatalogModKey(null);
  }, [addModuleOpen]);

  const confirmPickModule = useCallback(
    (modKey: string) => {
      if (!addModuleOpen) return;
      const mod = rocketStackModules[modKey];
      if (!mod) return;
      let didAdd = false;
      onPlacementsChange((prev) => {
        const mergedPrev = [...prev, ...inferredTankPlacements];
        if (
          isRocketHeadModule(mod) &&
          mergedPrev.some((p) =>
            isRocketHeadModule(rocketStackModules[p.moduleKey]),
          )
        ) {
          return prev;
        }
        if (
          mod.commondModule &&
          mergedPrev.some((p) =>
            rocketStackModules[p.moduleKey]?.commondModule,
          )
        ) {
          return prev;
        }
        const occBody = occupiedCellsNonHead(mergedPrev);
        const anchor = isRocketHeadModule(mod)
          ? anchorForStackModule(mod, bodyModuleBudget, occBody)
          : anchorForNonHeadModule(mod, bodyModuleBudget, prev);
        if (!anchor) return prev;
        const { row: anchorRow, col: anchorCol } = anchor;
        const occCheck = isRocketHeadModule(mod)
          ? occBody
          : occupiedCells(prev);
        if (
          !placementFitsAt(
            anchorRow,
            anchorCol,
            mod,
            bodyModuleBudget,
            occCheck,
          )
        )
          return prev;
        didAdd = true;
        return [
          ...prev,
          {
            uid:
              typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            moduleKey: modKey,
            row: anchorRow,
            col: anchorCol,
          },
        ];
      });
      if (didAdd) setAddModuleOpen(false);
    },
    [
      addModuleOpen,
      bodyModuleBudget,
      inferredTankPlacements,
      onPlacementsChange,
    ],
  );

  const removePlacement = useCallback(
    (uid: string) => {
      if (uid.startsWith(INFERRED_ROCKET_TANK_UID_PREFIX)) return;
      onPlacementsChange((prev) => prev.filter((p) => p.uid !== uid));
    },
    [onPlacementsChange],
  );

  const stackExtentRows = useMemo(
    () => placementsStackExtentRows(mergedPlacements),
    [mergedPlacements],
  );

  /** В readOnly (классика) высота зоны модулей = фактический стек, без запаса по maxHeight. */
  const gridModuleBudget = readOnly ? stackExtentRows : budget;
  const gridRocketTotalRows =
    readOnly && engine
      ? gridModuleBudget + engine.height
      : rocketTotalRows;

  const gridPixelWidth = ROCKET_GRID_COLUMNS * ROCKET_CELL_PX;
  const moduleZoneHeightPx = gridModuleBudget * ROCKET_CELL_PX;
  const gridContentHeightPx =
    (gridRocketTotalRows + platformRowCount) * ROCKET_CELL_PX;

  const hoveredClassicCargoSlot = useMemo(() => {
    if (!hoveredStackModuleUid) return null;
    return classicCargoSlotIndexFromUid(hoveredStackModuleUid);
  }, [hoveredStackModuleUid]);

  const hoveredClassicRsSlot = useMemo(() => {
    if (!hoveredStackModuleUid) return null;
    return classicResearchSightseeingSlotIndexFromUid(hoveredStackModuleUid);
  }, [hoveredStackModuleUid]);

  const classicModulePickerAnchorY = useMemo(() => {
    const slot =
      hoveredClassicCargoSlot !== null
        ? hoveredClassicCargoSlot
        : hoveredClassicRsSlot;
    if (slot === null) return null;
    const placement = mergedPlacements.find((p) => {
      if (hoveredClassicCargoSlot !== null) {
        return classicCargoSlotIndexFromUid(p.uid) === hoveredClassicCargoSlot;
      }
      return classicResearchSightseeingSlotIndexFromUid(p.uid) === slot;
    });
    if (!placement) return null;
    const mod = rocketStackModules[placement.moduleKey];
    if (!mod) return null;
    return (placement.row + mod.height / 2) * ROCKET_CELL_PX;
  }, [hoveredClassicCargoSlot, hoveredClassicRsSlot, mergedPlacements]);

  const classicCargoKindPickerEnabled =
    readOnly && classicCargoBayKinds && onClassicCargoBayKindChange;

  const classicRsKindPickerEnabled =
    readOnly &&
    classicResearchSightseeingKinds &&
    onClassicResearchSightseeingKindChange;

  const classicSidePickerEnabled =
    classicCargoKindPickerEnabled || classicRsKindPickerEnabled;

  const showClassicCargoPicker =
    classicCargoKindPickerEnabled &&
    hoveredClassicCargoSlot !== null &&
    classicModulePickerAnchorY !== null;

  const showClassicRsPicker =
    classicRsKindPickerEnabled &&
    hoveredClassicRsSlot !== null &&
    classicModulePickerAnchorY !== null;

  const showClassicSidePicker = showClassicCargoPicker || showClassicRsPicker;

  const syncClassicPickableHoverFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!classicSidePickerEnabled) return;
      const zone = classicSidePickerZoneRef.current;
      const gridEl = gridWrapRef.current;
      if (!zone || !gridEl) return;

      const zoneR = zone.getBoundingClientRect();
      const xZone = clientX - zoneR.left;
      const yZone = clientY - zoneR.top;

      const pickerLeft =
        gridPixelWidth - CLASSIC_MODULE_PICKER_COLUMN_OVERLAP_PX;
      const pickerRight =
        pickerLeft + CLASSIC_MODULE_PICKER_COLUMN_PX;
      if (
        xZone >= pickerLeft &&
        xZone < pickerRight &&
        yZone >= 0 &&
        yZone <= gridContentHeightPx
      ) {
        return;
      }

      const gridR = gridEl.getBoundingClientRect();
      const x = clientX - gridR.left;
      const y = clientY - gridR.top;
      if (x < 0 || y < 0 || x >= gridPixelWidth || y >= moduleZoneHeightPx) {
        setHoveredStackModuleUid(null);
        return;
      }

      for (let i = mergedPlacements.length - 1; i >= 0; i--) {
        const p = mergedPlacements[i];
        if (p.uid.startsWith(INFERRED_ROCKET_TANK_UID_PREFIX)) continue;
        const isCargo = classicCargoSlotIndexFromUid(p.uid) !== null;
        const isRs = classicResearchSightseeingSlotIndexFromUid(p.uid) !== null;
        if (!isCargo && !isRs) continue;
        const mod = rocketStackModules[p.moduleKey];
        if (!mod) continue;
        const left = p.col * ROCKET_CELL_PX;
        const top = p.row * ROCKET_CELL_PX;
        const wPx = mod.width * ROCKET_CELL_PX;
        const hPx = mod.height * ROCKET_CELL_PX;
        const hitRight = left + wPx + CLASSIC_MODULE_PICKER_BRIDGE_PX;
        if (x >= left && x < hitRight && y >= top && y < top + hPx) {
          setHoveredStackModuleUid(p.uid);
          return;
        }
      }
      setHoveredStackModuleUid(null);
    },
    [
      classicSidePickerEnabled,
      mergedPlacements,
      gridPixelWidth,
      moduleZoneHeightPx,
      gridContentHeightPx,
    ],
  );

  const loadRailMarkers = useMemo(() => {
    if (!engine) return [];
    const railLabel = (part: IRocketModule | IRocketEngine) =>
      readOnly ? part.height : rocketPartBurden(part);
    const markers: { key: string; centerY: number; label: number }[] = [
      {
        key: "engine",
        centerY: (gridModuleBudget + engine.height / 2) * ROCKET_CELL_PX,
        label: railLabel(engine),
      },
    ];
    for (const p of mergedPlacements) {
      const mod = rocketStackModules[p.moduleKey];
      if (!mod) continue;
      markers.push({
        key: p.uid,
        centerY: (p.row + mod.height / 2) * ROCKET_CELL_PX,
        label: railLabel(mod),
      });
    }
    return markers;
  }, [mergedPlacements, engine, gridModuleBudget, readOnly]);

  const syncHighlightFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = gridWrapRef.current;
      if (!el || budget <= 0) {
        setHighlightFreeStack(false);
        return;
      }
      const r = el.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      if (
        x < 0 ||
        y < 0 ||
        x >= gridPixelWidth ||
        y >= moduleZoneHeightPx
      ) {
        setHighlightFreeStack(false);
        return;
      }
      const col = Math.floor(x / ROCKET_CELL_PX);
      const row = Math.floor(y / ROCKET_CELL_PX);
      if (
        row < gridModuleBudget &&
        col >= 0 &&
        col < ROCKET_GRID_COLUMNS &&
        !occ.has(cellKey(row, col))
      ) {
        setHighlightFreeStack(true);
      } else {
        setHighlightFreeStack(false);
      }
    },
    [gridModuleBudget, gridPixelWidth, moduleZoneHeightPx, occ],
  );

  if (!engine) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: colors.text.primary,
          borderRadius: 8,
          border: `1px dashed ${colors.border.main}`,
          maxWidth: ROCKET_GRID_COLUMNS * ROCKET_CELL_PX,
        }}
      >
        {t("rocket_builder_select_route_engine")}
      </div>
    );
  }

  const engineSpriteInset = getRocketModuleSpriteInset(engine);
  const engineNominalW = engine.width * ROCKET_CELL_PX;
  const engineNominalH = engine.height * ROCKET_CELL_PX;
  const engineDrawW =
    engineNominalW + engineSpriteInset.left + engineSpriteInset.right;
  const engineDrawH =
    engineNominalH + engineSpriteInset.top + engineSpriteInset.bottom;

  const platformSpriteInset = getRocketModuleSpriteInset(platform);
  const platformNominalW = platform.width * ROCKET_CELL_PX;
  const platformNominalH = platform.height * ROCKET_CELL_PX;
  const platformDrawW =
    platformNominalW + platformSpriteInset.left + platformSpriteInset.right;
  const platformDrawH =
    platformNominalH + platformSpriteInset.top + platformSpriteInset.bottom;

  const railMuted = `color-mix(in srgb, ${colors.text.primary} 52%, transparent)`;
  const railCellStyle = (justify: "flex-end" | "flex-start") =>
    ({
      height: ROCKET_CELL_PX,
      display: "flex",
      alignItems: "center",
      justifyContent: justify,
      fontSize: "0.7rem",
      lineHeight: 1,
      color: railMuted,
      fontVariantNumeric: "tabular-nums",
      userSelect: "none",
    }) as const;

  const loadRailLabelStyle = {
    position: "absolute" as const,
    left: 0,
    right: 0,
    fontSize: "0.7rem",
    lineHeight: 1,
    color: railMuted,
    fontVariantNumeric: "tabular-nums" as const,
    userSelect: "none" as const,
    textAlign: "center" as const,
    pointerEvents: "none" as const,
    transform: "translateY(-50%)",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 6,
        }}
      >
        <div
          aria-hidden
          style={{
            flexShrink: 0,
            width: ROCKET_ROW_INDEX_RAIL_PX,
            height: gridContentHeightPx,
          }}
        >
          {Array.from({ length: gridRocketTotalRows + platformRowCount }).map((_, r) => (
            <div key={`row-${r}`} style={railCellStyle("flex-end")}>
              {gridRocketTotalRows + platformRowCount - r}
            </div>
          ))}
        </div>
        <div
          ref={classicSidePickerZoneRef}
          style={{
            position: "relative",
            flexShrink: 0,
            width: gridPixelWidth,
            height: gridContentHeightPx,
          }}
          onMouseMove={(e) => {
            syncClassicPickableHoverFromPointer(e.clientX, e.clientY);
          }}
          onMouseLeave={(e) => {
            if (!readOnly || !classicSidePickerEnabled) return;
            const next = e.relatedTarget;
            if (next instanceof Node && e.currentTarget.contains(next)) return;
            setHoveredStackModuleUid(null);
          }}
        >
        <div
          ref={gridWrapRef}
          style={{ position: "relative", width: gridPixelWidth, flexShrink: 0 }}
          onMouseMove={(e) => {
            syncHighlightFromPointer(e.clientX, e.clientY);
          }}
          onMouseLeave={() => setHighlightFreeStack(false)}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${ROCKET_GRID_COLUMNS}, ${ROCKET_CELL_PX}px)`,
              gridAutoRows: `${ROCKET_CELL_PX}px`,
              borderTop: `1px solid ${colors.border.main}`,
              borderLeft: `1px solid ${colors.border.main}`,
            }}
          >
            {Array.from({
              length: (gridRocketTotalRows + platformRowCount) * ROCKET_GRID_COLUMNS,
            }).map((_, i) => {
              const row = Math.floor(i / ROCKET_GRID_COLUMNS);
              const col = i % ROCKET_GRID_COLUMNS;

              const inModuleZone = row < gridModuleBudget;
              const occupied = occ.has(cellKey(row, col));

              const cellInteract = !readOnly && inModuleZone && !occupied;

              const inEngineFootprint =
                row >= gridModuleBudget &&
                row < gridRocketTotalRows &&
                col >= engineColOffset &&
                col < engineColOffset + engine.width;

              return (
                <div
                  key={cellKey(row, col)}
                  role={cellInteract ? "button" : undefined}
                  tabIndex={cellInteract ? 0 : undefined}
                  aria-label={
                    cellInteract
                      ? t("rocket_builder_aria_add_module_on_stack")
                      : undefined
                  }
                  onClick={() => cellInteract && setAddModuleOpen(true)}
                  onKeyDown={(e) => {
                    if (
                      cellInteract &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault();
                      setAddModuleOpen(true);
                    }
                  }}
                  style={{
                    position: "relative",
                    width: ROCKET_CELL_PX,
                    height: ROCKET_CELL_PX,
                    borderRight: `1px solid ${colors.border.main}`,
                    borderBottom: `1px solid ${colors.border.main}`,
                    boxSizing: "border-box",
                    cursor:
                      row >= gridModuleBudget
                        ? "default"
                        : cellInteract
                          ? "pointer"
                          : "default",
                    backgroundColor: (() => {
                      if (row >= gridModuleBudget && inEngineFootprint) {
                        return `color-mix(in srgb, ${colors.text.primary} 4%, transparent)`;
                      }
                      if (row >= gridModuleBudget) {
                        return `color-mix(in srgb, ${colors.text.primary} 7%, transparent)`;
                      }
                      return "transparent";
                    })(),
                  }}
                >
                </div>
              );
            })}
          </div>

          {!readOnly && gridModuleBudget > 0 && highlightFreeStack ? (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: gridPixelWidth,
                height: moduleZoneHeightPx,
                boxSizing: "border-box",
                border: `2px solid ${primary}`,
                pointerEvents: "none",
                zIndex: 1,
                borderRadius: 2,
                backgroundColor: `color-mix(in srgb, ${primary} 12%, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiPlus
                style={{ color: primary }}
                size={Math.max(
                  24,
                  Math.floor(
                    Math.min(gridPixelWidth, moduleZoneHeightPx) * 0.12,
                  ),
                )}
                strokeWidth={2.25}
              />
            </div>
          ) : null}

          {showPlatform ? (
            <img
              alt=""
              draggable={false}
              src={getAssetImageUrl(platform.image)}
              style={{
                position: "absolute",
                pointerEvents: "none",
                left: -platformSpriteInset.left,
                top:
                  gridRocketTotalRows * ROCKET_CELL_PX - platformSpriteInset.top,
                width: platformDrawW,
                height: platformDrawH,
                objectFit: "contain",
                zIndex: 0,
              }}
            />
          ) : null}

          {/* Двигатель в нижней части той же сетки (высота двигателя в ячейках). */}
          <img
            alt=""
            draggable={false}
            src={getAssetImageUrl(engine.image)}
            style={{
              position: "absolute",
              pointerEvents: "none",
              left:
                engineColOffset * ROCKET_CELL_PX - engineSpriteInset.left,
              top: gridModuleBudget * ROCKET_CELL_PX - engineSpriteInset.top,
              width: engineDrawW,
              height: engineDrawH,
              objectFit: "contain",
              zIndex: 1,
            }}
          />

          {mergedPlacements.map((p) => {
            const mod = rocketStackModules[p.moduleKey];
            if (!mod) return null;
            const inferredTank = p.uid.startsWith(INFERRED_ROCKET_TANK_UID_PREFIX);
            const classicCargoSlot = classicCargoSlotIndexFromUid(p.uid);
            const classicRsSlot = classicResearchSightseeingSlotIndexFromUid(p.uid);
            const isClassicCargoModule =
              readOnly && classicCargoSlot !== null && !inferredTank;
            const isClassicRsModule =
              readOnly && classicRsSlot !== null && !inferredTank;
            const isClassicPickableModule =
              isClassicCargoModule || isClassicRsModule;
            const modInset = getRocketModuleSpriteInset(mod);
            const wPx = mod.width * ROCKET_CELL_PX;
            const hPx = mod.height * ROCKET_CELL_PX;
            const drawW = wPx + modInset.left + modInset.right;
            const drawH = hPx + modInset.top + modInset.bottom;
            const isHovered =
              !inferredTank &&
              hoveredStackModuleUid === p.uid &&
              (!readOnly || isClassicPickableModule);
            const crossSize = Math.max(
              22,
              Math.min(36, Math.floor(Math.min(wPx, hPx) * 0.28)),
            );
            return (
              <div
                key={p.uid}
                title={
                  inferredTank
                    ? undefined
                    : t("rocket_builder_module_remove_hint")
                }
                onMouseEnter={() => {
                  if (!inferredTank) setHoveredStackModuleUid(p.uid);
                }}
                onMouseLeave={(e) => {
                  if (isClassicPickableModule) {
                    const related = e.relatedTarget;
                    if (
                      related instanceof Element &&
                      (related.closest("[data-classic-module-picker]") ||
                        related.closest("[data-classic-module-picker-bridge]"))
                    ) {
                      return;
                    }
                  }
                  setHoveredStackModuleUid((prev) =>
                    prev === p.uid ? null : prev,
                  );
                }}
                onClick={
                  inferredTank
                    ? undefined
                    : (e) => {
                      e.stopPropagation();
                      removePlacement(p.uid);
                    }
                }
                style={{
                  position: "absolute",
                  left: p.col * ROCKET_CELL_PX,
                  top: p.row * ROCKET_CELL_PX,
                  width: wPx,
                  height: hPx,
                  zIndex: 2,
                  pointerEvents:
                    inferredTank || (readOnly && !isClassicPickableModule)
                      ? "none"
                      : "auto",
                  overflow: "visible",
                  cursor:
                    inferredTank
                      ? "default"
                      : isClassicPickableModule
                        ? "pointer"
                        : readOnly
                          ? "default"
                          : "pointer",
                }}
              >
                <img
                  src={getAssetImageUrl(mod.image)}
                  alt=""
                  draggable={false}
                  style={{
                    position: "absolute",
                    left: -modInset.left,
                    top: -modInset.top,
                    width: drawW,
                    height: drawH,
                    objectFit: "contain",
                    objectPosition: isRocketHeadModule(mod)
                      ? "bottom center"
                      : p.moduleKey === "solidFuelThruster"
                        ? "top center"
                        : p.moduleKey === "classicResearchModule" ||
                            p.moduleKey === "classicSightseeingModule"
                          ? "bottom center"
                          : "center",
                    transform:
                      p.moduleKey === "largeGasCargoCanister"
                        ? "translateX(-14px)"
                        : undefined,
                    pointerEvents: "none",
                  }}
                />
                {isHovered ? (
                  <>
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 6,
                        border: `2px solid ${primary}`,
                        background: `color-mix(in srgb, ${primary} 16%, transparent)`,
                        pointerEvents: "none",
                        zIndex: 1,
                        boxSizing: "border-box",
                      }}
                    />
                    {!readOnly ? (
                      <div
                        aria-hidden
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: crossSize,
                          height: crossSize,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: colors.background.default,
                          color: primary,
                          border: `2px solid ${primary}`,
                          pointerEvents: "none",
                          zIndex: 2,
                          boxShadow: `0 2px 8px color-mix(in srgb, ${colors.text.primary} 22%, transparent)`,
                        }}
                      >
                        <FiX size={crossSize * 0.5} strokeWidth={2.5} />
                      </div>
                    ) : null}
                  </>
                ) : null}
                {isClassicPickableModule && hoveredStackModuleUid === p.uid ? (
                  <div
                    aria-hidden
                    data-classic-module-picker-bridge
                    style={{
                      position: "absolute",
                      left: wPx,
                      top: 0,
                      width: CLASSIC_MODULE_PICKER_BRIDGE_PX,
                      height: hPx,
                      zIndex: 3,
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        {classicSidePickerEnabled ? (
          <div
            data-classic-module-picker
            style={{
              position: "absolute",
              left: gridPixelWidth - CLASSIC_MODULE_PICKER_COLUMN_OVERLAP_PX,
              top: 0,
              width: CLASSIC_MODULE_PICKER_COLUMN_PX,
              paddingLeft: CLASSIC_MODULE_PICKER_COLUMN_OVERLAP_PX,
              height: gridContentHeightPx,
              boxSizing: "border-box",
              zIndex: 15,
            }}
          >
            {showClassicSidePicker ? (
            <div
              role="toolbar"
              aria-label={
                showClassicCargoPicker
                  ? t("classic_rocket_cargo_kind_picker")
                  : t("classic_rocket_rs_kind_picker")
              }
              style={{
                position: "absolute",
                left: 0,
                top: classicModulePickerAnchorY ?? 0,
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: 4,
                borderRadius: 8,
                border: `1px solid ${colors.border.main}`,
                background: colors.background.paper,
                boxShadow: `0 4px 14px color-mix(in srgb, ${colors.text.primary} 18%, transparent)`,
                zIndex: 12,
              }}
            >
              {showClassicCargoPicker
                ? CLASSIC_CARGO_BAY_KIND_ORDER.map((kind) => {
                    const active =
                      classicCargoBayKinds![hoveredClassicCargoSlot!] === kind;
                    return (
                      <button
                        key={kind}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          onClassicCargoBayKindChange!(
                            hoveredClassicCargoSlot!,
                            kind,
                          )
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          padding: 2,
                          borderRadius: 6,
                          border: `2px solid ${active ? primary : colors.border.main}`,
                          background: active
                            ? `color-mix(in srgb, ${primary} 14%, ${colors.background.paper})`
                            : colors.background.average,
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={getAssetImageUrl(classicCargoBayKindImage(kind))}
                          alt=""
                          style={{
                            maxWidth: 28,
                            maxHeight: 28,
                            objectFit: "contain",
                          }}
                        />
                      </button>
                    );
                  })
                : CLASSIC_RESEARCH_SIGHTSEEING_KIND_ORDER.map((kind) => {
                    const active =
                      classicResearchSightseeingKinds![
                        hoveredClassicRsSlot!
                      ] === kind;
                    return (
                      <button
                        key={kind}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          onClassicResearchSightseeingKindChange!(
                            hoveredClassicRsSlot!,
                            kind,
                          )
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          padding: 2,
                          borderRadius: 6,
                          border: `2px solid ${active ? primary : colors.border.main}`,
                          background: active
                            ? `color-mix(in srgb, ${primary} 14%, ${colors.background.paper})`
                            : colors.background.average,
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={getAssetImageUrl(
                            classicResearchSightseeingKindImage(kind),
                          )}
                          alt=""
                          style={{
                            maxWidth: 28,
                            maxHeight: 28,
                            objectFit: "contain",
                          }}
                        />
                      </button>
                    );
                  })}
            </div>
            ) : null}
          </div>
        ) : null}
        </div>
        <div
          aria-hidden
          style={{
            flexShrink: 0,
            position: "relative",
            width: ROCKET_LOAD_RAIL_MIN_PX,
            height: gridContentHeightPx,
          }}
        >
          {loadRailMarkers.map((m) => (
            <div
              key={`load-${m.key}`}
              style={{
                ...loadRailLabelStyle,
                top: m.centerY,
              }}
            >
              {m.label}
            </div>
          ))}
        </div>
      </div>

      {!readOnly ? (
      <Popup
        open={addModuleOpen}
        title={t("rocket_builder_add_module_popup_title")}
        variant="fit-content"
        width={640}
        closeButton
        onClose={() => setAddModuleOpen(false)}
      >
        {stackCatalog.length === 0 ? (
          <p style={{ margin: 0, color: colors.text.primary }}>
            {t("rocket_builder_catalog_empty_before")}
            <code style={{ fontSize: "0.9em" }}>rocketStackModules</code>.
          </p>
        ) : !addModuleOpen ? null : (
          <div
            style={{
              width: "100%",
              maxHeight: "min(460px, 70vh)",
              overflowY: "auto",
              overflowX: "hidden",
              padding: "14px 18px 20px",
              boxSizing: "border-box",
            }}
          >
            {catalogBySection.map((section, sectionIdx) => (
              <div
                key={section.type}
                style={{
                  marginTop: sectionIdx > 0 ? 20 : 0,
                }}
              >
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: `color-mix(in srgb, ${colors.text.primary} 58%, transparent)`,
                    marginBottom: 10,
                  }}
                >
                  {section.title}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  {section.items.map(([modKey, mod]) => {
                    const physicalOk = (() => {
                      if (isRocketHeadModule(mod)) {
                        if (hasHead) return false;
                        return (
                          anchorForStackModule(mod, bodyModuleBudget, occNonHead) !==
                          null
                        );
                      }
                      return (
                        anchorForNonHeadModule(mod, bodyModuleBudget, placements) !==
                        null
                      );
                    })();
                    const listDisabled =
                      !physicalOk ||
                      (Boolean(mod.commondModule) && hasCommonModule);
                    const isHover =
                      !listDisabled && hoveredCatalogModKey === modKey;
                    return (
                      <button
                        type="button"
                        key={modKey}
                        disabled={listDisabled}
                        onClick={() => confirmPickModule(modKey)}
                        onMouseEnter={() => {
                          if (!listDisabled) setHoveredCatalogModKey(modKey);
                        }}
                        onMouseLeave={() => {
                          setHoveredCatalogModKey((prev) =>
                            prev === modKey ? null : prev,
                          );
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          justifyContent: "flex-start",
                          minHeight: 132,
                          padding: "10px 8px 12px",
                          gap: 8,
                          borderRadius: 10,
                          border: `1px solid ${listDisabled
                            ? colors.border.main
                            : isHover
                              ? primary
                              : `color-mix(in srgb, ${primary} 32%, ${colors.border.main})`
                            }`,
                          background: isHover
                            ? `color-mix(in srgb, ${primary} 14%, ${colors.background.default})`
                            : colors.background.default,
                          color: colors.text.primary,
                          cursor: listDisabled ? "not-allowed" : "pointer",
                          opacity: listDisabled ? 0.42 : 1,
                          boxSizing: "border-box",
                          textAlign: "center",
                          margin: 0,
                          font: "inherit",
                          outline: "none",
                          boxShadow: listDisabled
                            ? "none"
                            : isHover
                              ? `0 4px 14px color-mix(in srgb, ${primary} 22%, transparent)`
                              : `0 1px 2px color-mix(in srgb, ${colors.text.primary} 8%, transparent)`,
                          transition:
                            "background 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease",
                        }}
                      >
                        <div
                          style={{
                            flex: "1 1 auto",
                            minHeight: 76,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 6,
                            background: isHover
                              ? `color-mix(in srgb, ${primary} 10%, transparent)`
                              : `color-mix(in srgb, ${colors.text.primary} 5%, transparent)`,
                            transition: "background 0.12s ease",
                          }}
                        >
                          <img
                            src={getAssetImageUrl(mod.image)}
                            alt={entityName(mod.name)}
                            draggable={false}
                            style={{
                              maxWidth: "100%",
                              maxHeight: 72,
                              width: "auto",
                              height: "auto",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            lineHeight: 1.25,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 3,
                            wordBreak: "break-word",
                          }}
                        >
                          {entityName(mod.name)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Popup>
      ) : null}
    </div>
  );
}
