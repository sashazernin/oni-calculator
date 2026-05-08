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
import { TextField } from "../../components/text-field/TextField";
import { getAssetImageUrl } from "../../components/asset-image/AssetImage";
import { Popup, POPUP_Z_INDEX_ABOVE_PAGE_DRAWERS } from "../../components/popup/Popup";
import Tabs from "../../components/tabs/Tabs";
import { useTranslation } from "../../hooks/useTranslation";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { FiPlusCircle } from "react-icons/fi";
import { IoMdWarning } from "react-icons/io";
import { IoChevronBackOutline } from "react-icons/io5";
import { FaTrashAlt } from "react-icons/fa";
import styles from "./rocket.module.css";

type TranslationFn = ReturnType<typeof useTranslation>["t"];
type EntityNameFn = ReturnType<typeof useTranslation>["entityName"];
import { HEX_MAP_CENTER_CELL_INDEX } from "../../helpers/hex-map-geometry";
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
import { Tooltip } from "../../components/tooltip/Tooltip";
import Info from "../../components/info/info";

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
  t: TranslationFn;
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
    t,
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
        {hasOxidizer ? <div style={sectionTitleStyle}>{t("rocket_section_fuel")}</div> : null}
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
            <div style={{ color: textMuted }}>{t("rocket_fuel_tank_insufficient")}</div>
          ) : null}
          {fuelPlan.steps <= 0 ? (
            <div>{t("rocket_fuel_route_hint")}</div>
          ) : (
            <div>
              {t("rocket_fuel_consumption", { kg: Math.ceil(fuelPlan.totalFuelKg) })}
              {fuelPlan.usesIntegratedTank ? t("rocket_fuel_integrated_tank_suffix") : null}
              {fuelPlan.tanksNeeded > 0
                ? t("rocket_fuel_tanks_count", { count: fuelPlan.tanksNeeded })
                : null}
            </div>
          )}
        </div>
      </div>

      {hasOxidizer && oxidizerLines ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
          <div style={sectionTitleStyle}>{t("rocket_section_oxidizer")}</div>
          <div
            role="group"
            aria-label={t("aria_rocket_oxidizer_type")}
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
                      {t("rocket_oxidizer_row_line", {
                        kg: line.totalOxidizerKg.toFixed(1),
                        tanks: line.oxidizerTanksNeeded,
                      })}
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

  const narrowRocketLayout = useMediaQuery("(max-width: 1200px)");
  const [rocketSidebarOpen, setRocketSidebarOpen] = useState(false);

  useEffect(() => {
    if (!narrowRocketLayout) setRocketSidebarOpen(false);
  }, [narrowRocketLayout]);

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

  const rocketRouteOneWayWarning = useMemo(
    () =>
      way != null &&
      way.length >= 2 &&
      way[way.length - 1] !== HEX_MAP_CENTER_CELL_INDEX,
    [way],
  );

  const rocketSidebarInner = (
    <>
      <TextField
        label={t("rocket_name_label")}
        fullWidth
        value={rocket.title}
        onChange={(e) => patchRocket(rocketIndex, { title: e.target.value })}
        onBlur={() => {
          const trimmed = rocket.title.trim();
          if (trimmed.length === 0) {
            patchRocket(rocketIndex, {
              title: t("rocket_default_name", { n: rocketIndex + 1 }),
            });
          }
        }}
        maxLength={120}
      />
      <Button onClick={() => setMapOpen(true)}>{t("settings_tab_space_map")}</Button>
      <div style={{ display: "flex", gap: 8, minWidth: 0 }}>
        <div style={{ fontSize: "0.95rem", color: colors.text.primary }}>
          {t("rocket_moves_label", { count: way ? way.length - 1 : 0 })}
        </div>
        {rocketRouteOneWayWarning ? (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "0px 2px",
              borderRadius: 8,
              backgroundColor:
                "color-mix(in srgb, rgba(255, 180, 72, 0.12) 100%, transparent)",
              border:
                "1px solid color-mix(in srgb, rgba(255, 180, 72, 0.55) 100%, transparent)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: colors.text.primary,
              lineHeight: 1.4
            }}
          >
            <Tooltip placement="bottom" arrow title={t("rocket_route_one_way_warning")}>
              <div>
                <IoMdWarning
                  size={20}
                  style={{ flexShrink: 0, color: "rgba(230, 165, 70, 0.95)" }}
                  aria-hidden
                />
              </div>

            </Tooltip>
          </div>
        ) : null}
      </div>
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
          : t("rocket_select_engine")}
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
            t={t}
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
            {t("rocket_section_speed")}
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
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {t("rocket_flight_cycles")}
              </div>
              {rocketSpeedStats.flightCycles !== null ? (
                <div style={{ fontVariantNumeric: "tabular-nums" }}>
                  {rocketSpeedStats.flightCycles.toFixed(1)}
                </div>
              ) : (
                <div style={{ fontSize: "0.85rem", color: textMuted }}>
                  {t("rocket_speed_route_hint")}
                </div>
              )}
              {rocketSpeedStats.flightCycles !== null ? (
                <div style={{ fontSize: "0.8rem", color: textMuted, marginTop: 6 }}>
                  {t("rocket_speed_cells_per_cycle", {
                    steps,
                    speed: rocketSpeedStats.speed.toFixed(2),
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          minHeight: 0,
          boxSizing: "border-box",
          height: "100%",
          ...(narrowRocketLayout
            ? { padding: 16 }
            : {
              paddingTop: 16,
              paddingBottom: 16,
              paddingLeft: 16,
              paddingRight: 0,
            }),
        }}
      >
        <div
          style={{
            width: narrowRocketLayout ? "100%" : "70%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "relative",
          }}
        >
          <div
            className={styles['rocket-builder-container']}
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
          <div style={{ position: "absolute", top: -4, left: -2 }}>
            <Info message={t("rocket_modules_speed_hint")} />
          </div>
        </div>
        {!narrowRocketLayout ? (
          <>
            <div style={{ width: "1px", height: "100%", background: colors.border.main }} />
            <div
              className={styles["rocket-sidebar-scroll"]}
              style={{
                width: "30%",
                marginLeft: 16,
                minHeight: 0,
                alignSelf: "stretch",
                overflow: "auto",
                overflowX: "hidden",
              }}
            >
              <div
                className={styles["rocket-sidebar-inner"]}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  minWidth: 0,
                }}
              >
                {rocketSidebarInner}
              </div>
            </div>
          </>
        ) : null}
      </div>
      {narrowRocketLayout ? (
        <>
          {!rocketSidebarOpen ? (
            <Button
              type="button"
              variant="translucent"
              aria-label={t("aria_rocket_open_sidebar")}
              onClick={() => setRocketSidebarOpen(true)}
              style={{
                position: "fixed",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1592,
                padding: "14px 10px 14px 12px",
                borderRadius: "12px 0 0 12px",
                boxShadow: colors.shadow.default,
              }}
            >
              <IoChevronBackOutline size={22} aria-hidden />
            </Button>
          ) : null}
          <Popup
            title={t("rocket_sidebar_title")}
            variant="drawer-right"
            open={rocketSidebarOpen}
            onClose={() => setRocketSidebarOpen(false)}
            closeButton
            zIndex={1592}
          >
            <div
              style={{
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                padding: `16px max(16px, env(safe-area-inset-right, 0px)) calc(16px + env(safe-area-inset-bottom, 0px)) 16px`,
              }}
            >
              {rocketSidebarInner}
            </div>
          </Popup>
        </>
      ) : null}
    </>
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
      const created = createStoredRocket(s.rockets.length);
      const nextRockets = [
        ...s.rockets,
        {
          ...created,
          title: t("rocket_default_name", { n: s.rockets.length + 1 }),
        },
      ];
      return { rockets: nextRockets, activeIndex: nextRockets.length - 1 };
    });
  }, [t]);

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
              paddingLeft: 4,
              paddingRight: 4,
              flexShrink: 0,
            }}
          >
            <IconButton style={{ height: 32, width: 32 }} type="button" variant="translucent" onClick={addRocket}>
              <FiPlusCircle size={18} />
            </IconButton>
            <Confirmation
              title={t("rocket_delete_dialog_title", {
                name: rockets[activeIndex]?.title ?? "",
              })}
            >
              <IconButton
                style={{ ...deleteRocketIconStyle, height: 32, width: 32 }}
                type="button"
                variant="translucent"
                colorOverrides={deleteRocketIconOverrides}
                disabled={rockets.length <= 1}
                onClick={removeRocket}
              >
                <FaTrashAlt size={16} />
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
        title={t("rocket_engine_picker_title")}
        variant="fit-content"
        zIndex={POPUP_Z_INDEX_ABOVE_PAGE_DRAWERS}
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
