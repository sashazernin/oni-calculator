import { useContext, useEffect, useMemo, useState, type ContextType } from "react";
import Box from "../../components/box/box";
import { HexMapPopup, type HexMapObjectItem } from "../../components/hex-map/HexMap";
import { Button } from "../../components/button/Button";
import { getAssetImageUrl } from "../../components/asset-image/AssetImage";
import { Popup } from "../../components/popup/Popup";
import { useTranslation } from "../../hooks/useTranslation";
import { readStoredStarMapObjects } from "../../helpers/readStoredStarMapObjects";
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

type ThemeColors = ContextType<typeof ThemeContext>["colors"];

const allEngineIds = Object.keys(rocketEngines) as RocketEngineId[];

function gameDataLabel(name: string, entityName: (n: string) => string): string {
  return name.startsWith("gd_") ? entityName(name) : name;
}

function FuelAndOxidizerRows(props: {
  engineId: RocketEngineId;
  fuelPlan: RocketFuelPlan;
  steps: number;
  selectedEngineFeasible: boolean;
  colors: ThemeColors;
  textMuted: string;
  entityName: (key: string) => string;
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

export default function Rocket() {
  const [open, setOpen] = useState(false);
  const [enginePickerOpen, setEnginePickerOpen] = useState(false);
  const { colors } = useContext(ThemeContext);
  const { t, entityName } = useTranslation();
  const [objects] = useState<HexMapObjectItem[]>(readStoredStarMapObjects);
  const [way, setWay] = useState<number[] | null>(null);
  const [engineId, setEngineId] = useState<RocketEngineId | null>(null);
  const [selectedOxidizerVariant, setSelectedOxidizerVariant] =
    useState<RocketOxidizerVariant>("oxylite");
  const [stackModules, setStackModules] = useState<PlacedRocketStackModule[]>([]);

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
  }, [
    engineId,
    fuelPlan,
    stackModules,
    selectedOxidizerVariant,
  ]);

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

  useEffect(() => {
    setSelectedOxidizerVariant("oxylite");
  }, [engineId]);

  const textMuted = `color-mix(in srgb, ${colors.text.primary} 68%, transparent)`;

  const selectEngine = (id: RocketEngineId) => {
    setEngineId(id);
    setEnginePickerOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 16, flex: 1 }}>
      <Box
        style={{ width: "70%", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", position: "relative", overflow: 'auto' }}>
          <div style={{ position: "absolute" }}>
            <RocketBuilder
              engineId={engineId}
              placements={stackModules}
              onPlacementsChange={setStackModules}
              inferredTankPlacements={inferredTankPlacements}
            />
          </div>

        </div>
      </Box>
      <Box style={{ width: "30%", display: "flex", flexDirection: "column", gap: 16 }}>
        <Button onClick={() => setOpen(true)}>{t('settings_tab_space_map')}</Button>
        Перемещений: {way ? way?.length - 1 : 0}
        <HexMapPopup
          open={open}
          onClose={() => setOpen(false)}
          mapProps={{
            objects: objects,
            rocketWay: way,
            onWayChange: setWay,
            minHeightPx: 280,
            mode: 'select',
          }}
        />
        <Button
          disabled={!way}
          onClick={() => setEnginePickerOpen(true)}
          style={{ width: "100%" }}
        >
          {engineId !== null
            ? entityName(rocketEngines[engineId].name)
            : "Выберите двигатель"}
        </Button>
        {engineId && fuelPlan ? (
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
        ) : null}
        {engineId !== null && rocketSpeedStats ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: 'color-mix(in srgb, rgb(232, 232, 232) 68%, transparent)'
            }}>Скорость</div>
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
                  Циклов полёта
                </div>
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
          </div>) : null}
      </Box>

      <Popup
        open={enginePickerOpen}
        title="Двигатель"
        variant="fit-content"
        onClose={() => setEnginePickerOpen(false)}
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
            const ok = isRocketEngineFeasibleForSteps(eng, steps);

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
    </div>
  );
}
