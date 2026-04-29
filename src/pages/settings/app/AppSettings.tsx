import { useContext } from "react";
import { supportedThemes, ThemeContext } from "../../../providers/app-theme-provider";
import { Select } from "../../../components/select/Select";
import { Languages, LocalizationContext, supportedLanguages } from "../../../providers/localization-provider";
import { useTranslation } from "../../../hooks/useTranslation";
import type { TranslationKey } from "../../../i18n/translations";

export default function AppSettings() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, setLanguage } = useContext(LocalizationContext);
  const { t } = useTranslation();

  function themeLabel(themeId: (typeof supportedThemes)[number]): TranslationKey {
    if (themeId === "system") return "theme_system";
    if (themeId === "light") return "theme_light";
    return "theme_dark";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Select
        style={{ minWidth: 100 }}
        label={t("settings_theme")}
        fullWidth
        value={theme}
        items={supportedThemes}
        getLabel={(item) => t(themeLabel(item))}
        onChange={(value) => toggleTheme(value)}
      />
      <Select
        style={{ minWidth: 100 }}
        label={t("settings_language")}
        fullWidth
        value={Languages[language]}
        getLabel={(item) => item.label}
        items={Object.values(Languages) as { label: string, value: string }[]}
        onChange={(value) => setLanguage(value.value as any)}
      />
    </div>
  );
}