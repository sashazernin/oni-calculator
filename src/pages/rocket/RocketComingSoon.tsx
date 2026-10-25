import { useContext } from "react";
import Box from "../../components/box/box";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";

export default function RocketComingSoon() {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);
  const muted = `color-mix(in srgb, ${colors.text.primary} 62%, transparent)`;

  return (
    <Box
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
        padding: 24,
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0, maxWidth: 420, lineHeight: 1.5, color: muted, fontSize: 15 }}>
        {t("rocket_page_coming_soon")}
      </p>
    </Box>
  );
}
