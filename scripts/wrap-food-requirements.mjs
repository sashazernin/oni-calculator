import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "src/game-data/food.ts");
let src = fs.readFileSync(file, "utf8");

src = src.replace(/\balternativeRequirements:\s*\[[\s\S]*?\],\s*\n/g, "");

const marker = "requirements: [";
let out = "";
let i = 0;

while (i < src.length) {
  const idx = src.indexOf(marker, i);
  if (idx === -1) {
    out += src.slice(i);
    break;
  }
  out += src.slice(i, idx + marker.length);
  let pos = idx + marker.length;

  let depth = 1;
  const innerStart = pos;
  while (pos < src.length && depth > 0) {
    const ch = src[pos];
    if (ch === "[") depth++;
    if (ch === "]") depth--;
    pos++;
  }
  const inner = src.slice(innerStart, pos - 1);
  const trimmed = inner.replace(/^\s+/, "");
  if (trimmed.startsWith("[")) {
    out += inner;
    out += "]";
  } else {
    out += "\n    [";
    out += inner;
    out += "\n    ]";
    out += "]";
  }
  i = pos;
}

fs.writeFileSync(file, out);
