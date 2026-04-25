import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "../src/icons.tsx"), "utf8");
const m = src.match(/path d="([^"]+)"/);
if (!m) throw new Error("path not found");
const d = m[1];

const { svgPathBbox } = await import("svg-path-bbox");
const [lx, ly, ux, uy] = svgPathBbox(d);

// g: translate(0,126) scale(0.1,-0.1)  →  (x',y') = (0.1*x, 126 - 0.1*y)
const minX = 0.1 * lx;
const maxX = 0.1 * ux;
const minY = 126 - 0.1 * uy;
const maxY = 126 - 0.1 * ly;

const pad = 0.75;
const vbX = minX - pad;
const vbY = minY - pad;
const vbW = maxX - minX + 2 * pad;
const vbH = maxY - minY + 2 * pad;

console.log(JSON.stringify({ local: [lx, ly, ux, uy], minX, maxX, minY, maxY, viewBox: `${vbX} ${vbY} ${vbW} ${vbH}` }, null, 2));
