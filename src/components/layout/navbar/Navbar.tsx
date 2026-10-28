import { useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../../../providers/app-theme-provider";
import { Button, type ButtonColorOverrides } from "../../button/Button";
import { menuItems } from "../../../menu-items/menu-items";
import { useTranslation } from "../../../hooks/useTranslation";
import GoogleDriveSettings from "../../google-drive/GoogleDriveSettings";
import { useAppSettings } from "../../../providers/app-settings-provider";

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

const NAV_ICON_SLOT_PX = 24;
const NAV_ICON_SIZE_PX = 20;

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
  const { activePlanetoid, planetoidRestrictionsActive } = useAppSettings();
  const visibleMenuItems = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          !item.spacedOutOnly ||
          !planetoidRestrictionsActive ||
          activePlanetoid?.gameType !== "classic"
      ),
    [activePlanetoid?.gameType, planetoidRestrictionsActive]
  );
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
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
      }}
    >
      {visibleMenuItems.map((item) => {
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
              flexShrink: 0,
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
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: NAV_ICON_SLOT_PX,
                  minWidth: NAV_ICON_SLOT_PX,
                  height: NAV_ICON_SLOT_PX,
                  flexShrink: 0,
                }}
                aria-hidden
              >
                <ItemIcon
                  size={NAV_ICON_SIZE_PX}
                  style={{
                    fontSize: NAV_ICON_SIZE_PX,
                    width: NAV_ICON_SIZE_PX,
                    height: NAV_ICON_SIZE_PX,
                    maxWidth: NAV_ICON_SIZE_PX,
                    maxHeight: NAV_ICON_SIZE_PX,
                    flexShrink: 0,
                  }}
                />
              </span>
            ) : null}
            {t(item.labelKey)}
          </Button>
        );
      })}
    </div>
  );

  const shell = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: layout === "drawer" ? 1 : undefined,
        height: layout === "sidebar" ? "100%" : undefined,
        minHeight: 0,
        backgroundColor: colors.layout.background,
        minWidth: layout === "sidebar" ? 220 : undefined,
      }}
    >
      {list}
      <div style={{ flexShrink: 0, paddingBottom: 16 }}>
        <GoogleDriveSettings compact onNavigate={onNavigate} />
      </div>
    </div>
  );

  return shell;
}
