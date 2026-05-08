import { useContext, type CSSProperties } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import { IconButton } from "../../../../components/icon-button/IconButton";
import { ThemeContext } from "../../../../providers/app-theme-provider";
import { DupeIcon } from "../../../../icons";
import type { IDuplicate } from "../../../../types/game-data-types";
import "./DupeCard.css";
import { GiStomach } from "react-icons/gi";
import Confirmation from "../../../../components/confirmation/confirmation";
import { useTranslation } from "../../../../hooks/useTranslation";

const DANGER = "rgb(211, 64, 64)";

const deleteBtnOverrides = {
  main: "transparent",
  contrastText: DANGER,
  hover: `color-mix(in srgb, ${DANGER} 16%, transparent)`,
  active: `color-mix(in srgb, ${DANGER} 24%, transparent)`,
  ripple: `color-mix(in srgb, ${DANGER} 40%, transparent)`,
};

type DupeCardProps = {
  duplicate: IDuplicate;
  onEdit: () => void;
  onDelete: () => void;
};

export default function DupeCard({ duplicate, onEdit, onDelete }: DupeCardProps) {
  const { colors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const muted = `color-mix(in srgb, ${colors.text.primary} 70%, ${colors.background.paper})`;

  const root: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
    minWidth: 0,
    minHeight: 0,
    padding: "12px 10px",
    borderRadius: 10,
    border: `1px solid ${colors.border.main}`,
    background: colors.background.paper,
    boxSizing: "border-box",
  };

  return (
    <div className="dupe-card" style={root}>
      <div className="dupe-card__actions">
        <Confirmation
          message={t("delete_duplicant_confirm", { name: duplicate.name })}
        >
          <IconButton
            type="button"
            className="dupe-card__action-btn"
            onClick={onDelete}
            colorOverrides={deleteBtnOverrides}
            aria-label={t("aria_delete_duplicant")}
            style={
              {
                "--icon-focus": `color-mix(in srgb, ${DANGER} 48%, transparent)`,
              } as CSSProperties
            }
          >
            <LuTrash2 aria-hidden />
          </IconButton>
        </Confirmation>
        <IconButton
          type="button"
          className="dupe-card__action-btn"
          onClick={onEdit}
          aria-label={t("aria_edit_duplicant")}
        >
          <LuPencil aria-hidden />
        </IconButton>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 40,
        }}
      >
        <DupeIcon size={32} style={{ color: colors.primary.main }} />
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
        {duplicate.name}
      </div>
      {duplicate.gluttonous && <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "0.7rem",
          lineHeight: 1.2,
          color: muted,
          textAlign: "center",
        }}
      >
        <div><GiStomach style={{ width: 16, height: 16 }} /></div>
        <div style={{ textAlign: "left" }}>{t("dupe_trait_bottomless")}</div>
      </div>}
    </div>
  );
}
