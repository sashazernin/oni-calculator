import { useCallback, useContext, useEffect, useMemo, useState, type CSSProperties } from "react";
import { IoMdPlanet, IoMdWarning } from "react-icons/io";
import { cellNumberFromAxial, HexMapPopup, type HexMapObjectItem } from "../../../components/hex-map/HexMap";
import { HEX_MAP_CELLS } from "../../../components/hex-map/hex-map-geometry";
import { Button } from "../../../components/button/Button";
import Divider from "../../../components/divider/Devider";
import { ThemeContext } from "../../../providers/app-theme-provider";
import { useTranslation } from "../../../hooks/useTranslation";
import StarMapObjectCard from "./star-map-object-card/StarMapObjectCard";
import StarMapObjectEdit from "./star-map-object-edit/StarMapObjectEdit";

const STAR_MAP_OBJECTS_KEY = "oni-calculator.star-map.objects";

const initialObjects = (): HexMapObjectItem[] => {
  const planet = cellNumberFromAxial(0, 0);
  const out: HexMapObjectItem[] = [];
  if (planet != null) out.push({ cellNumber: planet, name: "Home planet", type: "planet", main: true });
  return out;
};

function readStoredStarMapObjects(): HexMapObjectItem[] {
  if (typeof window === "undefined") return initialObjects();
  try {
    const raw = window.localStorage.getItem(STAR_MAP_OBJECTS_KEY);
    if (!raw) return initialObjects();
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return initialObjects();
    const parsed: HexMapObjectItem[] = [];
    for (const x of data) {
      if (!x || typeof x !== "object") continue;
      const rec = x as Record<string, unknown>;
      const cellNumber = rec.cellNumber;
      const name = rec.name;
      const type = rec.type;
      if (typeof cellNumber !== "number" || !Number.isFinite(cellNumber)) continue;
      if (typeof name !== "string") continue;
      if (type !== "planet" && type !== "wreck") continue;
      parsed.push({
        cellNumber,
        name,
        type,
        main: typeof rec.main === "boolean" ? rec.main : undefined,
      });
    }
    return parsed.length > 0 ? parsed : initialObjects();
  } catch {
    return initialObjects();
  }
}

export default function StarMap() {
  const { colors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editCellNumber, setEditCellNumber] = useState<number | null>(null);

  const [objects, setObjects] = useState<HexMapObjectItem[]>(readStoredStarMapObjects);

  useEffect(() => {
    try {
      window.localStorage.setItem(STAR_MAP_OBJECTS_KEY, JSON.stringify(objects));
    } catch {
      /* quota / private mode */
    }
  }, [objects]);

  const onCreateObject = useCallback((item: HexMapObjectItem) => {
    setObjects((prev) => {
      if (prev.some((o) => o.cellNumber === item.cellNumber)) return prev;
      return [...prev, item];
    });
  }, []);

  const onDeleteObject = useCallback((cellNumber: number) => {
    setObjects((prev) => prev.filter((o) => o.cellNumber !== cellNumber));
  }, []);

  const onUpdateObject = useCallback((item: HexMapObjectItem) => {
    setObjects((prev) => prev.map((o) => (o.cellNumber === item.cellNumber ? { ...item } : o)));
  }, []);

  const { catalogSorted, planetCount, wreckCount } = useMemo(() => {
    const p = objects.filter((o) => o.type === "planet");
    const w = objects.filter((o) => o.type === "wreck");
    const sorted = [...objects].sort((a, b) => {
      if (Boolean(a.main) !== Boolean(b.main)) return a.main ? -1 : 1;
      if (a.type !== b.type) return a.type === "planet" ? -1 : 1;
      return a.name.localeCompare(b.name, "ru");
    });
    return {
      catalogSorted: sorted,
      planetCount: p.length,
      wreckCount: w.length,
    };
  }, [objects]);

  const editingItem =
    editCellNumber != null ? (objects.find((o) => o.cellNumber === editCellNumber) ?? undefined) : undefined;

  useEffect(() => {
    if (editCellNumber != null && !objects.some((o) => o.cellNumber === editCellNumber)) {
      setEditCellNumber(null);
    }
  }, [objects, editCellNumber]);

  const statCardStyle = (): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 12px",
    borderRadius: 12,
    border: `1px solid ${colors.border.main}`,
    backgroundColor: colors.background.paper,
    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
    minWidth: 0,
  });

  const catalogGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 160px), 1fr))",
    gap: 12,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div style={statCardStyle()}>
          <IoMdPlanet size={26} style={{ color: colors.primary.main, flexShrink: 0, opacity: 0.95 }} aria-hidden />
          <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: colors.text.primary, lineHeight: 1.15 }}>
              {planetCount}
            </span>
          </div>
        </div>
        <div style={statCardStyle()}>
          <IoMdWarning size={24} style={{ color: "rgba(255, 200, 120, 0.92)", flexShrink: 0 }} aria-hidden />
          <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: colors.text.primary, lineHeight: 1.15 }}>
              {wreckCount}
            </span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 8 }} />
        <Button onClick={() => setOpen(true)}>{t("star_map_open_editor")}</Button>
      </div>
      <Divider />

      {catalogSorted.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, opacity: 0.68, lineHeight: 1.5 }}>{t("star_map_empty_catalog")}</p>
      ) : (
        <div style={catalogGridStyle}>
          {catalogSorted.map((o) => {
            const ax = HEX_MAP_CELLS[o.cellNumber];
            const cellLine = ax
              ? t("star_map_cell_coords", { cell: o.cellNumber, q: ax.q, r: ax.r })
              : `Cell ${o.cellNumber}`;
            return (
              <StarMapObjectCard
                key={o.cellNumber}
                item={o}
                cellLine={cellLine}
                onEdit={() => setEditCellNumber(o.cellNumber)}
                onDelete={() => onDeleteObject(o.cellNumber)}
              />
            );
          })}
        </div>
      )}

      <StarMapObjectEdit
        open={editCellNumber != null && editingItem != null}
        item={editingItem}
        onClose={() => setEditCellNumber(null)}
        onSave={onUpdateObject}
      />

      <HexMapPopup
        open={open}
        onClose={() => setOpen(false)}
        mapProps={{
          objects: objects,
          onCreateObject: onCreateObject,
          onUpdateObject: onUpdateObject,
          onDeleteObject: onDeleteObject,
          minHeightPx: 280,
          mode: "edit",
        }}
      />
    </div>
  );
}
