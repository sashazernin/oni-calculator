import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ContextType,
  type CSSProperties,
  type SetStateAction,
} from "react";
import Box from "../../components/box/box";
import { HexMapPopup, type HexMapObjectItem } from "../../components/hex-map/HexMap";
import { Button } from "../../components/button/Button";
import { getAssetImageUrl } from "../../components/asset-image/AssetImage";
import { Popup } from "../../components/popup/Popup";
import Tabs from "../../components/tabs/Tabs";
import { useTranslation } from "../../hooks/useTranslation";
import { FiPlusCircle } from "react-icons/fi";
import { FaTrashAlt } from "react-icons/fa";

type TranslationFn = ReturnType<typeof useTranslation>["t"];
type EntityNameFn = ReturnType<typeof useTranslation>["entityName"];
import { readStoredStarMapObjects } from "../../helpers/readStoredStarMapObjects";
import {
  createStoredRocket,
  readStoredRockets,
  ROCKETS_STORAGE_KEY,
  type StoredRocketSnapshot,
} from "../../helpers/readStoredRockets";
import { ThemeContext } from "../../providers/app-theme-provider";
import RocketBuilder, {
  buildInferredTankPlacements,
  computeRocketFuelPlan,
  isRocketEngineFeasibleForSteps,
  rocketModuleCellBudget,
  rocketRouteSteps,
  rocketStackModules,
  type PlacedRocketStackModule,
  type RocketFuelPlan,
  type RocketOxidizerVariant,
} from "../../components/rocket-builder/RocketBuilder";
import { rocketEngines, type RocketEngineId } from "../../game-data/rocket";
import { IconButton } from "../../components/icon-button/IconButton";
import Confirmation from "../../components/confirmation/confirmation";

type ThemeColors = ContextType<typeof ThemeContext>["colors"];

type RocketsPageState = {
  rockets: StoredRocketSnapshot[];
  activeIndex: number;
};

const allEngineIds = Object.keys(rocketEngines) as RocketEngineId[];

const DANGER = "rgb(211, 64, 64)";

const deleteRocketIconOverrides = {
  main: "transparent",
  contrastText: DANGER,
  hover: `color-mix(in srgb, ${DANGER} 16%, transparent)`,
  active: `color-mix(in srgb, ${DANGER} 24%, transparent)`,
  ripple: `color-mix(in srgb, ${DANGER} 40%, transparent)`,
};

const deleteRocketIconStyle = {
  "--icon-focus": `color-mix(in srgb, ${DANGER} 48%, transparent)`,
} as CSSProperties;

function gameDataLabel(name: string, entityName: EntityNameFn): string {
  return name.startsWith("gd_") ? entityName(name) : name;
}

