import { useContext, type CSSProperties, type ReactNode } from "react";
import { ThemeContext } from "../../providers/AppThemeProvider";

interface ITabsProps {
  value?: number;
  onChange: (tab: number) => void;
  tabs?: {
    label: string;
    className?: string;
    style?: CSSProperties;
  }[];
  children?: ReactNode[];
  hideBorders?: boolean;
  container?: (children: ReactNode) => ReactNode;
}

export default function Tabs({
  tabs,
  children,
  onChange,
  value,
  hideBorders,
  container,
}: Readonly<ITabsProps>) {
  const { colors } = useContext(ThemeContext);
  const borderColor = `color-mix(in srgb, ${colors.text.primary} 25%, transparent)`;
  const tabBg = colors.background.average;
  const panelBg = colors.background.paper;

  const rootStyle: CSSProperties = {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    ...(hideBorders
      ? {}
      : {
        border: `1px solid ${borderColor}`,
        borderRadius: 6,
        overflow: "hidden",
      }),
  };

  return (
    <div style={rootStyle}>
      <div
        style={{
          display: "flex",
          overflow: "hidden"
        }}
      >
        {tabs?.map((tab, index) => {
          const isActive = index === value;
          const nextIsActive = index + 1 === value;

          const tabStyle: CSSProperties = {
            cursor: "pointer",
            padding: "8px 12px",
            backgroundColor: isActive ? panelBg : tabBg,
            color: "inherit",
            borderRight: nextIsActive
              ? "none"
              : `1px solid ${borderColor}`,
            marginRight: nextIsActive ? 1 : 0,
            borderBottom: isActive
              ? `1px solid ${panelBg}`
              : `1px solid ${borderColor}`,
            marginBottom: isActive ? -1 : 0,
            position: "relative",
            zIndex: isActive ? 2 : 1,
            ...(isActive
              ? {
                outline: `1px solid ${borderColor}`,
                outlineOffset: 0,
                borderTopRightRadius: 6,
                borderTopLeftRadius: index !== 0 ? 6 : 0,
              }
              : {}),
            ...tab.style,
          };

          return (
            <div
              onClick={() => onChange(index)}
              key={index}
              className={tab.className}
              style={tabStyle}
              role="tab"
              aria-selected={isActive}
            >
              {tab.label}
            </div>
          );
        })}
        <div
          style={{
            flex: 1,
            borderBottom: `1px solid ${borderColor}`,
            backgroundColor: tabBg,
            minWidth: 0,
          }}
        />
      </div>
      <div style={{ flex: 1, position: "relative", minHeight: 0, backgroundColor: panelBg }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "auto",
          }}
        >
          {children?.map((page, index) => {
            if (index !== value) return;
            return (
              <div
                key={index}
                style={{ position: "relative", height: "100%", width: "100%" }}
              >
                {container ? container(page) : page}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
