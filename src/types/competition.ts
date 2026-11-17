import type { Athlete } from "./athlete";
import { DEFAULT_LOCALE, type Locale } from "../i18n/types";
import { buildFlightLabels, buildPlatformLabels } from "../utils/labels";

export type LiftType = "squat" | "bench" | "deadlift";
export type CompetitionFormat = "sbd" | "benchOnly";
export type { Locale };

export interface CompetitionState {
  competitionName: string;
  competitionFormat: CompetitionFormat;
  currentLift: LiftType;
  platforms: string[];
  flights: string[];
  activePlatform: string;
  activeFlight: string;
  athletes: Athlete[];
  activeAthleteId: string | null;
  currentAttemptNumber: number;
  isOverlayVisible: boolean;
  locale: Locale;
}

export const DEFAULT_PLATFORMS = buildPlatformLabels(2);
export const DEFAULT_FLIGHTS = buildFlightLabels(2);
export { DEFAULT_LOCALE };

export const OBS_OVERLAY_URL = "http://localhost:4567/#/overlay";

export function liftsForFormat(format: CompetitionFormat): LiftType[] {
  return format === "benchOnly" ? ["bench"] : ["squat", "bench", "deadlift"];
}
