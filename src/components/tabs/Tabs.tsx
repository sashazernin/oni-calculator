import {
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  useRef,
  type CSSProperties,
  type ReactNode,
  Children,
} from "react";
import { ThemeContext } from "../../providers/AppThemeProvider";
import { Button } from "../button/Button";

interface ITabsProps {
  value?: number;
  onChange: (tab: number) => void;
  tabs?: {
    label: string;
    icon?: ReactNode;
    className?: string;
    style?: CSSProperties;
  }[];
  children?: ReactNode;
  container?: (children: ReactNode) => ReactNode;
}

const INDICATOR_MS = 300;
const INDICATOR_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

export default function Tabs({
  tabs,
  children,
  onChange,
  value = 0,
  container,
}: Readonly<ITabsProps>) {
  const { colors } = useContext(ThemeContext);
  const panelBg = colors.background.paper;
  const borderColor = `color-mix(in srgb, ${colors.text.primary} 22%, transparent)`;
  const primary = colors.primary.main;

  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [ind, setInd] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const track = trackRef.current;
    const i = value;
    const tab = tabRefs.current[i];
    if (!track || !tab) return;
    const tr = track.getBoundingClientRect();
    const tb = tab.getBoundingClientRect();
    setInd({
      left: tb.left - tr.left,
      width: tb.width,
    });
  }, [value]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, tabs]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(() => updateIndicator());
    ro.observe(track);
    return () => ro.disconnect();
  }, [updateIndicator]);

  useLayoutEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateIndicator]);

  const onScroll = useCallback(() => {
    updateIndicator();
  }, [updateIndicator]);

  const rootStyle: CSSProperties = {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    minHeight: 0
  };

  const pages = Children.toArray(children);

  return (
    <div style={rootStyle}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          flexShrink: 0,
          backgroundColor: panelBg,
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "thin",
        }}
      >
        {tabs?.map((tab, index) => {
          const isActive = index === value;
          return (
            <Button
              key={index}
              ref={(el) => {
                tabRefs.current[index] = el as HTMLButtonElement;
              }}
              variant="translucent"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(index)}
              colorOverrides={{
                main: 'transparent',
                contrastText: isActive ? colors.primary.main : colors.text.primary,
              }}
              style={{
                gap: 8,
              }}
            >
              {tab.icon != null ? (
                <span
                  style={{
                    display: "inline-flex",
                    color: "inherit",
                    fontSize: "1.25rem",
                    flexShrink: 0
                  }}
                  aria-hidden
                >
                  {tab.icon}
                </span>
              ) : null}
              {tab.label}
            </Button>
          );
        })}

        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
            backgroundColor: borderColor,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: ind.left,
            width: ind.width,
            height: 2,
            backgroundColor: primary,
            borderRadius: "2px 2px 0 0",
            pointerEvents: "none",
            transition: `left ${INDICATOR_MS}ms ${INDICATOR_EASING}, width ${INDICATOR_MS}ms ${INDICATOR_EASING}`,
            zIndex: 2,
            marginBottom: 0,
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          position: "relative",
          minHeight: 0,
          backgroundColor: panelBg,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "auto",
          }}
        >
          {pages.map((page, index) => {
            if (index !== value) return null;
            return (
              <div
                key={index}
                style={{ position: "relative", minHeight: "100%", width: "100%" }}
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
