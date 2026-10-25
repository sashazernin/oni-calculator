import { useContext, type CSSProperties, type ReactNode } from "react";
import { ThemeContext } from "../../providers/app-theme-provider";

export type PageToolbarProps = {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
};

export function pageStatCardStyle(colors: { border: { main: string }; background: { paper: string } }): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 12px",
    borderRadius: 12,
    border: `1px solid ${colors.border.main}`,
    backgroundColor: colors.background.paper,
    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
    minWidth: 0,
    flexShrink: 0,
  };
}

export default function PageToolbar({ title, children, actions }: PageToolbarProps) {
  const { colors } = useContext(ThemeContext);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        rowGap: 10,
        width: "100%",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.15rem, 2vw, 1.35rem)",
          fontWeight: 700,
          color: colors.text.primary,
          flexShrink: 0,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {children}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {actions}
      </div>
    </div>
  );
}
