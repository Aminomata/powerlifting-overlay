import { t } from "../i18n/translate";
import type { Locale } from "../i18n/types";

const FLIGHT_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function buildPlatformLabels(count: number): string[] {
  const safe = Math.min(Math.max(count, 1), 12);
  return Array.from({ length: safe }, (_, index) => `Platform ${index + 1}`);
}

export function buildFlightLabels(count: number): string[] {
  const safe = Math.min(Math.max(count, 1), 26);
  return Array.from({ length: safe }, (_, index) => `Flight ${FLIGHT_LETTERS[index] ?? index + 1}`);
}

export function clampLabel(value: string, options: string[]): string {
  if (options.includes(value)) {
    return value;
  }
  return options[0] ?? value;
}

export function formatPlatformLabel(stored: string, locale: Locale): string {
  const match = /^Platform\s+(\d+)$/i.exec(stored.trim());
  if (match) {
    return t(locale, "platform", { n: match[1] });
  }
  return stored;
}

export function formatFlightLabel(stored: string, locale: Locale): string {
  const match = /^Flight\s+([A-Z0-9]+)$/i.exec(stored.trim());
  if (match) {
    return t(locale, "flight", { letter: match[1].toUpperCase() });
  }
  return stored;
}

export function toPlatformSelectOptions(
  values: string[],
  locale: Locale,
): { value: string; label: string }[] {
  return values.map((value) => ({ value, label: formatPlatformLabel(value, locale) }));
}

export function toFlightSelectOptions(
  values: string[],
  locale: Locale,
): { value: string; label: string }[] {
  return values.map((value) => ({ value, label: formatFlightLabel(value, locale) }));
}
