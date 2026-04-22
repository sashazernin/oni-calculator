import { useContext } from "react";
import { ThemeContext } from "../../../providers/AppThemeProvider";
import { FaRegMoon } from "react-icons/fa";
import { IconButton } from "../../icon-button/IconButton";
import { FaMoon } from "react-icons/fa";

export default function Header() {
  const { colors, toggleTheme } = useContext(ThemeContext);
  return (
    <div style={{ backgroundColor: colors.layout.background, padding: '10px 0px', minWidth: '200px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0px 16px' }}>
        <div style={{ paddingRight: '16px', fontWeight: 'bold', fontSize: '1.25rem', color: 'white' }}>ONI Calculator</div>
        <div style={{ flex: 1 }}></div>
        <IconButton onClick={() => toggleTheme(colors.mode === 'dark' ? 'light' : 'dark')}>
          {colors.mode === 'dark' ? <FaMoon /> : <FaRegMoon />}
        </IconButton>
      </div>
    </div>
  )
}