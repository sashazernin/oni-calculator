import { useContext } from "react";
import { supportedThemes, ThemeContext } from "../../../providers/app-theme-provider";
import { Select } from "../../../components/select/Select";
import { LocalizationContext, supportedLanguages } from "../../../providers/localization-provider";

export default function AppSettings() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, setLanguage } = useContext(LocalizationContext);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Select
        style={{ minWidth: 100 }}
        label="Theme"
        fullWidth
        value={theme}
        items={supportedThemes}
        onChange={(value) => toggleTheme(value)}
      />
      <Select
        style={{ minWidth: 100 }}
        label="Language"
        fullWidth
        value={language}
        items={supportedLanguages}
        onChange={(value) => setLanguage(value)}
      />
    </div>
  );
}