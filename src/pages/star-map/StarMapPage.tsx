import { useContext } from "react";
import Box from "../../components/box/box";
import StarMap from "../settings/star-map/StarMap";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppSettings } from "../../providers/app-settings-provider";
import {
  PAGE_TITLE_FONT_SIZE,
  PAGE_TOOLBAR_MIN_HEIGHT_PX,
} from "../../components/page-toolbar/PageToolbar";

export default function StarMapPage() {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);
  const { activePlanetoid, planetoidRestrictionsActive } = useAppSettings();
  const isClassic =
    planetoidRestrictionsActive && activePlanetoid?.gameType === "classic";
  const muted = `color-mix(in srgb, ${colors.text.primary} 62%, transparent)`;

  return (
    <Box
      style={{
        height: "100%",
        width: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: "16px 20px",
        ["--page-inline-padding" as string]: "20px",
      }}
    >
      {isClassic ? (
        <>
          <h2
            style={{
              margin: "0 0 16px",
              fontFamily: "var(--font-heading)",
              fontSize: PAGE_TITLE_FONT_SIZE,
              fontWeight: 700,
              color: colors.text.primary,
              minHeight: PAGE_TOOLBAR_MIN_HEIGHT_PX,
              display: "flex",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            {t("nav_star_map")}
          </h2>
          <p style={{ margin: 0, color: muted, lineHeight: 1.5, fontSize: 14 }}>
            {t("star_map_classic_unavailable")}
          </p>
        </>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <StarMap pageTitle={t("nav_star_map")} />
        </div>
      )}
    </Box>
  );
}
