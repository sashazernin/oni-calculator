import { Fragment, useContext, useEffect, useMemo, useState, type CSSProperties } from "react";
import { RxCross2, RxPlus } from "react-icons/rx";
import { AssetImage } from "../asset-image/AssetImage";
import { IconButton } from "../icon-button/IconButton";
import { Popup } from "../popup/Popup";
import {
  ROCKET_GRID_COLUMNS,
  rocketEngines,
  rocketModuleCellBudget,
  rocketModules,
  rocketStackModules,
  type RocketEngineId,
} from "../../game-data/rocket";
import type { IRocketEngine, IRocketModule } from "../../types/game-data-types";
import { ThemeContext } from "../../providers/app-theme-provider";
import "./Rocket.css";

const platform = rocketModules.rocketPlatform;

const CELL_PX = 36;

export type PlacedRocketModule = {
  instanceId: string;
  catalogKey: string;
  def: IRocketModule;
};

export type RocketPicker =
  | { kind: "engine" }
  | { kind: "module"; insertIndex: number };

export type RocketBuilderProps = {
  availableEngineIds: readonly RocketEngineId[];
  engineId: RocketEngineId | null;
  onEngineChange: (id: RocketEngineId | null) => void;
  modules: PlacedRocketModule[];
  onModulesChange: (next: PlacedRocketModule[]) => void;
  className?: string;
  style?: CSSProperties;
};

function newInstanceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function gridSegmentStyle(rows: number, cols: number): CSSProperties {
  return {
    gridTemplateRows: `repeat(${rows}, minmax(${CELL_PX}px, ${CELL_PX}px))`,
    gridTemplateColumns: `repeat(${cols}, minmax(${CELL_PX}px, ${CELL_PX}px))`,
  };
}

function centerSpan(width: number): { gridColumn: string } {
  const offset = Math.max(0, Math.floor((ROCKET_GRID_COLUMNS - width) / 2));
  const start = offset + 1;
  const end = start + width;
  return { gridColumn: `${start} / ${end}` };
}

function trimModulesToBudget(list: PlacedRocketModule[], eng: IRocketEngine): PlacedRocketModule[] {
  const cap = rocketModuleCellBudget(eng);
  const out: PlacedRocketModule[] = [];
  let sum = 0;
  for (const m of list) {
    if (sum + m.def.height <= cap) {
      out.push(m);
      sum += m.def.height;
    }
  }
  return out;
}

