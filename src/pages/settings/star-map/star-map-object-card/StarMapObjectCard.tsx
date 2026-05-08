import { useContext, type CSSProperties } from "react";
import { IoMdPlanet, IoMdWarning } from "react-icons/io";
import { WiSmog } from "react-icons/wi";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import { IconButton } from "../../../../components/icon-button/IconButton";
import Confirmation from "../../../../components/confirmation/confirmation";
import type { HexMapObjectItem } from "../../../../components/hex-map/HexMap";
import { ThemeContext } from "../../../../providers/app-theme-provider";
import { useTranslation } from "../../../../hooks/useTranslation";
import "./StarMapObjectCard.css";

const DANGER = "rgb(211, 64, 64)";

const deleteBtnOverrides = {
  main: "transparent",
  contrastText: DANGER,
  hover: `color-mix(in srgb, ${DANGER} 16%, transparent)`,
  active: `color-mix(in srgb, ${DANGER} 24%, transparent)`,
  ripple: `color-mix(in srgb, ${DANGER} 40%, transparent)`,
};

type StarMapObjectCardProps = {
  item: HexMapObjectItem;
  cellLine: string;
  onEdit: () => void;
  onDelete: () => void;
};

export default function StarMapObjectCard({ item, cellLine, onEdit, onDelete }: StarMapObjectCardProps) {
  const { colors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const isMain = Boolean(item.main);
  const muted = `color-mix(in srgb, ${colors.text.primary} 70%, ${colors.background.paper})`;

  const root: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 8,
    minWidth: 0,
    minHeight: 0,
    padding: "12px 10px",
    borderRadius: 10,
    border: `1px solid ${colors.border.main}`,
    background: colors.background.paper,
    boxSizing: "border-box",
    ...(item.type === "planet"
      ? { borderTop: `3px solid ${colors.primary.main}` }
      : item.type === "nebula"
        ? { borderTop: `3px solid rgba(186, 150, 235, 0.85)` }
        : { borderTop: `3px solid rgba(255, 200, 120, 0.75)` }),
  };

  const deleteBtnStyle = {
    "--icon-focus": `color-mix(in srgb, ${DANGER} 48%, transparent)`,
  } as CSSProperties;

  return (
    <div className="star-map-object-card" style={root}>
      <div className="star-map-object-card__actions">
        {isMain ? (
          <IconButton
            type="button"
            className="star-map-object-card__action-btn"
            disabled
            colorOverrides={deleteBtnOverrides}
            aria-label={t("aria_star_map_delete_object")}
            style={{ ...deleteBtnStyle, opacity: 0.4 }}
          >
            <LuTrash2 aria-hidden />
          </IconButton>
        ) : (
          <Confirmation message={t("star_map_delete_object_confirm", { name: item.name })}>
            <IconButton
              type="button"
              className="star-map-object-card__action-btn"
              onClick={onDelete}
              colorOverrides={deleteBtnOverrides}
              aria-label={t("aria_star_map_delete_object")}
              style={deleteBtnStyle}
            >
              <LuTrash2 aria-hidden />
            </IconButton>
          </Confirmation>
        )}
        <IconButton
          type="button"
          className="star-map-object-card__action-btn"
          onClick={onEdit}
          aria-label={t("aria_star_map_edit_object")}
        >
          <LuPencil aria-hidden />
        </IconButton>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 36,
          paddingTop: 4,
        }}
      >
        {item.type === "planet" ? (
          <IoMdPlanet size={32} style={{ color: colors.primary.main, opacity: 0.95 }} aria-hidden />
        ) : item.type === "nebula" ? (
          <WiSmog size={32} style={{ color: "rgba(195, 165, 245, 0.95)" }} aria-hidden />
        ) : (
          <IoMdWarning size={30} style={{ color: "rgba(255, 200, 120, 0.92)" }} aria-hidden />
        )}
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: "0.8125rem",
          lineHeight: 1.25,
          color: colors.text.primary,
          textAlign: "center",
          wordBreak: "break-word",
        }}
      >
        {item.name}
      </div>
      <div style={{ fontSize: "0.7rem", lineHeight: 1.2, color: muted, textAlign: "center" }}>
        {item.type === "planet"
          ? t("star_map_type_planet")
          : item.type === "nebula"
            ? t("star_map_type_nebula")
            : t("star_map_type_wreck")}
        {isMain ? ` · ${t("star_map_main_short")}` : null}
      </div>
      <div style={{ fontSize: "0.65rem", lineHeight: 1.3, color: muted, textAlign: "center" }}>
        {cellLine}
      </div>
    </div>
  );
}
