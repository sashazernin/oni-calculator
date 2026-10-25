import type { TranslationKey } from "../../i18n/translations";
import { getAppLanguage, translate } from "../../i18n/translate";

type AppBootLoaderProps = {
  messageKey: TranslationKey;
};

export default function AppBootLoader({ messageKey }: AppBootLoaderProps) {
  const message = translate(getAppLanguage(), messageKey);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        background: "var(--page-bg-for-scrollbar, #252525)",
        color: "var(--text-primary, #e8e8e8)",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      <div className="app-boot-spinner" aria-hidden />
      <div style={{ fontSize: 15, fontWeight: 500, opacity: 0.92 }}>{message}</div>
    </div>
  );
}
