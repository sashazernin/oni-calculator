import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import Box from "../../components/box/box";
import { getAssetImageUrl } from "../../components/asset-image/AssetImage";
import { TextField } from "../../components/text-field/TextField";
import Tabs from "../../components/tabs/Tabs";
import { Button } from "../../components/button/Button";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useAppSettings } from "../../providers/app-settings-provider";
import {
  CLASSIC_TARGET_DISTANCES_KM,
  classicMaxFuelKgForGraph,
  classicRequiredExceedsFuelTankCapacity,
  classicModulePatchAffectsTankSync,
  classicModulesWithNormalizedCargoKinds,
  classicModulesWithSyncedTanksForTarget,
  classicRequiredMassForTargetKm,
  classicRocketEngines,
  computeClassicFlightStats,
  sampleClassicDistanceCurve,
  type ClassicEngineId,
  type ClassicFlightSnapshot,
  type ClassicOxidizerId,
  type ClassicRocketModules,
  type ClassicTargetDistanceKm,
} from "../../helpers/classicRocketFlight";
import {
  normalizeCargoBayKinds,
  type ClassicCargoBayKind,
} from "../../helpers/classicCargoBayKinds";
import {
  normalizeResearchSightseeingKinds,
  type ClassicResearchSightseeingKind,
} from "../../helpers/classicResearchSightseeingKinds";
import { Select } from "../../components/select/Select";
import {
  createStoredRocket,
  ensureClassicFlight,
  type StoredRocketSnapshot,
} from "../../helpers/readStoredRockets";
import {
  CLASSIC_MAX_LIQUID_FUEL_TANKS,
  CLASSIC_MAX_OXIDIZER_TANKS,
  classicRocketEngineData,
  rocketCargos,
  rocketHeads,
  rocketModules,
  rocketTanks,
} from "../../game-data/rocket";
import { liquids } from "../../game-data/liquids";
import { resourses } from "../../game-data/resourses";
import RocketBuilder from "../../components/rocket-builder/RocketBuilder";
import { buildClassicRocketPlacements } from "../../helpers/classicRocketPlacements";
import { IconButton } from "../../components/icon-button/IconButton";
import Confirmation from "../../components/confirmation/confirmation";
import { Popup } from "../../components/popup/Popup";
import { FiPlusCircle } from "react-icons/fi";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { FaTrashAlt } from "react-icons/fa";
import { IoChevronBackOutline } from "react-icons/io5";
import styles from "./classic-rocket.module.css";
import rocketLayout from "./rocket.module.css";

const ENGINE_IDS = Object.keys(classicRocketEngines) as ClassicEngineId[];
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

type RocketsPageState = {
  rockets: StoredRocketSnapshot[];
  activeIndex: number;
};

function clampCount(raw: string, max = 99): number {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(max, n));
}

const CLASSIC_CARGO_BAY_PREVIEW_IMAGES: readonly string[] = [
  rocketCargos.classicCargoBay.image,
  "rocket/cargos/Classic_Biological_Cargo_Bay.webp",
  rocketCargos.largeGasCargoCanister.image,
  rocketCargos.largeLiquidCargoTank.image,
];

const CLASSIC_RS_PREVIEW_IMAGES: readonly string[] = [
  rocketModules.classicResearchModule.image,
  rocketModules.classicSightseeingModule.image,
];

