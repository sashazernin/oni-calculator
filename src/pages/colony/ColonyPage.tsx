import { useContext } from "react";
import Box from "../../components/box/box";
import ColonySettings from "../settings/colony/ColonySettings";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";

export default function ColonyPage() {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);

  return (
    <Box
      style={{
        flex: 1,
        width: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflow: "hidden",
        padding: "16px 20px",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.15rem, 2vw, 1.35rem)",
          fontWeight: 700,
          color: colors.text.primary,
          flexShrink: 0,
        }}
      >
        {t("nav_colony")}
      </h2>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <ColonySettings />
      </div>
    </Box>
  );
}
