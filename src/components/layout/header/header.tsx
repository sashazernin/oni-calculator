import { useContext } from "react";
import { ThemeContext } from "../../../providers/app-theme-provider";
import { FaRegMoon } from "react-icons/fa";
import { IconButton } from "../../icon-button/IconButton";
import { FaMoon } from "react-icons/fa";
import { DupeIcon } from "../../../icons";
import { DuplicantContext } from "../../../providers/duplicant-provider";

export default function Header() {
  const { colors, toggleTheme } = useContext(ThemeContext);
  const { duplicants } = useContext(DuplicantContext);
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
          gap: 16,
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
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <DupeIcon size={25} style={{ color: colors.primary.main }} />
          <span>{duplicants.length}</span>
        </div>
        <IconButton onClick={() => toggleTheme(colors.mode === 'dark' ? 'light' : 'dark')}>
          {colors.mode === 'dark' ? <FaMoon /> : <FaRegMoon />}
        </IconButton>
      </div>
    </div>
  )
}