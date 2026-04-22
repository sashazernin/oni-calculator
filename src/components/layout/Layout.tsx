import { Outlet } from "react-router-dom";
import Navbar from "./navbar/Navbar";
import Header from "./header/header";
import { useContext } from "react";
import { ThemeContext } from "../../providers/AppThemeProvider";

export default function Layout() {
  const { colors } = useContext(ThemeContext);
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column' }}>
      <Header />
      <div style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'row' }}>
        <Navbar />
        <div style={{ backgroundColor: colors.background.default, flex: 1, padding: '20px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}