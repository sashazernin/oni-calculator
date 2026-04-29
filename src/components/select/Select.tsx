import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEventHandler,
  type CSSProperties,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";

const FLOAT_MS = 0.2;
const FIELD_H = 40;
const FIELD_PAD_X = 8;
/** Небольшой зазор между полем и списком. */
const PANEL_GAP = 2;
/** Сдвиг анимации «выезда» из-под поля (px). */
const PANEL_SLIDE_PX = 8;
const LIST_Z = 12000;
const INPUT_LINE_H = 28;

export type SelectProps<T> = {
  items: readonly T[];
  value: T | null | undefined;
  onChange: (item: T) => void;
  /** Если не задан: берётся `id` элемента (строка или число), иначе индекс в массиве. */
  getId?: (item: T) => string | number;
  getLabel?: (item: T) => string;
  label?: string;
  error?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
  hideLabelMargin?: boolean;
  /** Фон поля и «таблетки» подписи (по умолчанию как у карточек — `paper`). Для хедера — цвет подложки шапки. */
  fieldBackground?: string;
};

function objectIdIfPresent(item: unknown): string | undefined {
  if (item !== null && typeof item === "object" && "id" in item) {
    const raw = (item as { id: unknown }).id;
    if (typeof raw === "string" || typeof raw === "number") return String(raw);
  }
  return undefined;
}

function itemOptionValue<T>(
  item: T,
  index: number,
  getId?: (item: T) => string | number
): string {
  if (getId !== undefined) return String(getId(item));
  const fromObj = objectIdIfPresent(item);
  if (fromObj !== undefined) return fromObj;
  return String(index);
}

function defaultGetLabel<T>(item: T): string {
  return String(item as unknown);
}

function ChevronIcon({
  color,
  open,
}: {
  color: string;
  open: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        lineHeight: 0,
        flexShrink: 0,
        perspective: 56,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          transform: open ? "rotateX(180deg)" : "rotateX(0deg)",
          transformOrigin: "center",
          transformStyle: "preserve-3d",
          transition: `transform ${FLOAT_MS}s ease`,
          willChange: "transform",
        }}
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </span>
  );
}

