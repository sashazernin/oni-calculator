import { useContext, type ButtonHTMLAttributes } from "react";
import { ThemeContext } from "../../providers/app-theme-provider";

export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  /** Картинка слева от подписи (например логотип DLC). */
  labelImageSrc?: string;
  labelImageAlt?: string;
  /** `start` — переключатель слева, подпись и картинка справа. */
  togglePosition?: "start" | "end";
  disabled?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "children">;

export function Switch({
  checked,
  onChange,
  label,
  labelImageSrc,
  labelImageAlt = "",
  togglePosition = "end",
  disabled,
  style,
  ...rest
}: SwitchProps) {
  const { colors } = useContext(ThemeContext);
  const primary = colors.primary.main;
  const trackOff = `color-mix(in srgb, ${colors.text.primary} 22%, ${colors.background.paper})`;
  const trackOn = `color-mix(in srgb, ${primary} 55%, ${colors.background.paper})`;

  const toggle = (
    <span
      aria-hidden
      style={{
        position: "relative",
        width: 44,
        height: 26,
        flexShrink: 0,
        borderRadius: 999,
        background: checked ? trackOn : trackOff,
        border: `1px solid ${checked ? `color-mix(in srgb, ${primary} 50%, transparent)` : colors.border.main}`,
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 22 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: checked ? primary : colors.background.paper,
          boxShadow: "0 1px 3px rgba(0,0,0,0.28)",
          transition: "left 0.2s ease, background 0.2s ease",
        }}
      />
    </span>
  );

  const labelContent = (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flex: togglePosition === "end" ? 1 : undefined,
        minWidth: 0,
      }}
    >
      {labelImageSrc ? (
        <img
          src={labelImageSrc}
          alt={labelImageAlt}
          draggable={false}
          style={{
            height: 26,
            width: "auto",
            maxWidth: 110,
            objectFit: "contain",
            flexShrink: 0,
            display: "block",
          }}
        />
      ) : null}
      {label ? (
        <span
          style={{
            fontSize: "0.875rem",
            lineHeight: 1.35,
            color: colors.text.primary,
            minWidth: 0,
          }}
        >
          {label}
        </span>
      ) : null}
    </span>
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || labelImageAlt || undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: togglePosition === "end" ? "space-between" : "flex-start",
        gap: togglePosition === "start" ? 8 : 12,
        width: "100%",
        margin: 0,
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        font: "inherit",
        textAlign: "left",
        ...style,
      }}
      {...rest}
    >
      {togglePosition === "start" ? toggle : null}
      {labelContent}
      {togglePosition === "end" ? toggle : null}
    </button>
  );
}
