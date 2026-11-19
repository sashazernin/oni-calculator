export const CLASSIC_ROCKET_MAIN_VIEW_STORAGE_KEY =
  "oni-calculator:classic-rocket-main-view";

export type ClassicRocketMainView = "rocket" | "chart";

const VALID: ClassicRocketMainView[] = ["rocket", "chart"];

export function readClassicRocketMainView(): ClassicRocketMainView {
  if (typeof window === "undefined") return "rocket";
  try {
    const raw = window.localStorage.getItem(CLASSIC_ROCKET_MAIN_VIEW_STORAGE_KEY);
    if (raw === "chart" || raw === "rocket") return raw;
  } catch {
    /* ignore */
  }
  return "rocket";
}

export function persistClassicRocketMainView(view: ClassicRocketMainView): void {
  if (typeof window === "undefined") return;
  if (!VALID.includes(view)) return;
  try {
    window.localStorage.setItem(CLASSIC_ROCKET_MAIN_VIEW_STORAGE_KEY, view);
  } catch {
    /* ignore */
  }
}