function FuelAndOxidizerRows(props: {
  engineId: RocketEngineId;
  fuelPlan: RocketFuelPlan;
  steps: number;
  selectedEngineFeasible: boolean;
  colors: ThemeColors;
  textMuted: string;
  entityName: EntityNameFn;
  selectedOxidizerVariant: RocketOxidizerVariant;
  onSelectOxidizer: (variant: RocketOxidizerVariant) => void;
}) {
  const {
    engineId,
    fuelPlan,
    steps,
    selectedEngineFeasible,
    colors,
    textMuted,
    entityName,
    selectedOxidizerVariant,
    onSelectOxidizer,
  } = props;
  const engine = rocketEngines[engineId];
  const oxidizerLines = fuelPlan.oxidizerLines;
  const hasOxidizer = Boolean(oxidizerLines?.length);
  const sectionTitleStyle = {
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: textMuted,
  } as const;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        {hasOxidizer ? <div style={sectionTitleStyle}>Топливо</div> : null}
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px solid ${colors.border.main}`,
            background: colors.background.default,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={getAssetImageUrl(engine.fuel.image)}
              alt=""
              style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0 }}
            />
            <span style={{ fontWeight: 600 }}>
              {gameDataLabel(engine.fuel.name, entityName)}
            </span>
          </div>
          {steps > 0 && !selectedEngineFeasible ? (
            <div style={{ color: textMuted }}>
              На текущий маршрут встроенного бака этого двигателя не хватает — выберите другой
              двигатель или укоротите путь.
            </div>
          ) : null}
          {fuelPlan.steps <= 0 ? (
            <div>Укажите маршрут из минимум двух клеток — тогда появится расчёт баков.</div>
          ) : (
            <div>
              Расход за полёт: {Math.ceil(fuelPlan.totalFuelKg)} кг
              {fuelPlan.usesIntegratedTank ? <> · встроенный бак</> : null}
              {fuelPlan.tanksNeeded > 0 ? <> · баков: {fuelPlan.tanksNeeded}</> : null}
            </div>
          )}
        </div>
      </div>

      {hasOxidizer && oxidizerLines ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
          <div style={sectionTitleStyle}>Окислитель</div>
          <div
            role="group"
            aria-label="Тип окислителя"
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {oxidizerLines.map((line) => {
              const selected = line.variant === selectedOxidizerVariant;
              return (
                <button
                  type="button"
                  key={line.variant}
                  aria-pressed={selected}
                  onClick={() => onSelectOxidizer(line.variant)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `2px solid ${selected ? colors.primary.main : colors.border.main
                      }`,
                    background: selected
                      ? `color-mix(in srgb, ${colors.primary.main} 16%, ${colors.background.default})`
                      : colors.background.default,
                    color: colors.text.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    boxSizing: "border-box",
                    margin: 0,
                    font: "inherit",
                    outline: "none",
                  }}
                >
                  <img
                    src={getAssetImageUrl(line.image)}
                    alt=""
                    style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0 }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                    <span style={{ fontWeight: 600 }}>{entityName(line.translationKey)}</span>
                    <span>
                      {line.totalOxidizerKg.toFixed(1)} кг · баков: {line.oxidizerTanksNeeded}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}

type RocketTabPanelProps = {
  rocket: StoredRocketSnapshot;
  rocketIndex: number;
  colors: ThemeColors;
  textMuted: string;
  entityName: EntityNameFn;
  t: TranslationFn;
  objects: HexMapObjectItem[];
  patchRocket: (index: number, partial: Partial<StoredRocketSnapshot>) => void;
  updateRocketStack: (
    index: number,
    updater: SetStateAction<PlacedRocketStackModule[]>,
  ) => void;
  onOpenEnginePicker: (rocketIndex: number) => void;
};

function RocketTabPanel(props: RocketTabPanelProps) {
  const {
    rocket,
    rocketIndex,
    colors,
    textMuted,
    entityName,
    t,
    objects,
    patchRocket,
    updateRocketStack,
    onOpenEnginePicker,
  } = props;

  const [mapOpen, setMapOpen] = useState(false);

  const way = rocket.way;
  const engineId = rocket.engineId;
  const selectedOxidizerVariant = rocket.selectedOxidizerVariant;
  const stackModules = rocket.stackModules;

  const setWay = useCallback(
    (next: number[] | null) => {
      patchRocket(rocketIndex, { way: next });
    },
    [patchRocket, rocketIndex],
  );

  const setStackModules = useCallback(
    (updater: SetStateAction<PlacedRocketStackModule[]>) => {
      updateRocketStack(rocketIndex, updater);
    },
    [updateRocketStack, rocketIndex],
  );

  const setSelectedOxidizerVariant = useCallback(
    (variant: RocketOxidizerVariant) => {
      patchRocket(rocketIndex, { selectedOxidizerVariant: variant });
    },
    [patchRocket, rocketIndex],
  );

  const steps = useMemo(() => rocketRouteSteps(way), [way]);

  const fuelPlan = useMemo(() => {
    if (!engineId) return null;
    return computeRocketFuelPlan(rocketEngines[engineId], steps);
  }, [engineId, steps]);

  const inferredTankPlacements = useMemo((): PlacedRocketStackModule[] => {
    if (!engineId || !fuelPlan) return [];
    const eng = rocketEngines[engineId];
    const budget = rocketModuleCellBudget(eng);
    return buildInferredTankPlacements(
      eng,
      budget,
      stackModules,
      fuelPlan,
      selectedOxidizerVariant,
    );
  }, [engineId, fuelPlan, stackModules, selectedOxidizerVariant]);

  const selectedEngineFeasible =
    engineId !== null && isRocketEngineFeasibleForSteps(rocketEngines[engineId], steps);

  const rocketSpeedStats = useMemo(() => {
    if (!engineId) return null;
    const engine = rocketEngines[engineId];
    let totalLoad = engine.load ?? 0;
    for (const p of stackModules) {
      const mod = rocketStackModules[p.moduleKey];
      if (mod) totalLoad += mod.load ?? 0;
    }
    for (const p of inferredTankPlacements) {
      const mod = rocketStackModules[p.moduleKey];
      if (mod) totalLoad += mod.load ?? 0;
    }
    if (totalLoad <= 0) return null;
    const speed = engine.power / totalLoad;
    const flightCycles =
      steps > 0 && speed > 0 ? steps / speed : null;
    return {
      speed,
      power: engine.power,
      totalLoad,
      flightCycles,
    };
  }, [engineId, stackModules, inferredTankPlacements, steps]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        minHeight: 0,
        boxSizing: "border-box",
        height: "100%",
        padding: 16,
      }}
    >
      <div
        style={{ width: "70%", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            position: "relative",
            overflow: "auto",
          }}
        >
          <div style={{ position: "absolute" }}>
            <RocketBuilder
              engineId={engineId}
              placements={stackModules}
              onPlacementsChange={setStackModules}
              inferredTankPlacements={inferredTankPlacements}
            />
          </div>
        </div>
      </div>
      <div style={{ width: "1px", height: "100%", background: colors.border.main }} />
      <div style={{ width: "30%", marginLeft: 16, position: "relative", overflow: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "absolute", top: 0, left: 0, right: 0 }}>
          <Button onClick={() => setMapOpen(true)}>{t("settings_tab_space_map")}</Button>
          Перемещений: {way ? way.length - 1 : 0}
          <HexMapPopup
            open={mapOpen}
            onClose={() => setMapOpen(false)}
            mapProps={{
              objects,
              rocketWay: way,
              onWayChange: setWay,
              minHeightPx: 280,
              mode: "select",
            }}
          />
          <Button
            disabled={!way}
            onClick={() => onOpenEnginePicker(rocketIndex)}
            style={{ width: "100%" }}
          >
            {engineId !== null
              ? entityName(rocketEngines[engineId].name)
              : "Выберите двигатель"}
          </Button>
          {engineId && fuelPlan ? (
            <div
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.45,
                color: colors.text.primary,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <FuelAndOxidizerRows
                engineId={engineId}
                fuelPlan={fuelPlan}
                steps={steps}
                selectedEngineFeasible={selectedEngineFeasible}
                colors={colors}
                textMuted={textMuted}
                entityName={entityName}
                selectedOxidizerVariant={selectedOxidizerVariant}
                onSelectOxidizer={setSelectedOxidizerVariant}
              />
            </div>
          ) : null}
          {engineId !== null && rocketSpeedStats ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: textMuted,
                }}
              >
                Скорость
              </div>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1px solid ${colors.border.main}`,
                  background: colors.background.default,
                  fontSize: "0.95rem",
                  lineHeight: 1.45,
                  color: colors.text.primary,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Циклов полёта</div>
                  {rocketSpeedStats.flightCycles !== null ? (
                    <div style={{ fontVariantNumeric: "tabular-nums" }}>
                      {rocketSpeedStats.flightCycles.toFixed(1)}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.85rem", color: textMuted }}>
                      Задайте маршрут из двух и более клеток
                    </div>
                  )}
                  {rocketSpeedStats.flightCycles !== null ? (
                    <div style={{ fontSize: "0.8rem", color: textMuted, marginTop: 6 }}>
                      {steps} клеток / {rocketSpeedStats.speed.toFixed(2)} за цикл
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function Rocket() {
  const { colors } = useContext(ThemeContext);
  const { t, entityName } = useTranslation();
  const [objects] = useState<HexMapObjectItem[]>(readStoredStarMapObjects);
  const [page, setPage] = useState<RocketsPageState>(readStoredRockets);
  const [enginePickerFor, setEnginePickerFor] = useState<number | null>(null);

  const { rockets, activeIndex } = page;

  const patchRocket = useCallback((index: number, partial: Partial<StoredRocketSnapshot>) => {
    setPage((s) => ({
      ...s,
      rockets: s.rockets.map((r, i) => (i === index ? { ...r, ...partial } : r)),
    }));
  }, []);

  const updateRocketStack = useCallback(
    (index: number, updater: SetStateAction<PlacedRocketStackModule[]>) => {
      setPage((s) => {
        const r = s.rockets[index];
        if (!r) return s;
        const prev = r.stackModules;
        const next =
          typeof updater === "function"
            ? (updater as (p: PlacedRocketStackModule[]) => PlacedRocketStackModule[])(prev)
            : updater;
        return {
          ...s,
          rockets: s.rockets.map((x, i) =>
            i === index ? { ...x, stackModules: next } : x,
          ),
        };
      });
    },
    [],
  );

  const lastEngineByRocketRef = useRef(new Map<string, RocketEngineId | null>());

  useEffect(() => {
    const r = rockets[activeIndex];
    if (!r) return;
    const prevE = lastEngineByRocketRef.current.get(r.id);
    lastEngineByRocketRef.current.set(r.id, r.engineId);
    if (prevE !== undefined && prevE !== r.engineId) {
      patchRocket(activeIndex, { selectedOxidizerVariant: "oxylite" });
    }
  }, [activeIndex, rockets, patchRocket]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ROCKETS_STORAGE_KEY,
        JSON.stringify({ rockets, activeIndex }),
      );
    } catch {
      /* quota / private mode */
    }
  }, [rockets, activeIndex]);

  const addRocket = useCallback(() => {
    setPage((s) => {
      const nextRockets = [...s.rockets, createStoredRocket(s.rockets.length)];
      return { rockets: nextRockets, activeIndex: nextRockets.length - 1 };
    });
  }, []);

  const removeRocket = useCallback(() => {
    setPage((s) => {
      if (s.rockets.length <= 1) return s;
      const nextRockets = s.rockets.filter((_, i) => i !== s.activeIndex);
      let ai = s.activeIndex;
      if (ai >= nextRockets.length) ai = nextRockets.length - 1;
      return { rockets: nextRockets, activeIndex: ai };
    });
  }, []);

  const pickerRocketIndex =
    enginePickerFor !== null ? enginePickerFor : activeIndex;
  const pickerWay = rockets[pickerRocketIndex]?.way ?? null;
  const pickerSteps = useMemo(() => rocketRouteSteps(pickerWay), [pickerWay]);

  const selectEngine = useCallback(
    (id: RocketEngineId) => {
      if (enginePickerFor === null) return;
      patchRocket(enginePickerFor, { engineId: id });
      setEnginePickerFor(null);
    },
    [enginePickerFor, patchRocket],
  );

  const textMuted = `color-mix(in srgb, ${colors.text.primary} 68%, transparent)`;

  const tabsConfig = useMemo(
    () => rockets.map((r) => ({ label: r.title })),
    [rockets],
  );

  return (
    <Box
      style={{
        height: "100%",
        padding: 0,
        overflow: "hidden",
      }}
    >
      <Tabs
        value={activeIndex}
        onChange={(i) => setPage((s) => ({ ...s, activeIndex: i }))}
        tabs={tabsConfig}
        header={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginLeft: "auto",
              paddingLeft: 12,
              paddingRight: 8,
              flexShrink: 0,
            }}
          >
            <IconButton style={{ height: 32, width: 32 }} type="button" variant="translucent" onClick={addRocket}>
              <FiPlusCircle size={20} />
            </IconButton>
            <Confirmation title={`Удаление ${rockets[activeIndex]?.title}`}>
              <IconButton
                style={{ ...deleteRocketIconStyle, height: 32, width: 32 }}
                type="button"
                variant="translucent"
                colorOverrides={deleteRocketIconOverrides}
                disabled={rockets.length <= 1}
                onClick={removeRocket}
              >
                <FaTrashAlt size={20} />
              </IconButton>
            </Confirmation>
          </div>
        }
      >
        {rockets.map((rocket, rocketIndex) => (
          <RocketTabPanel
            key={rocket.id}
            rocket={rocket}
            rocketIndex={rocketIndex}
            colors={colors}
            textMuted={textMuted}
            entityName={entityName}
            t={t}
            objects={objects}
            patchRocket={patchRocket}
            updateRocketStack={updateRocketStack}
            onOpenEnginePicker={setEnginePickerFor}
          />
        ))}
      </Tabs>

      <Popup
        open={enginePickerFor !== null}
        title="Двигатель"
        variant="fit-content"
        onClose={() => setEnginePickerFor(null)}
        closeButton
      >
        <div
          style={{
            padding: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))",
            gap: 10,
            maxHeight: "min(480px, 70vh)",
            overflowY: "auto",
            minWidth: "min(100vw - 2rem, 400px)",
            boxSizing: "border-box",
          }}
        >
          {allEngineIds.map((id) => {
            const eng = rocketEngines[id];
            const ok = isRocketEngineFeasibleForSteps(eng, pickerSteps);

            return (
              <button
                type="button"
                key={id}
                disabled={!ok}
                onClick={() => ok && selectEngine(id)}
                style={{
                  aspectRatio: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  padding: 8,
                  gap: 6,
                  borderRadius: 8,
                  border: `1px solid ${colors.border.main}`,
                  background: colors.background.default,
                  color: colors.text.primary,
                  cursor: ok ? "pointer" : "not-allowed",
                  opacity: ok ? 1 : 0.45,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    flex: "1 1 0",
                    minHeight: 0,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={getAssetImageUrl(eng.image)}
                    alt=""
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    lineHeight: 1.2,
                    textAlign: "center",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                  }}
                >
                  {entityName(eng.name)}
                </span>
              </button>
            );
          })}
        </div>
      </Popup>
    </Box>
  );
}
