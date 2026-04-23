import { useContext } from "react";
import { ThemeContext, type ISupportedThemes } from "../../../providers/AppThemeProvider";

export default function AppSettings() {
  const { colors, theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div>
      <select value={theme} onChange={(e) => toggleTheme(e.target.value as ISupportedThemes)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  )
}