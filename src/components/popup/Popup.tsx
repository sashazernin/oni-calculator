import { RxCross1 } from "react-icons/rx";
import { useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "../icon-button/IconButton";
import { ThemeContext } from "../../providers/app-theme-provider";

const Portal = ({ children }: { children: ReactNode }) => {
  return createPortal(children, document.body);
};

interface IPopupProps {
  open: boolean;
  title?: string;
  header?: ReactNode;
  /** Extra `className` for the header row (optional). */
  headerStyles?: string;
  headerClassName?: string;
  children: ReactNode;
  bottom?: ReactNode;
  onClose?: () => void;
  disableCloseOnEscape?: boolean;
  disableCloseOnClickOutside?: boolean;
  closeButton?: boolean;
  variant?: "standard" | "fit-content";
}

const TRANSITION_MS = 280;
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const DIALOG_IDLE_Y = 14;
const DIALOG_IDLE_SCALE = 0.98;

function mergeHeaderClass(a?: string, b?: string) {
  return [a, b].filter(Boolean).join(" ") || undefined;
}

export function Popup(props: Readonly<IPopupProps>) {
  const { colors } = useContext(ThemeContext);
  const {
    open,
    title,
    header,
    headerStyles,
    headerClassName,
    children,
    bottom,
    onClose,
    disableCloseOnEscape,
    disableCloseOnClickOutside,
    closeButton,
    variant = "standard",
  } = props;

  const overlayBg = "rgba(0, 0, 0, 0.1)";

  const dialogSurface: CSSProperties = {
    background: `linear-gradient(
      160deg,
      ${colors.background.paper} 0%,
      color-mix(in srgb, ${colors.text.primary} 3%, ${colors.background.paper}) 48%,
      ${colors.layout.background} 100%
    )`,
    boxShadow: colors.shadow.default,
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    if (open && !disableCloseOnEscape) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [disableCloseOnEscape, onClose, open]);

  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close popup on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node) &&
        containerRef.current?.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    if (!disableCloseOnClickOutside && open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dialogRef, disableCloseOnClickOutside, onClose, open]);

  const dialogLayoutStyle: CSSProperties =
    variant === "standard"
      ? {
        width: "100%",
        maxWidth: 900,
        height: "calc(100vh - 4rem)",
        maxHeight: "calc(100vh - 2rem)",
      }
      : {
        width: "max-content",
        height: "max-content",
        maxWidth: "min(100vw - 2rem, 900px)",
      };

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const openRef = useRef(open);
  const enterGenRef = useRef(0);

  openRef.current = open;

  /** Синхронно до paint: в DOM попадает уже скрытое окно; иначе иногда нет снимка "до" — transition не срабатывает. */
  useLayoutEffect(() => {
    if (open) {
      setMounted(true);
      setVisible(false);
    } else {
      enterGenRef.current += 1;
      setVisible(false);
    }
  }, [open]);

  /** Показ после кадра с opacity:0; unmount оверлея после анимации закрытия. [mounted] — чтобы не словить rAF, пока layout ещё не поднял оверлей. */
  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(() => {
        if (!openRef.current) {
          setMounted(false);
        }
      }, TRANSITION_MS);
      return () => clearTimeout(t);
    }

    if (!mounted) return;

    const gen = ++enterGenRef.current;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (gen !== enterGenRef.current || !openRef.current) return;
        setVisible(true);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [open, mounted]);

  if (!mounted) return;

  const headerCombinedClass = mergeHeaderClass(headerStyles, headerClassName);

  return (
    <Portal>
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          background: overlayBg,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0,
          visibility: visible ? "visible" : "hidden",
          pointerEvents: visible ? "auto" : "none",
          transition: `opacity ${TRANSITION_MS}ms ${EASE}, visibility ${TRANSITION_MS}ms ease`,
        }}
      >
        <div
          ref={dialogRef}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            margin: 32,
            borderRadius: 8,
            border: `1px solid ${colors.border.main}`,
            minHeight: 0,
            color: colors.text.primary,
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translate3d(0, 0, 0) scale(1)"
              : `translate3d(0, ${DIALOG_IDLE_Y}px, 0) scale(${DIALOG_IDLE_SCALE})`,
            transition: `opacity ${TRANSITION_MS}ms ${EASE}, transform ${TRANSITION_MS}ms ${EASE}`,
            ...dialogLayoutStyle,
            ...dialogSurface,
          }}
        >
          {(title || header) && (
            <div
              className={headerCombinedClass}
              style={{
                display: "flex",
                width: "100%",
                padding: 16,
                borderBottom: `1px solid ${colors.border.main}`,
                gap: 16,
                alignItems: "center",
                boxSizing: "border-box",
              }}
            >
              {title ? (
                <span
                  style={{
                    fontSize: "1.25rem",
                    lineHeight: 1.2,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {title}
                </span>
              ) : null}
              {header}
              {closeButton && (
                <>
                  <div style={{ flex: 1, minWidth: 8 }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconButton onClick={() => onClose?.()}>
                      <RxCross1 />
                    </IconButton>
                  </div>
                </>
              )}
            </div>
          )}
          <div
            style={{
              overflow: "auto",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              flex: variant === "standard" ? 1 : "0 1 auto",
            }}
          >
            {children}
          </div>
          {bottom && (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                padding: 16,
                justifyContent: "flex-end",
                alignItems: "center",
                boxSizing: "border-box",
                borderTop: `1px solid ${colors.border.main}`,
              }}
            >
              {bottom}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
