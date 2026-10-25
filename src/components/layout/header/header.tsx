import { useContext } from "react";
import { ThemeContext } from "../../../providers/app-theme-provider";
import { FaRegMoon } from "react-icons/fa";
import { IconButton } from "../../icon-button/IconButton";
import { FaMoon } from "react-icons/fa";
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
  const { language, setLanguage } = useContext(LocalizationContext);
  const { t } = useTranslation();
  const { isMobile, drawerOpen, toggleDrawer } = useMobileNav();

  return (
    <div
      style={{
        backgroundColor: colors.layout.background,
        padding: "12px 0",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "auto minmax(0, 1fr) max-content"
            : "minmax(0, 1fr) max-content",
          alignItems: "center",
          columnGap: isMobile ? 14 : 12,
          padding: "0 20px",
          minWidth: 0,
          overflow: "visible",
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
            alignItems: "center",
            gap: 10,
            minWidth: 0,
            width: "max-content",
            maxWidth: "100%",
            justifySelf: "end",
            overflow: "visible",
          }}
        >
          <Select
            className={style["lang-hide"]}
            fieldBackground={colors.layout.background}
            style={{
              width: 100,
              flexShrink: 0,
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
            style={{ flexShrink: 0 }}
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
