import { forwardRef } from "react";
import { Button, type ButtonColorOverrides, type ButtonProps } from "../button/Button";
import "./icon-button.css";

const ICON_BUTTON_COLORS: ButtonColorOverrides = {
  main: "transparent",
  hover: "rgba(0, 0, 0, 0.07)",
  active: "rgba(0, 0, 0, 0.15)",
  contrastText: "#ffffff",
  /* та же тёмная «масса», что и в hover, но плотнее в центре волны */
  ripple: "color-mix(in srgb, #000 26%, transparent)",
};

/**
 * Круглая кнопка под иконку из `react-icons` (children).
 * По умолчанию без заливки, иконка белая, при наведении — тёмный оверлей;
 * свои цвета (например, на светлом фоне) — через `colorOverrides`.
 */
export const IconButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function IconButton({ className, children, colorOverrides, ...rest }, ref) {
    return (
      <Button
        ref={ref}
        className={["icon-button", className].filter(Boolean).join(" ")}
        colorOverrides={{ ...ICON_BUTTON_COLORS, ...colorOverrides }}
        {...rest}
      >
        {children}
      </Button>
    );
  }
);
