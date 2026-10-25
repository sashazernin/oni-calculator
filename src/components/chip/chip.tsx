import { ThemeContext } from "../../providers/app-theme-provider";
import { useContext } from "react";

type ChipProps = {
  children: React.ReactNode;
  dense?: boolean;
  title?: string;
  "aria-label"?: string;
};

export default function Chip({ children, dense, title, "aria-label": ariaLabel }: ChipProps) {
  const { colors } = useContext(ThemeContext);
  return (
    <div
      title={title}
      aria-label={ariaLabel}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: dense ? 6 : 8,
        alignItems: "center",
        background: colors.background.average,
        padding: dense ? "0 10px" : "8px 16px",
        minHeight: dense ? 36 : undefined,
        borderRadius: dense ? 8 : 10,
        border: `1px solid ${colors.border.main}`,
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}