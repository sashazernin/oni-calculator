import { useContext, useRef, useState } from "react";
import { ThemeContext } from "../../../providers/app-theme-provider";
import { FaRegMoon } from "react-icons/fa";
import { IconButton } from "../../icon-button/IconButton";
import { FaMoon } from "react-icons/fa";
import { DupeIcon } from "../../../icons";
import { DuplicantContext } from "../../../providers/duplicant-provider";
import { Link } from "react-router-dom";
import { IoMenuOutline } from "react-icons/io5";
import {
  Languages,
  LocalizationContext,
  type ISupportedLanguages,
} from "../../../providers/localization-provider";
import { useTranslation } from "../../../hooks/useTranslation";
import { Select } from "../../select/Select";
import { useMobileNav } from "../mobile-nav-context";
import style from "./header.module.css";

export default function Header() {
  const { colors, toggleTheme } = useContext(ThemeContext);
  const { duplicants } = useContext(DuplicantContext);
  const [dupeLinkHover, setDupeLinkHover] = useState(false);
  const accent = colors.primary.main;
  const { language, setLanguage } = useContext(LocalizationContext);
  const { t } = useTranslation();
  const { isMobile, drawerOpen, toggleDrawer } = useMobileNav();

  const toolbarRef = useRef<HTMLDivElement>(null);
  const [compactLevel, setCompactLevel] = useState(0);


  const hideTheme = compactLevel >= 1;
  const hideLang = compactLevel >= 2;
  const hideDupe = compactLevel >= 3;

  return (
    <div
      style={{
        backgroundColor: colors.layout.background,
        padding: "12px 0",
        minWidth: 0,
      }}
    >
      <div
        ref={toolbarRef}
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "auto minmax(0, 1fr) max-content"
            : "minmax(0, 1fr) max-content",
          alignItems: "center",
          columnGap: isMobile ? 14 : 12,
          padding: "0 20px",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {isMobile ? (
          <div
            style={{
              width: 40,
              minWidth: 40,
              maxWidth: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              justifySelf: "start",
              overflow: "hidden",
            }}
          >
            <IconButton
              type="button"
              color="action"
              aria-label={
                drawerOpen ? t("nav_close_menu") : t("nav_open_menu")
              }
              onClick={toggleDrawer}
            >
              <IoMenuOutline style={{ fontSize: "1.35rem" }} aria-hidden />
            </IconButton>
          </div>
        ) : null}
        <div
          style={{
            minWidth: 0,
            maxWidth: "100%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Link
            to="/"
            aria-label={`${t("nav_home")}, ${t("app_title")}`}
            style={{
              minWidth: 0,
              maxWidth: "100%",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "clamp(0.95rem, 2.5vw, 1.125rem)",
              letterSpacing: "-0.03em",
              color: colors.text.primary,
              textDecoration: "none",
            }}
          >
            {t("app_title")}
          </Link>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            gap: 10,
            minWidth: 0,
            width: "max-content",
            maxWidth: "100%",
            justifySelf: "end",
          }}
        >
          <Link
            to="/settings?tab=game"
            aria-label={t("aria_game_settings_duplicants", {
              count: duplicants.length,
            })}
            className={style["dupe-hide"]}
            onMouseEnter={() => setDupeLinkHover(true)}
            onMouseLeave={() => setDupeLinkHover(false)}
            style={{
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "center",
              gap: 8,
              padding: "4px 8px",
              borderRadius: 10,
              color: colors.text.primary,
              textDecoration: "none",
              flexShrink: 0,
              background: dupeLinkHover
                ? `color-mix(in srgb, ${accent} 20%, ${colors.background.paper})`
                : `color-mix(in srgb, ${accent} 11%, ${colors.background.paper})`,
              border: `1px solid color-mix(in srgb, ${accent} 36%, ${colors.border.main})`,
              transition: "background 0.15s ease, box-shadow 0.15s ease",
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
            className={style["dupe-hide"]}
            style={{
              width: 1,
              alignSelf: "stretch",
              flexShrink: 0,
              backgroundColor: colors.border.main,
            }}
          />
          <Select
            className={style["lang-hide"]}
            fieldBackground={colors.layout.background}
            style={{
              width: 100,
              flexShrink: 0,
              alignSelf: "center",
              justifyContent: "center",
            }}
            hideLabelMargin
            label={t("lang_short_label")}
            value={Languages[language]}
            getLabel={(item) => item.label}
            items={
              Object.values(Languages) as { label: string; value: string }[]
            }
            onChange={(value) =>
              setLanguage(value.value as ISupportedLanguages)
            }
          />
          <IconButton
            className={style["theme-hide"]}
            type="button"
            style={{ flexShrink: 0, alignSelf: "center" }}
            onClick={() =>
              toggleTheme(colors.mode === "dark" ? "light" : "dark")
            }
            aria-label={
              colors.mode === "dark" ? t("theme_light") : t("theme_dark")
            }
          >
            {colors.mode === "dark" ? <FaMoon /> : <FaRegMoon />}
          </IconButton>
        </div>
      </div>
    </div>
  );
}