type ModuleCounterButtonProps = {
  ariaLabel: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function ModuleCounterButton({ ariaLabel, disabled, onClick, children }: ModuleCounterButtonProps) {
  const { colors } = useContext(ThemeContext);
  const isDark = colors.mode === "dark";
  const style = {
    "--module-counter-fg": isDark ? "#ffffff" : "#6a6a6a",
    "--module-counter-hover": isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.07)",
    "--module-counter-active": isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.12)",
    "--module-counter-focus": isDark ? "rgba(255, 255, 255, 0.48)" : "rgba(0, 0, 0, 0.32)",
  } as CSSProperties;

  return (
    <button
      type="button"
      className={styles.moduleCounterBtn}
      style={style}
      aria-label={ariaLabel}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

type SidebarModuleCounterProps = {
  label: string;
  image: string;
  /** Сетка 2×2 из спрайтов (вместо одного `image`). */
  previewImages?: readonly string[];
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
};

function SidebarModuleCounter({
  label,
  image,
  previewImages,
  value,
  onChange,
  min = 0,
  max = 99,
}: SidebarModuleCounterProps) {
  const { colors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    onChange(Math.max(min, Math.min(max, clampCount(draft, max))));
    setEditing(false);
  };

  const locked = min === max;
  const countFieldStyle = {
    color: colors.text.primary,
    background: colors.background.average,
    borderColor: colors.border.main,
  };

  return (
    <div
      className={styles.sidebarModuleCard}
      style={{
        borderColor: colors.border.main,
        background: colors.background.paper,
      }}
    >
      <div className={styles.sidebarModuleLabel} style={{ color: colors.primary.main }}>
        {label}
      </div>
      <div
        className={
          previewImages?.length === 2
            ? styles.sidebarModuleImagePair
            : previewImages?.length
              ? styles.sidebarModuleImageGrid
              : styles.sidebarModuleImageWrap
        }
      >
        {previewImages?.length ? (
          previewImages.map((src) => (
            <img
              key={src}
              src={getAssetImageUrl(src)}
              alt=""
              className={
                previewImages.length === 2
                  ? styles.sidebarModuleImgPairCell
                  : styles.sidebarModuleImgGridCell
              }
            />
          ))
        ) : (
          <img src={getAssetImageUrl(image)} alt="" className={styles.sidebarModuleImg} />
        )}
      </div>
      <div className={styles.moduleCounterRow}>
        {locked ? (
          <span className={styles.sidebarModuleCounterSpacer} aria-hidden />
        ) : (
          <ModuleCounterButton
            ariaLabel={t("aria_decrease_count")}
            disabled={value <= min}
            onClick={() => {
              setEditing(false);
              if (value > min) onChange(value - 1);
            }}
          >
            <AiOutlineMinusCircle size={20} />
          </ModuleCounterButton>
        )}
        {locked ? (
          <div
            className={styles.sidebarModuleCountLocked}
            style={countFieldStyle}
            aria-label={t("aria_edit_count")}
          >
            {value}
          </div>
        ) : (
          <input
            type="text"
            inputMode="numeric"
            className={styles.sidebarModuleInput}
            aria-label={t("aria_edit_count")}
            value={editing ? draft : String(value)}
            onFocus={(e) => {
              setEditing(true);
              setDraft(String(value));
              e.target.select();
            }}
            onBlur={commit}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 2))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            style={countFieldStyle}
          />
        )}
        {locked ? (
          <span className={styles.sidebarModuleCounterSpacer} aria-hidden />
        ) : (
          <ModuleCounterButton
            ariaLabel={t("aria_increase_count")}
            disabled={value >= max}
            onClick={() => {
              setEditing(false);
              if (value < max) onChange(value + 1);
            }}
          >
            <FiPlusCircle size={20} />
          </ModuleCounterButton>
        )}
      </div>
    </div>
  );
}


type ChartPoint = { fuelKg: number; distanceKm: number };

function interpolateClassicChartPoint(points: ChartPoint[], fuelKg: number): ChartPoint {
  if (points.length === 0) return { fuelKg: 0, distanceKm: 0 };
  if (points.length === 1) return points[0];
  if (fuelKg <= points[0].fuelKg) return points[0];
  const last = points[points.length - 1];
  if (fuelKg >= last.fuelKg) return last;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (fuelKg >= a.fuelKg && fuelKg <= b.fuelKg) {
      const span = b.fuelKg - a.fuelKg;
      const t = span > 0 ? (fuelKg - a.fuelKg) / span : 0;
      return {
        fuelKg,
        distanceKm: a.distanceKm + t * (b.distanceKm - a.distanceKm),
      };
    }
  }
  return last;
}

