import { createContext, useCallback, useState } from "react";

export const LANGUAGE_STORAGE_KEY = "language";

export const supportedLanguages = ['ru', 'en'] as const;

export type ISupportedLanguages = (typeof supportedLanguages)[number];

function readStoredLanguage(): ISupportedLanguages | null {
  try {
    const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (raw && (supportedLanguages as readonly string[]).includes(raw)) {
      return raw as ISupportedLanguages;
    }
  } catch {
    /* private mode, quota, … */
  }
  return null;
}

function resolveSystemLanguage(): ISupportedLanguages {  if (typeof navigator === "undefined") return "en";

  const codes = new Set<ISupportedLanguages>(supportedLanguages);
  const tags = [...(navigator.languages ?? []), navigator.language];

  for (const raw of tags) {
    if (!raw) continue;
    const primary = raw.toLowerCase().split("-")[0]?.trim();
    if (primary && codes.has(primary as ISupportedLanguages)) {
      return primary as ISupportedLanguages;
    }
  }
  return "en";
}

export type LocalizationContextValue = {
  language: ISupportedLanguages;
  setLanguage: (next: ISupportedLanguages) => void;
};

export const LocalizationContext = createContext<LocalizationContextValue>({
  language: 'en',
  setLanguage: () => { },
});

export default function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<ISupportedLanguages>(() =>
    readStoredLanguage() ?? resolveSystemLanguage()
  );

  const setLanguage = useCallback((next: ISupportedLanguages) => {
    setLanguageState(next);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      /* private mode, quota, … */
    }
  }, []);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage }}>
      {children}
    </LocalizationContext.Provider>
  )
}