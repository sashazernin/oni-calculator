import { useContext } from "react";
import { ThemeContext } from "../../../providers/AppThemeProvider";
import { FaRegMoon } from "react-icons/fa";
import { IconButton } from "../../icon-button/IconButton";
import { FaMoon } from "react-icons/fa";

export default function Header() {
  const { colors, toggleTheme } = useContext(ThemeContext);
  return (
    <div
      style={{
        backgroundColor: colors.layout.background,
        padding: "12px 0",
        minWidth: 200,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            paddingRight: 16,
            fontWeight: 700,
            fontSize: "1.125rem",
            letterSpacing: "-0.03em",
            color: colors.text.primary,
          }}
        >
          ONI Calculator
        </div>
        <div style={{ flex: 1 }}></div>
        <IconButton onClick={() => toggleTheme(colors.mode === 'dark' ? 'light' : 'dark')}>
          {colors.mode === 'dark' ? <FaMoon /> : <FaRegMoon />}
        </IconButton>
      </div>
    </div>
  )
}