import { useContext } from "react";
import { supportedThemes, ThemeContext } from "../../../providers/app-theme-provider";
import { Select } from "../../../components/select/Select";

export default function AppSettings() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div>
      <Select
        style={{ minWidth: 100 }}
        label="Theme"
        fullWidth
        value={theme}
        items={supportedThemes}
        onChange={(value) => toggleTheme(value)}
      />
    </div>
  );
}