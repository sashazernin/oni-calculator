import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEventHandler,
  type CSSProperties,
  type InputHTMLAttributes,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { ThemeContext } from "../../providers/AppThemeProvider";

const BOX = 18;
const RADIUS = 4;

const checkSvg = (stroke: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>`
  )}")`;

const dashSvg = (stroke: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14"/></svg>`
  )}")`;

export type CheckboxProps = {
  label?: ReactNode;
  indeterminate?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      label,
      className,
      style: inputStyle,
      id: idProp,
      disabled,
      checked: checkedProp,
      defaultChecked,
      onChange,
      onFocus,
      onBlur,
      indeterminate,
      ...inputRest
    },
    ref
  ) {
    const { colors } = useContext(ThemeContext);
    const generatedId = useId();
    const id = idProp ?? `chk-${generatedId}`;
    const innerRef = useRef<HTMLInputElement | null>(null);
    const [focused, setFocused] = useState(false);

    const isControlled = checkedProp !== undefined;
    const [uncontrolledChecked, setUncontrolledChecked] = useState(
      Boolean(defaultChecked)
    );
    const checked = isControlled ? Boolean(checkedProp) : uncontrolledChecked;

    const setRefs = (el: HTMLInputElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") {
        ref(el);
      } else if (ref) {
        (ref as MutableRefObject<HTMLInputElement | null>).current = el;
      }
    };

    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate]);

    const borderIdle = `color-mix(in srgb, ${colors.text.primary} 35%, transparent)`;
    const primary = colors.primary.main;
    const onPrimary = colors.primary.contrastText;

    const isVisuallyChecked = checked && !indeterminate;
    const isVisuallyIndeterminate = Boolean(indeterminate);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      if (!isControlled) {
        setUncontrolledChecked(e.currentTarget.checked);
      }
      onChange?.(e);
    };

    const controlStyle: CSSProperties = {
      appearance: "none",
      width: BOX,
      height: BOX,
      minWidth: BOX,
      minHeight: BOX,
      margin: 0,
      flexShrink: 0,
      boxSizing: "border-box",
      border: `2px solid ${
        isVisuallyChecked || isVisuallyIndeterminate
          ? primary
          : focused
            ? primary
            : borderIdle
      }`,
      borderRadius: RADIUS,
      backgroundColor: isVisuallyChecked
        ? primary
        : isVisuallyIndeterminate
          ? `color-mix(in srgb, ${primary} 30%, ${colors.background.paper})`
          : "transparent",
      backgroundImage: isVisuallyChecked
        ? checkSvg(onPrimary)
        : isVisuallyIndeterminate
          ? dashSvg(primary)
          : "none",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundSize: isVisuallyIndeterminate ? "12px" : "12px 12px",
      boxShadow: focused
        ? `0 0 0 3px color-mix(in srgb, ${primary} 28%, transparent)`
        : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition:
        "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
      ...inputStyle,
    };

    const control = (
      <input
        {...inputRest}
        ref={setRefs}
        id={id}
        type="checkbox"
        disabled={disabled}
        checked={isControlled ? checkedProp : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        onChange={handleChange}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={controlStyle}
        aria-checked={isVisuallyIndeterminate ? "mixed" : checked}
      />
    );

    if (label == null) {
      return (
        <span className={className}>
          {control}
        </span>
      );
    }

    return (
      <label
        htmlFor={id}
        className={className}
        style={{
          display: "inline-flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
          minWidth: 0,
        }}
      >
        {control}
        <span
          style={{
            fontSize: "0.875rem",
            lineHeight: 1.35,
            color: colors.text.primary,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {label}
        </span>
      </label>
    );
  }
);
