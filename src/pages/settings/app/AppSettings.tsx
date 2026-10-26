import { useContext } from "react";
import { supportedThemes, ThemeContext } from "../../../providers/app-theme-provider";
import { Select } from "../../../components/select/Select";
import {
  Languages,
  LocalizationContext,
  type ISupportedLanguages,
} from "../../../providers/localization-provider";
import { useTranslation } from "../../../hooks/useTranslation";
import type { TranslationKey } from "../../../i18n/translations";
import GoogleDriveSettings from "../../../components/google-drive/GoogleDriveSettings";
import PageToolbar from "../../../components/page-toolbar/PageToolbar";
import Divider from "../../../components/divider/Devider";
import { Switch } from "../../../components/switch/Switch";
import { useAppSettings } from "../../../providers/app-settings-provider";
import Info from "../../../components/info/info";

export default function AppSettings() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, setLanguage } = useContext(LocalizationContext);
  const { data, setMixedMode } = useAppSettings();
  const { t } = useTranslation();

  function themeLabel(themeId: (typeof supportedThemes)[number]): TranslationKey {
    if (themeId === "system") return "theme_system";
    if (themeId === "light") return "theme_light";
    return "theme_dark";
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
        alignSelf: "stretch",
        minWidth: 0,
      }}
    >
      <PageToolbar title={t("nav_settings")} />
      <Divider />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <Select
          label={t("settings_theme")}
          fullWidth
          hideLabelMargin
          disableSearch
          value={theme}
          items={supportedThemes}
          getLabel={(item) => t(themeLabel(item))}
          onChange={(value) => toggleTheme(value)}
        />
        <Select
          label={t("settings_language")}
          fullWidth
          hideLabelMargin
          disableSearch
          value={Languages[language]}
          getLabel={(item) => item.label}
          items={Object.values(Languages) as { label: string; value: string }[]}
          onChange={(value) => setLanguage(value.value as ISupportedLanguages)}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            width: "100%",
            minWidth: 0,
          }}
        >
          <Switch
            checked={data.mixedMode}
            onChange={setMixedMode}
            togglePosition="start"
            label={t("settings_mixed_mode")}
            style={{ width: "auto", flex: "0 1 auto", minWidth: 0 }}
          />
          <Info message={t("settings_mixed_mode_hint")} placement="top" />
        </div>
        <GoogleDriveSettings />
      </div>
    </div>
  );
}