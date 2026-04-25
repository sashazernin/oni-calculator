import {
  forwardRef,
  useContext,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { Link, type To } from "react-router-dom";
import "./button.css";
import { ThemeContext } from "../../providers/AppThemeProvider";

type Ripple = { id: number; x: number; y: number };

export type ButtonVariant = "primary" | "translucent";

export type ButtonColorOverrides = Partial<{
  main: string;
  hover: string;
  active: string;
  contrastText: string;
  /** Волна от клика: по умолчанию = «разлёт» цвета hover, не отдельный блик */
  ripple: string;
}>;

type ButtonAsLink = Omit<ComponentPropsWithoutRef<typeof Link>, "to"> & {
  to: To;
  disabled?: boolean;
  variant?: ButtonVariant;
  colorOverrides?: ButtonColorOverrides;
};

type ButtonAsNative = ButtonHTMLAttributes<HTMLButtonElement> & {
  to?: never;
  variant?: ButtonVariant;
  colorOverrides?: ButtonColorOverrides;
};

export type ButtonProps = ButtonAsNative | ButtonAsLink;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const { colors } = useContext(ThemeContext);
    const variant = props.variant ?? "primary";
    const t = colors.primary;
    const tr = colors.translucent;
    const o = {
      ...(variant === "translucent"
        ? {
            main: tr.main,
            hover: tr.hover,
            active: tr.active,
            contrastText: colors.text.primary,
          }
        : {}),
      ...props.colorOverrides,
    };
    const main = o?.main ?? t.main;
    const hover = o?.hover ?? t.hover;
    const active = o?.active ?? t.active;
    const contrastText = o?.contrastText ?? t.contrastText;
    const ripple =
      o?.ripple ?? `color-mix(in srgb, ${hover} 52%, transparent)`;
    const buttonStyle = {
      "--btn-bg": main,
      "--btn-bg-hover": hover,
      "--btn-bg-active": active,
      "--btn-fg": contrastText,
      "--btn-ripple": ripple,
    } as CSSProperties;

    const [ripples, setRipples] = useState<Ripple[]>([]);
    const idRef = useRef(0);

    const addRipple = (x: number, y: number) => {
      const id = idRef.current++;
      setRipples((prev) => [...prev, { id, x, y }]);
    };

    const commonClass = ["button", props.className].filter(Boolean).join(" ");
    const mergedStyle = { ...buttonStyle, ...props.style };

    const ripplesNode = (
      <>
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="button__ripple"
            style={{ left: ripple.x, top: ripple.y }}
            onAnimationEnd={() => {
              setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
            }}
          />
        ))}
      </>
    );

    if ("to" in props) {
      const p = props as ButtonAsLink;
      const {
        to,
        className: _c,
        children,
        onPointerDown,
        type: _t,
        style: _st,
        disabled,
        tabIndex,
        variant: _v,
        colorOverrides: _co,
        ...linkRest
      } = p;
      const handleLinkPointer = (e: React.PointerEvent<HTMLAnchorElement>) => {
        onPointerDown?.(e);
        if (e.defaultPrevented || disabled) return;
        if (e.button !== 0) return;
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        addRipple(e.clientX - r.left, e.clientY - r.top);
      };

      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          to={to}
          className={commonClass}
          style={mergedStyle}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : tabIndex}
          onPointerDown={handleLinkPointer}
          {...linkRest}
        >
          {ripplesNode}
          {children}
        </Link>
      );
    }

    const {
      className,
      children,
      onPointerDown,
      type = "button",
      disabled,
      style: _s,
      variant: _v2,
      colorOverrides: _co2,
      ...rest
    } = props;

    const handleButtonPointer = (e: React.PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(e);
      if (e.defaultPrevented || disabled) return;
      if (e.button !== 0) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      addRipple(e.clientX - r.left, e.clientY - r.top);
    };

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled}
        className={commonClass}
        style={mergedStyle}
        onPointerDown={handleButtonPointer}
        {...rest}
      >
        {ripplesNode}
        {children}
      </button>
    );
  }
);
