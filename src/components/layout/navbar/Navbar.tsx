import { useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../../../providers/app-theme-provider";
import { Button, type ButtonColorOverrides } from "../../button/Button";
import { menuItems } from "../../../menu-items/menu-items";
import { useTranslation } from "../../../hooks/useTranslation";

function navItemActive(
  main: string,
  mode: "light" | "dark",
  textPrimary: string
): ButtonColorOverrides {
  const a = mode === "dark" ? 32 : 20;
  return {
    main: `color-mix(in srgb, ${main} ${a}%, transparent)`,
    hover: `color-mix(in srgb, ${main} ${a + 10}%, transparent)`,
    active: `color-mix(in srgb, ${main} ${a + 16}%, transparent)`,
    contrastText: textPrimary,
    ripple: `color-mix(in srgb, ${main} 38%, transparent)`,
  };
}

function itemPath(href: string) {
  return href === "" ? "/" : `/${href}`;
}

function isItemActive(pathname: string, href: string) {
  const p = itemPath(href).replace(/\/$/, "") || "/";
  const loc = pathname.replace(/\/$/, "") || "/";
  return loc === p;
}

export type NavbarLayout = "sidebar" | "drawer";

export type NavbarProps = {
  layout?: NavbarLayout;
  /** Вызвать после перехода по пункту (закрыть drawer на мобильном). */
  onNavigate?: () => void;
};

export default function Navbar({
  layout = "sidebar",
  onNavigate,
}: NavbarProps) {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);
  const { pathname } = useLocation();
  const activeNav = useMemo(
    () => navItemActive(colors.primary.main, colors.mode, colors.text.primary),
    [colors.primary.main, colors.mode, colors.text.primary]
  );
  const activeMark = `3px solid ${colors.primary.main}`;

  const list = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "8px 0",
        flex: layout === "drawer" ? 1 : undefined,
        minHeight: 0,
        overflowY: layout === "drawer" ? "auto" : undefined,
      }}
    >
      {menuItems.map((item) => {
        const active = isItemActive(pathname, item.href);
        const ItemIcon =
          active && item.activeIcon ? item.activeIcon : item.icon;
        return (
          <Button
            key={item.href}
            to={itemPath(item.href)}
            variant="translucent"
            colorOverrides={active ? activeNav : undefined}
            onClick={() => {
              onNavigate?.();
            }}
            style={{
              borderRadius: 8,
              marginLeft: 8,
              marginRight: 8,
              padding: "10px 12px",
              minHeight: 0,
              boxShadow: "none",
              justifyContent: "flex-start",
              gap: 10,
              fontWeight: active ? 600 : 500,
              borderLeft: active ? activeMark : "3px solid transparent",
              boxSizing: "border-box",
            }}
            aria-current={active ? "page" : undefined}
          >
            {ItemIcon ? (
              <ItemIcon
                style={{ fontSize: "1.25rem" }}
                aria-hidden
              />
            ) : null}
            {t(item.labelKey)}
          </Button>
        );
      })}
    </div>
  );

  if (layout === "drawer") {
    return list;
  }

  return (
    <div
      style={{
        backgroundColor: colors.layout.background,
        minWidth: 220,
      }}
    >
      {list}
    </div>
  );
}
