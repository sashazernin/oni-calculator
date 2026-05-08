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
import { ThemeContext } from "../../providers/app-theme-provider";
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
  header?: ReactNode;
}

const INDICATOR_MS = 300;
const INDICATOR_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

export default function Tabs({
  tabs,
  children,
  onChange,
  value = 0,
  container,
  header,
}: Readonly<ITabsProps>) {
  const { colors } = useContext(ThemeContext);
  const panelBg = colors.background.paper;
  const lineColor = colors.border.main;
  const primary = colors.primary.main;

  const trackRef = useRef<HTMLDivElement>(null);
  /** Горизонтальный скролл только колонки с вкладками; `header` снаружи скролла и остаётся видимым. */
  const tabStripScrollRef = useRef<HTMLDivElement>(null);
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

  const scrollTabIntoView = useCallback((index: number) => {
    const viewport = tabStripScrollRef.current;
    const tab = tabRefs.current[index];
    if (!viewport || !tab) return;
    const pad = 8;
    const vr = viewport.getBoundingClientRect();
    const br = tab.getBoundingClientRect();
    let next = viewport.scrollLeft;
    if (br.left < vr.left + pad) {
      next = viewport.scrollLeft + (br.left - vr.left - pad);
    } else if (br.right > vr.right - pad) {
      next = viewport.scrollLeft + (br.right - vr.right + pad);
    } else {
      return;
    }
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    next = Math.max(0, Math.min(next, max));
    if (Math.abs(next - viewport.scrollLeft) < 1) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    viewport.scrollTo({ left: next, behavior });
  }, []);

  useLayoutEffect(() => {
    scrollTabIntoView(value);
  }, [value, tabs, scrollTabIntoView]);

  const pages = Children.toArray(children);

  return (
    <div style={{
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      minHeight: 0
    }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          flexShrink: 0,
          height: "40.5px",
          backgroundColor: panelBg,
          position: "relative",
        }}
      >
        <div
          ref={tabStripScrollRef}
          onScroll={onScroll}
          style={{
            position: "relative",
            flex: 1,
            minWidth: 0,
            height: "100%",
            overflowX: "auto",
            overflowY: "hidden",
          }}
          className="hide-scrollbar"
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              minWidth: "100%",
              height: "100%",
            }}
          >
            <div
              ref={trackRef}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
                flexShrink: 0,
                height: "100%",
                overflowX: "visible",
                overflowY: "hidden",
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
                    onClick={() => {
                      onChange(index);
                      if (index === value) {
                        requestAnimationFrame(() => scrollTabIntoView(index));
                      }
                    }}
                    colorOverrides={{
                      main: 'transparent',
                      contrastText: isActive ? colors.primary.main : colors.text.primary,
                    }}
                    style={{
                      gap: 8,
                      textWrap: "nowrap",
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
          </div>
        </div>
        {header != null ? (
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              alignSelf: "stretch",
            }}
          >
            {header}
          </div>
        ) : null}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
            backgroundColor: lineColor,
            pointerEvents: "none",
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
