import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MobileNavContextValue = {
  isMobile: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({
  isMobile,
  children,
}: {
  isMobile: boolean;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), []);

  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!drawerOpen || !isMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, isMobile, closeDrawer]);

  useEffect(() => {
    if (isMobile && drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [isMobile, drawerOpen]);

  const value = useMemo(
    () => ({
      isMobile,
      drawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [isMobile, drawerOpen, openDrawer, closeDrawer, toggleDrawer]
  );

  return (
    <MobileNavContext.Provider value={value}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav(): MobileNavContextValue {
  const v = useContext(MobileNavContext);
  if (!v) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return v;
}
