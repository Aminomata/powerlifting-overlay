import { useCompetitionStore } from "../store/useCompetitionStore";
import { t, type MessageKey } from "./translate";
import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
  type Messages,
  type TranslationParams,
} from "./types";

export type { Locale, Messages, MessageKey, TranslationParams };
export { DEFAULT_LOCALE, LOCALES, isLocale } from "./types";
export { t } from "./translate";

export function useLocale(): Locale {
  const locale = useCompetitionStore((s) => s.locale);
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function useT(): (key: MessageKey, params?: TranslationParams) => string {
  const locale = useLocale();
  return (key, params) => t(locale, key, params);
}

export function applyDocumentLang(locale: Locale): void {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}
