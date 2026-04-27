import { forwardRef, useContext, type CSSProperties } from "react";
import { ThemeContext } from "../../providers/app-theme-provider";
import { Button, type ButtonColorOverrides, type ButtonProps } from "../button/Button";
import "./icon-button.css";

function iconButtonBase(
  translucent: { hover: string; active: string; iconRipple: string },
  text: string
): ButtonColorOverrides {
  return {
    main: "transparent",
    hover: translucent.hover,
    active: translucent.active,
    contrastText: text,
    ripple: translucent.iconRipple,
  };
}

/** Нейтральная белая/серая иконка и оверлеи (для панелей, хедера). */
function iconButtonAction(isDark: boolean): ButtonColorOverrides {
  return {
    main: "transparent",
    hover: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.07)",
    active: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.12)",
    contrastText: isDark ? "#ffffff" : "#6a6a6a",
    ripple: isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)",
  };
}

export type IconButtonProps = Omit<ButtonProps, "color"> & {
  /** `primary` — цвет акцента темы; `action` — белый/серый и нейтральные оверлеи. @default primary */
  color?: "primary" | "action";
};

/**
 * Круглая кнопка под иконку из `react-icons` (children).
 * Заливка по hover/active как у `Button variant="translucent"`; по умолчанию цвет иконки — `colors.primary.main`.
 * Своё оформление — через `colorOverrides`.
 */
export const IconButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, IconButtonProps>(
  function IconButton({ className, children, colorOverrides, style, color = "primary", ...rest }, ref) {
    const { colors } = useContext(ThemeContext);
    const isDark = colors.mode === "dark";
    const base =
      color === "action"
        ? iconButtonAction(isDark)
        : iconButtonBase(colors.translucent, colors.primary.main);
    const focusStyle = {
      "--icon-focus":
        color === "action"
          ? isDark
            ? "rgba(255, 255, 255, 0.48)"
            : "rgba(0, 0, 0, 0.32)"
          : colors.translucent.iconFocus,
      ...style,
    } as CSSProperties;

    return (
      <Button
        ref={ref}
        className={["icon-button", className].filter(Boolean).join(" ")}
        colorOverrides={{ ...base, ...colorOverrides }}
        style={focusStyle}
        {...(rest as ButtonProps)}
      >
        {children}
      </Button>
    );
  }
);
