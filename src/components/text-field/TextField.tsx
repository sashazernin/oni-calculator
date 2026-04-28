import {
  forwardRef,
  useContext,
  useId,
  useState,
  type ChangeEventHandler,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { ThemeContext } from "../../providers/app-theme-provider";

const FLOAT_MS = 0.2;
/** Высота видимой строки ввода (нативный input). */
const INPUT_H = 28;
/** Высота всей рамки (бордер + внутренняя область). */
const FIELD_H = 40;
const FIELD_PAD_X = 8;

export type TextFieldProps = {
  label?: string;
  error?: string;
  fullWidth?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      error,
      fullWidth,
      disabled,
      className,
      style: inputStyle,
      id: idProp,
      onFocus,
      onBlur,
      onChange,
      value: valueProp,
      defaultValue,
      placeholder: placeholderProp,
      ...inputRest
    },
    ref
  ) {
    const { colors } = useContext(ThemeContext);
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const [focused, setFocused] = useState(false);
    const [innerValue, setInnerValue] = useState(
      String(defaultValue ?? "")
    );

    const isControlled = valueProp !== undefined;
    const valueStr = isControlled
      ? valueProp === null
        ? ""
        : String(valueProp)
      : innerValue;
    const hasValue = valueStr.length > 0;

    const hasLabel = Boolean(label);
    const float =
      hasLabel && (hasValue || (!disabled && focused));

    const primary = colors.primary.main;
    const paper = colors.background.paper;
    const defaultBorder = colors.border.main;
    const errorColor = "rgb(211, 64, 64)";
    const labelPlaceholder = `color-mix(in srgb, ${colors.text.primary} 50%, ${paper})`;
    const labelFloatMuted = `color-mix(in srgb, ${colors.text.primary} 70%, ${paper})`;

    const showError = Boolean(error);
    const borderColor = showError
      ? errorColor
      : focused
        ? primary
        : defaultBorder;

    const boxShadow = "none";

    const labelTextColor = showError
      ? errorColor
      : float
        ? (focused ? primary : labelFloatMuted)
        : labelPlaceholder;

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      if (!isControlled) {
        setInnerValue(e.target.value);
      }
      onChange?.(e);
    };

    const sharedInputStyle = {
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box" as const,
      margin: 0,
      font: "inherit",
      fontSize: "0.875rem",
      lineHeight: `${INPUT_H}px`,
      letterSpacing: "0.01em",
      color: colors.text.primary,
      outline: "none" as const,
      cursor: disabled ? "not-allowed" : "text",
      opacity: disabled ? 0.72 : 1,
      transition: `border-color ${FLOAT_MS}s ease, background-color ${FLOAT_MS}s ease, opacity ${FLOAT_MS}s ease`,
      border: "none" as const,
      borderRadius: 0,
      backgroundColor: "transparent" as const,
      height: INPUT_H,
      padding: 0,
      ...inputStyle,
    };

    const disabledFill = `color-mix(in srgb, ${colors.text.primary} 6%, ${paper})`;

    const fieldShell = (children: ReactNode, extra?: { marginTop?: number }) => (
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
          minWidth: 0,
          height: FIELD_H,
          minHeight: FIELD_H,
          border: `1px solid ${borderColor}`,
          borderRadius: 10,
          backgroundColor: disabled ? disabledFill : paper,
          boxShadow,
          padding: `0 ${FIELD_PAD_X}px`,
          transition: `border-color ${FLOAT_MS}s ease, background-color ${FLOAT_MS}s ease`,
          marginTop: extra?.marginTop ?? 0,
        }}
      >
        {children}
      </div>
    );

    const inputEl = (
      <input
        ref={ref}
        id={id}
        disabled={disabled}
        value={isControlled ? valueProp : undefined}
        defaultValue={isControlled ? undefined : (defaultValue ?? undefined)}
        onChange={handleChange}
        placeholder={hasLabel ? (placeholderProp ?? "") : placeholderProp}
        aria-invalid={showError}
        aria-describedby={showError ? `${id}-error` : undefined}
        onFocus={(e) => {
          if (!disabled) setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={
          hasLabel
            ? {
              ...sharedInputStyle,
              position: "relative",
              zIndex: 2,
            }
            : {
              ...sharedInputStyle,
              backgroundColor: "transparent",
              boxShadow: "none",
            }
        }
        {...inputRest}
      />
    );

    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 6,
          width: fullWidth ? "100%" : "auto",
          minWidth: 0,
        }}
      >
        {hasLabel
          ? fieldShell(
            <>
              <label
                htmlFor={id}
                style={{
                  position: "absolute",
                  left: FIELD_PAD_X,
                  maxWidth: `calc(100% - ${FIELD_PAD_X * 2}px)`,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  pointerEvents: "none" as const,
                  userSelect: "none" as const,
                  lineHeight: 1.2,
                  fontWeight: 500,
                  zIndex: 1,
                  transformOrigin: "left top",
                  transition: `top ${FLOAT_MS}s ease, transform ${FLOAT_MS}s ease, font-size ${FLOAT_MS}s ease, color ${FLOAT_MS}s ease, background-color ${FLOAT_MS}s ease, padding ${FLOAT_MS}s ease`,
                  ...(float
                    ? {
                      top: 0,
                      transform: "translateY(-50%)",
                      fontSize: "0.6875rem",
                      padding: "0 3px",
                      color: labelTextColor,
                      backgroundColor: paper,
                    }
                    : {
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "0.875rem",
                      padding: 0,
                      color: labelTextColor,
                      backgroundColor: "transparent",
                    }),
                }}
              >
                {label}
              </label>
              {inputEl}
            </>,
            { marginTop: 6 }
          )
          : fieldShell(inputEl)}
        {showError ? (
          <span
            id={`${id}-error`}
            role="alert"
            style={{
              fontSize: "0.8125rem",
              lineHeight: 1.4,
              color: errorColor,
            }}
          >
            {error}
          </span>
        ) : null}
      </div>
    );
  }
);
