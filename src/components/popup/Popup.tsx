import { RxCross1 } from "react-icons/rx";
import { useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "../icon-button/IconButton";
import { ThemeContext } from "../../providers/AppThemeProvider";

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

const TRANSITION_MS = 200;

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

  const borderSubtle = `color-mix(in srgb, ${colors.text.primary} 16%, transparent)`;
  const overlayBg = "rgba(0, 0, 0, 0.05)";

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

  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timeout = setTimeout(() => setMounted(false), TRANSITION_MS);
      return () => clearTimeout(timeout);
    }
  }, [open]);

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
          transition: `opacity ${TRANSITION_MS}ms ease, visibility ${TRANSITION_MS}ms ease`,
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
            border: `1px solid ${borderSubtle}`,
            minHeight: 0,
            color: colors.text.primary,
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
                borderBottom: `1px solid ${borderSubtle}`,
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
                borderTop: `1px solid ${borderSubtle}`,
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
