import { useContext } from "react";
import { Link } from "react-router-dom";
import Box from "../../components/box/box";
import { useTranslation } from "../../hooks/useTranslation";
import { ThemeContext } from "../../providers/app-theme-provider";

const CONTACT_EMAIL = "sashazernin1@gmail.com";

export default function Home() {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);

  const accentLinkStyle = {
    color: colors.primary.main,
    fontWeight: 600,
    textDecorationSkipInk: "auto" as const,
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignSelf: "stretch",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <Box
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          minHeight: 0,
          width: "100%",
          boxSizing: "border-box",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.25rem, 2.2vw, 1.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1.25,
            color: colors.text.primary,
          }}
        >
          {t("app_title")}
        </h2>
        <p>{t("page_home_intro")}</p>
        <p>
          {t("page_home_food_before")}
          <Link to="/food" style={accentLinkStyle}>
            {t("page_home_food_link")}
          </Link>
          {t("page_home_food_after")}
        </p>
        <p>
          {t("page_home_rocket_before")}
          <Link to="/rocket" style={accentLinkStyle}>
            {t("page_home_rocket_link")}
          </Link>
          {t("page_home_rocket_after")}
        </p>
        <p>
          {t("page_home_star_map_before")}
          <Link to="/star-map" style={accentLinkStyle}>
            {t("page_home_star_map_link")}
          </Link>
          {t("page_home_star_map_after")}
        </p>
        <p>
          {t("page_home_colony_before")}
          <Link to="/colony" style={accentLinkStyle}>
            {t("page_home_colony_link")}
          </Link>
          {t("page_home_colony_after")}
        </p>
        <p>
          {t("page_home_planetoids_before")}
          <Link to="/planetoids" style={accentLinkStyle}>
            {t("page_home_planetoids_link")}
          </Link>
          {t("page_home_planetoids_after")}
        </p>
        <p>{t("page_home_save_explanation")}</p>
        <p>
          {t("page_home_contact_prefix")}{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} style={accentLinkStyle}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <p
          style={{
            marginTop: "auto",
            paddingTop: 8,
            fontSize: "0.875rem",
            borderTop: `1px solid ${colors.border.main}`,
          }}
        >
          <Link to="/privacy" style={accentLinkStyle}>
            {t("privacy_title")}
          </Link>
        </p>
      </Box>
    </div>
  );
}
