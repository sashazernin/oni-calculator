import {
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ThemeContext } from "../../providers/app-theme-provider";
import "./tooltip.css";

const GAP = 8;
const MARGIN = 8;
const Z = 1500;
const ARROW_EDGE_INSET = 4;

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export type TooltipProps = {
  title: ReactNode;
  children: ReactElement;
  /**
   * Расположение относительно якоря. При нехватке места по вертикали/горизонтали
   * пытается сместить или перевернуть плашку внутри окна.
   */
  placement?: TooltipPlacement;
  /** @default 100 — как у MUI */
  enterDelay?: number;
  /** @default 0 */
  leaveDelay?: number;
  /** Маленький треугольник, указывающий на якорь (как `arrow` в MUI). */
  arrow?: boolean;
  /** @default false — если `true`, можно навести курсор на текст подсказки (нужен `leaveDelay` &gt; 0 для перехода) */
  disableInteractive?: boolean;
  className?: string;
  /** `className` на обёртке-якоре */
  slotProps?: {
    anchor?: { className?: string; style?: CSSProperties };
  };
};

type Coords = { top: number; left: number };

function isEmptyTitle(title: ReactNode) {
  if (title == null) return true;
  if (typeof title === "string" || typeof title === "number") {
    return String(title).trim() === "";
  }
  return false;
}

function placeWithinViewport(
  placement: TooltipPlacement,
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  tw: number,
  th: number
): { coords: Coords; placement: TooltipPlacement } {
  const innerW = window.innerWidth;
  const innerH = window.innerHeight;
  const gap = GAP;
  const m = MARGIN;

  const centerX = () => {
    const left = ax + aw / 2 - tw / 2;
    return Math.max(m, Math.min(left, innerW - tw - m));
  };
  const centerY = () => {
    const top = ay + ah / 2 - th / 2;
    return Math.max(m, Math.min(top, innerH - th - m));
  };

  const tryTop = (): Coords | null => {
    const top = ay - th - gap;
    if (top < m) return null;
    return { top, left: centerX() };
  };
  const tryBottom = (): Coords | null => {
    const top = ay + ah + gap;
    if (top + th > innerH - m) return null;
    return { top, left: centerX() };
  };
  const tryLeft = (): Coords | null => {
    const left = ax - tw - gap;
    if (left < m) return null;
    return { top: centerY(), left };
  };
  const tryRight = (): Coords | null => {
    const left = ax + aw + gap;
    if (left + tw > innerW - m) return null;
    return { top: centerY(), left };
  };

  const order: TooltipPlacement[] =
    placement === "top"
      ? ["top", "bottom", "left", "right"]
      : placement === "bottom"
        ? ["bottom", "top", "right", "left"]
        : placement === "left"
          ? ["left", "right", "top", "bottom"]
          : ["right", "left", "top", "bottom"];

  for (const p of order) {
    if (p === "top") {
      const c = tryTop();
      if (c) return { coords: c, placement: p };
    }
    if (p === "bottom") {
      const c = tryBottom();
      if (c) return { coords: c, placement: p };
    }
    if (p === "left") {
      const c = tryLeft();
      if (c) return { coords: c, placement: p };
    }
    if (p === "right") {
      const c = tryRight();
      if (c) return { coords: c, placement: p };
    }
  }

  /* Fallback: прижать к лучшей грани */
  const left = centerX();
  const preferTop = ay + ah / 2 < innerH / 2;
  const top = preferTop
    ? Math.min(ay + ah + gap, innerH - th - m)
    : Math.max(ay - th - gap, m);
  return { coords: { top, left }, placement: preferTop ? "bottom" : "top" };
}

