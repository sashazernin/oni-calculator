import { useCallback, useContext } from "react";
import {
  LocalizationContext,
  type ISupportedLanguages,
} from "../providers/localization-provider";
import { translations } from "../i18n/translations";
import type { TranslationKey } from "../i18n/translations";

export function useTranslation() {
  const { language } = useContext(LocalizationContext);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const row = translations[key];
      let str: string = row[language as ISupportedLanguages] as string;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.split(`{{${k}}}`).join(String(v));
        }
      }
      return str;
    },
    [language]
  );

  /** Подпись сущности из game-data (`name` хранит ключ `gd_*`). */
  const entityName = useCallback(
    (name: string) => t(name as TranslationKey),
    [t]
  );

  return { t, entityName, language };
}