export default function RocketBuilder({
  availableEngineIds,
  engineId,
  onEngineChange,
  modules,
  onModulesChange,
  className,
  style,
}: RocketBuilderProps) {
  const { colors } = useContext(ThemeContext);
  const [picker, setPicker] = useState<RocketPicker | null>(null);

  const resolvedEngineId = useMemo((): RocketEngineId | null => {
    if (engineId === null) return null;
    if (availableEngineIds.includes(engineId)) return engineId;
    return null;
  }, [availableEngineIds, engineId]);

  const engine = resolvedEngineId ? rocketEngines[resolvedEngineId] : null;
  const budget = engine ? rocketModuleCellBudget(engine) : 0;
  const usedHeights = useMemo(() => modules.reduce((s, m) => s + m.def.height, 0), [modules]);
  const spareRows = engine ? Math.max(0, budget - usedHeights) : 0;
  const stackCatalog = useMemo(() => Object.entries(rocketStackModules), []);
  const fullStack = Boolean(engine && usedHeights >= budget);
  const hasEngine = engine !== null;

  const captionColor = `color-mix(in srgb, ${colors.text.primary} 58%, ${colors.background.default})`;
  const columnBorder = `1px solid ${colors.border.main}`;
  const plusBg = `color-mix(in srgb, ${colors.background.paper} 88%, ${colors.primary.main})`;
  const dashedBorder = `1px dashed color-mix(in srgb, ${colors.text.primary} 22%, transparent)`;
  const junctionAccent = `color-mix(in srgb, ${colors.primary.main} 85%, #1a0505)`;

  useEffect(() => {
    if (resolvedEngineId === null && modules.length > 0) {
      onModulesChange([]);
    }
  }, [resolvedEngineId, modules.length, onModulesChange]);

  useEffect(() => {
    if (!engine) return;
    const sum = modules.reduce((s, m) => s + m.def.height, 0);
    if (sum <= budget) return;
    onModulesChange(trimModulesToBudget(modules, engine));
  }, [budget, engine, modules, onModulesChange]);

  const tryInsertModule = (insertIndex: number, def: IRocketModule, key: string) => {
    if (!engine) return;
    const next = [
      ...modules.slice(0, insertIndex),
      { instanceId: newInstanceId(), catalogKey: key, def },
      ...modules.slice(insertIndex),
    ];
    const h = next.reduce((s, m) => s + m.def.height, 0);
    if (h > budget) return;
    if (def.width > ROCKET_GRID_COLUMNS) return;
    onModulesChange(next);
    setPicker(null);
  };

  const selectEngine = (id: RocketEngineId) => {
    onEngineChange(id);
    setPicker(null);
  };

  const clearEngineAndModules = () => {
    onModulesChange([]);
    onEngineChange(null);
  };

  const removeModule = (instanceId: string) => {
    onModulesChange(modules.filter((m) => m.instanceId !== instanceId));
  };

  const openModulePicker = (insertIndex: number) => {
    if (!engine || fullStack) return;
    setPicker({ kind: "module", insertIndex });
  };

  if (availableEngineIds.length === 0) {
    return (
      <div className={className} style={{ fontSize: 13, color: captionColor, ...style }}>
        Нет доступных двигателей.
      </div>
    );
  }

  const plusRow = (insertIndex: number, key: string) => (
    <button
      key={key}
      type="button"
      className="rocket-builder__plus"
      disabled={fullStack}
      aria-label="Добавить модуль"
      onClick={() => openModulePicker(insertIndex)}
      style={{
        borderColor: colors.border.main,
        background: plusBg,
        color: colors.text.primary,
      }}
    >
      <RxPlus size={20} strokeWidth={0.5} aria-hidden />
    </button>
  );

  const moduleBlock = (m: PlacedRocketModule) => (
    <div
      key={m.instanceId}
      className="rocket-builder__column"
      style={{ borderLeft: columnBorder, borderRight: columnBorder, alignSelf: "center", width: "max-content" }}
    >
      <div
        className="rocket-builder__segment"
        style={{
          ...gridSegmentStyle(m.def.height, ROCKET_GRID_COLUMNS),
          borderTop: dashedBorder,
          borderBottom: dashedBorder,
        }}
      >
        <div className="rocket-builder__segment-inner" style={centerSpan(m.def.width)}>
          <AssetImage pathRelativeToAssets={m.def.image} alt={m.def.name} style={{ maxHeight: m.def.height * CELL_PX }} />
          <IconButton
            type="button"
            color="action"
            aria-label="Убрать модуль"
            className="rocket-builder__remove-mod"
            onClick={() => removeModule(m.instanceId)}
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 26,
              height: 26,
              minWidth: 26,
              background: colors.background.paper,
            }}
          >
            <RxCross2 size={14} aria-hidden />
          </IconButton>
        </div>
      </div>
    </div>
  );

  const popupTitle = picker?.kind === "engine" ? "Двигатель" : "Модуль ракеты";

  return (
    <div
      className={`rocket-builder${className ? ` ${className}` : ""}`}
      style={
        {
          ...style,
          ["--rocket-cell" as string]: `${CELL_PX}px`,
          ["--rocket-fg" as string]: colors.text.primary,
        } as CSSProperties
      }
    >
      <div className="rocket-builder__stack">
        <div className="rocket-builder__caption" style={{ color: captionColor, alignSelf: "flex-start" }}>
          {hasEngine
            ? `Сетка ${ROCKET_GRID_COLUMNS} ячеек · над двигателем до ${budget} ряд.`
            : "Платформа — нажмите +, чтобы установить двигатель."}
        </div>

        <div
          className="rocket-builder__stage"
          style={{
            borderColor: colors.border.main,
            background: `radial-gradient(120% 80% at 50% 100%, color-mix(in srgb, ${colors.primary.main} 12%, ${colors.background.default}) 0%, ${colors.background.default} 55%),
              linear-gradient(180deg, color-mix(in srgb, ${colors.text.primary} 6%, transparent) 0%, transparent 40%)`,
          }}
        >
          <div className="rocket-builder__rocket-column">
            {hasEngine ? (
              <>
                {modules.length > 0 ? plusRow(modules.length, "plus-top") : null}
                {spareRows > 0 ? (
                  <div
                    className="rocket-builder__column rocket-builder__spare"
                    style={{ borderLeft: columnBorder, borderRight: columnBorder, alignSelf: "center", width: "max-content" }}
                  >
                    <div
                      className="rocket-builder__segment rocket-builder__spare-grid"
                      style={{
                        ...gridSegmentStyle(spareRows, ROCKET_GRID_COLUMNS),
                        borderTop: modules.length > 0 ? dashedBorder : undefined,
                        borderBottom: dashedBorder,
                      }}
                    />
                  </div>
                ) : null}
                {[...modules].reverse().map((m, rev) => {
                  const idx = modules.length - 1 - rev;
                  return (
                    <Fragment key={m.instanceId}>
                      {moduleBlock(m)}
                      {plusRow(idx, `plus-${m.instanceId}`)}
                    </Fragment>
                  );
                })}
                {modules.length === 0 ? plusRow(0, "plus-above-engine") : null}
              </>
            ) : null}

            <div
              className={`rocket-builder__dock${!hasEngine ? " rocket-builder__dock--awaiting-engine" : ""}`}
              style={{ borderLeft: columnBorder, borderRight: columnBorder }}
            >
              {!hasEngine ? (
                <button
                  type="button"
                  className="rocket-builder__plus rocket-builder__plus--junction"
                  aria-label="Установить двигатель"
                  onClick={() => setPicker({ kind: "engine" })}
                  style={{
                    borderColor: `color-mix(in srgb, #000 35%, ${colors.border.main})`,
                    background: junctionAccent,
                    color: colors.primary.contrastText,
                    boxShadow: `0 0 0 2px ${colors.background.paper}`,
                  }}
                >
                  <RxPlus size={18} strokeWidth={0.5} aria-hidden />
                </button>
              ) : (
                <div
                  className="rocket-builder__segment rocket-builder__segment--flush-bottom"
                  style={{
                    ...gridSegmentStyle(engine.height, ROCKET_GRID_COLUMNS),
                    borderTop: dashedBorder,
                    borderBottom: "none",
                  }}
                >
                  <div className="rocket-builder__segment-inner" style={centerSpan(engine.width)}>
                    <AssetImage pathRelativeToAssets={engine.image} alt={engine.name} style={{ maxHeight: engine.height * CELL_PX }} />
                    <IconButton
                      type="button"
                      color="action"
                      aria-label="Снять двигатель"
                      className="rocket-builder__remove-mod"
                      onClick={clearEngineAndModules}
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        width: 26,
                        height: 26,
                        minWidth: 26,
                        background: colors.background.paper,
                      }}
                    >
                      <RxCross2 size={14} aria-hidden />
                    </IconButton>
                  </div>
                </div>
              )}

              <div
                className={`rocket-builder__segment ${hasEngine ? "rocket-builder__segment--flush-top" : ""}`}
                style={{
                  ...gridSegmentStyle(platform.height, ROCKET_GRID_COLUMNS),
                  borderTop: hasEngine ? "none" : dashedBorder,
                  borderBottom: dashedBorder,
                }}
              >
                <div className="rocket-builder__segment-inner" style={centerSpan(platform.width)}>
                  <AssetImage pathRelativeToAssets={platform.image} alt={platform.name} style={{ maxHeight: platform.height * CELL_PX }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Popup open={picker !== null} onClose={() => setPicker(null)} variant="fit-content" title={popupTitle} closeButton>
        <div style={{ padding: 16, minWidth: 280, maxWidth: 440 }}>
          {picker?.kind === "engine" ? (
            <ul className="rocket-builder__catalog">
              {availableEngineIds.map((id) => {
                const eng = rocketEngines[id];
                const cap = rocketModuleCellBudget(eng);
                return (
                  <li key={id} className="rocket-builder__catalog-item">
                    <button
                      type="button"
                      className="rocket-builder__catalog-btn"
                      onClick={() => selectEngine(id)}
                      style={{
                        borderColor: colors.border.main,
                        background: colors.background.paper,
                        color: colors.text.primary,
                      }}
                    >
                      <span className="rocket-builder__catalog-thumb">
                        <AssetImage pathRelativeToAssets={eng.image} alt="" style={{ maxHeight: 52, maxWidth: 60 }} />
                      </span>
                      <span className="rocket-builder__catalog-meta">
                        <span className="rocket-builder__catalog-name">{eng.name}</span>
                        <span className="rocket-builder__catalog-dim">
                          {eng.height}×{eng.width} ячеек · модули до {cap} ряд.
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : picker?.kind === "module" && engine ? (
            stackCatalog.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: captionColor }}>
                В rocketStackModules пока нет модулей — добавьте записи в src/game-data/rocket.ts.
              </p>
            ) : (
              <ul className="rocket-builder__catalog">
                {stackCatalog.map(([key, mod]) => {
                  const fitsWidth = mod.width <= ROCKET_GRID_COLUMNS;
                  const ins = picker.insertIndex;
                  const hAfter =
                    modules.slice(0, ins).reduce((s, m) => s + m.def.height, 0) +
                    mod.height +
                    modules.slice(ins).reduce((s, m) => s + m.def.height, 0);
                  const disabled = !fitsWidth || hAfter > budget;
                  return (
                    <li key={key} className="rocket-builder__catalog-item">
                      <button
                        type="button"
                        className="rocket-builder__catalog-btn"
                        disabled={disabled}
                        onClick={() => tryInsertModule(ins, mod, key)}
                        style={{
                          borderColor: colors.border.main,
                          background: colors.background.paper,
                          color: colors.text.primary,
                          opacity: disabled ? 0.45 : 1,
                        }}
                      >
                        <span className="rocket-builder__catalog-thumb">
                          <AssetImage pathRelativeToAssets={mod.image} alt="" style={{ maxHeight: 48, maxWidth: 56 }} />
                        </span>
                        <span className="rocket-builder__catalog-meta">
                          <span className="rocket-builder__catalog-name">{mod.name}</span>
                          <span className="rocket-builder__catalog-dim">
                            {mod.height}×{mod.width} ячеек
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )
          ) : null}
        </div>
      </Popup>
    </div>
  );
}