function ClassicDistanceChart(props: {
  points: ChartPoint[];
  currentFuelKg: number;
  currentDistanceKm: number;
  targetDistanceKm?: number;
}) {
  const { colors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const { points, currentFuelKg, currentDistanceKm, targetDistanceKm } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<ChartPoint | null>(null);

  const width = 640;
  const height = 320;
  const pad = { l: 56, r: 16, t: 20, b: 44 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;

  const maxFuel = Math.max(1, ...points.map((p) => p.fuelKg));
  const maxDist = Math.max(
    1000,
    targetDistanceKm ?? 0,
    ...points.map((p) => p.distanceKm)
  );

  const x = (fuel: number) => pad.l + (fuel / maxFuel) * innerW;
  const y = (dist: number) => pad.t + innerH - (dist / maxDist) * innerH;

  const poly = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.fuelKg).toFixed(1)} ${y(p.distanceKm).toFixed(1)}`)
    .join(" ");

  const yTicks = 5;
  const xTicks = 5;

  const clearHover = useCallback(() => setHover(null), []);

  const updateHoverFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg || points.length < 2) {
        setHover(null);
        return;
      }
      const rect = svg.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const svgX = ((clientX - rect.left) / rect.width) * width;
      const svgY = ((clientY - rect.top) / rect.height) * height;
      if (
        svgX < pad.l ||
        svgX > pad.l + innerW ||
        svgY < pad.t ||
        svgY > pad.t + innerH
      ) {
        setHover(null);
        return;
      }
      const fuelKg = ((svgX - pad.l) / innerW) * maxFuel;
      setHover(interpolateClassicChartPoint(points, fuelKg));
    },
    [innerH, innerW, maxFuel, points, pad.l, pad.t]
  );

  const onPlotPointerMove = useCallback(
    (e: ReactPointerEvent<SVGRectElement>) => {
      updateHoverFromClient(e.clientX, e.clientY);
    },
    [updateHoverFromClient]
  );

  const hoverDot =
    hover != null
      ? { cx: x(hover.fuelKg), cy: y(hover.distanceKm) }
      : null;

  const tooltipStyle: CSSProperties | undefined =
    hover != null && hoverDot != null
      ? {
          left: `${(hoverDot.cx / width) * 100}%`,
          top: `${(hoverDot.cy / height) * 100}%`,
          background: colors.background.paper,
          border: `1px solid ${colors.border.main}`,
          color: colors.text.primary,
        }
      : undefined;

  const tooltipArrowColor = colors.background.paper;

  return (
    <div className={styles.chartWrap} onMouseLeave={clearHover}>
      <div className={styles.chartTitle}>{t("classic_rocket_chart_title")}</div>
      {hover != null && tooltipStyle ? (
        <div
          className={styles.chartTooltip}
          style={{
            ...tooltipStyle,
            // triangle fill matches tooltip background
            ["--chart-tooltip-arrow" as string]: tooltipArrowColor,
          }}
        >
          <div className={styles.chartTooltipFuel}>
            {Math.round(hover.fuelKg).toLocaleString()}
          </div>
          <div className={styles.chartTooltipDistance}>
            {t("classic_rocket_chart_tooltip_distance")}:{" "}
            {Math.round(hover.distanceKm).toLocaleString()}
          </div>
        </div>
      ) : null}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className={styles.chartSvg}
        role="img"
        aria-label={t("classic_rocket_chart_title")}
      >
        <rect
          x={pad.l}
          y={pad.t}
          width={innerW}
          height={innerH}
          fill={`color-mix(in srgb, ${colors.primary.main} 8%, ${colors.background.paper})`}
          rx={4}
        />
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const dist = (maxDist / yTicks) * i;
          const yy = y(dist);
          return (
            <g key={i}>
              <line
                x1={pad.l}
                x2={pad.l + innerW}
                y1={yy}
                y2={yy}
                stroke={colors.border.main}
                strokeWidth={1}
                opacity={0.55}
              />
              <text
                x={pad.l - 8}
                y={yy + 4}
                textAnchor="end"
                fontSize={11}
                fill={colors.text.primary}
                opacity={0.75}
              >
                {Math.round(dist).toLocaleString()}
              </text>
            </g>
          );
        })}
        {Array.from({ length: xTicks + 1 }, (_, i) => {
          const fuel = (maxFuel / xTicks) * i;
          const xx = x(fuel);
          return (
            <text
              key={i}
              x={xx}
              y={height - 12}
              textAnchor="middle"
              fontSize={11}
              fill={colors.text.primary}
              opacity={0.75}
            >
              {Math.round(fuel)}
            </text>
          );
        })}
        {targetDistanceKm != null && targetDistanceKm > 0 ? (
          <line
            x1={pad.l}
            x2={pad.l + innerW}
            y1={y(targetDistanceKm)}
            y2={y(targetDistanceKm)}
            stroke={colors.text.primary}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            opacity={0.65}
          />
        ) : null}
        <path d={poly} fill="none" stroke={colors.primary.main} strokeWidth={2.5} />
        <rect
          x={pad.l}
          y={pad.t}
          width={innerW}
          height={innerH}
          fill="transparent"
          className={styles.chartPlotHit}
          onPointerMove={onPlotPointerMove}
          onPointerLeave={clearHover}
        />
        {hoverDot ? (
          <circle
            cx={hoverDot.cx}
            cy={hoverDot.cy}
            r={5}
            fill={colors.primary.main}
            stroke={colors.background.paper}
            strokeWidth={2}
            pointerEvents="none"
          />
        ) : null}
        {currentFuelKg > 0 ? (
          <circle
            cx={x(currentFuelKg)}
            cy={y(currentDistanceKm)}
            r={5}
            fill={colors.primary.main}
            stroke={colors.background.paper}
            strokeWidth={2}
          />
        ) : null}
        <text
          x={pad.l + innerW / 2}
          y={height - 2}
          textAnchor="middle"
          fontSize={12}
          fill={colors.text.primary}
          opacity={0.85}
        >
          {t("classic_rocket_chart_axis_fuel")}
        </text>
      </svg>
    </div>
  );
}

type ClassicRocketTabPanelProps = {
  rocket: StoredRocketSnapshot;
  rocketIndex: number;
  patchClassic: (index: number, patch: Partial<ClassicFlightSnapshot>) => void;
  patchTitle: (index: number, title: string) => void;
};

function ClassicRocketTabPanel({
  rocket,
  rocketIndex,
  patchClassic,
  patchTitle,
}: ClassicRocketTabPanelProps) {
  const { colors } = useContext(ThemeContext);
  const { t, entityName } = useTranslation();
  const narrow = useMediaQuery("(max-width: 1200px)");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mainView, setMainView] = useState<"rocket" | "chart">("rocket");

  useEffect(() => {
    if (!narrow) setSidebarOpen(false);
  }, [narrow]);

  const flight = ensureClassicFlight(rocket);
  const { engineId, oxidizer, modules, targetDistanceKm } = flight;
  const engine = classicRocketEngines[engineId];

  const patchModules = useCallback(
    (patch: Partial<ClassicRocketModules>) => {
      const next = classicModulesWithNormalizedCargoKinds({
        ...modules,
        ...patch,
        commandCapsules: 1,
      });
      const tanksOnly = Object.keys(patch).every(
        (k) => k === "fuelTanks" || k === "oxidizerTanks",
      );
      const modulesOut = tanksOnly
        ? next
        : classicModulesWithSyncedTanksForTarget(
            engineId,
            oxidizer,
            next,
            targetDistanceKm,
          );
      patchClassic(rocketIndex, {
        modules: classicModulesWithNormalizedCargoKinds(modulesOut),
      });
    },
    [engineId, modules, oxidizer, patchClassic, rocketIndex, targetDistanceKm],
  );

  const onClassicCargoBayKindChange = useCallback(
    (slotIndex: number, kind: ClassicCargoBayKind) => {
      const kinds = normalizeCargoBayKinds(modules.cargoBays, modules.cargoBayKinds);
      if (slotIndex < 0 || slotIndex >= kinds.length) return;
      kinds[slotIndex] = kind;
      patchModules({ cargoBayKinds: kinds });
    },
    [modules.cargoBays, modules.cargoBayKinds, patchModules],
  );

  const onClassicResearchSightseeingKindChange = useCallback(
    (slotIndex: number, kind: ClassicResearchSightseeingKind) => {
      const kinds = normalizeResearchSightseeingKinds(
        modules.researchSightseeing,
        modules.researchSightseeingKinds,
      );
      if (slotIndex < 0 || slotIndex >= kinds.length) return;
      kinds[slotIndex] = kind;
      patchModules({ researchSightseeingKinds: kinds });
    },
    [
      modules.researchSightseeing,
      modules.researchSightseeingKinds,
      patchModules,
    ],
  );

  const rocketVisual = useMemo(
    () => buildClassicRocketPlacements(engineId, oxidizer, modules),
    [engineId, oxidizer, modules]
  );

  const maxFuel = classicMaxFuelKgForGraph(engineId, modules.fuelTanks);
  const curve = useMemo(
    () => sampleClassicDistanceCurve(engineId, oxidizer, modules, maxFuel, maxFuel > 200 ? 8 : 2),
    [engineId, oxidizer, modules, maxFuel]
  );

  const fmt = (n: number) => Math.round(n).toLocaleString();

  const formatTargetKm = (km: number) =>
    `${km.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`;

  const requiredMassForTarget = useMemo(
    () => classicRequiredMassForTargetKm(engineId, oxidizer, modules, targetDistanceKm),
    [engineId, oxidizer, modules, targetDistanceKm]
  );

  const stats = useMemo(() => {
    if (requiredMassForTarget !== null) {
      return computeClassicFlightStats(
        engineId,
        oxidizer,
        modules,
        requiredMassForTarget.fuelKg,
      );
    }
    return computeClassicFlightStats(engineId, oxidizer, modules);
  }, [engineId, oxidizer, modules, requiredMassForTarget]);

  const requiredExceedsTankCapacity = useMemo(
    () =>
      requiredMassForTarget !== null &&
      classicRequiredExceedsFuelTankCapacity(engineId, modules, requiredMassForTarget),
    [engineId, modules, requiredMassForTarget]
  );

  const rocketEngineData = useMemo(() => classicRocketEngineData(engineId), [engineId]);
  const oxidizerResourceImage =
    oxidizer === "liquidOxygen" ? liquids.liquidOxygen.image : resourses.oxylite.image;

  const mainPaneHeader = (
    <div className={styles.mainPaneHeader}>
      <div className={styles.viewToggle} role="tablist" aria-label={t("classic_rocket_main_view_label")}>
        {(["rocket", "chart"] as const).map((id) => {
          const active = mainView === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              className={styles.viewToggleBtn}
              onClick={() => setMainView(id)}
              style={{
                borderColor: active ? colors.primary.main : colors.border.main,
                background: active
                  ? `color-mix(in srgb, ${colors.primary.main} 16%, ${colors.background.paper})`
                  : colors.background.average,
                color: colors.text.primary,
              }}
            >
              {t(id === "rocket" ? "classic_rocket_tab_builder" : "classic_rocket_tab_chart")}
            </button>
          );
        })}
      </div>
      <div className={styles.mainPaneHeaderTarget}>
        <div className={styles.targetRequiredMassRow}>
          {requiredMassForTarget === null ? (
            <span
              className={styles.targetRequiredMassUnreachable}
              style={{ color: colors.text.primary }}
            >
              {t("classic_rocket_target_unreachable")}
            </span>
          ) : requiredExceedsTankCapacity ? (
            <span
              className={styles.targetRequiredMassUnreachable}
              style={{ color: colors.text.primary }}
            >
              {t("classic_rocket_target_impossible")}
            </span>
          ) : (
            <>
              <div
                className={styles.targetRequiredMassChip}
                style={{
                  borderColor: colors.border.main,
                  background: colors.background.average,
                  color: colors.text.primary,
                }}
                title={entityName(rocketEngineData.fuel.name)}
              >
                <img
                  src={getAssetImageUrl(rocketEngineData.fuel.image)}
                  alt=""
                  className={styles.targetRequiredMassImg}
                />
                <span className={styles.targetRequiredMassValue}>
                  {fmt(requiredMassForTarget.fuelKg)}
                </span>
              </div>
              {engine.needsOxidizer ? (
                <div
                  className={styles.targetRequiredMassChip}
                  style={{
                    borderColor: colors.border.main,
                    background: colors.background.average,
                    color: colors.text.primary,
                  }}
                  title={
                    oxidizer === "liquidOxygen"
                      ? t("classic_rocket_liquid_oxygen")
                      : t("classic_rocket_oxylite")
                  }
                >
                  <img
                    src={getAssetImageUrl(oxidizerResourceImage)}
                    alt=""
                    className={styles.targetRequiredMassImg}
                  />
                  <span className={styles.targetRequiredMassValue}>
                    {fmt(requiredMassForTarget.oxidizerKg)}
                  </span>
                </div>
              ) : null}
            </>
          )}
        </div>
        <Select<ClassicTargetDistanceKm>
          label={t("classic_rocket_target_distance")}
          fullWidth
          hideLabelMargin
          disableSearch
          items={CLASSIC_TARGET_DISTANCES_KM}
          value={targetDistanceKm}
          getId={(km) => km}
          getLabel={formatTargetKm}
          fieldBackground={colors.background.paper}
          onChange={(km) => patchClassic(rocketIndex, { targetDistanceKm: km })}
        />
      </div>
    </div>
  );

  const mainContent =
    mainView === "rocket" ? (
      <div
        className={`${rocketLayout["rocket-builder-container"]} ${styles.classicRocketBuilder}`}
      >
        <RocketBuilder
          engineId={rocketVisual.engineId}
          placements={rocketVisual.placements}
          onPlacementsChange={() => { }}
          readOnly
          classicCargoBayKinds={modules.cargoBayKinds}
          onClassicCargoBayKindChange={onClassicCargoBayKindChange}
          classicResearchSightseeingKinds={modules.researchSightseeingKinds}
          onClassicResearchSightseeingKindChange={
            onClassicResearchSightseeingKindChange
          }
        />
      </div>
    ) : (
      <div className={styles.chartPanel}>
        <div className={styles.statsBlock}>
          <div className={styles.statsTitle}>{t("classic_rocket_stats_title")}</div>
          <ul className={styles.statsList} style={{ color: colors.text.primary }}>
            <li>
              <span>{t("classic_rocket_stat_dry_mass")}</span>
              <strong>{fmt(stats.dryMassKg)}</strong>
            </li>
            <li>
              <span>{t("classic_rocket_stat_fuel_mass")}</span>
              <strong>{fmt(stats.fuelMassKg + stats.oxidizerMassKg)}</strong>
            </li>
            <li>
              <span>{t("classic_rocket_stat_base_distance")}</span>
              <strong>{fmt(stats.baseDistanceKm)}</strong>
            </li>
            <li>
              <span>{t("classic_rocket_stat_mass_penalty")}</span>
              <strong>−{fmt(stats.massPenaltyKm)}</strong>
            </li>
            <li>
              <span>{t("classic_rocket_stat_final_distance")}</span>
              <strong>{fmt(stats.finalDistanceKm)}</strong>
            </li>
          </ul>
        </div>
        <ClassicDistanceChart
          points={curve}
          currentFuelKg={stats.fuelMassKg}
          currentDistanceKm={stats.finalDistanceKm}
          targetDistanceKm={targetDistanceKm}
        />
      </div>
    );

  const sidebarInner = (
    <>
      <TextField
        label={t("rocket_name_label")}
        fullWidth
        value={rocket.title}
        onChange={(e) => patchTitle(rocketIndex, e.target.value)}
        onBlur={() => {
          const trimmed = rocket.title.trim();
          if (trimmed.length === 0) {
            patchTitle(rocketIndex, t("rocket_default_name", { n: rocketIndex + 1 }));
          }
        }}
        maxLength={120}
      />

      <div className={styles.sidebarSectionTitle}>{t("classic_rocket_section_engines")}</div>
      <div className={styles.sidebarEngineGrid}>
        {ENGINE_IDS.map((id) => {
          const eng = classicRocketEngines[id];
          const selected = id === engineId;
          return (
            <button
              key={id}
              type="button"
              className={styles.sidebarEngineCard}
              onClick={() => patchClassic(rocketIndex, { engineId: id })}
              style={{
                borderColor: selected ? colors.primary.main : colors.border.main,
                background: selected
                  ? `color-mix(in srgb, ${colors.primary.main} 14%, ${colors.background.paper})`
                  : colors.background.paper,
              }}
            >
              <img src={getAssetImageUrl(eng.image)} alt="" className={styles.sidebarEngineImg} />
              <span className={styles.sidebarEngineName}>{entityName(eng.nameKey)}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.sidebarSectionTitle}>{t("rocket_section_oxidizer")}</div>
      <div className={styles.oxidizerButtons}>
        {(["oxylite", "liquidOxygen"] as ClassicOxidizerId[]).map((id) => {
          const active = oxidizer === id;
          const disabled = !engine.needsOxidizer;
          const oxidizerImage =
            id === "liquidOxygen" ? liquids.liquidOxygen.image : resourses.oxylite.image;
          return (
            <button
              key={id}
              type="button"
              className={styles.oxidizerChipBtn}
              disabled={disabled}
              onClick={() => patchClassic(rocketIndex, { oxidizer: id })}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${active ? colors.primary.main : colors.border.main}`,
                background: active
                  ? `color-mix(in srgb, ${colors.primary.main} 18%, ${colors.background.paper})`
                  : colors.background.average,
                color: colors.text.primary,
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.45 : 1,
              }}
            >
              <img
                src={getAssetImageUrl(oxidizerImage)}
                alt=""
                className={styles.oxidizerChipImg}
              />
              {t(id === "oxylite" ? "classic_rocket_oxylite" : "classic_rocket_liquid_oxygen")}
            </button>
          );
        })}
      </div>

      <div className={styles.sidebarSectionLead}>
        <div className={styles.sidebarSectionTitle}>
          {t("classic_rocket_section_extra_modules")}
        </div>
        <p
          className={styles.sidebarSectionHint}
          style={{ color: colors.text.primary }}
        >
          {t("classic_rocket_section_extra_modules_hint")}
        </p>
      </div>
      <div className={styles.moduleCardGrid}>
        <SidebarModuleCounter
          label={t("classic_rocket_mod_cargo")}
          image={rocketCargos.classicCargoBay.image}
          previewImages={CLASSIC_CARGO_BAY_PREVIEW_IMAGES}
          value={modules.cargoBays}
          onChange={(n) => patchModules({ cargoBays: n })}
        />
        <SidebarModuleCounter
          label={t("classic_rocket_mod_research")}
          image={rocketModules.classicResearchModule.image}
          previewImages={CLASSIC_RS_PREVIEW_IMAGES}
          value={modules.researchSightseeing}
          onChange={(n) => patchModules({ researchSightseeing: n })}
        />
        <SidebarModuleCounter
          label={t("classic_rocket_mod_solid_booster")}
          image={rocketModules.solidFuelThruster.image}
          value={modules.solidBoosters}
          onChange={(n) => patchModules({ solidBoosters: n })}
        />
      </div>

      <div className={styles.sidebarSectionTitle}>{t("classic_rocket_section_base_modules")}</div>
      <div className={styles.moduleCardGrid}>
        <SidebarModuleCounter
          label={t("classic_rocket_mod_fuel_tank")}
          image={rocketTanks.largeLiquidFuelTank.image}
          value={modules.fuelTanks}
          max={CLASSIC_MAX_LIQUID_FUEL_TANKS}
          onChange={(n) => patchModules({ fuelTanks: n })}
        />
        <SidebarModuleCounter
          label={t("classic_rocket_mod_oxidizer_tank")}
          image={rocketTanks.largeSolidOxidizerTank.image}
          value={modules.oxidizerTanks}
          max={CLASSIC_MAX_OXIDIZER_TANKS}
          onChange={(n) => patchModules({ oxidizerTanks: n })}
        />
        <SidebarModuleCounter
          label={t("classic_rocket_mod_command")}
          image={rocketHeads.commandCapsule.image}
          value={1}
          min={1}
          max={1}
          onChange={() => {}}
        />
      </div>
    </>
  );

  return (
    <div className={styles.tabPanelShell}>
      <div
        className={styles.mainRow}
        style={
          narrow
            ? { padding: 16 }
            : { paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 0 }
        }
      >
        <div className={styles.mainPane}>
          {mainPaneHeader}
          <div className={styles.mainPaneScroll}>{mainContent}</div>
        </div>
        {!narrow ? (
          <>
            <div style={{ width: 1, alignSelf: "stretch", background: colors.border.main }} />
            <div className={`${rocketLayout["rocket-sidebar-scroll"]} ${styles.sidebarScroll}`}>
              <div className={`${rocketLayout["rocket-sidebar-inner"]} ${styles.sidebarInner}`}>
                {sidebarInner}
              </div>
            </div>
          </>
        ) : null}
      </div>
      {narrow ? (
        <>
          {!sidebarOpen ? (
            <Button
              type="button"
              variant="translucent"
              aria-label={t("aria_rocket_open_sidebar")}
              onClick={() => setSidebarOpen(true)}
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
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            closeButton
            zIndex={1592}
          >
            <div className={styles.mobileSidebar}>{sidebarInner}</div>
          </Popup>
        </>
      ) : null}
    </div>
  );
}

export default function ClassicRocket() {
  const { t } = useTranslation();
  const { data, setRockets } = useAppSettings();
  const page = data.rockets;
  const pageRef = useRef(page);
  pageRef.current = page;

  const setPage = useCallback(
    (updater: SetStateAction<RocketsPageState>) => {
      const next = typeof updater === "function" ? updater(pageRef.current) : updater;
      setRockets(next);
    },
    [setRockets]
  );

  const { rockets, activeIndex } = page;

  const patchClassic = useCallback((index: number, patch: Partial<ClassicFlightSnapshot>) => {
    setPage((s) => ({
      ...s,
      rockets: s.rockets.map((r, i) => {
        if (i !== index) return r;
        const prevFlight = ensureClassicFlight(r);
        const merged = { ...prevFlight, ...patch };
        const shouldSyncTanks =
          patch.engineId !== undefined ||
          patch.oxidizer !== undefined ||
          patch.targetDistanceKm !== undefined ||
          (patch.modules !== undefined &&
            classicModulePatchAffectsTankSync(prevFlight.modules, patch.modules));
        const syncedModules = shouldSyncTanks
          ? classicModulesWithSyncedTanksForTarget(
              merged.engineId,
              merged.oxidizer,
              merged.modules,
              merged.targetDistanceKm,
            )
          : merged.modules;
        const classicFlight = {
          ...merged,
          modules: classicModulesWithNormalizedCargoKinds(syncedModules),
        };
        return { ...r, classicFlight };
      }),
    }));
  }, [setPage]);

  const patchTitle = useCallback((index: number, title: string) => {
    setPage((s) => ({
      ...s,
      rockets: s.rockets.map((r, i) => (i === index ? { ...r, title } : r)),
    }));
  }, [setPage]);

  const addRocket = useCallback(() => {
    setPage((s) => {
      const created = createStoredRocket(s.rockets.length);
      const nextRockets = [
        ...s.rockets,
        { ...created, title: t("rocket_default_name", { n: s.rockets.length + 1 }) },
      ];
      return { rockets: nextRockets, activeIndex: nextRockets.length - 1 };
    });
  }, [setPage, t]);

  const removeRocket = useCallback(() => {
    setPage((s) => {
      if (s.rockets.length <= 1) return s;
      const nextRockets = s.rockets.filter((_, i) => i !== s.activeIndex);
      let ai = s.activeIndex;
      if (ai >= nextRockets.length) ai = nextRockets.length - 1;
      return { rockets: nextRockets, activeIndex: ai };
    });
  }, [setPage]);

  const tabsConfig = useMemo(() => rockets.map((r) => ({ label: r.title })), [rockets]);

  return (
    <Box style={{ height: "100%", padding: 0, overflow: "hidden" }}>
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
              title={t("rocket_delete_dialog_title", { name: rockets[activeIndex]?.title ?? "" })}
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
          <ClassicRocketTabPanel
            key={rocket.id}
            rocket={rocket}
            rocketIndex={rocketIndex}
            patchClassic={patchClassic}
            patchTitle={patchTitle}
          />
        ))}
      </Tabs>
    </Box>
  );
}
