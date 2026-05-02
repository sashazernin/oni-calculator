export const HEX_MAP_CUBE_RADIUS = 11;
export const HEX_PIXEL_R = 14;
export const HEX_DRAW_SCALE = 0.88;
export const HEX_DRAW_R = HEX_PIXEL_R * HEX_DRAW_SCALE;

export interface Axial {
  readonly q: number;
  readonly r: number;
}

/** Соседи в аксиальных (q,r) для плоских сверху гексов. */
export const AXIAL_NEIGHBOR_DR: readonly Axial[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function axialKey(q: number, r: number): string {
  return `${q},${r}`;
}

export function hexDisk(radius: number): Axial[] {
  const out: Axial[] = [];
  for (let q = -radius; q <= radius; q++) {
    const rLow = Math.max(-radius, -radius - q);
    const rHigh = Math.min(radius, radius - q);
    for (let r = rLow; r <= rHigh; r++) {
      out.push({ q, r });
    }
  }
  return out;
}

export const HEX_MAP_CELLS = hexDisk(HEX_MAP_CUBE_RADIUS);

export const AXIAL_TO_CELL_INDEX = new Map<string, number>(
  HEX_MAP_CELLS.map((c, i) => [axialKey(c.q, c.r), i])
);

/** Номер ячейки (как при клике в консоль) для (q,r) на текущей карте. */
export function cellNumberFromAxial(q: number, r: number): number | undefined {
  return AXIAL_TO_CELL_INDEX.get(axialKey(q, r));
}

export function axialToPixelFlat(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
}

export function flatTopHexCorners(cx: number, cy: number, size: number): string {
  const parts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 6 + (Math.PI / 3) * i;
    const vx = cx + size * Math.cos(angle);
    const vy = cy + size * Math.sin(angle);
    parts.push(i === 0 ? `${vx},${vy}` : `L${vx},${vy}`);
  }
  return `M ${parts.join(" ")} Z`;
}

const HEX_VIEW_PAD = 24;

export function computeHexMapViewBox(): { vbX: number; vbY: number; vbW: number; vbH: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const { q, r } of HEX_MAP_CELLS) {
    const { x, y } = axialToPixelFlat(q, r, HEX_PIXEL_R);
    minX = Math.min(minX, x - HEX_DRAW_R);
    maxX = Math.max(maxX, x + HEX_DRAW_R);
    minY = Math.min(minY, y - HEX_DRAW_R);
    maxY = Math.max(maxY, y + HEX_DRAW_R);
  }
  return {
    vbX: minX - HEX_VIEW_PAD,
    vbY: minY - HEX_VIEW_PAD,
    vbW: maxX - minX + HEX_VIEW_PAD * 2,
    vbH: maxY - minY + HEX_VIEW_PAD * 2,
  };
}

export const HEX_MAP_VIEW_BOX = computeHexMapViewBox();