export function Tooltip(props: Readonly<TooltipProps>) {
  const {
    title,
    children,
    placement: placementProp = "top",
    enterDelay = 100,
    leaveDelay = 0,
    arrow = false,
    disableInteractive = false,
    className,
    slotProps,
  } = props;

  const { colors } = useContext(ThemeContext);
  const id = useId();
  const tooltipId = `tooltip-${id}`;

  const anchorRef = useRef<HTMLSpanElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [coords, setCoords] = useState<Coords>({ top: 0, left: 0 });
  const [resolvedPlacement, setResolvedPlacement] = useState<TooltipPlacement>(placementProp);
  const [relAnchor, setRelAnchor] = useState({ x: 0, y: 0 });
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearEnter = () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
  };
  const clearLeave = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const scheduleOpen = () => {
    clearLeave();
    clearEnter();
    enterTimerRef.current = setTimeout(() => {
      setResolvedPlacement(placementProp);
      setOpen(true);
    }, enterDelay);
  };

  const handleOpen = () => {
    if (isEmptyTitle(title)) return;
    scheduleOpen();
  };

  const handleClose = () => {
    clearEnter();
    leaveTimerRef.current = setTimeout(() => {
      setOpen(false);
      setReady(false);
      setResolvedPlacement(placementProp);
    }, leaveDelay);
  };

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pop = popperRef.current;
    if (!pop) {
      return;
    }
    const tw = pop.offsetWidth;
    const th = pop.offsetHeight;
    const { coords: c, placement: resolved } = placeWithinViewport(
      placementProp,
      rect.left,
      rect.top,
      rect.width,
      rect.height,
      tw,
      th
    );
    setCoords(c);
    setResolvedPlacement(resolved);
    const ax = rect.left + rect.width / 2;
    const ay = rect.top + rect.height / 2;
    let relX = ax - c.left;
    let relY = ay - c.top;
    const edge = ARROW_EDGE_INSET;
    relX = Math.max(edge, Math.min(relX, tw - edge));
    relY = Math.max(edge, Math.min(relY, th - edge));
    setRelAnchor({ x: relX, y: relY });
  }, [placementProp]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    const pop = popperRef.current;
    if (!pop) return;
    updatePosition();
    const r = requestAnimationFrame(() => {
      updatePosition();
      setReady(true);
    });
    return () => cancelAnimationFrame(r);
  }, [open, title, placementProp, updatePosition]);

  useLayoutEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  useLayoutEffect(
    () => () => {
      clearEnter();
      clearLeave();
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (enterTimerRef.current) {
          clearTimeout(enterTimerRef.current);
          enterTimerRef.current = null;
        }
        setOpen(false);
        setReady(false);
        setResolvedPlacement(placementProp);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, placementProp]);

  if (!isValidElement(children)) {
    throw new Error("Tooltip: children must be a single valid React element.");
  }

  if (isEmptyTitle(title)) {
    return children;
  }

  const baseShadow = "0 2px 8px rgba(0,0,0,0.12)";
  const surfaceBg = "rgba(97, 97, 97, 0.95)";
  const bodyStyle: CSSProperties = {
    backgroundColor: surfaceBg,
    color: "#fff",
    boxShadow: `${baseShadow}, ${colors.shadow.default}`,
  };

  const surfacePlacement = arrow ? resolvedPlacement : null;

  const popper = open && (
    <div
      ref={popperRef}
      id={tooltipId}
      role="tooltip"
      className={[
        "tooltip-popper",
        ready ? "tooltip-popper--visible" : null,
        disableInteractive ? null : "tooltip-popper--interactive",
        arrow ? "tooltip-popper--arrow" : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          top: coords.top,
          left: coords.left,
          zIndex: Z,
          visibility: ready ? "visible" : "hidden",
          "--tooltip-surface": surfaceBg,
        } as CSSProperties & { "--tooltip-surface": string }
      }
      onMouseEnter={disableInteractive ? undefined : () => clearLeave()}
      onMouseLeave={disableInteractive ? undefined : handleClose}
    >
      <div
        className={[
          "tooltip-popper__surface",
          surfacePlacement ? `tooltip-popper__surface--${surfacePlacement}` : null,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="tooltip-popper__body" style={bodyStyle}>
          {title}
        </div>
        {arrow && surfacePlacement ? (
          <span
            className={["tooltip-popper__arrow", `tooltip-popper__arrow--${surfacePlacement}`].join(" ")}
            style={
              surfacePlacement === "top" || surfacePlacement === "bottom"
                ? { left: relAnchor.x, transform: "translateX(-50%)" }
                : surfacePlacement === "left"
                  ? { top: relAnchor.y, right: 0, left: "auto", transform: "translate(50%, -50%)" }
                  : { top: relAnchor.y, left: 0, transform: "translate(-50%, -50%)" }
            }
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <span
        ref={anchorRef}
        className={["tooltip-anchor", slotProps?.anchor?.className].filter(Boolean).join(" ")}
        style={slotProps?.anchor?.style}
        aria-describedby={ready ? tooltipId : undefined}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
      >
        {children}
      </span>
      {open ? createPortal(popper, document.body) : null}
    </>
  );
}
