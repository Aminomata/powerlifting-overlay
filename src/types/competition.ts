import type { Athlete } from "./athlete";
import { buildFlightLabels, buildPlatformLabels } from "../utils/labels";

export type LiftType = "squat" | "bench" | "deadlift";
export type CompetitionFormat = "sbd" | "benchOnly";

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
}

export const LIFT_LABELS: Record<LiftType, string> = {
  squat: "Squat",
  bench: "Bench Press",
  deadlift: "Deadlift",
};

export const LIFT_SHORT: Record<LiftType, string> = {
  squat: "SQUAT",
  bench: "BENCH",
  deadlift: "DEADLIFT",
};

export const FORMAT_LABELS: Record<CompetitionFormat, string> = {
  sbd: "SBD",
  benchOnly: "Bench only",
};

export const DEFAULT_PLATFORMS = buildPlatformLabels(2);
export const DEFAULT_FLIGHTS = buildFlightLabels(2);

export const OBS_OVERLAY_URL = "http://localhost:4567/#/overlay";

export function liftsForFormat(format: CompetitionFormat): LiftType[] {
  return format === "benchOnly" ? ["bench"] : ["squat", "bench", "deadlift"];
}
