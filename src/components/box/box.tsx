import { useContext } from "react";
import { ThemeContext } from "../../providers/AppThemeProvider";

interface IBoxProps {
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function Box({ children, style }: IBoxProps) {
  const { colors } = useContext(ThemeContext);
  return (
    <div style={{
      backgroundColor: colors.background.paper,
      padding: 16,
      borderRadius: 8,
      ...style
    }}>
      {children}
    </div>
  )
}