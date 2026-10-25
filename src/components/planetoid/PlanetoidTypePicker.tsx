import {
  useCallback,
  useContext,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { PlanetoidGameType } from "../../types/planetoid-types";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";
import { PlanetoidIcon } from "../../icons";
import spacedOutLogo from "../../assets/Spaced_Out_Logo.webp";

type PlanetoidTypePickerProps = {
  /** Краткий заголовок над карточками (опционально). */
  title?: ReactNode;
  onPick: (gameType: PlanetoidGameType) => void;
};

export default function PlanetoidTypePicker({ title, onPick }: PlanetoidTypePickerProps) {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);
  const [hovered, setHovered] = useState<PlanetoidGameType | null>(null);

  const pick = useCallback(
    (gameType: PlanetoidGameType) => {
      onPick(gameType);
    },
    [onPick]
  );

  const muted = `color-mix(in srgb, ${colors.text.primary} 72%, transparent)`;
  const accent = colors.primary.main;

  const cardBase = (type: PlanetoidGameType): CSSProperties => {
    const isHover = hovered === type;
    return {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      minHeight: 200,
      padding: "20px 16px",
      borderRadius: 10,
      border: `1px solid ${isHover ? accent : colors.border.main}`,
      background: isHover
        ? `color-mix(in srgb, ${accent} 10%, ${colors.background.paper})`
        : colors.background.paper,
      borderTop: `3px solid ${accent}`,
      boxSizing: "border-box",
      cursor: "pointer",
      width: "100%",
      font: "inherit",
      color: colors.text.primary,
      textAlign: "center",
      transition: "border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease",
      boxShadow: isHover
        ? `0 0 0 1px color-mix(in srgb, ${accent} 28%, transparent)`
        : undefined,
    };
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        padding: "8px 0 24px",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          margin: 0,
          width: "100%",
          fontSize: 15,
          lineHeight: 1.5,
          color: muted,
          textAlign: "center",
        }}
      >
        {title ?? t("planetoid_pick_type_intro")}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: 16,
          width: "100%",
          alignItems: "stretch",
        }}
      >
        <button
          type="button"
          style={cardBase("classic")}
          onMouseEnter={() => setHovered("classic")}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered("classic")}
          onBlur={() => setHovered(null)}
          onClick={() => pick("classic")}
        >
          <PlanetoidIcon
            size={64}
            style={{
              color: accent,
              opacity: 0.95,
              filter: `drop-shadow(0 2px 6px color-mix(in srgb, ${accent} 45%, transparent))`,
            }}
          />
          <span style={{ fontWeight: 700, fontSize: "1.125rem", lineHeight: 1.25 }}>
            {t("planetoid_type_classic")}
          </span>
        </button>
        <button
          type="button"
          style={cardBase("spaced-out")}
          onMouseEnter={() => setHovered("spaced-out")}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered("spaced-out")}
          onBlur={() => setHovered(null)}
          onClick={() => pick("spaced-out")}
        >
          <img
            src={spacedOutLogo}
            alt=""
            draggable={false}
            style={{ width: "min(100%, 160px)", height: "auto", objectFit: "contain" }}
          />
          <span style={{ fontWeight: 700, fontSize: "1.125rem", lineHeight: 1.25 }}>
            {t("planetoid_type_spaced_out")}
          </span>
        </button>
      </div>
    </div>
  );
}
