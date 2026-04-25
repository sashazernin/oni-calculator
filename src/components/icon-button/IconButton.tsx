import { forwardRef, useContext, type CSSProperties } from "react";
import { ThemeContext } from "../../providers/AppThemeProvider";
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

/**
 * Круглая кнопка под иконку из `react-icons` (children).
 * Заливка по hover/active как у `Button variant="translucent"`; цвет иконки — `colors.text.primary`.
 * Своё оформление — через `colorOverrides`.
 */
export const IconButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function IconButton({ className, children, colorOverrides, style, ...rest }, ref) {
    const { colors } = useContext(ThemeContext);
    const base = iconButtonBase(colors.translucent, colors.text.primary);
    const focusStyle = {
      "--icon-focus": colors.translucent.iconFocus,
      ...style,
    } as CSSProperties;

    return (
      <Button
        ref={ref}
        className={["icon-button", className].filter(Boolean).join(" ")}
        colorOverrides={{ ...base, ...colorOverrides }}
        style={focusStyle}
        {...rest}
      >
        {children}
      </Button>
    );
  }
);
