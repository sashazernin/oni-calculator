import { useContext } from "react";
import { ThemeContext } from "../../providers/app-theme-provider";

export default function Divider() {
  const { colors } = useContext(ThemeContext);
  return <div style={{ width: '100%', height: 1, backgroundColor: colors.border.main }} />;
}