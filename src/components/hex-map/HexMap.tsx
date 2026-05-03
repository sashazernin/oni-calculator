import type { CSSProperties } from "react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IoMdPlanet, IoMdWarning } from "react-icons/io";
import { WiSmog } from "react-icons/wi";
import { RxCross1 } from "react-icons/rx";
import spaceBg from "../../../assets/space_bg.jpg";
import { ThemeContext } from "../../providers/app-theme-provider";
import type { HexMapObjectItem, HexMapObjectType } from "../../types/hex-map-types";
import {
  AXIAL_NEIGHBOR_DR,
  AXIAL_TO_CELL_INDEX,
  HEX_DRAW_R,
  HEX_MAP_CENTER_CELL_INDEX,
  HEX_MAP_CELLS,
  HEX_MAP_VIEW_BOX,
  HEX_PIXEL_R,
  axialKey,
  axialToPixelFlat,
  flatTopHexCorners,
  shortestHexPathAvoidPlanets,
} from "../../helpers/hex-map-geometry";
import { Popup, type IPopupProps } from "../popup/Popup";
import { TextField } from "../text-field/TextField";
import { IconButton } from "../icon-button/IconButton";
import Info from "../info/info";

export type { HexMapObjectItem, HexMapObjectType } from "../../types/hex-map-types";

const FIT_PADDING_FRAC = 0.045;
/** Плавность зума колесом: чем больше τ (мс), тем медленнее подстраивается масштаб. */
const ZOOM_SMOOTH_TAU_MS = 95;
const ZOOM_RAF_DT_CAP_MS = 32;

/** Длина наконечника маршрута (от основания до острия) в координатах карты. */
const SELECT_ROUTE_ARROW_LENGTH = 10;
/** Половина ширины наконечника у основания (в тех же координатах). */
const SELECT_ROUTE_ARROW_HALF_WIDTH = 5;

const CREATE_TYPE_SEGMENTS: readonly { value: HexMapObjectType; label: string }[] = [
  { value: "planet", label: "Планета" },
  { value: "nebula", label: "Туманность" },
  { value: "wreck", label: "Обломок" },
];

interface MapBoundsPx {
  cw: number;
  ch: number;
  u: number;
  insetX: number;
  insetY: number;
  drawW: number;
  drawH: number;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function mapMeetLayout(cw: number, ch: number, vbW: number, vbH: number): MapBoundsPx {
  if (!(cw > 0) || !(ch > 0) || !(vbW > 0) || !(vbH > 0)) {
    return { cw, ch, u: 1, insetX: 0, insetY: 0, drawW: cw, drawH: ch };
  }
  const vbAspect = vbW / vbH;
  const contAspect = cw / ch;
  let u: number;
  let drawW: number;
  let drawH: number;
  if (vbAspect > contAspect) {
    u = cw / vbW;
    drawW = cw;
    drawH = vbH * u;
  } else {
    u = ch / vbH;
    drawW = vbW * u;
    drawH = ch;
  }
  const insetX = (cw - drawW) / 2;
  const insetY = (ch - drawH) / 2;
  return { cw, ch, u, insetX, insetY, drawW, drawH };
}

function computeMinFitScale(layout: MapBoundsPx, vbW: number, vbH: number): number {
  const { cw: w, ch: h } = layout;
  if (!(w > 0) || !(h > 0) || !(vbW > 0) || !(vbH > 0)) return 1;
  const lm = mapMeetLayout(w * (1 - 2 * FIT_PADDING_FRAC), h * (1 - 2 * FIT_PADDING_FRAC), vbW, vbH);
  return lm.u / layout.u;
}

function clampTranslate(tx: number, ty: number, scale: number, bounds: MapBoundsPx): { tx: number; ty: number } {
  const { cw, ch, insetX, insetY, drawW, drawH } = bounds;
  if (!(cw > 0) || !(ch > 0)) return { tx, ty };

  const mapW = drawW * scale;
  const mapH = drawH * scale;

  const minTx = cw - insetX * scale - mapW;
  const maxTx = -insetX * scale;
  const minTy = ch - insetY * scale - mapH;
  const maxTy = -insetY * scale;

  const txClamp = clamp(tx, Math.min(minTx, maxTx), Math.max(minTx, maxTx));
  const tyClamp = clamp(ty, Math.min(minTy, maxTy), Math.max(minTy, maxTy));

  return { tx: txClamp, ty: tyClamp };
}

export interface HexMapProps {
  objects?: HexMapObjectItem[];
  /** Короткий ЛКМ (если клик не открыл форму создания). */
  onHexClick?: (cellNumber: number, q: number, r: number) => void;
  /** Если передан — пустые клетки не рядом с планетой открывают форму; по «Добавить» вызывается с готовым объектом. */
  onCreateObject?: (item: HexMapObjectItem) => void;
  /** Изменение объекта (панель по клику на объект). */
  onUpdateObject?: (item: HexMapObjectItem) => void;
  /** Удаление объекта из клетки (кнопка в правой панели). */
  onDeleteObject?: (cellNumber: number) => void;
  className?: string;
  style?: CSSProperties;
  /** Минимальная высота вьюпорта карты в px. */
  minHeightPx?: number;
  /**
   * `edit` — создание/панель редактирования как обычно.
   * `select` — без создания и без панели; ЛКМ — новый путь от центра (0,0), ПКМ по гексу — продолжить от конца текущего. Промежуточно через планеты нельзя, финиш на планете можно.
   */
  mode?: "edit" | "select";
  /** Маршрут в режиме `select`: индексы клеток по порядку; `null` — маршрута нет. */
  rocketWay?: number[] | null;
  onWayChange?: (way: number[] | null) => void;
}

const cells = HEX_MAP_CELLS;
const boundsSvg = HEX_MAP_VIEW_BOX;
const EMPTY_OBJECTS: HexMapObjectItem[] = [];

export default function HexMap({
  objects: objectsProp,
  onHexClick,
  onCreateObject,
  onUpdateObject,
  onDeleteObject,
  className,
  style,
  minHeightPx = 280,
  mode = "edit",
  rocketWay = null,
  onWayChange,
}: HexMapProps) {
  const { colors } = useContext(ThemeContext);
  const objects = objectsProp ?? EMPTY_OBJECTS;

  const objectByCell = useMemo(() => {
    const m = new Map<number, HexMapObjectItem>();
    for (const o of objects) {
      if (
        typeof o.cellNumber === "number" &&
        Number.isFinite(o.cellNumber) &&
        o.cellNumber >= 0 &&
        o.cellNumber < cells.length
      ) {
        m.set(o.cellNumber, o);
      }
    }
    return m;
  }, [objects]);

  const planetCellIndices = useMemo(() => {
    const s = new Set<number>();
    for (const o of objects) {
      if (o.type === "planet") s.add(o.cellNumber);
    }
    return s;
  }, [objects]);

  const axialKeysAdjacentToAnyPlanet = useMemo(() => {
    const s = new Set<string>();
    for (const o of objects) {
      if (o.type !== "planet") continue;
      const axial = cells[o.cellNumber];
      if (!axial) continue;
      for (const d of AXIAL_NEIGHBOR_DR) {
        const k = axialKey(axial.q + d.q, axial.r + d.r);
        if (AXIAL_TO_CELL_INDEX.has(k)) s.add(k);
      }
    }
    return s;
  }, [objects]);

  const [neighborHoverPlanetCell, setNeighborHoverPlanetCell] = useState<number | null>(null);

  const [createDraft, setCreateDraft] = useState<{
    cellNumber: number;
    q: number;
    r: number;
  } | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftType, setDraftType] = useState<HexMapObjectType>("planet");

