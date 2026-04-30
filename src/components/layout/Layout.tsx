import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./navbar/Navbar";
import Header from "./header/header";
import { useContext, useEffect } from "react";
import { ThemeContext } from "../../providers/app-theme-provider";
import { MobileNavProvider, useMobileNav } from "./mobile-nav-context";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useTranslation } from "../../hooks/useTranslation";

const MOBILE_NAV_MQ = "(max-width: 767px)";
const DRAWER_MS = "0.28s";
const DRAWER_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

function LayoutShell() {
  const { colors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const { isMobile, drawerOpen, closeDrawer } = useMobileNav();
  const location = useLocation();

  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
      }}
    >
      <Header />
      <div
        style={{
          display: "flex",
          flex: 1,
          width: "100%",
          flexDirection: "row",
          position: "relative",
        }}
      >
        {!isMobile ? <Navbar layout="sidebar" /> : null}

        {isMobile ? (
          <>
            <button
              type="button"
              aria-label={t("nav_close_menu")}
              onClick={closeDrawer}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 40,
                border: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                opacity: drawerOpen ? 1 : 0,
                pointerEvents: drawerOpen ? "auto" : "none",
                transition: `opacity ${DRAWER_MS} ease`,
              }}
            />
            <div
              role="dialog"
              aria-modal={drawerOpen}
              aria-hidden={!drawerOpen}
              aria-label={t("nav_menu_title")}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "min(280px, 88vw)",
                zIndex: 41,
                display: "flex",
                flexDirection: "column",
                backgroundColor: colors.layout.background,
                boxShadow: drawerOpen ? colors.shadow.default : "none",
                boxSizing: "border-box",
                transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
                transition: `transform ${DRAWER_MS} ${DRAWER_EASE}`,
                pointerEvents: drawerOpen ? "auto" : "none",
                willChange: "transform",
              }}
            >
              <Navbar layout="drawer" onNavigate={closeDrawer} />
            </div>
          </>
        ) : null}

        <div
          style={{
            backgroundColor: colors.background.default,
            flex: 1,
            minHeight: 0,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const isMobile = useMediaQuery(MOBILE_NAV_MQ);
  return (
    <MobileNavProvider isMobile={isMobile}>
      <LayoutShell />
    </MobileNavProvider>
  );
}
