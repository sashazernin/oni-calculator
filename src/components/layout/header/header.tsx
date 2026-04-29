import { useContext, useState } from "react";
import { ThemeContext } from "../../../providers/app-theme-provider";
import { FaRegMoon } from "react-icons/fa";
import { IconButton } from "../../icon-button/IconButton";
import { FaMoon } from "react-icons/fa";
import { DupeIcon } from "../../../icons";
import { DuplicantContext } from "../../../providers/duplicant-provider";
import { Link } from "react-router-dom";
import { LocalizationContext, supportedLanguages } from "../../../providers/localization-provider";
import { useTranslation } from "../../../hooks/useTranslation";
import { Select } from "../../select/Select";

export default function Header() {
  const { colors, toggleTheme } = useContext(ThemeContext);
  const { duplicants } = useContext(DuplicantContext);
  const [dupeLinkHover, setDupeLinkHover] = useState(false);
  const accent = colors.primary.main;
  const { language, setLanguage } = useContext(LocalizationContext);
  const { t } = useTranslation();

  return (
    <div
      style={{
        backgroundColor: colors.layout.background,
        padding: "12px 0",
        minWidth: 200,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
          gap: 16,
        }}
      >
        <Link
          to="/"
          aria-label={`${t("nav_home")}, ${t("app_title")}`}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            paddingRight: 16,
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "1.125rem",
            letterSpacing: "-0.03em",
            color: colors.text.primary,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {t("app_title")}
        </Link>
        <div style={{ flex: 1 }}></div>
        <Link
          to="/settings?tab=game"
          aria-label={t("aria_game_settings_duplicants", {
            count: duplicants.length,
          })}
          onMouseEnter={() => setDupeLinkHover(true)}
          onMouseLeave={() => setDupeLinkHover(false)}
          style={{
            boxSizing: 'border-box',
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            padding: "4px 8px",
            borderRadius: 10,
            color: colors.text.primary,
            textDecoration: "none",
            background: dupeLinkHover
              ? `color-mix(in srgb, ${accent} 20%, ${colors.background.paper})`
              : `color-mix(in srgb, ${accent} 11%, ${colors.background.paper})`,
            border: `1px solid color-mix(in srgb, ${accent} 36%, ${colors.border.main})`,
            transition: "background 0.15s ease, box-shadow 0.15s ease"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "50%",
              flexShrink: 0,
              background: `color-mix(in srgb, ${accent} 22%, ${colors.background.average})`,
              boxShadow: `inset 0 1px 0 color-mix(in srgb, ${accent} 42%, transparent)`,
            }}
          >
            <DupeIcon
              size={22}
              style={{
                color: accent,
                filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.4))",
              }}
            />
          </div>
          <span
            style={{
              fontVariantNumeric: "tabular-nums",
              fontWeight: 700,
              fontSize: "0.9375rem",
              lineHeight: 1,
              minWidth: "1.35rem",
              textAlign: "center",
            }}
          >
            {duplicants.length}
          </span>
        </Link>
        <div
          style={{
            width: 1,
            alignSelf: "stretch",
            flexShrink: 0,
            backgroundColor: colors.border.main,
          }}
        />
        <Select
          fieldBackground={colors.layout.background}
          style={{
            width: 60,
            alignSelf: "stretch",
            justifyContent: "center",
          }}
          hideLabelMargin
          label={t("lang_short_label")}
          value={language}
          items={supportedLanguages}
          onChange={(value) => setLanguage(value)}
        />
        <IconButton onClick={() => toggleTheme(colors.mode === 'dark' ? 'light' : 'dark')}>
          {colors.mode === 'dark' ? <FaMoon /> : <FaRegMoon />}
        </IconButton>
      </div>
    </div>
  )
}