  /** Выбранный для просмотра объект (правая панель). */
  const [inspectorCell, setInspectorCell] = useState<number | null>(null);

  const inspectorObject =
    inspectorCell != null ? (objectByCell.get(inspectorCell) ?? null) : null;

  const [inspectorEditName, setInspectorEditName] = useState("");
  const [inspectorEditType, setInspectorEditType] = useState<HexMapObjectType>("planet");

  const neighborKeySet = useMemo(() => {
    const s = new Set<string>();
    if (neighborHoverPlanetCell === null) return s;
    const c = cells[neighborHoverPlanetCell];
    if (!c) return s;
    for (const d of AXIAL_NEIGHBOR_DR) {
      const k = axialKey(c.q + d.q, c.r + d.r);
      if (AXIAL_TO_CELL_INDEX.has(k)) s.add(k);
    }
    return s;
  }, [neighborHoverPlanetCell]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [{ cw, ch }, setCwCh] = useState({ cw: 0, ch: 0 });

  const layout = useMemo(
    () => mapMeetLayout(cw, ch, boundsSvg.vbW, boundsSvg.vbH),
    [cw, ch]
  );

  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const panMoved = useRef(false);
  const pendingHexPick = useRef<{ q: number; r: number; cellIdx: number; button: 0 | 2 } | null>(
    null
  );
  const panning = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
    pointerId: -1,
  });

  const didInitPan = useRef(false);

  const zoomRafRef = useRef(0);
  const zoomLastTsRef = useRef(0);
  const zoomTargetSRef = useRef(1);
  const zoomPivotRef = useRef({ mx: 0, my: 0, cw: 1, ch: 1 });

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      const w = cr?.width ?? el.clientWidth;
      const h = cr?.height ?? el.clientHeight;
      setCwCh({ cw: Math.max(1, w), ch: Math.max(1, h) });
    });
    ro.observe(el);
    setCwCh({ cw: Math.max(1, el.clientWidth), ch: Math.max(1, el.clientHeight) });
    return () => ro.disconnect();
  }, []);

  const syncScaleClampPan = useCallback(
    (
      nextScale: number,
      nextTx?: number,
      nextTy?: number,
      overrides?: Partial<MapBoundsPx> & {
        cw?: number;
        ch?: number;
      }
    ) => {
      const cwUse = overrides?.cw ?? cw;
      const chUse = overrides?.ch ?? ch;
      const lay =
        overrides?.cw != null && overrides?.ch != null
          ? mapMeetLayout(cwUse, chUse, boundsSvg.vbW, boundsSvg.vbH)
          : layout;

      const minFitForLay = computeMinFitScale(lay, boundsSvg.vbW, boundsSvg.vbH);
      const s = clamp(nextScale, minFitForLay, 4);
      const txTry = nextTx ?? txRef.current;
      const tyTry = nextTy ?? tyRef.current;
      const c = clampTranslate(txTry, tyTry, s, lay);
      scaleRef.current = s;
      txRef.current = c.tx;
      tyRef.current = c.ty;
      setScale(s);
      setTx(c.tx);
      setTy(c.ty);
      return { scale: s, tx: c.tx, ty: c.ty };
    },
    [cw, ch, layout]
  );

  useEffect(() => {
    if (!(cw > 0) || !(ch > 0)) return;
    if (!didInitPan.current) {
      const minFit = computeMinFitScale(layout, boundsSvg.vbW, boundsSvg.vbH);
      if (minFit > 0) {
        didInitPan.current = true;
        syncScaleClampPan(minFit);
      }
    }
  }, [cw, ch, layout, syncScaleClampPan]);

  const wheelSyncRef = useRef(syncScaleClampPan);
  wheelSyncRef.current = syncScaleClampPan;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const tick = (now: number) => {
      const sync = wheelSyncRef.current;
      const prevT = zoomLastTsRef.current;
      zoomLastTsRef.current = now;
      const dt = prevT === 0 ? 16 : Math.min(ZOOM_RAF_DT_CAP_MS, Math.max(1, now - prevT));

      const curS = scaleRef.current;
      const { mx, my, cw, ch } = zoomPivotRef.current;
      const layW = mapMeetLayout(cw, ch, boundsSvg.vbW, boundsSvg.vbH);
      const minFw = computeMinFitScale(layW, boundsSvg.vbW, boundsSvg.vbH);
      const targetClamp = clamp(zoomTargetSRef.current, minFw, 4);
      zoomTargetSRef.current = targetClamp;

      const alpha = 1 - Math.exp(-dt / ZOOM_SMOOTH_TAU_MS);
      let sNew = curS + (targetClamp - curS) * alpha;

      const wx = (mx - txRef.current) / curS;
      const wy = (my - tyRef.current) / curS;
      const txNew = mx - wx * sNew;
      const tyNew = my - wy * sNew;

      sync(sNew, txNew, tyNew, { cw, ch });

      const sDone = scaleRef.current;
      if (Math.abs(sDone - targetClamp) < 0.0035) {
        zoomRafRef.current = 0;
        zoomLastTsRef.current = 0;
        return;
      }

      zoomRafRef.current = requestAnimationFrame(tick);
    };

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const vp = viewportRef.current;
      if (!vp) return;
      const rect = vp.getBoundingClientRect();
      const cwR = Math.max(1, rect.width);
      const chR = Math.max(1, rect.height);
      const layW = mapMeetLayout(cwR, chR, boundsSvg.vbW, boundsSvg.vbH);
      const minFw = computeMinFitScale(layW, boundsSvg.vbW, boundsSvg.vbH);
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const mx = clamp(e.clientX - rect.left, 0, cwR);
      const my = clamp(e.clientY - rect.top, 0, chR);

      zoomPivotRef.current = { mx, my, cw: cwR, ch: chR };
      if (zoomRafRef.current === 0) {
        zoomTargetSRef.current = clamp(scaleRef.current * factor, minFw, 4);
      } else {
        zoomTargetSRef.current = clamp(zoomTargetSRef.current * factor, minFw, 4);
      }

      if (zoomRafRef.current === 0) {
        zoomLastTsRef.current = 0;
        zoomRafRef.current = requestAnimationFrame(tick);
      }
    };
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheelNative);
      if (zoomRafRef.current !== 0) {
        cancelAnimationFrame(zoomRafRef.current);
        zoomRafRef.current = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (mode === "select") {
      setCreateDraft(null);
      setInspectorCell(null);
    } else {
      onWayChange?.(null);
    }
  }, [mode, onWayChange]);

  useEffect(() => {
    if (mode !== "select") return;
    const prev = rocketWay;
    if (!prev?.length) return;
    const last = prev.length - 1;
    for (let i = 0; i < prev.length; i++) {
      const ii = prev[i];
      if (i === last) continue;
      if (i === 0) continue;
      if (planetCellIndices.has(ii)) {
        onWayChange?.(null);
        return;
      }
    }
  }, [mode, planetCellIndices, rocketWay, onWayChange]);

  useEffect(() => {
    if (!onCreateObject) setCreateDraft(null);
  }, [onCreateObject]);

  useEffect(() => {
    if (createDraft != null && objectByCell.has(createDraft.cellNumber)) {
      setCreateDraft(null);
    }
  }, [createDraft, objectByCell]);

  useEffect(() => {
    const active =
      createDraft != null ||
      inspectorCell != null ||
      (mode === "select" && rocketWay != null);
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCreateDraft(null);
        setInspectorCell(null);
        if (mode === "select") onWayChange?.(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [createDraft, inspectorCell, mode, rocketWay, onWayChange]);

  useEffect(() => {
    if (inspectorCell === null) return;
    if (!objectByCell.has(inspectorCell)) setInspectorCell(null);
  }, [inspectorCell, objectByCell]);

  useEffect(() => {
    if (inspectorObject == null) return;
    setInspectorEditName(inspectorObject.name);
    setInspectorEditType(inspectorObject.type);
  }, [inspectorCell, inspectorObject]);

  const handleHexActivation = useCallback(
    (q: number, r: number, selectExtendRoute = false) => {
      const idx = AXIAL_TO_CELL_INDEX.get(axialKey(q, r));
      if (idx === undefined) return;
      const k = axialKey(q, r);

      if (mode === "select") {
        setCreateDraft(null);
        setInspectorCell(null);
        if (selectExtendRoute) {
          const prev = rocketWay;
          const from =
            prev != null && prev.length > 0 ? prev[prev.length - 1]! : HEX_MAP_CENTER_CELL_INDEX;
          if (from !== idx) {
            const segment = shortestHexPathAvoidPlanets(from, idx, planetCellIndices);
            if (segment != null) {
              const next =
                prev == null || prev.length === 0 ? segment : [...prev, ...segment.slice(1)];
              onWayChange?.(next);
            }
          }
        } else {
          const path = shortestHexPathAvoidPlanets(HEX_MAP_CENTER_CELL_INDEX, idx, planetCellIndices);
          onWayChange?.(path);
        }
        onHexClick?.(idx, q, r);
        return;
      }

      if (objectByCell.has(idx)) {
        setCreateDraft(null);
        setInspectorCell(idx);
        onHexClick?.(idx, q, r);
        return;
      }
      const empty = !objectByCell.has(idx);
      const canOpenCreate =
        onCreateObject != null && empty && !axialKeysAdjacentToAnyPlanet.has(k);
      if (canOpenCreate) {
        setInspectorCell(null);
        setDraftType("planet");
        setDraftName("");
        setCreateDraft({ cellNumber: idx, q, r });
        return;
      }
      if (onCreateObject != null && empty && axialKeysAdjacentToAnyPlanet.has(k)) {
        setInspectorCell(null);
        return;
      }
      setInspectorCell(null);
      onHexClick?.(idx, q, r);
    },
    [
      mode,
      objectByCell,
      axialKeysAdjacentToAnyPlanet,
      onHexClick,
      onCreateObject,
      planetCellIndices,
      rocketWay,
      onWayChange,
    ]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const left = e.button === 0;
      const right = e.button === 2;
      if (!left && !right) return;

      pendingHexPick.current = null;
      const tryPickHex = (button: 0 | 2) => {
        const t = e.target;
        const cell = t instanceof Element ? t.closest(".rocketHexCell, .hexMapPickTarget") : null;
        if (!cell) return;
        const dq = cell.getAttribute("data-q");
        const dr = cell.getAttribute("data-r");
        if (dq == null || dr == null) return;
        const q = Number(dq);
        const r = Number(dr);
        if (Number.isNaN(q) || Number.isNaN(r)) return;
        const cellIdx = AXIAL_TO_CELL_INDEX.get(axialKey(q, r));
        if (cellIdx !== undefined) pendingHexPick.current = { q, r, cellIdx, button };
      };
      if (left) tryPickHex(0);
      else if (right && mode === "select") tryPickHex(2);

      if (right) e.preventDefault();
      if (zoomRafRef.current !== 0) {
        cancelAnimationFrame(zoomRafRef.current);
        zoomRafRef.current = 0;
        zoomLastTsRef.current = 0;
        zoomTargetSRef.current = scaleRef.current;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      panMoved.current = false;
      setDragging(true);
      panning.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        startTx: txRef.current,
        startTy: tyRef.current,
        pointerId: e.pointerId,
      };
    },
    [mode]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const p = panning.current;
      if (!p.active || e.pointerId !== p.pointerId) return;
      const dx = e.clientX - p.startX;
      const dy = e.clientY - p.startY;
      if (dx * dx + dy * dy > 16) panMoved.current = true;
      const candTx = p.startTx + dx;
      const candTy = p.startTy + dy;
      const c = clampTranslate(candTx, candTy, scaleRef.current, layout);
      txRef.current = c.tx;
      tyRef.current = c.ty;
      setTx(c.tx);
      setTy(c.ty);
    },
    [layout]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const p = panning.current;
      if (e.pointerId !== p.pointerId) return;
      const pick = pendingHexPick.current;
      pendingHexPick.current = null;
      setDragging(false);
      panning.current = { ...p, active: false, pointerId: -1 };
      if (pick != null && !panMoved.current && e.button === pick.button) {
        if (pick.button === 2) handleHexActivation(pick.q, pick.r, true);
        else handleHexActivation(pick.q, pick.r, false);
      }
      panMoved.current = false;
    },
    [handleHexActivation]
  );

  const foSize = HEX_DRAW_R * 2.6;
  const iconPx = HEX_DRAW_R * 1.85;

  const bgStyle = {
    backgroundColor: "rgb(6 4 14)",
    backgroundImage: `linear-gradient(
      to bottom,
      rgba(6, 4, 18, 0.35),
      rgba(4, 3, 12, 0.55)
    ), url(${spaceBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  } as const;

  const submitCreate = () => {
    if (!createDraft) return;
    const name = draftName.trim();
    if (!name || !onCreateObject) return;
    onCreateObject({ cellNumber: createDraft.cellNumber, name, type: draftType, main: false });
    setCreateDraft(null);
  };

  const submitInspectorUpdate = () => {
    if (inspectorCell == null || inspectorObject == null || !onUpdateObject) return;
    const name = inspectorEditName.trim();
    if (!name) return;
    const typeNext = inspectorObject.main ? inspectorObject.type : inspectorEditType;
    if (name === inspectorObject.name && typeNext === inspectorObject.type) return;
    onUpdateObject({ ...inspectorObject, cellNumber: inspectorCell, name, type: typeNext });
  };

  const inspectorIsMain = Boolean(inspectorObject?.main);

  const inspectorCanSave =
    onUpdateObject != null &&
    inspectorEditName.trim().length > 0 &&
    inspectorObject != null &&
    (inspectorEditName.trim() !== inspectorObject.name ||
      (!inspectorIsMain && inspectorEditType !== inspectorObject.type));

  const formLabelColor = `color-mix(in srgb, ${colors.text.primary} 72%, ${colors.background.default})`;

  const selectRouteArrow = useMemo(() => {
    if (mode !== "select" || !rocketWay || rocketWay.length < 2) return null;
    const pts: { x: number; y: number }[] = [];
    for (const ii of rocketWay) {
      const a = cells[ii];
      if (!a) return null;
      pts.push(axialToPixelFlat(a.q, a.r, HEX_PIXEL_R));
    }
    const tip = pts[pts.length - 1]!;
    const prev = pts[pts.length - 2]!;
    let dx = tip.x - prev.x;
    let dy = tip.y - prev.y;
    const segLen = Math.hypot(dx, dy);
    if (segLen < 1e-6) return null;
    dx /= segLen;
    dy /= segLen;
    const effLen = Math.min(SELECT_ROUTE_ARROW_LENGTH, segLen * 0.88);
    const baseMidX = tip.x - dx * effLen;
    const baseMidY = tip.y - dy * effLen;
    const perpX = -dy;
    const perpY = dx;
    const p1x = baseMidX + perpX * SELECT_ROUTE_ARROW_HALF_WIDTH;
    const p1y = baseMidY + perpY * SELECT_ROUTE_ARROW_HALF_WIDTH;
    const p2x = baseMidX - perpX * SELECT_ROUTE_ARROW_HALF_WIDTH;
    const p2y = baseMidY - perpY * SELECT_ROUTE_ARROW_HALF_WIDTH;

    let lineD = `M ${pts[0].x} ${pts[0].y}`;
    if (pts.length === 2) {
      lineD += ` L ${baseMidX} ${baseMidY}`;
    } else {
      for (let i = 1; i < pts.length - 1; i++) lineD += ` L ${pts[i].x} ${pts[i].y}`;
      lineD += ` L ${baseMidX} ${baseMidY}`;
    }
    const arrowPoints = `${tip.x},${tip.y} ${p1x},${p1y} ${p2x},${p2y}`;
    return { lineD, arrowPoints };
  }, [mode, rocketWay]);

  /** Число перемещений между соседними клетками вдоль текущего маршрута (ребра пути). */
  const selectMoveCount = useMemo(() => {
    if (!rocketWay?.length) return 0;
    return rocketWay.length - 1;
  }, [rocketWay]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: minHeightPx,
        minWidth: 0,
        ...style,
      }}
    >
      <div
        ref={viewportRef}
        role="presentation"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          cursor: dragging ? "grabbing" : "grab",
          borderRadius: 8,
          touchAction: "none",
          ...bgStyle,
        }}
      >
        {mode === "select" && rocketWay != null ? (
          <div
            aria-live="polite"
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 6,
              pointerEvents: "none",
              padding: "8px 12px",
              borderRadius: 8,
              backgroundColor: colors.background.paper,
              border: `1px solid ${colors.border.main}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
              fontSize: 13,
              fontWeight: 600,
              color: colors.text.primary,
              lineHeight: 1.3,
            }}
          >
            Перемещений между клетками:{" "}
            <span style={{ color: colors.primary.main }}>{selectMoveCount}</span>
          </div>
        ) : null}
        {mode === "select" ? (
          <div
            style={{
              position: "absolute",
              left: 10,
              bottom: 10,
              zIndex: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
              borderRadius: 8,
              backgroundColor: colors.background.paper,
              border: `1px solid ${colors.border.main}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
              color: colors.primary.main,
            }}
          >
            <Info
              placement="top"
              message="Начальный маршрут — ЛКМ по клетке (от центра карты). Продолжение маршрута — ПКМ по следующей клетке от текущего конца пути."
            />
          </div>
        ) : null}
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`${boundsSvg.vbX} ${boundsSvg.vbY} ${boundsSvg.vbW} ${boundsSvg.vbH}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ display: "block", pointerEvents: "auto" }}
          >
            <title>Hex map</title>
            <defs>
              <filter id="hexMapPlanetGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <style>{`
            .rocketHexCell {
              cursor: pointer;
              outline: none;
              transition:
                fill 0.07s ease,
                stroke 0.07s ease,
                stroke-width 0.07s ease,
                stroke-opacity 0.07s ease;
            }
            .rocketHexCell:not(.rocketHexGhost):hover {
              fill: ${colors.translucent.hover};
              stroke: ${colors.primary.main};
              stroke-opacity: 0.9;
              stroke-width: 1.15;
            }
            .rocketHexCell:not(.rocketHexGhost):focus-visible {
              fill: ${colors.translucent.active};
              stroke: ${colors.primary.hover};
              stroke-opacity: 1;
              stroke-width: 1.2;
            }
            .rocketHexGhost:hover {
              fill: ${colors.translucent.hover};
              stroke: ${colors.primary.main};
              stroke-opacity: 0.9;
              stroke-width: 1.15;
            }
            .rocketHexGhost:focus-visible {
              fill: ${colors.translucent.active};
              stroke: ${colors.primary.hover};
              stroke-opacity: 1;
              stroke-width: 1.2;
            }
            .hexMapNeighborLit {
              fill: ${colors.translucent.hover} !important;
              stroke: ${colors.primary.main} !important;
              stroke-opacity: 0.75 !important;
              stroke-width: 1.1 !important;
            }
            .rocketHexPlanetBase {
              fill: rgba(0, 0, 0, 0.28);
              stroke: rgba(255, 255, 255, 0.2);
              stroke-width: 0.9;
            }
            .rocketHexWreckBase {
              fill: rgba(80, 40, 18, 0.32);
              stroke: rgba(255, 200, 120, 0.28);
              stroke-width: 0.9;
            }
            .rocketHexNebulaBase {
              fill: rgba(56, 36, 92, 0.34);
              stroke: rgba(186, 150, 235, 0.32);
              stroke-width: 0.9;
            }
            .hexMapCreateBlocked {
              cursor: not-allowed !important;
            }
            .hexMapCreateBlocked:hover {
              fill: rgba(0, 0, 0, 0.22) !important;
              stroke: rgba(255, 255, 255, 0.15) !important;
              stroke-opacity: 0.9 !important;
              stroke-width: 0.85 !important;
            }
          `}</style>
            {cells.map(({ q, r }) => {
              const { x, y } = axialToPixelFlat(q, r, HEX_PIXEL_R);
              const d = flatTopHexCorners(x, y, HEX_DRAW_R);
              const idx = AXIAL_TO_CELL_INDEX.get(axialKey(q, r))!;
              const k = axialKey(q, r);
              const obj = objectByCell.get(idx);
              const kind =
                obj?.type === "planet"
                  ? "planet"
                  : obj?.type === "wreck"
                    ? "wreck"
                    : obj?.type === "nebula"
                      ? "nebula"
                      : "empty";
              const planetClusterLit =
                neighborHoverPlanetCell !== null &&
                (neighborKeySet.has(k) || (kind === "planet" && neighborHoverPlanetCell === idx));
              const lit = planetClusterLit;

              const baseClass =
                kind === "planet"
                  ? "rocketHexPlanetBase"
                  : kind === "wreck"
                    ? "rocketHexWreckBase"
                    : kind === "nebula"
                      ? "rocketHexNebulaBase"
                      : "rocketHexGhost";
              const createBlocked =
                mode === "edit" &&
                onCreateObject != null &&
                kind === "empty" &&
                axialKeysAdjacentToAnyPlanet.has(k);

              return (
                <path
                  key={k}
                  className={`rocketHexCell ${baseClass}${lit ? " hexMapNeighborLit" : ""}${createBlocked ? " hexMapCreateBlocked" : ""
                    }`}
                  data-q={q}
                  data-r={r}
                  tabIndex={kind === "empty" ? 0 : undefined}
                  role={kind === "empty" ? "button" : undefined}
                  aria-label={kind === "empty" ? `Ячейка ${idx}` : obj?.name ?? `Объект ${idx}`}
                  d={d}
                  fill={
                    kind === "empty"
                      ? "rgba(0,0,0,0.22)"
                      : kind === "planet"
                        ? "rgba(0,0,0,0.28)"
                        : kind === "nebula"
                          ? "rgba(56, 36, 92, 0.34)"
                          : "rgba(80, 40, 18, 0.32)"
                  }
                  stroke={
                    kind === "empty"
                      ? "rgba(255,255,255,0.15)"
                      : kind === "planet"
                        ? "rgba(255,255,255,0.2)"
                        : kind === "nebula"
                          ? "rgba(186, 150, 235, 0.32)"
                          : "rgba(255, 200, 120, 0.28)"
                  }
                  strokeWidth={0.85}
                  onKeyDown={
                    kind === "empty"
                      ? (ev) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          handleHexActivation(q, r);
                        }
                      }
                      : undefined
                  }
                />
              );
            })}

            {cells.map(({ q, r }) => {
              const { x, y } = axialToPixelFlat(q, r, HEX_PIXEL_R);
              const idx = AXIAL_TO_CELL_INDEX.get(axialKey(q, r))!;
              const obj = objectByCell.get(idx);
              if (!obj) return null;

              const labelY = y + HEX_DRAW_R + 9;

              if (obj.type === "planet") {
                const hoverPath = flatTopHexCorners(x, y, HEX_DRAW_R);
                return (
                  <g key={`ov-${idx}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={HEX_DRAW_R + 10}
                      fill="none"
                      stroke={colors.primary.main}
                      strokeWidth={1.2}
                      opacity={0.45}
                      filter="url(#hexMapPlanetGlow)"
                      pointerEvents="none"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={HEX_DRAW_R + 5}
                      fill="none"
                      stroke={`color-mix(in srgb, ${colors.primary.main} 72%, transparent)`}
                      strokeWidth={1}
                      opacity={0.65}
                      pointerEvents="none"
                    />
                    <foreignObject
                      x={x - foSize / 2}
                      y={y - foSize / 2}
                      width={foSize}
                      height={foSize}
                      style={{ overflow: "visible", pointerEvents: "none" }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: colors.primary.main,
                          userSelect: "none",
                        }}
                      >
                        <IoMdPlanet size={iconPx} aria-hidden style={{ opacity: 0.95 }} />
                      </div>
                    </foreignObject>
                    <text
                      x={x}
                      y={labelY}
                      textAnchor="middle"
                      fill={colors.text.primary}
                      fontSize={10}
                      fontWeight={600}
                      style={{
                        pointerEvents: "none",
                        userSelect: "none",
                        textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                      }}
                    >
                      {obj.name}
                    </text>
                    <path
                      className="hexMapPickTarget"
                      d={hoverPath}
                      fill="transparent"
                      stroke="none"
                      pointerEvents="all"
                      data-q={q}
                      data-r={r}
                      onPointerEnter={() => setNeighborHoverPlanetCell(idx)}
                      onPointerLeave={() => setNeighborHoverPlanetCell(null)}
                    />
                  </g>
                );
              }

              if (obj.type === "wreck") {
                const wFo = HEX_DRAW_R * 2.2;
                const wIcon = HEX_DRAW_R * 1.4;
                return (
                  <g key={`ov-${idx}`} style={{ pointerEvents: "none" }}>
                    <foreignObject
                      x={x - wFo / 2}
                      y={y - wFo / 2}
                      width={wFo}
                      height={wFo}
                      style={{ overflow: "visible", pointerEvents: "none" }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255, 200, 120, 0.92)",
                          userSelect: "none",
                        }}
                      >
                        <IoMdWarning size={wIcon} aria-hidden />
                      </div>
                    </foreignObject>
                    <text
                      x={x}
                      y={labelY}
                      textAnchor="middle"
                      fill={colors.text.primary}
                      fontSize={10}
                      fontWeight={500}
                      style={{
                        pointerEvents: "none",
                        userSelect: "none",
                        textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                      }}
                    >
                      {obj.name}
                    </text>
                  </g>
                );
              }

              if (obj.type === "nebula") {
                const nFo = HEX_DRAW_R * 2.2;
                const nIcon = HEX_DRAW_R * 1.45;
                return (
                  <g key={`ov-${idx}`} style={{ pointerEvents: "none" }}>
                    <foreignObject
                      x={x - nFo / 2}
                      y={y - nFo / 2}
                      width={nFo}
                      height={nFo}
                      style={{ overflow: "visible", pointerEvents: "none" }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(195, 165, 245, 0.95)",
                          userSelect: "none",
                        }}
                      >
                        <WiSmog size={nIcon} aria-hidden />
                      </div>
                    </foreignObject>
                    <text
                      x={x}
                      y={labelY}
                      textAnchor="middle"
                      fill={colors.text.primary}
                      fontSize={10}
                      fontWeight={500}
                      style={{
                        pointerEvents: "none",
                        userSelect: "none",
                        textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                      }}
                    >
                      {obj.name}
                    </text>
                  </g>
                );
              }

              return null;
            })}

            {selectRouteArrow ? (
              <g pointerEvents="none" style={{ opacity: 0.95 }}>
                <path
                  d={selectRouteArrow.lineD}
                  fill="none"
                  stroke={colors.primary.main}
                  strokeWidth={2.35}
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                />
                <polygon
                  points={selectRouteArrow.arrowPoints}
                  fill={colors.primary.main}
                  stroke="none"
                />
              </g>
            ) : null}
          </svg>
        </div>
      </div>

      {createDraft != null && (
        <div
          role="dialog"
          aria-label="Новый объект"
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            left: "auto",
            zIndex: 2,
            padding: 12,
            borderRadius: 8,
            backgroundColor: colors.background.paper,
            boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
            border: `1px solid ${colors.translucent.active}`,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "min(360px, calc(100% - 24px))",
            maxWidth: 360,
            boxSizing: "border-box",
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary }}>
            Клетка {createDraft.cellNumber}{" "}
            <span style={{ fontWeight: 400, opacity: 0.75 }}>
              (q {createDraft.q}, r {createDraft.r})
            </span>
          </div>
          <TextField
            label="Название"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            autoFocus
            fullWidth
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", minWidth: 0 }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: formLabelColor, userSelect: "none" }}>
              Тип
            </span>
            <div
              role="group"
              aria-label="Тип объекта"
              style={{
                display: "flex",
                padding: 3,
                gap: 4,
                borderRadius: 10,
                border: `1px solid ${colors.border.main}`,
                backgroundColor: colors.background.default,
                boxSizing: "border-box",
              }}
            >
              {CREATE_TYPE_SEGMENTS.map(({ value, label }) => {
                const active = draftType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDraftType(value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      margin: 0,
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      font: "inherit",
                      fontSize: "0.875rem",
                      fontWeight: active ? 600 : 500,
                      background: active ? colors.primary.main : "transparent",
                      color: active ? colors.primary.contrastText : colors.text.primary,
                      transition:
                        "background-color 0.15s ease, color 0.15s ease, font-weight 0.15s ease",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          {!onCreateObject && (
            <div style={{ fontSize: 12, color: formLabelColor }}>Передайте onCreateObject, чтобы сохранять.</div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setCreateDraft(null)}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: `1px solid ${colors.translucent.active}`,
                background: "transparent",
                color: colors.text.primary,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Отмена
            </button>
            <button
              type="button"
              disabled={!draftName.trim() || !onCreateObject}
              onClick={submitCreate}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: "none",
                background: colors.primary.main,
                color: colors.primary.contrastText,
                cursor: draftName.trim() && onCreateObject ? "pointer" : "not-allowed",
                opacity: draftName.trim() && onCreateObject ? 1 : 0.45,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Добавить
            </button>
          </div>
        </div>
      )}

      {inspectorObject != null && inspectorCell !== null && (
        <div
          role="dialog"
          aria-label="Объект на карте"
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            zIndex: 4,
            width: "min(340px, calc(100% - 24px))",
            maxWidth: "calc(100% - 24px)",
            boxSizing: "border-box",
            padding: "14px 14px 16px",
            borderRadius: 12,
            backgroundColor: colors.background.paper,
            boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
            border: `1px solid ${colors.border.main}`,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 0,
                userSelect: "none",
              }}
              aria-hidden
            >
              {inspectorEditType === "planet" ? (
                <IoMdPlanet size={28} style={{ color: colors.primary.main, opacity: 0.95 }} />
              ) : inspectorEditType === "nebula" ? (
                <WiSmog size={28} style={{ color: "rgba(195, 165, 245, 0.95)" }} />
              ) : (
                <IoMdWarning size={24} style={{ color: "rgba(255, 200, 120, 0.92)" }} />
              )}
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 13,
                fontWeight: 600,
                color: colors.text.primary,
                lineHeight: 1.4,
                letterSpacing: "0.01em",
              }}
            >
              Клетка {inspectorCell}
              {cells[inspectorCell] ? (
                <span style={{ fontWeight: 500, opacity: 0.72 }}>
                  {` · q ${cells[inspectorCell].q}, r ${cells[inspectorCell].r}`}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Закрыть"
              onClick={() => setInspectorCell(null)}
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                padding: 0,
                border: "none",
                borderRadius: 8,
                background: colors.translucent.main,
                color: colors.text.primary,
                cursor: "pointer",
                lineHeight: 0,
              }}
            >
              <RxCross1 size={15} aria-hidden />
            </button>
          </div>

          <TextField
            label="Название"
            value={inspectorEditName}
            onChange={(e) => setInspectorEditName(e.target.value)}
            fullWidth
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", minWidth: 0 }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: formLabelColor, userSelect: "none" }}>
              Тип
            </span>
            <div
              role="group"
              aria-label="Тип объекта"
              aria-disabled={inspectorIsMain}
              style={{
                display: "flex",
                padding: 3,
                gap: 4,
                borderRadius: 10,
                border: `1px solid ${colors.border.main}`,
                backgroundColor: colors.background.default,
                boxSizing: "border-box",
                opacity: inspectorIsMain ? 0.62 : 1,
              }}
            >
              {CREATE_TYPE_SEGMENTS.map(({ value, label }) => {
                const active = inspectorEditType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    disabled={inspectorIsMain}
                    onClick={() => setInspectorEditType(value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      margin: 0,
                      border: "none",
                      borderRadius: 8,
                      cursor: inspectorIsMain ? "not-allowed" : "pointer",
                      font: "inherit",
                      fontSize: "0.875rem",
                      fontWeight: active ? 600 : 500,
                      background: active ? colors.primary.main : "transparent",
                      color: active ? colors.primary.contrastText : colors.text.primary,
                      transition:
                        "background-color 0.15s ease, color 0.15s ease, font-weight 0.15s ease",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {!onUpdateObject && (
              <div style={{ fontSize: 12, color: formLabelColor, lineHeight: 1.45 }}>
                Передайте onUpdateObject, чтобы сохранять правки.
              </div>
            )}

            {onUpdateObject ? (
              <button
                type="button"
                disabled={!inspectorCanSave}
                onClick={submitInspectorUpdate}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: colors.primary.main,
                  color: colors.primary.contrastText,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: inspectorCanSave ? "pointer" : "not-allowed",
                  opacity: inspectorCanSave ? 1 : 0.45,
                }}
              >
                Сохранить
              </button>
            ) : null}

            {onDeleteObject ? (
              <button
                type="button"
                disabled={inspectorIsMain}
                title={inspectorIsMain ? "Основной объект нельзя удалить" : undefined}
                onClick={() => {
                  if (inspectorIsMain) return;
                  onDeleteObject(inspectorCell);
                  setInspectorCell(null);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid rgb(211, 64, 64)",
                  background: "transparent",
                  color: "rgb(211, 64, 64)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: inspectorIsMain ? "not-allowed" : "pointer",
                  opacity: inspectorIsMain ? 0.45 : 1,
                }}
              >
                Удалить
              </button>
            ) : (
              <div style={{ fontSize: 10, opacity: 0.58, lineHeight: 1.35 }}>
                Чтобы удалять объекты, передайте onDeleteObject.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export interface HexMapPopupProps extends Omit<IPopupProps, 'children'> {
  mapProps: HexMapProps;
}

export const HexMapPopup = ({ open, onClose, mapProps }: HexMapPopupProps) => {
  return (
    <Popup variant="fullscreen" closeButton open={open} onClose={onClose}>
      <div style={{ position: 'absolute', top: 10, right: 10, height: '40px', width: '40px', zIndex: 1 }}>
        <IconButton color='action' style={{ height: '100%', width: '100%' }} onClick={onClose}>
          <RxCross1 size={18} />
        </IconButton>
      </div>
      <HexMap {...mapProps} />
    </Popup>
  );
};