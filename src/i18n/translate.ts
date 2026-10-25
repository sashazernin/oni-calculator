import type { ISupportedLanguages } from "../providers/localization-provider";
import {
  LANGUAGE_STORAGE_KEY,
  resolveSystemLanguage,
  supportedLanguages,
} from "../providers/localization-provider";
import { translations, type TranslationKey } from "./translations";

export function getAppLanguage(): ISupportedLanguages {
  try {
    const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (raw && (supportedLanguages as readonly string[]).includes(raw)) {
      return raw as ISupportedLanguages;
    }
  } catch {
    /* ignore */
  }
  return resolveSystemLanguage();
}

export function translate(
  language: ISupportedLanguages,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const row = translations[key];
  let str: string = row[language];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.split(`{{${k}}}`).join(String(v));
    }
  }
  return str;
}
