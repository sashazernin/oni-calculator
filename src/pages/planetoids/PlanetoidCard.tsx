import { useContext, type CSSProperties } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import type { Planetoid } from "../../types/planetoid-types";
import spacedOutLogo from "../../assets/Spaced_Out_Logo.webp";
import { DupeIcon, PlanetoidIcon } from "../../icons";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";
import { Button } from "../../components/button/Button";
import Chip from "../../components/chip/chip";
import { IoRocketSharp } from "react-icons/io5";
import { IconButton } from "../../components/icon-button/IconButton";
import Confirmation from "../../components/confirmation/confirmation";
import "./PlanetoidCard.css";

const DANGER = "rgb(211, 64, 64)";

const deleteBtnOverrides = {
  main: "transparent",
  contrastText: DANGER,
  hover: `color-mix(in srgb, ${DANGER} 16%, transparent)`,
  active: `color-mix(in srgb, ${DANGER} 24%, transparent)`,
  ripple: `color-mix(in srgb, ${DANGER} 40%, transparent)`,
};

type PlanetoidCardProps = {
  planetoid: Planetoid;
  isActive: boolean;
  canDelete: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function PlanetoidCard({
  planetoid,
  isActive,
  canDelete,
  onActivate,
  onEdit,
  onDelete,
}: PlanetoidCardProps) {
  const { colors } = useContext(ThemeContext);
  const { t } = useTranslation();

  const dupeCount = planetoid.duplicants.length;
  const rocketCount = planetoid.rockets.rockets.length;

  const statIconBox: CSSProperties = {
    width: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const deleteBtnStyle = {
    "--icon-focus": `color-mix(in srgb, ${DANGER} 48%, transparent)`,
  } as CSSProperties;

  const root: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
    minWidth: 0,
    minHeight: 200,
    padding: "14px 12px",
    borderRadius: 10,
    border: `1px solid ${isActive ? colors.primary.main : colors.border.main}`,
    background: isActive
      ? `color-mix(in srgb, ${colors.primary.main} 8%, ${colors.background.paper})`
      : colors.background.paper,
    boxSizing: "border-box",
    borderTop: `3px solid ${colors.primary.main}`,
    width: "100%",
    height: "100%",
    boxShadow: isActive
      ? `0 0 0 1px color-mix(in srgb, ${colors.primary.main} 35%, transparent)`
      : undefined,
  };

  return (
    <div className="planetoid-card" style={root}>
      {planetoid.gameType === "spaced-out" ? (
        <img
          className="planetoid-card__expansion-logo"
          src={spacedOutLogo}
          alt={t("planetoid_type_spaced_out")}
          draggable={false}
        />
      ) : null}
      <div className="planetoid-card__actions">
        {canDelete ? (
          <Confirmation message={t("planetoid_delete_confirm", { name: planetoid.name })}>
            <IconButton
              type="button"
              className="planetoid-card__action-btn"
              onClick={onDelete}
              colorOverrides={deleteBtnOverrides}
              aria-label={t("aria_delete_planetoid")}
              style={deleteBtnStyle}
            >
              <LuTrash2 aria-hidden />
            </IconButton>
          </Confirmation>
        ) : (
          <IconButton
            type="button"
            className="planetoid-card__action-btn"
            disabled
            colorOverrides={deleteBtnOverrides}
            aria-label={t("aria_delete_planetoid")}
            style={{ ...deleteBtnStyle, opacity: 0.4 }}
          >
            <LuTrash2 aria-hidden />
          </IconButton>
        )}
        <IconButton
          type="button"
          className="planetoid-card__action-btn"
          onClick={onEdit}
          aria-label={t("aria_edit_planetoid")}
        >
          <LuPencil aria-hidden />
        </IconButton>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 44,
        }}
      >
        <PlanetoidIcon
          size={40}
          style={{
            color: isActive
              ? colors.primary.main
              : `color-mix(in srgb, ${colors.text.primary} 42%, ${colors.background.paper})`,
            opacity: isActive ? 0.95 : 0.85,
          }}
        />
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: "1.125rem",
          lineHeight: 1.2,
          color: colors.text.primary,
          textAlign: "center",
          wordBreak: "break-word",
        }}
      >
        {planetoid.name}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
        }}
      >
        <Chip
          dense
          aria-label={t("planetoid_duplicants_summary", { count: dupeCount })}
        >
          <span style={statIconBox}>
            <DupeIcon size={20} style={{ color: colors.primary.main }} />
          </span>
          <span style={{ fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1, color: colors.text.primary }}>
            {dupeCount}
          </span>
        </Chip>
        <Chip dense aria-label={t("planetoid_rockets_summary", { count: rocketCount })}>
          <span style={statIconBox}>
            <IoRocketSharp size={20} style={{ color: colors.primary.main }} aria-hidden />
          </span>
          <span style={{ fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1, color: colors.text.primary }}>
            {rocketCount}
          </span>
        </Chip>
      </div>
      <Button
        type="button"
        variant={isActive ? "translucent" : "primary"}
        disabled={isActive}
        onClick={onActivate}
        style={{ marginTop: "auto", width: "100%", minHeight: 40, fontSize: "0.8125rem" }}
      >
        {isActive ? t("planetoid_current") : t("planetoid_select")}
      </Button>
    </div>
  );
}
