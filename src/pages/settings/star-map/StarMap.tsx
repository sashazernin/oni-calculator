import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type SetStateAction,
} from "react";
import { IoMdWarning } from "react-icons/io";
import { PlanetoidIcon } from "../../../icons";
import { WiSmog } from "react-icons/wi";
import {
  HexMapPopup,
  type HexMapObjectItem,
  type HexMapObjectType,
} from "../../../components/hex-map/HexMap";
import { HEX_MAP_CELLS } from "../../../helpers/hex-map-geometry";
import { Button } from "../../../components/button/Button";
import Divider from "../../../components/divider/Devider";
import PageToolbar, { pageStatCardStyle } from "../../../components/page-toolbar/PageToolbar";
import { ThemeContext } from "../../../providers/app-theme-provider";
import { useTranslation } from "../../../hooks/useTranslation";
import StarMapObjectCard from "./star-map-object-card/StarMapObjectCard";
import StarMapObjectEdit from "./star-map-object-edit/StarMapObjectEdit";
import { useAppSettings } from "../../../providers/app-settings-provider";

const STAR_MAP_TYPE_ORDER: Record<HexMapObjectType, number> = {
  planet: 0,
  nebula: 1,
  wreck: 2,
};

type StarMapProps = {
  pageTitle?: string;
};

export default function StarMap({ pageTitle }: StarMapProps) {
  const { colors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editCellNumber, setEditCellNumber] = useState<number | null>(null);

  const { data, setStarMap } = useAppSettings();
  const objects = data.starMap;

  const setObjects = useCallback(
    (updater: SetStateAction<HexMapObjectItem[]>) => {
      const next = typeof updater === "function" ? updater(objects) : updater;
      setStarMap(next);
    },
    [objects, setStarMap]
  );

  const onCreateObject = useCallback((item: HexMapObjectItem) => {
    setObjects((prev) => {
      if (prev.some((o) => o.cellNumber === item.cellNumber)) return prev;
      return [...prev, item];
    });
  }, [setObjects]);

  const onDeleteObject = useCallback((cellNumber: number) => {
    setObjects((prev) => prev.filter((o) => o.cellNumber !== cellNumber));
  }, [setObjects]);

  const onUpdateObject = useCallback((item: HexMapObjectItem) => {
    setObjects((prev) => prev.map((o) => (o.cellNumber === item.cellNumber ? { ...item } : o)));
  }, [setObjects]);

  const { catalogSorted, planetCount, nebulaCount, wreckCount } = useMemo(() => {
    const p = objects.filter((o) => o.type === "planet");
    const n = objects.filter((o) => o.type === "nebula");
    const w = objects.filter((o) => o.type === "wreck");
    const sorted = [...objects].sort((a, b) => {
      if (Boolean(a.main) !== Boolean(b.main)) return a.main ? -1 : 1;
      if (a.type !== b.type) return STAR_MAP_TYPE_ORDER[a.type] - STAR_MAP_TYPE_ORDER[b.type];
      return a.name.localeCompare(b.name, "ru");
    });
    return {
      catalogSorted: sorted,
      planetCount: p.length,
      nebulaCount: n.length,
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

  const statCardStyle = pageStatCardStyle(colors);

  const catalogGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 160px), 1fr))",
    gap: 12,
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minHeight: 0,
        flex: 1,
      }}
    >
      <PageToolbar
        title={pageTitle ?? t("settings_tab_space_map")}
        actions={<Button onClick={() => setOpen(true)}>{t("star_map_open_editor")}</Button>}
      >
        <div style={statCardStyle}>
          <PlanetoidIcon size={26} style={{ color: colors.primary.main, flexShrink: 0, opacity: 0.95 }} />
          <span style={{ fontSize: 22, fontWeight: 700, color: colors.text.primary, lineHeight: 1.15 }}>
            {planetCount}
          </span>
        </div>
        <div style={statCardStyle}>
          <WiSmog size={28} style={{ color: "rgba(195, 165, 245, 0.95)", flexShrink: 0 }} aria-hidden />
          <span style={{ fontSize: 22, fontWeight: 700, color: colors.text.primary, lineHeight: 1.15 }}>
            {nebulaCount}
          </span>
        </div>
        <div style={statCardStyle}>
          <IoMdWarning size={24} style={{ color: "rgba(255, 200, 120, 0.92)", flexShrink: 0 }} aria-hidden />
          <span style={{ fontSize: 22, fontWeight: 700, color: colors.text.primary, lineHeight: 1.15 }}>
            {wreckCount}
          </span>
        </div>
      </PageToolbar>
      <Divider />

      <div
        className="catalog-list-scroll"
        style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
      >
        {catalogSorted.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, opacity: 0.68, lineHeight: 1.5 }}>
            {t("star_map_empty_catalog")}
          </p>
        ) : (
          <div style={catalogGridStyle}>
            {catalogSorted.map((o) => {
              const ax = HEX_MAP_CELLS[o.cellNumber];
              const cellLine = ax
                ? t("star_map_hex_coords", { q: ax.q, r: ax.r })
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
      </div>

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
