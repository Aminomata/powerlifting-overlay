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
