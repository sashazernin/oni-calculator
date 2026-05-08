import { useCallback, useContext, useEffect, useState } from "react";
import { Popup } from "../../../../components/popup/Popup";
import { Button } from "../../../../components/button/Button";
import { TextField } from "../../../../components/text-field/TextField";
import type { HexMapObjectItem, HexMapObjectType } from "../../../../components/hex-map/HexMap";
import { HEX_MAP_CELLS } from "../../../../helpers/hex-map-geometry";
import type { TranslationKey } from "../../../../i18n/translations";
import { ThemeContext } from "../../../../providers/app-theme-provider";
import { useTranslation } from "../../../../hooks/useTranslation";

const TYPE_VALUES: HexMapObjectType[] = ["planet", "nebula", "wreck"];

const TYPE_LABEL_KEYS: Record<HexMapObjectType, TranslationKey> = {
  planet: "star_map_type_planet",
  nebula: "star_map_type_nebula",
  wreck: "star_map_type_wreck",
};

function defaultDraft(item?: HexMapObjectItem): { name: string; type: HexMapObjectType } {
  return {
    name: item?.name ?? "",
    type: item?.type ?? "planet",
  };
}

type StarMapObjectEditProps = {
  open: boolean;
  onClose: () => void;
  item?: HexMapObjectItem;
  onSave: (item: HexMapObjectItem) => void;
};

export default function StarMapObjectEdit({ open, onClose, item, onSave }: StarMapObjectEditProps) {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);
  const [draft, setDraft] = useState(defaultDraft);
  const [nameError, setNameError] = useState<string | undefined>();
  const isMain = Boolean(item?.main);

  useEffect(() => {
    if (open && item) {
      setDraft(defaultDraft(item));
      setNameError(undefined);
    }
  }, [open, item]);

  const formLabelColor = `color-mix(in srgb, ${colors.text.primary} 72%, ${colors.background.default})`;

  const handleClose = useCallback(() => {
    setNameError(undefined);
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (!item) return;
    const name = draft.name.trim();
    if (!name) {
      setNameError(t("validation_name_required"));
      return;
    }
    const type = isMain ? ("planet" as const) : draft.type;
    const out: HexMapObjectItem = {
      cellNumber: item.cellNumber,
      name,
      type,
    };
    if (type === "planet" && item.main) out.main = true;
    onSave(out);
    handleClose();
  }, [item, draft.name, draft.type, isMain, onSave, handleClose, t]);

  const cellMeta = item ? HEX_MAP_CELLS[item.cellNumber] : undefined;
  const cellLine =
    item && cellMeta
      ? t("star_map_cell_coords", { cell: item.cellNumber, q: cellMeta.q, r: cellMeta.r })
      : item
        ? `Cell ${item.cellNumber}`
        : "";

  return (
    <Popup
      open={open}
      onClose={handleClose}
      title={t("star_map_edit_object")}
      variant="fit-content"
      bottom={
        <>
          <Button onClick={handleClose} style={{ textTransform: "none" }}>
            {t("button_cancel")}
          </Button>
          <Button onClick={handleSave} style={{ textTransform: "none" }}>
            {t("button_save")}
          </Button>
        </>
      }
    >
      <div
        style={{
          padding: 16,
          minWidth: 360,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.4 }}>{cellLine}</div>
        <TextField
          label={t("dupe_name_label")}
          value={draft.name}
          error={nameError}
          onChange={(e) => {
            setNameError(undefined);
            setDraft((d) => ({ ...d, name: e.target.value }));
          }}
          fullWidth
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", minWidth: 0 }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: formLabelColor, userSelect: "none" }}>
            {t("label_type")}
          </span>
          <div
            role="group"
            aria-label={t("label_type")}
            style={{
              display: "flex",
              padding: 3,
              gap: 4,
              borderRadius: 10,
              border: `1px solid ${colors.border.main}`,
              backgroundColor: colors.background.default,
              boxSizing: "border-box",
              opacity: isMain ? 0.55 : 1,
            }}
          >
            {TYPE_VALUES.map((value) => {
              const active = draft.type === value;
              const label = t(TYPE_LABEL_KEYS[value]);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  disabled={isMain}
                  onClick={() => setDraft((d) => ({ ...d, type: value }))}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    margin: 0,
                    border: "none",
                    borderRadius: 8,
                    cursor: isMain ? "not-allowed" : "pointer",
                    font: "inherit",
                    fontSize: "0.8125rem",
                    fontWeight: active ? 600 : 500,
                    background: active ? colors.primary.main : "transparent",
                    color: active ? colors.primary.contrastText : colors.text.primary,
                    transition: "background-color 0.15s ease, color 0.15s ease, font-weight 0.15s ease",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Popup>
  );
}
