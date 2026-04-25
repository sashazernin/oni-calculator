import { ThemeContext } from "../../providers/app-theme-provider";
import { useContext } from "react";

export default function Chip({ children }: { children: React.ReactNode }) {
  const { colors } = useContext(ThemeContext);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center', background: colors.background.average, padding: '8px 16px', borderRadius: 10, border: `1px solid ${colors.border.main}`, boxSizing: 'border-box' }}>
      {children}
    </div>
  );
}