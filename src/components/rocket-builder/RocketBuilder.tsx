import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import type { IRocketModule } from "../../types/game-data-types";
import {
  ROCKET_CELL_PX,
  ROCKET_GRID_COLUMNS,
  rocketEngines,
  rocketModuleCellBudget,
  rocketStackModules,
  type PlacedRocketStackModule,
  type RocketEngineId,
} from "../../game-data/rocket";
import { ThemeContext } from "../../providers/app-theme-provider";
import { getAssetImageUrl } from "../asset-image/AssetImage";
import { Popup } from "../popup/Popup";
import { getRocketModuleSpriteInset, RocketPlatformBlock } from "./rocket-modules";

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

interface RocketBuilderProps {
  engineId: RocketEngineId | null;
  placements: PlacedRocketStackModule[];
  onPlacementsChange: React.Dispatch<React.SetStateAction<PlacedRocketStackModule[]>>;
}

export default function RocketBuilder(props: RocketBuilderProps) {
  const { engineId, placements, onPlacementsChange } = props;
  const { colors } = useContext(ThemeContext);
  const gridWrapRef = useRef<HTMLDivElement>(null);
  /** Курсор над любой свободной ячейкой зоны модулей — показываем общую подсветку области. */
  const [highlightFreeStack, setHighlightFreeStack] = useState(false);
  const [pickDialog, setPickDialog] = useState<{ row: number; col: number } | null>(null);

  const engine = engineId ? rocketEngines[engineId] : null;
  /** Рядов под модули над двигателем (= maxHeight двигателя минус высота двигателя). */
  const budget = engine ? rocketModuleCellBudget(engine) : 0;
  /** Общая высота ракеты на сетке в ячейках; включает и двигатель. */
  const rocketTotalRows = engine?.maxHeight ?? 0;
  const engineColOffset = engine
    ? Math.floor((ROCKET_GRID_COLUMNS - engine.width) / 2)
    : 0;

  const occ = useMemo(() => occupiedCells(placements), [placements]);
  const primary = colors.primary.main;

  const stackCatalog = useMemo(() => Object.entries(rocketStackModules), []);

  const confirmPickModule = useCallback(
    (modKey: string) => {
      if (!pickDialog) return;
      const mod = rocketStackModules[modKey];
      if (!mod || !placementFitsAt(pickDialog.row, pickDialog.col, mod, budget, occ)) return;
      onPlacementsChange((prev) => [
        ...prev,
        {
          uid:
            typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          moduleKey: modKey,
          row: pickDialog.row,
          col: pickDialog.col,
        },
      ]);
      setPickDialog(null);
    },
    [budget, occ, pickDialog, onPlacementsChange],
  );

  const gridPixelWidth = ROCKET_GRID_COLUMNS * ROCKET_CELL_PX;
  const moduleZoneHeightPx = budget * ROCKET_CELL_PX;

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
        row < budget &&
        col >= 0 &&
        col < ROCKET_GRID_COLUMNS &&
        !occ.has(cellKey(row, col))
      ) {
        setHighlightFreeStack(true);
      } else {
        setHighlightFreeStack(false);
      }
    },
    [budget, gridPixelWidth, moduleZoneHeightPx, occ],
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
        Выберите двигатель — без него сетка недоступна.
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

  return (
    <div>
      <div
        ref={gridWrapRef}
        style={{ position: "relative", width: gridPixelWidth }}
        onMouseMove={(e) =>
          syncHighlightFromPointer(e.clientX, e.clientY)
        }
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
            length: rocketTotalRows * ROCKET_GRID_COLUMNS,
          }).map((_, i) => {
            const row = Math.floor(i / ROCKET_GRID_COLUMNS);
            const col = i % ROCKET_GRID_COLUMNS;

            const inModuleZone = row < budget;
            const occupied = occ.has(cellKey(row, col));

            const cellInteract = inModuleZone && !occupied;

            const inEngineFootprint =
              row >= budget &&
              col >= engineColOffset &&
              col < engineColOffset + engine.width;

            return (
              <div
                key={cellKey(row, col)}
                role={cellInteract ? "button" : undefined}
                tabIndex={cellInteract ? 0 : undefined}
                aria-label={
                  cellInteract ? "Добавить модуль в эту ячейку" : undefined
                }
                onClick={() =>
                  cellInteract && setPickDialog({ row, col })
                }
                onKeyDown={(e) => {
                  if (
                    cellInteract &&
                    (e.key === "Enter" || e.key === " ")
                  ) {
                    e.preventDefault();
                    setPickDialog({ row, col });
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
                    row >= budget
                      ? "default"
                      : cellInteract
                        ? "pointer"
                        : "default",
                  backgroundColor: (() => {
                    if (row >= budget && inEngineFootprint) {
                      return `color-mix(in srgb, ${colors.text.primary} 4%, transparent)`;
                    }
                    if (row >= budget) {
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

        {budget > 0 && highlightFreeStack ? (
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
            top: budget * ROCKET_CELL_PX - engineSpriteInset.top,
            width: engineDrawW,
            height: engineDrawH,
            objectFit: "contain",
            zIndex: 1,
          }}
        />

        {placements.map((p) => {
          const mod = rocketStackModules[p.moduleKey];
          if (!mod) return null;
          return (
            <img
              key={p.uid}
              src={getAssetImageUrl(mod.image)}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                pointerEvents: "none",
                left: p.col * ROCKET_CELL_PX,
                top: p.row * ROCKET_CELL_PX,
                width: mod.width * ROCKET_CELL_PX,
                height: mod.height * ROCKET_CELL_PX,
                objectFit: "contain",
                zIndex: 2,
              }}
            />
          );
        })}
      </div>

      <RocketPlatformBlock />

      <Popup
        open={pickDialog !== null}
        title="Добавить модуль"
        onClose={() => setPickDialog(null)}
      >
        {stackCatalog.length === 0 ? (
          <p style={{ margin: 0, color: colors.text.primary }}>
            Элементов пока нет — добавьте их в{" "}
            <code style={{ fontSize: "0.9em" }}>rocketStackModules</code>.
          </p>
        ) : pickDialog === null ? null : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: "min(360px, 60vh)",
              overflowY: "auto",
            }}
          >
            {stackCatalog.map(([modKey, mod]) => {
              const ok = placementFitsAt(
                pickDialog.row,
                pickDialog.col,
                mod,
                budget,
                occ,
              );
              return (
                <button
                  type="button"
                  key={modKey}
                  disabled={!ok}
                  onClick={() => confirmPickModule(modKey)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: `1px solid ${colors.border.main}`,
                    background: colors.background.default,
                    color: colors.text.primary,
                    cursor: ok ? "pointer" : "not-allowed",
                    opacity: ok ? 1 : 0.45,
                  }}
                >
                  <img
                    src={getAssetImageUrl(mod.image)}
                    alt=""
                    style={{ width: 40, height: 40, objectFit: "contain" }}
                  />
                  <span>{mod.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </Popup>
    </div>
  );
}