export function Select<T>({
  items,
  value,
  onChange,
  getId,
  getLabel,
  label,
  error,
  fullWidth,
  disabled,
  className,
  id: idProp,
  style: triggerOuterStyle,
  hideLabelMargin,
  fieldBackground,
}: SelectProps<T>) {
  const { colors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listboxId = `${id}-listbox`;

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  /** Текст фильтра — только из `onChange` поля, не из синхронизации с `value`. */
  const [filterQuery, setFilterQuery] = useState("");
  const [panelRect, setPanelRect] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 280,
  });

  const [panelEnter, setPanelEnter] = useState(false);

  const resolvedGetLabel = getLabel ?? defaultGetLabel;

  const selectedKey = useMemo(() => {
    if (value === null || value === undefined) return "";
    const i = items.indexOf(value);
    if (i >= 0) return itemOptionValue(items[i], i, getId);
    if (getId !== undefined) {
      const want = String(getId(value));
      if (items.some((it, idx) => itemOptionValue(it, idx, getId) === want)) {
        return want;
      }
      return "";
    }
    const vid = objectIdIfPresent(value);
    if (vid !== undefined) {
      const j = items.findIndex((it) => objectIdIfPresent(it) === vid);
      if (j >= 0) return itemOptionValue(items[j], j, getId);
    }
    return "";
  }, [value, items, getId]);

  const selectedIndex = useMemo(() => {
    if (selectedKey === "") return -1;
    return items.findIndex(
      (it, idx) => itemOptionValue(it, idx, getId) === selectedKey
    );
  }, [items, selectedKey, getId]);

  const hasValue = selectedKey !== "";
  const hasLabel = Boolean(label);
  const float =
    hasLabel &&
    (hasValue ||
      inputValue.length > 0 ||
      (!disabled && (focused || open)));

  const primary = colors.primary.main;
  const paper = colors.background.paper;
  const fieldSurface = fieldBackground ?? paper;
  const defaultBorder = colors.border.main;
  const errorColor = "rgb(211, 64, 64)";
  const labelPlaceholder = `color-mix(in srgb, ${colors.text.primary} 50%, ${fieldSurface})`;
  const labelFloatMuted = `color-mix(in srgb, ${colors.text.primary} 70%, ${fieldSurface})`;
  const panelMutedText = `color-mix(in srgb, ${colors.text.primary} 50%, ${paper})`;

  const showError = Boolean(error);
  const borderColor = showError
    ? errorColor
    : focused || open
      ? primary
      : defaultBorder;

  const boxShadow = "none";

  const labelTextColor = showError
    ? errorColor
    : float
      ? focused || open
        ? primary
        : labelFloatMuted
      : labelPlaceholder;

  const disabledFill = `color-mix(in srgb, ${colors.text.primary} 6%, ${fieldSurface})`;

  const displayLabel =
    selectedIndex >= 0 ? resolvedGetLabel(items[selectedIndex]) : "";

  const filteredEntries = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    return items
      .map((item, sourceIndex) => ({ item, sourceIndex }))
      .filter(
        ({ item }) =>
          q === "" ||
          resolvedGetLabel(item).toLowerCase().includes(q)
      );
  }, [items, filterQuery, resolvedGetLabel]);

  const closeList = useCallback(() => {
    setOpen(false);
    setInputValue(displayLabel);
    setFilterQuery("");
  }, [displayLabel]);

  const commitSelection = useCallback(
    (item: T) => {
      const label = resolvedGetLabel(item);
      onChange(item);
      setInputValue(label);
      setFilterQuery("");
      setOpen(false);
      inputRef.current?.focus();
    },
    [onChange, resolvedGetLabel]
  );

  useLayoutEffect(() => {
    setInputValue(displayLabel);
    setFilterQuery("");
  }, [displayLabel]);

  const updatePanelPosition = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - PANEL_GAP - 12;
    const maxHeight = Math.max(120, Math.min(280, spaceBelow));
    setPanelRect({
      top: r.bottom + PANEL_GAP,
      left: r.left,
      width: r.width,
      maxHeight,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPanelEnter(false);
      return;
    }
    updatePanelPosition();
    setPanelEnter(false);
    const id = requestAnimationFrame(() => {
      setPanelEnter(true);
    });
    const onWin = () => updatePanelPosition();
    window.addEventListener("scroll", onWin, true);
    window.addEventListener("resize", onWin);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onWin, true);
      window.removeEventListener("resize", onWin);
    };
  }, [open, updatePanelPosition]);

  useLayoutEffect(() => {
    if (!open) return;
    if (filteredEntries.length === 0) {
      setHighlightIndex(0);
      return;
    }
    const sel = filteredEntries.findIndex(
      (e) => itemOptionValue(e.item, e.sourceIndex, getId) === selectedKey
    );
    setHighlightIndex(sel >= 0 ? sel : 0);
  }, [open, filteredEntries, selectedKey, getId]);

  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    const el = panelRef.current.querySelector(
      `[data-select-index="${highlightIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [open, highlightIndex]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        rootRef.current?.contains(t) ||
        panelRef.current?.contains(t)
      ) {
        return;
      }
      closeList();
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open, closeList]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeList();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeList]);

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = e.target.value;
    setInputValue(v);
    setFilterQuery(v);
    setOpen(true);
  };

  const onInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (disabled) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const n = filteredEntries.length;
      if (n === 0) return;
      setHighlightIndex((i) => (i + 1) % n);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const n = filteredEntries.length;
      if (n === 0) return;
      setHighlightIndex((i) => (i - 1 + n) % n);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filteredEntries.length > 0) {
        const safe = Math.min(highlightIndex, filteredEntries.length - 1);
        const entry = filteredEntries[safe];
        if (entry) commitSelection(entry.item);
      } else if (!open) {
        setOpen(true);
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        closeList();
      }
    } else if (e.key === "Home" && open) {
      e.preventDefault();
      if (filteredEntries.length > 0) setHighlightIndex(0);
    } else if (e.key === "End" && open) {
      e.preventDefault();
      if (filteredEntries.length > 0) {
        setHighlightIndex(filteredEntries.length - 1);
      }
    } else if (e.key === "Tab" && open) {
      closeList();
    }
  };

  const comboboxTrigger = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flex: 1,
        width: "100%",
        minWidth: 0,
        gap: 4,
        position: "relative",
        zIndex: 2
      }}
    >
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={
          open && filteredEntries.length > 0
            ? `${id}-opt-${highlightIndex}`
            : undefined
        }
        aria-invalid={showError}
        aria-describedby={showError ? `${id}-error` : undefined}
        disabled={disabled}
        value={inputValue}
        onChange={onInputChange}
        autoComplete="off"
        onFocus={() => {
          if (!disabled) {
            setFocused(true);
            setOpen(true);
          }
        }}
        onBlur={() => setFocused(false)}
        onKeyDown={onInputKeyDown}
        style={{
          flex: 1,
          minWidth: 0,
          boxSizing: "border-box",
          margin: 0,
          font: "inherit",
          fontSize: "0.875rem",
          lineHeight: `${INPUT_LINE_H}px`,
          letterSpacing: "0.01em",
          color: colors.text.primary,
          outline: "none",
          border: "none",
          borderRadius: 0,
          backgroundColor: "transparent",
          height: INPUT_LINE_H,
          padding: 0,
          cursor: disabled ? "not-allowed" : "text",
          opacity: disabled ? 0.72 : 1
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        aria-label={open ? t("select_close_list") : t("select_open_list")}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        onClick={() => {
          if (disabled) return;
          if (open) {
            closeList();
          } else {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          margin: 0,
          border: "none",
          background: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.72 : 1,
          flexShrink: 0,
          lineHeight: 0,
        }}
      >
        <ChevronIcon color={colors.text.primary} open={open} />
      </button>
    </div>
  );

  const panel = open
    ? createPortal(
      <div
        ref={panelRef}
        id={listboxId}
        role="listbox"
        tabIndex={-1}
        style={{
          position: "fixed",
          top: panelRect.top,
          left: panelRect.left,
          width: panelRect.width,
          maxHeight: panelRect.maxHeight,
          overflowY: "auto",
          overflowX: "hidden",
          backgroundColor: paper,
          border: `1px solid ${defaultBorder}`,
          borderRadius: 10,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          zIndex: LIST_Z,
          padding: 4,
          boxSizing: "border-box",
          transform: panelEnter
            ? "translateY(0)"
            : `translateY(-${PANEL_SLIDE_PX}px)`,
          opacity: panelEnter ? 1 : 0.88,
          transition:
            "transform 0.2s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.18s ease-out",
        }}
      >
        {filteredEntries.length === 0 ? (
          <div
            style={{
              padding: "12px 14px",
              fontSize: "0.875rem",
              lineHeight: 1.25,
              color: panelMutedText,
            }}
          >
            {t("select_no_matches")}
          </div>
        ) : (
          filteredEntries.map((ent, i) => {
            const k = itemOptionValue(ent.item, ent.sourceIndex, getId);
            const selected = k === selectedKey;
            const active = i === highlightIndex;
            const rowBg = selected
              ? `color-mix(in srgb, ${primary} 18%, ${paper})`
              : active
                ? `color-mix(in srgb, ${primary} 11%, ${paper})`
                : "transparent";
            return (
              <div
                key={`${String(k)}-${ent.sourceIndex}`}
                id={`${id}-opt-${i}`}
                data-select-index={i}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHighlightIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => commitSelection(ent.item)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  backgroundColor: rowBg,
                  fontSize: "0.875rem",
                  lineHeight: 1.25,
                  color: colors.text.primary,
                  fontWeight: selected ? 600 : 500,
                  marginBottom: i < filteredEntries.length - 1 ? 2 : 0,
                  transition: `background-color ${FLOAT_MS}s ease`,
                }}
              >
                {resolvedGetLabel(ent.item)}
              </div>
            );
          })
        )}
      </div>,
      document.body
    )
    : null;

  const fieldShell = (
    children: ReactNode,
    extra?: { marginTop?: number }
  ) => (
    <div
      ref={rootRef}
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
        backgroundColor: disabled ? disabledFill : fieldSurface,
        boxShadow,
        padding: `0 ${FIELD_PAD_X}px`,
        transition: `border-color ${FLOAT_MS}s ease, background-color ${FLOAT_MS}s ease`,
        ...(!hideLabelMargin ? { marginTop: extra?.marginTop ?? 0 } : {}),
      }}
    >
      {children}
    </div>
  );

  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 6,
        width: fullWidth ? "100%" : "auto",
        minWidth: 0,
        ...triggerOuterStyle,
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
                maxWidth: `calc(100% - ${FIELD_PAD_X}px)`,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                userSelect: "none",
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
                    backgroundColor: fieldSurface,
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
            {comboboxTrigger}
          </>,
          { marginTop: 6 }
        )
        : fieldShell(comboboxTrigger)}
      {panel}
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
