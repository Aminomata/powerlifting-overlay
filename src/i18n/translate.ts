import { en } from "./en";
import { fr } from "./fr";
import { type Locale, type Messages, type TranslationParams } from "./types";

const dictionaries: Record<Locale, Messages> = { en, fr };

export type MessageKey = keyof Messages;

export function t(locale: Locale, key: MessageKey, params?: TranslationParams): string {
  const template = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}
