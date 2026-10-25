import { createContext, useMemo } from "react";
import { useAppSettings } from "./app-settings-provider";

export const LANGUAGE_STORAGE_KEY = "language";

export const supportedLanguages = ['ru', 'en'] as const;

export const Languages = {
  ru: {
    label: "Русский",
    value: "ru",
  },
  en: {
    label: "English",
    value: "en",
  },
} as const satisfies Record<string, { label: string, value: ISupportedLanguages }>;

export type ISupportedLanguages = (typeof supportedLanguages)[number];

export function resolveSystemLanguage(): ISupportedLanguages {
  if (typeof navigator === "undefined") return "en";

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
  const { data, setLanguage } = useAppSettings();

  const value = useMemo(
    () => ({ language: data.language, setLanguage }),
    [data.language, setLanguage]
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  )
}
